// Trainer stages 1–2, all client-side: Tile School (recognise tiles, sets and winning hands) and Discard Drills
// (pick the best discard; feedback is the same comparison card as the table: shanten, live useful tiles, chance to improve).
import { useMemo, useState } from "react";
import { seededRng, shuffle, type Rng } from "../core.ts";
import { MjTile, TileRow } from "./Tile.tsx";
import { type Tile, ALL_KINDS, SUITS, SUIT_NAME, tileName, counts, sortTiles, fullSet, idx, isHonor } from "./tiles.ts";
import { analyzeDiscards, isComplete, shanten } from "./hand.ts";
import { compareDiscards, type Spot } from "./coach.ts";
import { MjCoachCard } from "./coachView.tsx";
import { beep } from "../../lib/fx";

const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const rnd = () => seededRng((Date.now() ^ (Math.random() * 2 ** 31)) >>> 0);
const pick = <T,>(a: T[], r: Rng) => a[Math.floor(r() * a.length)];

type Q = { tiles: Tile[]; prompt: string; options: string[]; answer: number; why: string };
const LESSONS: { id: string; title: string; intro: string; show: Tile[][]; gen: (r: Rng) => Q }[] = [
  { id: "suits", title: "1 · The three suits", intro: "Dots are circles, Bamboo are sticks (the 1 is a bird), Characters have a Chinese number on top of 萬 (“ten thousand”). The small corner number is there to help you while you learn.",
    show: SUITS.map((s) => Array.from({ length: 9 }, (_, k) => `${k + 1}${s}`)),
    gen: (r) => { const t = `${1 + Math.floor(r() * 9)}${pick([...SUITS], r)}`; const opts = ["Dots", "Bamboo", "Characters"]; const ask = r() < 0.5;
      if (ask) return { tiles: [t], prompt: "Which suit is this?", options: opts, answer: opts.indexOf(SUIT_NAME[t[1]]), why: `It's ${tileName(t)}.` };
      const n = +t[0]; const o = shuffle([n, ((n + 2) % 9) + 1, ((n + 5) % 9) + 1], r); return { tiles: [t], prompt: "What number is this tile?", options: o.map(String), answer: o.indexOf(n), why: t[1] === "m" ? `The Chinese numeral ${["一", "二", "三", "四", "五", "六", "七", "八", "九"][n - 1]} means ${n}.` : `Count the ${t[1] === "p" ? "circles" : "sticks"}: ${n}.` }; } },
  { id: "honours", title: "2 · Winds, dragons & flowers", intro: "Winds: 東 East, 南 South, 西 West, 北 North. Dragons: 中 Red, 發 Green, and White (an empty frame). Flowers and seasons are bonus tiles that get set aside when drawn.",
    show: [["1z", "2z", "3z", "4z"], ["5z", "6z", "7z"], ["1f", "2f", "3f", "4f", "1g", "2g", "3g", "4g"]],
    gen: (r) => { const pool = ["1z", "2z", "3z", "4z", "5z", "6z", "7z", "1f", "3g"]; const t = pick(pool, r); const names = shuffle([tileName(t), ...shuffle(pool.filter((x) => x !== t), r).slice(0, 3).map(tileName)], r);
      return { tiles: [t], prompt: "What is this tile?", options: names, answer: names.indexOf(tileName(t)), why: t[1] === "z" ? `${tileName(t)}.${+t[0] >= 5 ? " A pung of any dragon scores 1 faan." : " Winds score when they match your seat or the round."}` : "A bonus tile — set aside, replaced from the dead wall, and it can score 1 faan if its number matches your seat." }; } },
  { id: "sets", title: "3 · Sets: chow, pung, kong, pair", intro: "Chow = a run of three in one suit (4-5-6 Bamboo). Pung = three the same. Kong = four the same. Pair = two the same. Honours can't make runs.",
    show: [["3p", "4p", "5p"], ["7m", "7m", "7m"], ["6z", "6z", "6z", "6z"], ["9s", "9s"]],
    gen: (r) => { const k = Math.floor(r() * 3); const opts = ["Chow (run)", "Pung (three alike)", "Not a set"];
      if (k === 0) { const s = pick([...SUITS], r); const a = 1 + Math.floor(r() * 7); return { tiles: [a, a + 1, a + 2].map((x) => `${x}${s}`), prompt: "What is this?", options: opts, answer: 0, why: "Three in a row, same suit: a chow." }; }
      if (k === 1) { const t = pick(ALL_KINDS, r); return { tiles: [t, t, t], prompt: "What is this?", options: opts, answer: 1, why: "Three identical tiles: a pung." }; }
      const bad = pick([["1z", "2z", "3z"], ["3m", "4p", "5s"], ["2s", "3s", "5s"], ["8p", "9p", "1p"], ["5z", "6z", "7z"]], r);
      return { tiles: bad, prompt: "What is this?", options: opts, answer: 2, why: bad[0][1] === "z" ? "Honours have no numbers, so they can't form a run." : bad[0][1] !== bad[1][1] ? "A run must be in one suit." : "Runs must be consecutive; numbers don't wrap from 9 to 1." }; } },
  { id: "hands", title: "4 · Winning hands", intro: "A winning hand is four sets + one pair = 14 tiles. Special: Seven Pairs, and Thirteen Orphans (one of each 1, 9 and honour, plus one extra).",
    show: [["1m", "2m", "3m", "5p", "5p", "5p", "7s", "8s", "9s", "1z", "1z", "1z", "6z", "6z"]],
    gen: (r) => {
      const sets: Tile[] = [];
      for (let k = 0; k < 4; k++) { if (r() < 0.55) { const s = pick([...SUITS], r); const a = 1 + Math.floor(r() * 7); sets.push(...[a, a + 1, a + 2].map((x) => `${x}${s}`)); } else { const t = pick(ALL_KINDS, r); sets.push(t, t, t); } }
      const p = pick(ALL_KINDS, r); let hand = [...sets, p, p];
      if (counts(hand).some((x) => x > 4)) return LESSONS[3].gen(r);
      let ok = true;
      if (r() < 0.5) { const i = Math.floor(r() * 14); hand[i] = pick(ALL_KINDS, r); ok = isComplete(counts(hand), 0) && counts(hand).every((x) => x <= 4); if (counts(hand).some((x) => x > 4)) return LESSONS[3].gen(r); }
      hand = sortTiles(hand);
      return { tiles: hand, prompt: "Is this a winning hand?", options: ["Yes — Mahjong!", "Not yet"], answer: ok ? 0 : 1, why: ok ? "It splits into four sets and a pair." : `It doesn't split into four sets + a pair (it's ${shanten(counts(hand), 0) + 1} tile swap${shanten(counts(hand), 0) ? "s" : ""} away).` }; } },
];

