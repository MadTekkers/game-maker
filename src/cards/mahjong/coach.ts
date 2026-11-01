// Mahjong trainer maths for the client: the discard comparison card (shanten, live useful tiles, chance to improve on the next draw),
// claim explanations, and the guided-game tips. Uses only what this seat can legally see (own hand + every public tile).
import { type Tile, tileName, counts, idx, removeTiles, isHonor, WIND_NAME } from "./tiles.ts";
import { type Meld, analyzeDiscards, shanten, describeShanten, waits, type DiscardOption } from "./hand.ts";
import { visibleCounts, unseenCount, danger, threats, shantenAfterMeld, type View } from "./ai.ts";
import type { PublicMj } from "./engine.ts";

export type Spot = { hand: Tile[]; melds: Meld[]; view: View; vis: number[]; unseen: number };
export function spotOf(pub: PublicMj, seat: number, hand: Tile[]): Spot {
  const view: View = { hand, melds: pub.melds[seat], ponds: pub.ponds, allMelds: pub.melds, seat, wallCount: pub.wallCount };
  const vis = visibleCounts(view); return { hand, melds: pub.melds[seat], view, vis, unseen: unseenCount(vis) };
}
const pct = (x: number) => `${Math.round(x * 100)}%`;
export const sh = (s: number) => (s < 0 ? "Mahjong" : s === 0 ? "Ready" : `${s} away`);
export const usefulText = (o: DiscardOption, max = 8) => o.useful.filter((u) => u.live > 0).slice(0, max).map((u) => `${tileName(u.tile)} ×${u.live}`).join(", ") + (o.useful.filter((u) => u.live > 0).length > max ? "…" : "");

export type Row = { key: string; label: string; tile: Tile; shanten: number; live: number; kinds: number; chance: number; danger: number; why: string; useful: DiscardOption["useful"] };
export type Compare = { rows: Row[]; chosen: string | null; best: Row; gap: string; unseen: number; all: DiscardOption[] };

function whyFor(o: DiscardOption, best: DiscardOption, hand: Tile[]): string {
  const c = counts(hand); const k = c[idx(o.tile)];
  const kind = isHonor(o.tile) ? (k === 1 ? "a lone honour tile — it can only ever become a pung, so it's usually the first to go" : "an honour you hold a pair of — keep it if you want a pung")
    : k >= 2 ? "breaks a pair you could pung or use as your eyes" : "";
  if (o.shanten > best.shanten) return `Moves you backward: ${describeShanten(best.shanten)} becomes ${describeShanten(o.shanten)}. ${kind ? `It ${kind}.` : ""}`.trim();
  if (o.tile === best.tile) return o.shanten === 0 ? `Keeps you ready, waiting on ${o.useful.map((u) => tileName(u.tile)).join(" / ")} (${o.live} left).` : `Keeps the most tiles that move you closer: ${o.useful.length} kinds, ${o.live} tiles still live.${kind && isHonor(o.tile) ? ` It's ${kind}.` : ""}`;
  if (o.live < best.live) return `Same distance to ready, but ${best.live - o.live} fewer useful tiles left to draw than discarding ${tileName(best.tile)}.`;
  return "Equally good on the numbers.";
}
/** Rows for the comparison card: your discard plus up to 3 better options (or the top 3 if yours was best). */
export function compareDiscards(sp: Spot, chosen: Tile | null): Compare {
  const all = analyzeDiscards(sp.hand, sp.melds.length, sp.vis, sp.unseen);
  const th = threats(sp.view) > 0;
  const mk = (o: DiscardOption): Row => ({ key: o.tile, label: `Discard ${tileName(o.tile)}`, tile: o.tile, shanten: o.shanten, live: o.live, kinds: o.useful.length, chance: o.chance,
    danger: th ? danger(sp.view, o.tile) : 0, why: whyFor(o, all[0], sp.hand), useful: o.useful });
  const best = mk(all[0]);
  const mine = chosen ? all.find((o) => o.tile === chosen) : null;
  const better = mine ? all.filter((o) => o.shanten < mine.shanten || (o.shanten === mine.shanten && o.live > mine.live)) : [];
  let rows: Row[];
  if (!mine) rows = all.slice(0, 3).map(mk);
  else if (!better.length) rows = [mk(mine), ...all.filter((o) => o.tile !== mine.tile).slice(0, 2).map(mk)];
  else rows = [...better.slice(0, 3).map(mk), mk(mine)];
  const m = mine ? mk(mine) : null;
  let gap: string;
  if (!m) gap = `Best: ${best.label} — ${sh(best.shanten)}, ${best.live} useful tiles live (${pct(best.chance)} to improve on your next draw).`;
  else if (!better.length) gap = `✓ Good discard. ${tileName(m.tile)} keeps you ${describeShanten(m.shanten)} with ${m.live} useful tiles live — as good as any option.`;
  else if (better[0].shanten < m.shanten) gap = `✗ ${tileName(best.tile)} was better: it keeps you ${describeShanten(best.shanten)}; your discard left you ${describeShanten(m.shanten)}.`;
  else gap = `≈ Close. ${tileName(best.tile)} keeps ${best.live - m.live} more useful tiles live (${best.live} vs ${m.live}): ${pct(best.chance)} vs ${pct(m.chance)} to improve on the next draw.`;
  if (th && m && m.danger >= 1 && best.danger < m.danger) gap += ` Careful: an opponent has 2+ exposed sets and ${tileName(m.tile)} looks risky.`;
  return { rows, chosen: chosen, best, gap, unseen: sp.unseen, all };
}
/** Is the comparison worth showing? (always in Train/guided modes) */
export const isBest = (c: Compare) => !c.chosen || c.rows[0].key === c.chosen;

