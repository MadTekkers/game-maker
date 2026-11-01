// Hand analysis for Hong Kong Mahjong: shanten (tiles from ready), win detection, decompositions, ukeire (useful draws) and faan scoring.
// Pure TS, shared by the edge function (bots, validation, scoring) and the browser (coach, drills).
import { type Tile, idx, fromIdx, counts, isBonus, TERMINALS_HONORS, tileName, WIND_NAME, sortTiles } from "./tiles.ts";

export type Meld = { type: "chow" | "pung" | "kong"; tiles: Tile[]; concealed: boolean; from: number };

/** Standard-hand shanten: -1 = complete, 0 = ready (tenpai), 1 = one tile from ready, … `melds` = sets already declared. */
export function stdShanten(c: number[], melds: number): number {
  let best = 8; const cc = [...c];
  const dfs = (i: number, m: number, t: number, p: number) => {
    while (i < 34 && cc[i] === 0) i++;
    if (i >= 34) { const v = 8 - 2 * m - Math.min(t, 4 - m) - p; if (v < best) best = v; return; }
    if (cc[i] >= 3) { cc[i] -= 3; dfs(i, m + 1, t, p); cc[i] += 3; }
    const suited = i < 27, r = i % 9;
    if (suited && r <= 6 && cc[i + 1] && cc[i + 2]) { cc[i]--; cc[i + 1]--; cc[i + 2]--; dfs(i, m + 1, t, p); cc[i]++; cc[i + 1]++; cc[i + 2]++; }
    if (cc[i] >= 2) { cc[i] -= 2; if (!p) dfs(i, m, t, 1); else dfs(i, m, t + 1, p); cc[i] += 2; }
    if (m + t < 4) {
      if (suited && r <= 7 && cc[i + 1]) { cc[i]--; cc[i + 1]--; dfs(i, m, t + 1, p); cc[i]++; cc[i + 1]++; }
      if (suited && r <= 6 && cc[i + 2]) { cc[i]--; cc[i + 2]--; dfs(i, m, t + 1, p); cc[i]++; cc[i + 2]++; }
    }
    cc[i]--; dfs(i, m, t, p); cc[i]++;
  };
  dfs(0, melds, 0, 0);
  return best;
}
export function pairsShanten(c: number[]): number {
  let pairs = 0, kinds = 0; for (const v of c) { if (v >= 1) kinds++; if (v >= 2) pairs++; }
  return 6 - pairs + Math.max(0, 7 - kinds);
}
export function orphansShanten(c: number[]): number {
  let u = 0, pair = 0; for (const i of TERMINALS_HONORS) { if (c[i] >= 1) u++; if (c[i] >= 2) pair = 1; }
  return 13 - u - pair;
}
/** Best shanten over the standard hand, Seven Pairs and Thirteen Orphans (the special hands need no declared sets). */
export function shanten(c: number[], melds: number): number {
  const s = stdShanten(c, melds);
  if (melds > 0) return s;
  return Math.min(s, pairsShanten(c), orphansShanten(c));
}
export const shantenOf = (tiles: Tile[], melds: number) => shanten(counts(tiles), melds);

/** Which tile kinds would lower shanten, and how many of each are still unseen. `visible` = counts of tiles this player can see. */
export function ukeire(c: number[], melds: number, visible: number[], base = shanten(c, melds)): { i: number; live: number }[] {
  const out: { i: number; live: number }[] = [];
  for (let i = 0; i < 34; i++) {
    if (c[i] >= 4) continue;
    c[i]++; const s = shanten(c, melds); c[i]--;
    if (s < base) out.push({ i, live: Math.max(0, 4 - visible[i]) });
  }
  return out;
}
export type DiscardOption = { tile: Tile; shanten: number; useful: { tile: Tile; live: number }[]; live: number; chance: number };
/** Every distinct discard from a 14-tile (or 14-3k) hand, best first: lowest shanten, then most live useful tiles. */
export function analyzeDiscards(hand: Tile[], melds: number, visible: number[], unseen: number): DiscardOption[] {
  const c = counts(hand); const out: DiscardOption[] = [];
  for (let i = 0; i < 34; i++) {
    if (!c[i]) continue;
    c[i]--; const s = shanten(c, melds);
    const u = s >= 0 ? ukeire(c, melds, visible, s) : []; c[i]++;
    const live = u.reduce((a, x) => a + x.live, 0);
    out.push({ tile: fromIdx(i), shanten: s, useful: u.map((x) => ({ tile: fromIdx(x.i), live: x.live })), live, chance: unseen > 0 ? Math.min(1, live / unseen) : 0 });
  }
  return out.sort((a, b) => a.shanten - b.shanten || b.live - a.live);
}

export function isComplete(c: number[], melds: number): boolean {
  if (stdShanten(c, melds) === -1) return true;
  return melds === 0 && (pairsShanten(c) === -1 || orphansShanten(c) === -1);
}

type DSet = { type: "chow" | "pung"; i: number };
/** All ways to split the concealed counts into sets + one pair. */
export function decompose(c: number[]): { pair: number; sets: DSet[] }[] {
  const out: { pair: number; sets: DSet[] }[] = []; const cc = [...c];
  const rec = (sets: DSet[], pair: number) => {
    let i = 0; while (i < 34 && cc[i] === 0) i++;
    if (i >= 34) { if (pair >= 0) out.push({ pair, sets: [...sets] }); return; }
    if (pair < 0 && cc[i] >= 2) { cc[i] -= 2; rec(sets, i); cc[i] += 2; }
    if (cc[i] >= 3) { cc[i] -= 3; sets.push({ type: "pung", i }); rec(sets, pair); sets.pop(); cc[i] += 3; }
    if (i < 27 && i % 9 <= 6 && cc[i + 1] && cc[i + 2]) { cc[i]--; cc[i + 1]--; cc[i + 2]--; sets.push({ type: "chow", i }); rec(sets, pair); sets.pop(); cc[i]++; cc[i + 1]++; cc[i + 2]++; }
  };
  rec([], -1);
  return out;
}