export function TileSchool({ onDone }: { onDone: () => void }) {
  const [prog, setProg] = useState<Record<string, number>>(() => load("mj_school", {}));
  const firstOpen = LESSONS.findIndex((l) => (prog[l.id] ?? 0) < 5);
  const [li, setLi] = useState(firstOpen < 0 ? 0 : firstOpen);
  const [seed, setSeed] = useState(1);
  const [ans, setAns] = useState<number | null>(null);
  const L = LESSONS[li]; const r = useMemo(() => rnd(), [seed, li]); const q = useMemo(() => L.gen(r), [seed, li]);
  const got = prog[L.id] ?? 0;
  const choose = (k: number) => { if (ans !== null) return; setAns(k); const ok = k === q.answer; beep(ok ? "good" : "bad"); const p = { ...prog, [L.id]: ok ? got + 1 : Math.max(0, got - 1) }; setProg(p); save("mj_school", p); };
  const next = () => { setAns(null); setSeed(seed + 1); };
  const done = LESSONS.every((l) => (prog[l.id] ?? 0) >= 5);
  return (
    <div className="mj-school">
      <div className="mj-steps">{LESSONS.map((l, k) => <button key={l.id} className={`mj-step ${k === li ? "on" : ""} ${(prog[l.id] ?? 0) >= 5 ? "ok" : ""}`} onClick={() => { setLi(k); setAns(null); }}>{(prog[l.id] ?? 0) >= 5 ? "✓ " : ""}{l.title}</button>)}</div>
      <section className="mj-lesson">
        <h2>{L.title}</h2><p>{L.intro}</p>
        <div className="mj-show">{L.show.map((row, k) => <TileRow key={k} tiles={row} size="md" />)}</div>
      </section>
      <section className="mj-quiz rquiz" aria-live="polite">
        <div className="rq-prog"><span>Practice</span><b>{Math.min(5, got)}/5 to pass</b></div>
        <div className="rq-bar" aria-hidden><i style={{ width: `${Math.min(1, got / 5) * 100}%` }} /></div>
        <p className="rq-q">{q.prompt}</p>
        <div className="mj-quiz-tiles">{q.tiles.map((t, k) => <MjTile key={`${seed}-${k}`} tile={t} size={q.tiles.length > 8 ? "sm" : "lg"} idx={L.id !== "suits"} />)}</div>
        <div className="rq-opts">{q.options.map((o, k) => <button key={k} className={`rq-opt ${ans !== null && k === q.answer ? "right" : ""} ${ans === k && k !== q.answer ? "wrong" : ""}`} disabled={ans !== null} onClick={() => choose(k)}>{o}</button>)}</div>
        {ans !== null && <div className={`rq-why ${ans === q.answer ? "ok" : "warn"}`}><b>{ans === q.answer ? "Correct." : "Not quite."}</b> {q.why}</div>}
        <div className="controls">{ans !== null && <button className="pill sm" onClick={next}>Next</button>}
          {got >= 5 && li < LESSONS.length - 1 && <button className="pill sm" onClick={() => { setLi(li + 1); setAns(null); }}>Next lesson ›</button>}
          {done && <button className="pill sm" onClick={onDone}>Tile School done — on to Discard Drills ›</button>}</div>
      </section>
    </div>
  );
}

