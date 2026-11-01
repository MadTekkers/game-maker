import type { Answer, Prompt } from "./types";

const ROMAN: Record<string, string> = { ii: "2", iii: "3", iv: "4", v: "5", vi: "6", vii: "7", viii: "8", ix: "9", x: "10" };

/** Canonical form used on both sides of a comparison. */
export function norm(s: string): string {
  let t = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  t = t.replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/ø/g, "o").replace(/ł/g, "l").replace(/đ/g, "d");
  t = t.replace(/&/g, " and ").replace(/\+/g, " and ");
  t = t.replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  let w = t.split(" ").filter(Boolean);
  w = w.map((x) => (x === "saint" ? "st" : x === "mount" ? "mt" : ROMAN[x] ?? x));
  if (w.length > 1 && w[0] === "the") w = w.slice(1);
  return w.join(" ");
}
const compact = (s: string) => s.replace(/ /g, "");

/** Allowed typo edits for a normalised string of this length. */
export function tolerance(len: number): number { return len <= 3 ? 0 : len <= 7 ? 1 : 2; }

/** Damerau-Levenshtein (optimal string alignment) with an early cutoff. */
export function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}
const digits = (s: string) => s.replace(/\D/g, "");

export type MatchResult =
  | { kind: "hit"; answer: Answer; fuzzy: boolean }
  | { kind: "ambiguous"; options: Answer[] }
  | { kind: "miss" };

interface Index { exact: Map<string, Answer>; alias: Map<string, Answer[]>; keys: { key: string; answer: Answer }[] }
const cache = new WeakMap<Prompt, Index>();
function index(p: Prompt): Index {
  let ix = cache.get(p);
  if (ix) return ix;
  ix = { exact: new Map(), alias: new Map(), keys: [] };
  for (const ans of p.answers) {
    const k = norm(ans.t);
    if (!ix.exact.has(k)) ix.exact.set(k, ans);
    ix.keys.push({ key: k, answer: ans });
    // Titles with a subtitle also accept either half ("Return of the King").
    const parts = ans.t.includes(": ") ? ans.t.split(": ") : [];
    for (const al of [...(ans.a ?? []), ...(parts.length === 2 ? parts : [])]) {
      const ak = norm(al);
      if (!ak) continue;
      const arr = ix.alias.get(ak) ?? [];
      if (!arr.includes(ans)) arr.push(ans);
      ix.alias.set(ak, arr);
      ix.keys.push({ key: ak, answer: ans });
    }
  }
  cache.set(p, ix);
  return ix;
}

/** Match a typed guess to one of the prompt's answers. */
export function matchAnswer(p: Prompt, guess: string): MatchResult {
  const g = norm(guess);
  if (!g) return { kind: "miss" };
  const ix = index(p);
  const ex = ix.exact.get(g);
  if (ex) return { kind: "hit", answer: ex, fuzzy: false };
  const al = ix.alias.get(g);
  if (al?.length === 1) return { kind: "hit", answer: al[0], fuzzy: false };
  if (al && al.length > 1) return { kind: "ambiguous", options: al };
  // Spacing-insensitive exact ("spider man" vs "spiderman").
  const gc = compact(g);
  const sp = new Set(ix.keys.filter((k) => compact(k.key) === gc).map((k) => k.answer));
  if (sp.size === 1) return { kind: "hit", answer: [...sp][0], fuzzy: false };
  // Fuzzy: typos scaled to length, never across different numbers.
  const tol = tolerance(gc.length);
  if (tol === 0) return sp.size > 1 ? { kind: "ambiguous", options: [...sp] } : { kind: "miss" };
  let best = tol + 1;
  let hits = new Set<Answer>();
  for (const k of ix.keys) {
    if (digits(k.key) !== digits(g)) continue;
    const kc = compact(k.key);
    const d = editDistance(gc, kc, Math.min(tol, tolerance(kc.length)));
    if (d > Math.min(tol, tolerance(kc.length))) continue;
    if (d < best) { best = d; hits = new Set([k.answer]); } else if (d === best) hits.add(k.answer);
  }
  if (hits.size === 1) return { kind: "hit", answer: [...hits][0], fuzzy: true };
  if (hits.size > 1) return { kind: "ambiguous", options: [...hits] };
  return { kind: "miss" };
}
