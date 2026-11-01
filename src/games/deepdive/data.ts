import { supabase } from "../../lib/supabase";
import { thisWeek, todayDay } from "../../lib/weekly";
import type { Answer, Bank, CatId, Prompt } from "./types";

let bankP: Promise<Bank> | null = null;
/** The bank is ~300 KB, so it is a lazy chunk loaded on first use. */
export const loadBank = () => (bankP ??= import("./bank.json").then((m) => (m.default ?? m) as unknown as Bank));

export const CAT_ICON: Record<CatId, string> = { geo: "🌍", mtv: "🎬", sp: "🏅", pc: "🎤", sci: "🔬", hi: "🏛️" };
export const CAT_COLOR: Record<CatId, string> = { geo: "#1f7a5a", mtv: "#8e3fa8", sp: "#b04a12", pc: "#b03a78", sci: "#2f62c0", hi: "#7a5a12" };

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

/** One prompt per category plus one extra, shuffled: the same rule the weekly script uses. */
export function pickSet(bank: Bank, seed: string, n = 7, avoid: Set<string> = new Set()) {
  const r = rng(hash(seed));
  const cats = bank.categories.map((c) => c.id);
  const order = [...cats].sort(() => r() - 0.5);
  while (order.length < n) order.push(cats[Math.floor(r() * cats.length)]);
  const out: Prompt[] = [];
  for (const c of order.slice(0, n)) {
    const pool = bank.prompts.filter((p) => p.cat === c && !avoid.has(p.id) && !out.includes(p));
    const all = pool.length ? pool : bank.prompts.filter((p) => p.cat === c && !out.includes(p));
    out.push(all[Math.floor(r() * all.length)]);
  }
  return out;
}

export function chicagoDate() { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date()); }

/** Today's Daily Dive: the row the weekly script stored in Supabase, else a date-seeded set. */
export async function dailySet(bank: Bank): Promise<{ prompts: Prompt[]; source: "weekly" | "local"; day: string }> {
  const day = chicagoDate();
  try {
    if (supabase) {
      const { data } = await supabase.from("weekly_puzzles").select("data").eq("game", "deepdive").eq("week_start", thisWeek()).eq("day", todayDay()).maybeSingle();
      const ids: string[] = (data as { data?: { prompts?: string[] } } | null)?.data?.prompts ?? [];
      const ps = ids.map((id) => bank.prompts.find((p) => p.id === id)).filter(Boolean) as Prompt[];
      if (ps.length === 7) return { prompts: ps, source: "weekly", day };
    }
  } catch { /* offline: fall back */ }
  return { prompts: pickSet(bank, `deepdive:${day}`), source: "local", day };
}

/** Up to 3 rarer correct answers to learn from, spread across the rarer range (rarest last). */
export function rarerPicks(p: Prompt, mine: Answer | null): Answer[] {
  const pool = p.answers.filter((a) => !mine || a.p > mine.p).sort((a, b) => a.p - b.p);
  if (pool.length <= 3) return pool.reverse();
  const idx = [...new Set([Math.floor(pool.length * 0.4), Math.floor(pool.length * 0.75), pool.length - 1])];
  return idx.map((i) => pool[i]).reverse();
}
export const metres = (pts: number) => pts * 10;
export const fmtM = (m: number) => `${m.toLocaleString()} m`;
export const tier = (p: number) => (p >= 80 ? "abyss" : p >= 55 ? "deep" : p >= 30 ? "mid" : "shallow");
export const TIER_LABEL: Record<string, string> = { abyss: "Abyssal", deep: "Deep", mid: "Twilight", shallow: "Shallow" };
