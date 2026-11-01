// The five trainer stages, shown on the Mahjong setup screen and above every trainer page.
import { go } from "../../lib/router";
import { gameUrl } from "../../lib/lobby";

export const STAGES = [
  { n: 1, icon: "🀄", title: "Tile School", sub: "Learn the tiles, sets and winning hands with quick drills.", url: () => "/mahjong?mode=solo&school=tiles" },
  { n: 2, icon: "🎯", title: "Discard drills", sub: "Pick the best tile to throw. Feedback in shanten and useful tiles, getting harder.", url: () => "/mahjong?mode=solo&school=drills" },
  { n: 3, icon: "📖", title: "Guided game", sub: "A real game vs 3 bots with every tile face up and a tip on every turn and claim.", url: (bot = "easy") => gameUrl({ game: "mahjong", mode: "solo", seats: 4, bot, tut: 1 }) },
  { n: 4, icon: "💡", title: "Hints game", sub: "Hidden tiles. Ask for a hint any time; a coach card compares every discard.", url: (bot = "medium") => gameUrl({ game: "mahjong", mode: "solo", seats: 4, bot, train: 1 }) },
  { n: 5, icon: "🏆", title: "Real game", sub: "No hints. Just you and three bots (or friends).", url: (bot = "medium") => gameUrl({ game: "mahjong", mode: "solo", seats: 4, bot }) },
];
export function TrainerStages({ cur, bot }: { cur?: number; bot?: string }) {
  return (
    <nav className="mj-stages" aria-label="Mahjong trainer stages">
      {STAGES.map((s) => (
        <button key={s.n} className={`mj-stage ${cur === s.n ? "on" : ""}`} onClick={() => go(s.url(bot) + (s.n >= 3 ? `&n=${Date.now()}` : ""))} aria-current={cur === s.n ? "step" : undefined}>
          <span className="mj-stage-n">{s.n}</span><span className="mj-stage-i" aria-hidden>{s.icon}</span><b>{s.title}</b><small>{s.sub}</small>
        </button>))}
    </nav>
  );
}
