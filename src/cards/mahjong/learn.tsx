// Hong Kong Mahjong learn cards (tappable glossary), the faan/points reference, rule intros for the guided game, and the rules quiz.
import { useState } from "react";
import { TermCard, type Term } from "../holdem/learn.tsx";
import { MjTile, TileRow } from "./Tile.tsx";
import { POINTS } from "./hand.ts";

export const TERMS: (Term & { tiles?: string[] })[] = [
  { id: "tile", icon: "🀄", title: "Tile", body: "Mahjong is played with 144 tiles instead of cards: 108 suit tiles (3 suits × 1–9 × 4 copies), 28 honours (4 winds + 3 dragons, × 4) and 8 bonus flowers/seasons.", tiles: ["5p", "3s", "7m", "1z"] },
  { id: "suit", icon: "🔢", title: "Suits", body: "Three suits numbered 1–9: Dots (circles), Bamboo (sticks — the 1 is a bird) and Characters (a Chinese numeral over 萬). Runs (chows) only work inside one suit.", tiles: ["1p", "1s", "1m"] },
  { id: "honor", icon: "🀀", title: "Honours", body: "Winds and dragons. They have no numbers, so they can never be part of a run — only pairs, pungs and kongs. A lone honour is often the first tile to throw.", tiles: ["1z", "5z"] },
  { id: "wind", icon: "🧭", title: "Winds", body: "East 東, South 南, West 西, North 北. Each seat has a wind (the dealer is always East) and each round has one. A pung of your seat wind or the round wind scores 1 faan.", tiles: ["1z", "2z", "3z", "4z"] },
  { id: "dragon", icon: "🐉", title: "Dragons", body: "Red 中, Green 發 and White (a blank frame). A pung of any dragon scores 1 faan for anyone.", tiles: ["5z", "6z", "7z"] },
  { id: "flower", icon: "🌸", title: "Flowers & seasons", body: "8 bonus tiles. When you draw one it's set aside face up and you draw a replacement from the dead wall. The one numbered like your seat (East 1, South 2, West 3, North 4) is worth 1 faan; none at all is also 1 faan.", tiles: ["1f", "2g"] },
  { id: "wall", icon: "🧱", title: "The wall", body: "All tiles start face down in the wall. Players draw from it in turn. When it runs out before anyone wins, the hand is an exhaustive draw: nobody scores." },
  { id: "dead", icon: "⬛", title: "Dead wall", body: "The last 16 tiles are kept aside. Replacements for flowers and kongs come from here; they never count as normal draws." },
  { id: "chow", icon: "➡️", title: "Chow", body: "A run of three in one suit (e.g. 4-5-6 Bamboo). You may claim a discard for a chow only from the player on your left (the one who plays just before you).", tiles: ["4s", "5s", "6s"] },
  { id: "pung", icon: "🟰", title: "Pung", body: "Three identical tiles. You can claim any player's discard for a pung if you hold the other two — it skips everyone between and it's your turn.", tiles: ["8p", "8p", "8p"] },
  { id: "kong", icon: "4️⃣", title: "Kong", body: "Four identical tiles. Counts as one set, and because it uses an extra tile you immediately draw a replacement from the dead wall. Concealed kong: all four in your hand. Exposed: claimed from a discard or added to your pung.", tiles: ["2m", "2m", "2m", "2m"] },
  { id: "pair", icon: "👀", title: "Pair (the eyes)", body: "Two identical tiles. A winning hand is four sets (chows, pungs or kongs) plus exactly one pair.", tiles: ["9s", "9s"] },
  { id: "concealed", icon: "🙈", title: "Concealed vs exposed", body: "Sets you build from your own draws stay hidden (concealed). Sets made by claiming a discard are placed face up (exposed). Winning without ever claiming is worth +1 faan." },
  { id: "ready", icon: "⏳", title: "Ready (tenpai)", body: "One tile away from winning. The trainer counts how far you are as “N away” (shanten): 2 away → 1 away → ready → Mahjong!" },
  { id: "selfdraw", icon: "✋", title: "Self-draw", body: "Winning with a tile you drew yourself. +1 faan, and all three other players pay you. Winning on someone's discard: only that player pays, but double." },
  { id: "faan", icon: "⭐", title: "Faan", body: "Hong Kong scoring units. Each pattern in your winning hand adds faan (e.g. dragon pung 1, half flush 3); total faan converts to points 1·2·4·8·16·24·32·48·64·96·128 for 0–10 faan." },
  { id: "dealer", icon: "🏠", title: "Dealer / East", body: "The dealer sits East, starts with 14 tiles and plays first. If the dealer wins (or nobody wins) they stay dealer; otherwise East passes to the next seat and everyone's wind shifts. After four passes the round wind changes." },
];
/** Which glossary card fits the moment. */
export function contextTerm(o: { phase: string; handNo: number; claimKind?: string | null; flower?: boolean; ready?: boolean; lastClaim?: string | null; wallCount: number; draw?: boolean }) {
  if (o.phase === "handover") return o.draw ? "wall" : "faan";
  if (o.claimKind) return o.claimKind === "chow" ? "chow" : o.claimKind === "kong" ? "kong" : o.claimKind === "win" ? "selfdraw" : "pung";
  if (o.ready) return "ready";
  if (o.flower) return "flower";
  if (o.lastClaim) return o.lastClaim === "chow" ? "chow" : o.lastClaim === "kong" ? "kong" : "pung";
  if (o.wallCount < 20) return "wall";
  return ["tile", "suit", "honor", "dealer", "pair", "concealed"][o.handNo % 6];
}