export type ClaimKind = "win" | "pung" | "kong" | "chow" | "pass";
export type ClaimAdvice = { best: ClaimKind; bestTiles?: Tile[]; text: string; lines: { k: ClaimKind; label: string; shanten: number; note: string }[] };
/** Whether taking the discard helps: compares the shanten you reach after claiming (and discarding once) with simply passing. */
export function claimAdvice(sp: Spot, tile: Tile, o: { win: boolean; pung: boolean; kong: boolean; chows: Tile[][] }, winds: { seat: number; round: number }): ClaimAdvice {
  const base = shanten(counts(sp.hand), sp.melds.length);
  const lines: ClaimAdvice["lines"] = [];
  if (o.win) return { best: "win", text: `${tileName(tile)} completes your hand — always take the win.`, lines: [{ k: "win", label: "Mahjong!", shanten: -1, note: "Wins the hand" }, { k: "pass", label: "Pass", shanten: base, note: "Gives up a sure win" }] };
  const value = isHonor(tile) && (+tile[0] >= 5 || +tile[0] - 1 === winds.seat || +tile[0] - 1 === winds.round);
  if (o.pung) lines.push({ k: "pung", label: `Pung ${tileName(tile)}`, shanten: shantenAfterMeld(sp.hand, sp.melds.length, [tile, tile]), note: value ? "A pung of this honour scores 1 faan" : "Exposes a set of three" });
  if (o.kong) lines.push({ k: "kong", label: `Kong ${tileName(tile)}`, shanten: shantenAfterMeld(sp.hand, sp.melds.length, [tile, tile, tile], false), note: "Four of a kind + a replacement draw" });
  for (const ch of o.chows) lines.push({ k: "chow", label: `Chow ${ch.map((t) => t[0]).join("-")} ${tileName(tile).split(" ").slice(1).join(" ")}`, shanten: shantenAfterMeld(sp.hand, sp.melds.length, removeTiles(ch, [tile])), note: "A run, only from the player on your left" });
  lines.push({ k: "pass", label: "Pass", shanten: base, note: "Keep your hand concealed (+1 faan if you win without claiming)" });
  const open = sp.melds.some((m) => !m.concealed);
  const scored = lines.map((l) => ({ l, v: l.shanten - (l.k === "pung" && value ? 0.6 : 0) + (l.k !== "pass" && !open ? 0.35 : 0) + (l.k === "chow" ? 0.15 : 0) }));
  scored.sort((a, b) => a.v - b.v);
  const b = scored[0].l;
  const text = b.k === "pass"
    ? `Pass. Claiming doesn't bring you closer (${describeShanten(base)} either way)${open ? "" : ", and staying concealed keeps the +1 faan for a concealed hand"}.`
    : `${b.label}: it takes you from ${describeShanten(base)} to ${describeShanten(b.shanten)}${b.k === "pung" && value ? " and the pung itself scores 1 faan" : ""}.${!open ? " The cost: your hand is no longer concealed (−1 faan)." : ""}`;
  return { best: b.k, bestTiles: b.k === "chow" ? o.chows[lines.filter((l) => l.k === "chow").indexOf(b)] : undefined, text, lines };
}
/** Plain-language read of a hand for the guided tips. */
export function handRead(sp: Spot): string {
  const s = shanten(counts(sp.hand), sp.melds.length);
  if (sp.hand.length % 3 === 1 && s === 0) return `You're ready (tenpai)! You win with ${waits(sp.hand, sp.melds.length).map(tileName).join(" or ")}.`;
  return `Your hand is ${describeShanten(s)}.`;
}
export const windName = (w: number) => WIND_NAME[w];
