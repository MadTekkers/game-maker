// Hong Kong Mahjong tiles. Pure TS, no imports beyond core: runs in the browser, vitest and the Deno edge function.
// A tile is a 2-char string: rank + suit. Suits: m = characters (萬), p = dots (circles), s = bamboo,
// z = honours (1-4 = East/South/West/North winds, 5-7 = Red/Green/White dragons), f = flowers 1-4, g = seasons 1-4.
export type Tile = string;
export const SUITS = ["m", "p", "s"] as const;
export const SUIT_NAME: Record<string, string> = { m: "Characters", p: "Dots", s: "Bamboo", z: "Honours", f: "Flowers", g: "Seasons" };
export const WIND_NAME = ["East", "South", "West", "North"];
export const WIND_CN = ["東", "南", "西", "北"];
export const DRAGON_NAME = ["Red dragon", "Green dragon", "White dragon"];
export const FLOWER_NAME = ["Plum", "Orchid", "Chrysanthemum", "Bamboo"];
export const SEASON_NAME = ["Spring", "Summer", "Autumn", "Winter"];

export const isBonus = (t: Tile) => t[1] === "f" || t[1] === "g";
export const isHonor = (t: Tile) => t[1] === "z";
export const isWind = (t: Tile) => t[1] === "z" && +t[0] <= 4;
export const isDragon = (t: Tile) => t[1] === "z" && +t[0] >= 5;
export const isTerminal = (t: Tile) => !isHonor(t) && !isBonus(t) && (t[0] === "1" || t[0] === "9");
export const rankOf = (t: Tile) => +t[0];
export const suitOf = (t: Tile) => t[1];

/** 0..33 index (m 0-8, p 9-17, s 18-26, z 27-33). Bonus tiles have no index. */
export const idx = (t: Tile) => ({ m: 0, p: 9, s: 18, z: 27 } as Record<string, number>)[t[1]] + +t[0] - 1;
export const fromIdx = (i: number): Tile => (i < 27 ? `${(i % 9) + 1}${"mps"[Math.floor(i / 9)]}` : `${i - 26}z`);
export const ALL_KINDS: Tile[] = Array.from({ length: 34 }, (_, i) => fromIdx(i));
export const TERMINALS_HONORS: number[] = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

export function fullSet(flowers = true): Tile[] {
  const out: Tile[] = [];
  for (const k of ALL_KINDS) for (let c = 0; c < 4; c++) out.push(k);
  if (flowers) for (let r = 1; r <= 4; r++) out.push(`${r}f`, `${r}g`);
  return out;
}
const ORDER: Record<string, number> = { m: 0, p: 1, s: 2, z: 3, f: 4, g: 5 };
export const tileCmp = (a: Tile, b: Tile) => ORDER[a[1]] - ORDER[b[1]] || +a[0] - +b[0];
export const sortTiles = (a: Tile[]) => [...a].sort(tileCmp);

export function tileName(t: Tile): string {
  const r = +t[0];
  if (t[1] === "z") return r <= 4 ? `${WIND_NAME[r - 1]} wind` : DRAGON_NAME[r - 5];
  if (t[1] === "f") return `${FLOWER_NAME[r - 1]} (flower ${r})`;
  if (t[1] === "g") return `${SEASON_NAME[r - 1]} (season ${r})`;
  return `${r} ${SUIT_NAME[t[1]]}`;
}
export function counts(tiles: Tile[]): number[] {
  const c = new Array(34).fill(0);
  for (const t of tiles) if (!isBonus(t)) c[idx(t)]++;
  return c;
}
/** Remove one copy of each tile in `rm` from `from` (throws if missing). */
export function removeTiles(from: Tile[], rm: Tile[]): Tile[] {
  const out = [...from];
  for (const t of rm) { const k = out.indexOf(t); if (k < 0) throw new Error(`missing ${t}`); out.splice(k, 1); }
  return out;
}