export const FAAN_TABLE: { name: string; faan: string; ex?: string[] }[] = [
  { name: "Self-draw", faan: "1" }, { name: "Concealed hand (no claimed sets)", faan: "1" }, { name: "No flowers", faan: "1" }, { name: "Own flower/season (each)", faan: "1" },
  { name: "Dragon pung", faan: "1", ex: ["5z", "5z", "5z"] }, { name: "Seat-wind or round-wind pung", faan: "1 each", ex: ["1z", "1z", "1z"] },
  { name: "All chows", faan: "1" }, { name: "All pungs", faan: "3" }, { name: "Half flush (one suit + honours)", faan: "3" },
  { name: "Seven Pairs", faan: "4" }, { name: "Full flush (one suit only)", faan: "7" }, { name: "All honours", faan: "10 (limit)" }, { name: "Thirteen Orphans", faan: "10 (limit)", ex: ["1m", "9m", "1p", "9p", "1s", "9s", "1z", "2z", "3z", "4z", "5z", "6z", "7z"] },
];
export function ScoringCard() {
  return (
    <div className="mj-scoring">
      <table className="ip-table"><thead><tr><th>Pattern</th><th>Faan</th></tr></thead>
        <tbody>{FAAN_TABLE.map((r) => <tr key={r.name}><td>{r.name}{r.ex && <div className="mj-ex"><TileRow tiles={r.ex} size="xs" /></div>}</td><td>{r.faan}</td></tr>)}</tbody></table>
      <p className="small"><b>Faan → points:</b> {POINTS.map((p, f) => `${f}→${p}`).join(" · ")} (10+ faan = limit, 128).</p>
      <p className="small"><b>Who pays:</b> self-draw — each of the other three pays the points. Win on a discard — only the discarder pays, double the points. Draw — nobody pays. 1 point = 10 chips.</p>
    </div>
  );
}