// ---------- scoring ----------
export const MIN_FAAN = 0;
export const MAX_FAAN = 10;
/** Faan -> base points (Hong Kong "half-spicy" style table, capped at the 10-faan limit). */
export const POINTS = [1, 2, 4, 8, 16, 24, 32, 48, 64, 96, 128];
export const pointsFor = (faan: number) => POINTS[Math.max(0, Math.min(MAX_FAAN, faan))];
export type FaanItem = { name: string; faan: number; why: string };
export type Score = { faan: number; items: FaanItem[]; points: number; shape: "standard" | "pairs" | "orphans"; limit: boolean };
export type WinInput = { concealed: Tile[]; melds: Meld[]; flowers: Tile[]; seatWind: number; roundWind: number; selfDraw: boolean };

/** Score a complete hand (concealed tiles include the winning tile). Returns null if it isn't a complete hand. */
export function scoreHand(w: WinInput): Score | null {
  const c = counts(w.concealed); const nm = w.melds.length;
  const all = [...w.concealed, ...w.melds.flatMap((m) => m.tiles)].filter((t) => !isBonus(t));
  const suits = new Set(all.filter((t) => t[1] !== "z").map((t) => t[1])); const honors = all.some((t) => t[1] === "z");
  const open = w.melds.some((m) => !m.concealed);
  const common: FaanItem[] = [];
  if (w.selfDraw) common.push({ name: "Self-draw", faan: 1, why: "You drew the winning tile yourself." });
  if (!open) common.push({ name: "Concealed hand", faan: 1, why: "You never claimed a discard to make a set." });
  if (!honors && suits.size === 1) common.push({ name: "Full flush", faan: 7, why: "Every tile is from one suit." });
  else if (honors && suits.size === 1) common.push({ name: "Half flush", faan: 3, why: "One suit plus honours (winds/dragons)." });
  else if (honors && suits.size === 0) common.push({ name: "All honours", faan: 10, why: "Only winds and dragons." });
  const ownF = w.flowers.filter((f) => +f[0] === w.seatWind + 1);
  if (!w.flowers.length) common.push({ name: "No flowers", faan: 1, why: "You drew no flowers or seasons this hand." });
  else if (ownF.length) common.push({ name: ownF.length > 1 ? `Own flowers ×${ownF.length}` : "Own flower", faan: ownF.length, why: `Flower/season number ${w.seatWind + 1} matches your seat (${WIND_NAME[w.seatWind]}).` });
  const finish = (items: FaanItem[], shape: Score["shape"]): Score => {
    const raw = items.reduce((a, x) => a + x.faan, 0); const faan = Math.min(MAX_FAAN, raw);
    return { faan, items, points: pointsFor(faan), shape, limit: raw >= MAX_FAAN };
  };
  let best: Score | null = null;
  const consider = (s: Score) => { if (!best || s.faan > best.faan) best = s; };
  if (nm === 0 && orphansShanten(c) === -1) consider(finish([{ name: "Thirteen Orphans", faan: 10, why: "One of every terminal and honour plus a pair: a limit hand." }, ...common.filter((x) => x.name === "Self-draw")], "orphans"));
  if (nm === 0 && pairsShanten(c) === -1) consider(finish([{ name: "Seven Pairs", faan: 4, why: "Seven different pairs instead of four sets." }, ...common], "pairs"));
  for (const d of decompose(c)) {
    const sets: { type: "chow" | "pung"; i: number }[] = [...d.sets, ...w.melds.map((m) => ({ type: (m.type === "chow" ? "chow" : "pung") as "chow" | "pung", i: idx(sortTiles(m.tiles)[0]) }))];
    if (sets.length !== 4) continue;
    const items = [...common];
    if (sets.every((x) => x.type === "chow")) items.push({ name: "All chows", faan: 1, why: "All four sets are runs." });
    if (sets.every((x) => x.type === "pung")) items.push({ name: "All pungs", faan: 3, why: "All four sets are three (or four) of a kind." });
    for (const x of sets) {
      if (x.type !== "pung" || x.i < 27) continue;
      const h = x.i - 27;
      if (h >= 4) items.push({ name: `${["Red", "Green", "White"][h - 4]} dragon pung`, faan: 1, why: "A pung of any dragon is worth 1 faan." });
      else {
        if (h === w.seatWind) items.push({ name: `Seat wind pung (${WIND_NAME[h]})`, faan: 1, why: "A pung of your own seat's wind." });
        if (h === w.roundWind) items.push({ name: `Round wind pung (${WIND_NAME[h]})`, faan: 1, why: "A pung of the round's wind." });
      }
    }
    consider(finish(items, "standard"));
  }
  return best;
}

/** Tiles that complete a 13-tile (13-3k) hand. */
export function waits(hand: Tile[], melds: number): Tile[] {
  const c = counts(hand); const out: Tile[] = [];
  for (let i = 0; i < 34; i++) { if (c[i] >= 4) continue; c[i]++; if (isComplete(c, melds)) out.push(fromIdx(i)); c[i]--; }
  return out;
}
export const describeShanten = (s: number) => (s < 0 ? "complete (Mahjong!)" : s === 0 ? "ready — one tile from winning" : `${s} tile${s > 1 ? "s" : ""} from ready`);
export { tileName };
