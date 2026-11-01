// Mahjong comparison card: maps the discard analysis onto the shared TrainCard (same look as the Hold'em / Blackjack coach).
import { TrainCard, type CoachRow } from "../ui/TrainCard.tsx";
import { MjTile } from "./Tile.tsx";
import { tileName } from "./tiles.ts";
import { sh, type Compare, type ClaimAdvice } from "./coach.ts";

const pct = (x: number) => `${Math.round(x * 100)}%`;
export function coachRows(c: Compare): CoachRow[] {
  return c.rows.map((r) => ({
    key: r.key, label: r.label, why: r.why, winFrac: r.chance, evNum: -r.shanten * 100 + r.live,
    bar: [{ frac: r.chance, cls: r.shanten < 0 ? "good" : r.shanten === 0 ? "good" : "mid" }, { frac: 1 - r.chance, cls: "bad" }],
    ev: `${sh(r.shanten)} · ${pct(r.chance)}`,
    metric: `${r.shanten < 0 ? "Complete" : r.shanten === 0 ? "Ready (0 away)" : `Shanten ${r.shanten}`} · ${r.live} useful tile${r.live === 1 ? "" : "s"} live (${r.kinds} kind${r.kinds === 1 ? "" : "s"}) · ${pct(r.chance)} to improve on the next draw${r.danger >= 1 ? " · ⚠ risky vs an open hand" : ""}`,
    math: (<div className="mj-math">
      <div className="mj-useful">{r.useful.map((u) => <span key={u.tile} className={`mj-u ${u.live ? "" : "dead"}`}><MjTile tile={u.tile} size="xs" /><b>×{u.live}</b></span>)}</div>
      <p className="tiny">{r.useful.length ? <>Useful tiles = any draw that moves you one step closer ({r.shanten === 0 ? "winning tiles" : "lowers shanten"}). Live = 4 minus the copies you can already see (your hand, every pond and exposed set). Chance next draw = {r.live} ÷ {c.unseen} unseen tiles = <b>{pct(r.chance)}</b>.</> : "No draw improves this hand right away."}</p>
    </div>),
  }));
}
export function MjCoachCard({ c, onClose, title }: { c: Compare; onClose: () => void; title?: string }) {
  return <TrainCard rows={coachRows(c)} chosen={c.chosen} title={title ?? (c.chosen ? "Coach — your discard vs better options" : "Hint — best discards")} gapText={c.gap}
    sample={`“N away” = shanten: how many tile swaps from ready. Counts use only tiles you can see: ${c.unseen} tiles are unseen (wall + other hands). Tap a row for the useful tiles.`} onClose={onClose} />;
}
export function ClaimCard({ a, chosen, onClose }: { a: ClaimAdvice; chosen: string | null; onClose: () => void }) {
  const good = !chosen || chosen === a.best;
  return (
    <div className="coach pop-in" role="dialog" aria-label="Claim decision">
      <div className="coach-h"><b>🎓 {chosen ? "Coach — your claim decision" : "Claim hint"}</b><button className="x" onClick={onClose} aria-label="Close">×</button></div>
      <p className={`coach-gap ${good ? "ok" : "warn"}`}>{chosen ? (good ? "✓ Good call. " : "✗ Better: ") : ""}{a.text}</p>
      {a.lines.map((l) => <div key={l.label} className={`coach-row ${l.k === chosen ? "mine" : ""}`}><div className="coach-top"><span className="coach-name">{l.k === a.best && <span className="star">★</span>}{l.label}{l.k === chosen && <em> you</em>}</span><span className="coach-ev">{sh(l.shanten)}</span><span className="coach-metric">{l.k === "win" ? "Wins now" : l.k === "pass" ? `Stay ${sh(l.shanten).toLowerCase()}` : `After claiming and discarding: ${sh(l.shanten).toLowerCase()}`}</span><span className="coach-why">{l.note}</span></div></div>)}
      <p className="muted tiny">Shanten after a claim assumes you then throw your best tile. Claiming exposes the set (no “concealed hand” faan) but saves a whole draw.</p>
    </div>
  );
}
export const claimLabel = (k: string, tile: string) => (k === "pass" ? "Pass" : k === "win" ? "Mahjong!" : `${k[0].toUpperCase()}${k.slice(1)} ${tileName(tile)}`);