export function LearnCards({ hot }: { hot: string | null }) {
  const [open, setOpen] = useState<string | null>(hot);
  const [score, setScore] = useState(false);
  const hotT = TERMS.find((t) => t.id === hot);
  const card = (t: (typeof TERMS)[number], o: boolean, f: () => void, h?: boolean) => (
    <div key={t.id} className="mj-term"><TermCard t={t} open={o} onToggle={f} hot={h} />{o && t.tiles && <TileRow tiles={t.tiles} size="sm" className="mj-term-tiles" />}</div>);
  return (
    <div className="learn">
      {hotT && <div className="lc-now"><span className="tiny">Right now at the table</span>{card(hotT, true, () => {}, true)}</div>}
      <button className={`lc rank ${score ? "open" : ""}`} aria-expanded={score} onClick={() => setScore(!score)}><span className="lc-t">⭐ Scoring: faan table & who pays</span></button>
      {score && <ScoringCard />}
      <div className="lc-grid">{TERMS.filter((t) => t.id !== hot).map((t) => card(t, open === t.id, () => setOpen(open === t.id ? null : t.id)))}</div>
    </div>
  );
}

/** One-time rule introductions in the guided game, shown the first time each thing happens. */
export const INTROS: Record<string, { title: string; body: string }> = {
  start: { title: "How a turn works", body: "On your turn a tile is drawn for you from the wall (it appears on the right of your hand). Then you throw one tile away into the middle. Goal: four sets + one pair." },
  flower: { title: "A flower!", body: "Flowers and seasons don't stay in your hand: they're set aside face up (they can score) and you draw a replacement from the dead wall. That happens automatically." },
  claim: { title: "You can claim a discard", body: "When someone throws a tile you can use, you may take it: Pung (you hold two of it), Kong (you hold three), Chow (a run — only from the player on your left), or Mahjong if it wins. Claimed sets go face up. Win beats pung/kong, which beat chow." },
  otherClaim: { title: "Someone claimed a tile", body: "A player took a discard to finish a set — it's now face up in front of them, and play continues from them (skipping anyone in between)." },
  kong: { title: "A kong", body: "Four of a kind counts as one set; the player draws an extra tile from the dead wall to make up for it." },
  ready: { title: "You're ready (tenpai)", body: "One more tile wins. The trainer shows which tiles you're waiting on and how many are still unseen." },
  win: { title: "Mahjong!", body: "Four sets and a pair. The faan breakdown below shows how the hand scored and who paid." },
  draw: { title: "Exhaustive draw", body: "The wall ran out with no winner, so nobody pays. The dealer stays East for the next hand." },
};

