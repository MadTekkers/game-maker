// Mahjong bots. easy = loose / random-ish, medium = shanten-greedy, hard = shanten + live useful tiles (ukeire) + basic defence.
import type { Rng } from "../core.ts";
import { type Tile, counts, idx, isHonor, isTerminal, removeTiles, fromIdx } from "./tiles.ts";
import { type Meld, analyzeDiscards, shanten, isComplete } from "./hand.ts";
import type { Level } from "../seats.ts";

/** What one seat can legally see: its own hand plus every public tile. */
export type View = { hand: Tile[]; melds: Meld[]; ponds: Tile[][]; allMelds: Meld[][]; seat: number; wallCount: number };
export function visibleCounts(v: View): number[] {
  const c = counts(v.hand);
  for (const p of v.ponds) for (const t of p) c[idx(t)]++;
  for (const ms of v.allMelds) for (const m of ms) for (const t of m.tiles) c[idx(t)]++;
  return c.map((x) => Math.min(4, x));
}
export const unseenCount = (vis: number[]) => vis.reduce((a, x) => a + (4 - x), 0);

/** Rough "keep value" of a tile for tie-breaks: isolated honours and terminals are the first to go. */
function keepValue(hand: Tile[], t: Tile): number {
  const c = counts(hand); const i = idx(t);
  if (isHonor(t)) return c[i] >= 2 ? 6 : 0;
  let v = isTerminal(t) ? 1 : 2; if (c[i] >= 2) v += 4;
  const r = i % 9;
  for (const d of [-2, -1, 1, 2]) { const r2 = r + d; if (r2 >= 0 && r2 <= 8 && c[i + d]) v += Math.abs(d) === 1 ? 2 : 1; }
  return v;
}
/** How likely `t` is to deal into an opponent who looks close to winning (0 safe … ~2 very risky). */
export function danger(v: View, t: Tile): number {
  let worst = 0; const vis = visibleCounts(v); const i = idx(t);
  for (let j = 0; j < v.ponds.length; j++) {
    if (j === v.seat) continue; const ms = v.allMelds[j] ?? [];
    const threat = ms.length >= 2 || (ms.length >= 1 && v.wallCount < 30);
    if (!threat) continue;
    let d = isHonor(t) ? (vis[i] >= 3 ? 0 : vis[i] === 2 ? 0.3 : 0.6) : isTerminal(t) ? 0.6 : 1;
    if (v.ponds[j].includes(t)) d *= 0.25;
    const suits = new Set(ms.filter((m) => !isHonor(m.tiles[0])).map((m) => m.tiles[0][1]));
    if (suits.size === 1 && (t[1] === [...suits][0] || isHonor(t))) d += 0.8;
    worst = Math.max(worst, d);
  }
  return worst;
}
export function threats(v: View) { return v.allMelds.filter((ms, j) => j !== v.seat && (ms.length >= 2 || (ms.length >= 1 && v.wallCount < 30))).length; }

export function chooseDiscard(v: View, level: Level, rng: Rng): Tile {
  const vis = visibleCounts(v); const opts = analyzeDiscards(v.hand, v.melds.length, vis, unseenCount(vis));
  const best = opts[0].shanten;
  if (level === "easy") {
    // easy: plays a tile that keeps it on track, but picks blindly among them and sometimes slips a step back
    const ok = opts.filter((o) => o.shanten <= best + (rng() < 0.12 ? 1 : 0));
    return ok[Math.floor(rng() * ok.length)].tile;
  }
  if (level === "medium") {
    const top = opts.filter((o) => o.shanten === best);
    return top.sort((a, b) => keepValue(v.hand, a.tile) - keepValue(v.hand, b.tile))[0].tile;
  }
  const th = threats(v); const K = th ? (best >= 2 ? 30 : best === 1 ? 10 : 3) : 0;
  const score = (o: (typeof opts)[number]) => o.shanten * 100 - o.live - keepValue(v.hand, o.tile) * 0.1 + K * danger(v, o.tile);
  return [...opts].sort((a, b) => score(a) - score(b))[0].tile;
}

/** Best shanten reachable after taking `take` from hand to form a meld (and then discarding once). */
export function shantenAfterMeld(hand: Tile[], melds: number, take: Tile[], discardAfter = true): number {
  const rest = removeTiles(hand, take); const c = counts(rest);
  if (!discardAfter) return shanten(c, melds + 1);
  let best = 9;
  for (let i = 0; i < 34; i++) { if (!c[i]) continue; c[i]--; best = Math.min(best, shanten(c, melds + 1)); c[i]++; }
  return best;
}
export type ClaimOpts = { win: boolean; pung: boolean; kong: boolean; chows: Tile[][] };
export type ClaimResp = { t: "pass" } | { t: "win" } | { t: "pung" } | { t: "kong" } | { t: "chow"; tiles: Tile[] };
const valueHonor = (t: Tile, seatWind: number, roundWind: number) => isHonor(t) && (+t[0] >= 5 || +t[0] - 1 === seatWind || +t[0] - 1 === roundWind);

export function chooseClaim(v: View, tile: Tile, o: ClaimOpts, level: Level, rng: Rng, winds: { seat: number; round: number }): ClaimResp {
  if (o.win) return { t: "win" };
  const cur = shanten(counts(v.hand), v.melds.length);
  if (level === "easy") {
    if ((o.pung || o.kong) && rng() < 0.4) return { t: o.kong && rng() < 0.5 ? "kong" : "pung" };
    if (o.chows.length && rng() < 0.2) return { t: "chow", tiles: o.chows[0] };
    return { t: "pass" };
  }
  const val = valueHonor(tile, winds.seat, winds.round);
  if (o.kong) { const s = shantenAfterMeld(v.hand, v.melds.length, [tile, tile, tile], false); if (s <= cur) return { t: "kong" }; }
  if (o.pung) { const s = shantenAfterMeld(v.hand, v.melds.length, [tile, tile]); if (s < cur || (val && s <= cur)) return { t: "pung" }; }
  let bestChow: Tile[] | null = null; let bs = cur;
  for (const ch of o.chows) {
    const take = removeTiles(ch, [tile]); const s = shantenAfterMeld(v.hand, v.melds.length, take);
    if (s < bs) { bs = s; bestChow = ch; }
  }
  // stay concealed early unless the hand is already open or the chow gets us close
  if (bestChow && (v.melds.some((m) => !m.concealed) || bs <= (level === "hard" ? 1 : 2))) return { t: "chow", tiles: bestChow };
  return { t: "pass" };
}
export function chooseSelfKong(v: View, kongs: Tile[], level: Level): Tile | null {
  if (!kongs.length) return null; if (level === "easy") return kongs[0];
  const cur = shanten(counts(v.hand), v.melds.length) ;
  for (const t of kongs) {
    const added = v.melds.some((m) => m.type === "pung" && m.tiles[0] === t);
    if (added) return t;
    const c = counts(removeTiles(v.hand, [t, t, t, t]));
    // after a kong we draw a replacement, so compare 14-tile shanten with the 10-tile+1 meld shanten
    if (shanten(c, v.melds.length + 1) <= cur) return t;
  }
  return null;
}
export const canWinWith = (hand: Tile[], melds: number) => isComplete(counts(hand), melds);
export { fromIdx };