const LEVELS = [
  { n: 1, title: "Throw the loner", note: "Close to ready, with an obvious useless tile.", sh: [0, 1], seen: 0, loner: true },
  { n: 2, title: "Keep the shape", note: "One or two steps from ready.", sh: [1, 2], seen: 0, loner: false },
  { n: 3, title: "Messy hands", note: "Two or three steps away — find the tile that keeps the most options.", sh: [2, 3], seen: 0, loner: false },
  { n: 4, title: "Read the table", note: "Some tiles are already discarded — dead tiles don't help you.", sh: [1, 2], seen: 18, loner: false },
  { n: 5, title: "Fine margins", note: "Late in the hand: several options look alike; count the live tiles.", sh: [0, 2], seen: 34, loner: false },
];
type Drill = { hand: Tile[]; seen: Tile[] };
function genDrill(lv: (typeof LEVELS)[number], r: Rng): Drill {
  for (let g = 0; g < 400; g++) {
    const w = shuffle(fullSet(false), r); const hand = sortTiles(w.slice(0, 14)); const seen = w.slice(14, 14 + lv.seen);
    const vis = counts([...hand, ...seen]); const unseen = 136 - vis.reduce((a, b) => a + b, 0);
    const o = analyzeDiscards(hand, 0, vis, unseen); const best = o[0].shanten;
    if (best < lv.sh[0] || best > lv.sh[1]) continue;
    const c = counts(hand);
    if (lv.loner && !hand.some((t) => isHonor(t) && c[idx(t)] === 1)) continue;
    if (lv.n === 5 && !(o[1] && o[1].shanten === best && o[0].live - o[1].live <= 3 && o[0].live > o[1].live)) continue;
    if (lv.n >= 2 && o.filter((x) => x.shanten === best && x.live === o[0].live).length > 2) continue;
    return { hand, seen };
  }
  const w = shuffle(fullSet(false), r); return { hand: sortTiles(w.slice(0, 14)), seen: [] };
}
export function DiscardDrills() {
  const [st, setSt] = useState(() => load("mj_drills", { level: 1, streak: 0, right: 0, total: 0 }));
  const lv = LEVELS[Math.min(LEVELS.length, st.level) - 1];
  const [seed, setSeed] = useState(1);
  const d = useMemo(() => genDrill(lv, rnd()), [seed, st.level]);
  const [chosen, setChosen] = useState<Tile | null>(null);
  const [sel, setSel] = useState<Tile | null>(null);
  const spot: Spot = useMemo(() => {
    const vis = counts([...d.hand, ...d.seen]).map((x) => Math.min(4, x));
    return { hand: d.hand, melds: [], vis, unseen: 136 - vis.reduce((a, b) => a + b, 0), view: { hand: d.hand, melds: [], ponds: [d.seen], allMelds: [[]], seat: -1, wallCount: 80 } };
  }, [d]);
  const cmp = useMemo(() => (chosen ? compareDiscards(spot, chosen) : null), [chosen, spot]);
  const verdict = cmp ? (cmp.all.find((o) => o.tile === chosen)!.shanten === cmp.best.shanten && cmp.all.find((o) => o.tile === chosen)!.live >= cmp.best.live ? "best" : cmp.all.find((o) => o.tile === chosen)!.shanten === cmp.best.shanten ? "close" : "miss") : null;
  const answer = (t: Tile) => {
    if (chosen) return; setChosen(t); const c = compareDiscards(spot, t); const o = c.all.find((x) => x.tile === t)!; const ok = o.shanten === c.best.shanten && o.live >= c.best.live;
    beep(ok ? "good" : "bad");
    const streak = ok ? st.streak + 1 : 0; const up = streak >= 3 && st.level < LEVELS.length;
    const n = { level: up ? st.level + 1 : st.level, streak: up ? 0 : streak, right: st.right + (ok ? 1 : 0), total: st.total + 1 }; setSt(n); save("mj_drills", n);
  };
  const next = () => { setChosen(null); setSel(null); setSeed(seed + 1); };
  const tap = (t: Tile) => { if (chosen) return; if (sel === t) answer(t); else { beep("tap"); setSel(t); } };
  return (
    <div className="mj-drills">
      <div className="mj-steps">{LEVELS.map((l) => <button key={l.n} className={`mj-step ${l.n === st.level ? "on" : ""} ${l.n < st.level ? "ok" : ""}`} onClick={() => { const n = { ...st, level: l.n, streak: 0 }; setSt(n); save("mj_drills", n); next(); }}>{l.n < st.level ? "✓ " : ""}Level {l.n}</button>)}</div>
      <section className="mj-lesson"><h2>Level {lv.n} · {lv.title}</h2><p>{lv.note} You have 14 tiles: throw one away. Tap a tile to select it, tap again to discard. <b>3 best answers in a row</b> moves you up a level.</p>
        <p className="tiny muted">Score {st.right}/{st.total} · streak {st.streak}/3</p></section>
      {d.seen.length > 0 && <div className="mj-drill-seen"><span className="tiny">Already discarded on the table ({d.seen.length}):</span><TileRow tiles={sortTiles(d.seen)} size="xs" /></div>}
      <div className="mj-drill-hand felt">
        <div className="mj-hand-row">{d.hand.map((t, k) => <MjTile key={`${seed}-${k}`} tile={t} size="lg" sel={sel === t && !chosen} hint={!!cmp && t === cmp.best.tile} dim={!!chosen && t !== chosen && t !== cmp?.best.tile} onClick={() => tap(t)} />)}</div>
        {sel && !chosen && <div className="controls"><button className="pill" onClick={() => answer(sel)}>Discard {tileName(sel)}</button></div>}
      </div>
      {cmp && <>
        <div className={`bj-banner ${verdict === "best" ? "good" : verdict === "miss" ? "bad" : ""}`}>{verdict === "best" ? "✓ Best discard" : verdict === "close" ? "≈ Close — same distance, fewer useful tiles" : "✗ That moves you backwards"}</div>
        <MjCoachCard c={cmp} onClose={next} title="Your discard vs the best options" />
        <div className="controls"><button className="pill" onClick={next}>Next hand ›</button></div>
      </>}
    </div>
  );
}
