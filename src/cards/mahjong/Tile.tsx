// A Mahjong tile drawn in CSS/SVG: ivory face, green back. Uses the shared card-table motion (flyCard), so tiles slide from the wall,
// fly to the pond and flip face-up exactly like cards are dealt in Blackjack and Hold'em. Small corner index (3, E, R…) for beginners.
import { useLayoutEffect, useRef } from "react";
import { flyCard, type Fly } from "../ui/fly.ts";
import { type Tile as T, tileName } from "./tiles.ts";

const CN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const WIND = ["東", "南", "西", "北"]; const WIND_L = ["E", "S", "W", "N"];
const FLOWER = ["梅", "蘭", "菊", "竹"]; const SEASON = ["春", "夏", "秋", "冬"];
const DOTS: number[][][] = [
  [[15, 20]], [[15, 10], [15, 30]], [[7, 8], [15, 20], [23, 32]], [[9, 11], [21, 11], [9, 29], [21, 29]],
  [[8, 9], [22, 9], [15, 20], [8, 31], [22, 31]], [[9, 8], [21, 8], [9, 20], [21, 20], [9, 32], [21, 32]],
  [[6, 6], [15, 11], [24, 16], [9, 25], [21, 25], [9, 34], [21, 34]], [[9, 6], [21, 6], [9, 15], [21, 15], [9, 25], [21, 25], [9, 34], [21, 34]],
  [[7, 8], [15, 8], [23, 8], [7, 20], [15, 20], [23, 20], [7, 32], [15, 32], [23, 32]],
];
const DOT_COL = ["#1f5fae", "#1d7f45", "#c0392b"];
const STICKS: number[][][] = [
  [], [[15, 10], [15, 30]], [[15, 10], [9, 30], [21, 30]], [[9, 10], [21, 10], [9, 30], [21, 30]],
  [[8, 10], [22, 10], [15, 20], [8, 30], [22, 30]], [[7, 10], [15, 10], [23, 10], [7, 30], [15, 30], [23, 30]],
  [[15, 7], [7, 21], [15, 21], [23, 21], [7, 33], [15, 33], [23, 33]], [[6, 10], [12, 10], [18, 10], [24, 10], [6, 30], [12, 30], [18, 30], [24, 30]],
  [[7, 7], [15, 7], [23, 7], [7, 20], [15, 20], [23, 20], [7, 33], [15, 33], [23, 33]],
];
/** Short corner index: 1–9 for suits, E S W N, R G Wh for dragons, 1–4 for flowers/seasons. */
export function tileIndex(t: T): string {
  const r = +t[0];
  if (t[1] === "z") return r <= 4 ? WIND_L[r - 1] : ["R", "G", "Wh"][r - 5];
  return String(r);
}
function Face({ t }: { t: T }) {
  const r = +t[0], s = t[1];
  if (s === "m") return <span className="mj-ch"><b>{CN_NUM[r - 1]}</b><i>萬</i></span>;
  if (s === "z" && r <= 4) return <span className="mj-hz wind">{WIND[r - 1]}</span>;
  if (s === "z" && r === 5) return <span className="mj-hz red">中</span>;
  if (s === "z" && r === 6) return <span className="mj-hz green">發</span>;
  if (s === "z") return <span className="mj-white" />;
  if (s === "f" || s === "g") return <span className={`mj-fl ${s}`}><b>{(s === "f" ? FLOWER : SEASON)[r - 1]}</b><i>{r}</i></span>;
  if (s === "p") {
    const pts = DOTS[r - 1]; const rad = r === 1 ? 9 : r <= 2 ? 6 : r <= 5 ? 5 : r === 6 ? 4.6 : 4;
    return <svg viewBox="0 0 30 40" className="mj-svg" aria-hidden>{pts.map(([x, y], k) => {
      const col = r === 1 ? "#c0392b" : r === 5 && k === 2 ? "#c0392b" : r === 7 && k < 3 ? "#1d7f45" : DOT_COL[(k + (r % 2)) % 2];
      return <g key={k}><circle cx={x} cy={y} r={rad} fill="none" stroke={col} strokeWidth={rad > 6 ? 2.2 : 1.6} /><circle cx={x} cy={y} r={rad * 0.45} fill={col} /></g>; })}</svg>;
  }
  // bamboo
  if (r === 1) return <svg viewBox="0 0 30 40" className="mj-svg" aria-hidden><ellipse cx="15" cy="13" rx="7" ry="8" fill="#1d7f45" /><circle cx="17" cy="10" r="2" fill="#fff" /><path d="M21 12 l6 2 -6 2z" fill="#c0392b" /><path d="M9 20 q6 14 6 16 M15 21 v15 M21 20 q-6 14 -6 16" stroke="#c0392b" strokeWidth="2" fill="none" /></svg>;
  const h = r >= 7 ? 9 : 14; const red = (k: number) => (r === 5 && k === 2) || (r === 7 && k === 0) || (r === 9 && k % 3 === 1);
  return <svg viewBox="0 0 30 40" className="mj-svg" aria-hidden>{STICKS[r - 1].map(([x, y], k) => <g key={k}><rect x={x - 1.8} y={y - h / 2} width={3.6} height={h} rx={1.8} fill={red(k) ? "#c0392b" : "#1d7f45"} /><rect x={x - 2.4} y={y - 0.8} width={4.8} height={1.6} rx={0.8} fill={red(k) ? "#8e2418" : "#145c31"} /></g>)}</svg>;
}

export function MjTile({ tile, size = "md", fly, side, sel, hint, dim, onClick, title, idx = true, className = "" }: {
  tile: T | null; size?: "xl" | "lg" | "md" | "sm" | "xs"; fly?: Fly | null; side?: boolean; sel?: boolean; hint?: boolean; dim?: boolean;
  onClick?: () => void; title?: string; idx?: boolean; className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => { if (fly && ref.current) flyCard(ref.current, { ...fly, flip: fly.flip ?? !!tile }); }, []);
  const cls = `mjt ${size} ${tile ? "up" : "down"} ${tile ? `s-${tile[1]}` : ""} ${fly ? "fly" : ""} ${side ? "side" : ""} ${sel ? "sel" : ""} ${hint ? "hinted" : ""} ${dim ? "dim" : ""} ${className}`;
  const label = title ?? (tile ? tileName(tile) : "Face-down tile");
  const inner = (
    <span className="pc-in">
      <span className="mjt-face">{tile && <><Face t={tile} />{idx && <em className="mjt-ix">{tileIndex(tile)}</em>}</>}</span>
      <span className="mjt-back" />
    </span>
  );
  if (onClick) return <button ref={ref as React.RefObject<HTMLButtonElement>} type="button" className={cls} onClick={onClick} aria-label={label} aria-pressed={sel} title={label}>{inner}</button>;
  return <span ref={ref as React.RefObject<HTMLSpanElement>} className={cls} role="img" aria-label={label} title={label}>{inner}</span>;
}
export function TileRow({ tiles, size = "sm", className = "", fly }: { tiles: (T | null)[]; size?: "xl" | "lg" | "md" | "sm" | "xs"; className?: string; fly?: (k: number) => Fly | null }) {
  return <span className={`mj-row ${className}`}>{tiles.map((t, k) => <MjTile key={k} tile={t} size={size} fly={fly?.(k) ?? null} />)}</span>;
}