type RuleQ = { id: string; topic: string; q: string; options: string[]; answer: number; why: string; tiles?: string[] };
export const RULES_QUIZ: RuleQ[] = [
  { id: "win", topic: "Winning hand", q: "What does a normal winning hand contain?", options: ["Four sets + one pair (14 tiles)", "Seven sets", "Any 13 tiles of one suit"], answer: 0, why: "Four sets (chows, pungs or kongs) plus a pair. Seven Pairs and Thirteen Orphans are the two special exceptions." },
  { id: "chow", topic: "Chow", q: "Whose discard can you take for a chow (run)?", options: ["Anyone's", "Only the player on your left (who plays just before you)", "Only the dealer's"], answer: 1, why: "Chows may only be claimed from the previous player. Pungs, kongs and wins can be claimed from anyone." },
  { id: "honorchow", topic: "Honours", q: "Can East + South + West wind make a chow?", options: ["Yes", "No"], answer: 1, why: "Honours have no numbers, so they only form pairs, pungs and kongs.", tiles: ["1z", "2z", "3z"] },
  { id: "priority", topic: "Claims", q: "Two players want the same discard: one for a pung, one for Mahjong. Who gets it?", options: ["The pung", "The win", "Whoever is next in turn"], answer: 1, why: "Win > pung/kong > chow. Between two wins, the first in turn order after the discarder gets it." },
  { id: "flower", topic: "Flowers", q: "You draw a flower. What happens?", options: ["You must discard it", "It's set aside and you draw a replacement from the dead wall", "You lose your turn"], answer: 1, why: "Bonus tiles never stay in the hand. The one matching your seat number scores 1 faan." },
  { id: "kong", topic: "Kong", q: "After declaring a kong you…", options: ["Discard immediately", "Draw a replacement tile, then discard", "Skip your next turn"], answer: 1, why: "The kong uses four tiles for one set, so you draw a replacement from the dead wall to keep the hand size right." },
  { id: "pay", topic: "Scoring", q: "You win on a discard for 2 points. Who pays?", options: ["All three others pay 2", "The discarder pays 4 (double)", "Nobody"], answer: 1, why: "At this table: discard win → only the discarder pays, double. Self-draw → all three pay the base." },
  { id: "dragon", topic: "Faan", q: "How much is a pung of Red dragons worth?", options: ["1 faan", "3 faan", "Nothing"], answer: 0, why: "Every dragon pung is 1 faan; winds only score when they're your seat wind or the round wind.", tiles: ["5z", "5z", "5z"] },
  { id: "draw", topic: "Draw", q: "The wall runs out and nobody has won. What happens?", options: ["Lowest hand pays", "Nobody scores; the dealer stays", "Replay with the same tiles"], answer: 1, why: "An exhaustive draw: no payments and the dealer keeps East." },
  { id: "dealer", topic: "Dealer", q: "How many tiles does East (the dealer) start with?", options: ["13", "14", "16"], answer: 1, why: "Everyone gets 13; the dealer takes a 14th and starts by discarding." },
];
type Prog = Record<string, { right: boolean; tries: number }>;
const KEY = "mj_rules";
const loadP = (): Prog => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const saveP = (p: Prog) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } };
export function RulesQuiz() {
  const [prog, setProg] = useState<Prog>(() => loadP());
  const firstOpen = RULES_QUIZ.findIndex((q) => !prog[q.id]?.right);
  const [i, setI] = useState(firstOpen < 0 ? 0 : firstOpen);
  const [pick, setPick] = useState<number | null>(null);
  const q = RULES_QUIZ[i]; const right = RULES_QUIZ.filter((x) => prog[x.id]?.right).length;
  const choose = (k: number) => { if (pick !== null) return; setPick(k); const p = { ...prog, [q.id]: { right: prog[q.id]?.right || k === q.answer, tries: (prog[q.id]?.tries ?? 0) + 1 } }; setProg(p); saveP(p); };
  const next = () => { setPick(null); const n = RULES_QUIZ.findIndex((x, j) => j > i && !prog[x.id]?.right); setI(n >= 0 ? n : (i + 1) % RULES_QUIZ.length); };
  return (
    <div className="rquiz">
      <div className="rq-prog"><span>Rules check-in</span><b>{right}/{RULES_QUIZ.length} mastered</b></div>
      <div className="rq-bar" aria-hidden><i style={{ width: `${(right / RULES_QUIZ.length) * 100}%` }} /></div>
      <div className="rq-dots">{RULES_QUIZ.map((x, j) => <button key={x.id} className={`rq-dot ${prog[x.id]?.right ? "ok" : prog[x.id] ? "miss" : ""} ${j === i ? "cur" : ""}`} aria-label={`Question ${j + 1}: ${x.topic}`} onClick={() => { setI(j); setPick(null); }}>{j + 1}</button>)}</div>
      <p className="rq-topic">{q.topic}</p>
      <p className="rq-q">{q.q}</p>
      {q.tiles && <div className="mj-quiz-tiles">{q.tiles.map((t, k) => <MjTile key={k} tile={t} size="md" />)}</div>}
      <div className="rq-opts">{q.options.map((o, k) => <button key={k} className={`rq-opt ${pick !== null && k === q.answer ? "right" : ""} ${pick === k && k !== q.answer ? "wrong" : ""}`} disabled={pick !== null} onClick={() => choose(k)}>{o}</button>)}</div>
      {pick !== null && <div className={`rq-why ${pick === q.answer ? "ok" : "warn"}`}><b>{pick === q.answer ? "Correct." : "Not quite."}</b> {q.why}</div>}
      <div className="controls">{pick !== null && <button className="pill sm" onClick={next}>{right === RULES_QUIZ.length ? "Review another" : "Next question"}</button>}
        <button className="pill ghost sm" onClick={() => { setProg({}); saveP({}); setI(0); setPick(null); }}>Reset progress</button></div>
    </div>
  );
}
