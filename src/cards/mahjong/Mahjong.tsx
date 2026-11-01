// Hong Kong Mahjong table (four seats, bots fill the empty ones) + the trainer pages. Same table plumbing as Hold'em:
// server-authoritative moves, replayed public frames (tap to skip), shared deal-speed slider, side panel / bottom sheet, coach cards.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ReplayBar } from "../ui/DealSpeed";
import { GameHeader } from "../../games/common";
import { Avatar } from "../../Lobby";
import { ensurePlayer, getPlayer, newRoomId } from "../../lib/player";
import { gameUrl } from "../../lib/lobby";
import { go } from "../../lib/router";
import { beep, confetti } from "../../lib/fx";
import { useCardTable, useAutoStart } from "../api";
import { SidePanel, type PanelTab } from "../ui/SidePanel";
import { TutorTips } from "../ui/TrickTable";
import type { Fly } from "../ui/fly";
import { MjTile } from "./Tile";
import type { PublicMj, PrivateMj } from "./engine";
import { type Tile, tileName, WIND_CN, WIND_NAME, counts, idx, removeTiles } from "./tiles";
import { type Meld, POINTS, shanten, waits } from "./hand";
import { spotOf, compareDiscards, claimAdvice, handRead, sh, usefulText, type Compare, type ClaimAdvice } from "./coach";
import { MjCoachCard, ClaimCard } from "./coachView";
import { LearnCards, RulesQuiz, TERMS, INTROS, contextTerm, ScoringCard } from "./learn";
import { TileSchool, DiscardDrills } from "./school";
import { TrainerStages } from "./stages";
import "../cards.css";
import "../table.css";
import "./mahjong.css";

const short = (n: string) => n.replace(" 🤖", "");
const pct = (x: number) => `${Math.round(x * 100)}%`;

export default function MahjongPage({ params }: { params: URLSearchParams }) {
  const school = params.get("school");
  if (school === "tiles" || school === "drills") return (
    <div className="game mj mj-schoolpage">
      <GameHeader title={school === "tiles" ? "Mahjong · Tile School" : "Mahjong · Discard Drills"} game="mahjong" room={null} status="live" />
      <TrainerStages cur={school === "tiles" ? 1 : 2} />
      {school === "tiles" ? <TileSchool onDone={() => go("/mahjong?mode=solo&school=drills")} /> : <DiscardDrills />}
    </div>
  );
  return <MahjongTable params={params} />;
}

type Coach = { kind: "discard"; c: Compare; key: string } | { kind: "claim"; a: ClaimAdvice; chosen: string | null; key: string };

function useNow(on: boolean) { const [n, setN] = useState(Date.now()); useEffect(() => { if (!on) return; const t = setInterval(() => setN(Date.now()), 500); return () => clearInterval(t); }, [on]); return n; }

function MahjongTable({ params }: { params: URLSearchParams }) {
  const tutorial = params.get("tut") === "1";
  const live = params.get("mode") === "live" && !tutorial;
  const train = params.get("train") === "1";
  const coached = tutorial || train;
  const bot = ["easy", "medium", "hard"].includes(params.get("bot") || "") ? params.get("bot")! : tutorial ? "easy" : "medium";
  const expect = Number(params.get("expect")) || 0;
  const [room] = useState(() => params.get("room") || newRoomId());
  const urlOpts = { game: "mahjong" as const, mode: (live ? "live" : "solo") as "live" | "solo", seats: 4, bot, train: train ? 1 : undefined, tut: tutorial ? 1 : undefined };
  useEffect(() => { if (!params.get("room")) history.replaceState(null, "", "#" + gameUrl({ ...urlOpts, room })); }, [room]);
  const [name] = useState(() => ensurePlayer());
  const T = useCardTable<PublicMj, PrivateMj>(room, { game: "mahjong", seats: 4, bot, name, live, tutorial }, (p) => `${p.handNo}|${p.seq}|${p.phase}`);
  const { pub, seat } = T;
  const [sel, setSel] = useState<Tile | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [hintTile, setHintTile] = useState<Tile | null>(null);
  const [tab, setTab] = useState(() => (tutorial ? "tips" : "coach"));
  const [intro, setIntro] = useState<string | null>(null);
  const seenIntro = useRef(new Set<string>());
  useEffect(() => () => { if (live) T.leave(); }, []);
  useAutoStart(T, expect, pub);
  // deal animations only for tiles that arrive after the first render
  const live0 = useRef(false);
  useEffect(() => { if (pub) { const t = setTimeout(() => { live0.current = true; }, 50); return () => clearTimeout(t); } }, [!!pub]);

  const P = T.priv; const ok = !!pub && !!P && P.handNo === pub.handNo;
  const myTurn = !!pub && !T.replaying && ok && pub.phase === "play" && pub.turn === seat && pub.step === "discard" && P!.hand.length % 3 === 2;
  const claimO = !!pub && !T.replaying && ok && pub.phase === "play" && pub.step === "claim" && pub.claim ? P!.claim : null;
  const decisionKey = pub ? `${pub.handNo}|${pub.seq}|${myTurn}|${!!claimO}` : "";
  useEffect(() => { setSel(null); setHintTile(null); }, [decisionKey]);
  const winds = pub && seat >= 0 ? { seat: pub.seatWinds[seat], round: pub.roundWind } : { seat: 0, round: 0 };
  const spot = useMemo(() => (pub && ok && seat >= 0 ? spotOf(pub, seat, P!.hand) : null), [decisionKey, ok]);
  // tutorial: the best discard and the claim advice are worked out before you decide
  const best = useMemo(() => (myTurn && spot && tutorial ? compareDiscards(spot, null) : null), [decisionKey, tutorial]);
  const advice = useMemo(() => (claimO && spot && pub?.claim ? claimAdvice(spot, pub.claim.tile, claimO, winds) : null), [decisionKey]);

  // rule intros (guided game), shown the first time each thing happens
  const showIntro = (k: string) => { if (!tutorial || seenIntro.current.has(k)) return; seenIntro.current.add(k); setIntro(k); };
  useEffect(() => {
    if (!pub || !tutorial || T.replaying) return;
    if (pub.phase === "handover" && pub.lastHand) return showIntro(pub.lastHand.draw ? "draw" : "win");
    if (claimO) return showIntro("claim");
    if (pub.lastClaim?.type === "kong") showIntro("kong");
    else if (pub.lastClaim && pub.lastClaim.seat !== seat) showIntro("otherClaim");
    if (seat >= 0 && pub.flowers[seat]?.length) showIntro("flower");
    if (myTurn) showIntro("start");
    if (ok && seat >= 0 && P!.hand.length % 3 === 1 && shanten(counts(P!.hand), pub.melds[seat].length) === 0) showIntro("ready");
  }, [decisionKey, T.replaying, pub?.phase]);

  const lastNo = useRef(-1);
  useEffect(() => { const L = pub?.lastHand; if (!L || T.replaying) return; if (lastNo.current >= 0 && L.handNo !== lastNo.current && seat >= 0) { if (L.winner === seat) { beep("good"); confetti(); } else if ((L.pay[seat] ?? 0) < 0) beep("bad"); } lastNo.current = L.handNo; }, [pub?.lastHand?.handNo, T.replaying]);

  // what tiles to show for my own hand (during a replay, the newest private view minus the tile I haven't drawn yet in that frame)
  const myView = useMemo(() => {
    if (!pub || seat < 0) return null;
    const pv = T.replaying ? T.privNext : T.priv; if (!pv || pv.handNo !== pub.handNo || !pv.hand.length) return null;
    let hand = pv.hand; const want = pub.phase === "handover" ? hand.length : pub.handCount[seat];
    if (hand.length === want + 1 && pv.drawn) hand = removeTiles(hand, [pv.drawn]);
    else if (hand.length !== want) return null;
    const drawn = pub.phase === "play" && pub.turn === seat && pub.step === "discard" && hand.length % 3 === 2 && pv.drawn && hand.includes(pv.drawn) ? pv.drawn : null;
    return { rest: drawn ? removeTiles(hand, [drawn]) : hand, drawn };
  }, [pub, T.priv, T.privNext, T.replaying, seat]);
  const myDealt = useRef(-1); const backsDealt = useRef(-1);
  useEffect(() => { if (myView && pub) myDealt.current = pub.handNo; }, [!!myView, pub?.handNo]);
  useEffect(() => { if (pub) backsDealt.current = pub.handNo; }, [pub?.handNo]);

  const nowMs = useNow(!!pub?.deadline);
  if (!pub) return <div className="game mj"><GameHeader title="Hong Kong Mahjong" game="mahjong" room={live ? room : null} status="connecting" /><p className="center muted">{T.err || "Building the wall…"}</p></div>;

  const n = 4; const vs = seat >= 0 ? seat : 0; const rel = (i: number) => (i - vs + n) % n;
  const names = pub.seats.map((s, i) => (i === seat ? "You" : short(s.name)));
  const poss = (i: number) => (i === seat ? "your" : `${names[i]}'s`);
  const me = seat >= 0 ? pub.seats[seat] : null;
  const LH = pub.lastHand; const over = pub.phase === "handover" && !!LH;
  const animate = live0.current;
  const dealPos = (i: number, k: number) => { const p = (i - pub.dealer + n) % n; return k < 12 ? Math.floor(k / 4) * 16 + p * 4 + (k % 4) : k === 12 ? 48 + p : 52; };
  const dealingBacks = backsDealt.current !== pub.handNo;
  const backFly = (i: number, k: number): Fly | null => !animate ? null : dealingBacks ? { from: "#mj-wall", order: dealPos(i, k), gap: 34, dur: 260, flip: false } : { from: pub.drewFrom === "dead" ? "#mj-dead" : "#mj-wall", order: 0, gap: 0, dur: 300, flip: false };
  const humansHere = pub.seats.filter((s) => s.kind === "human").map((s) => s.name).filter((x) => x !== getPlayer());
  const hot = coached ? contextTerm({ phase: pub.phase, handNo: pub.handNo, claimKind: claimO ? (claimO.win ? "win" : claimO.pung ? "pung" : claimO.kong ? "kong" : "chow") : null, flower: seat >= 0 && pub.flowers[seat]?.length > 0 && pub.handNo % 2 === 1, lastClaim: pub.lastClaim?.type ?? null, wallCount: pub.wallCount, draw: LH?.draw }) : null;
  const hotTerm = TERMS.find((t) => t.id === hot);

  const doDiscard = (t: Tile) => {
    if (!myTurn || !P) return; beep("tap");
    if (coached) { setCoach({ kind: "discard", c: compareDiscards(spotOf(pub, seat, P.hand), t), key: `${pub.handNo}-${pub.seq}` }); }
    setSel(null); setHintTile(null); T.act({ t: "discard", tile: t });
  };
  const tapTile = (t: Tile) => { if (!myTurn) return; if (sel === t) doDiscard(t); else { beep("tap"); setSel(t); } };
  const doClaim = (k: "win" | "pung" | "kong" | "chow" | "pass", tiles?: Tile[]) => {
    beep("tap");
    if (coached && advice && k !== "win") setCoach({ kind: "claim", a: advice, chosen: k, key: `${pub.handNo}-${pub.seq}` });
    T.act(k === "chow" ? { t: "chow", tiles } : k === "kong" ? { t: "claimkong" } : { t: k });
  };
  const askHint = () => { if (!spot) return; T.hint(); if (claimO && advice) { setCoach({ kind: "claim", a: advice, chosen: null, key: `h${pub.seq}` }); return; } const c = compareDiscards(spot, null); setCoach({ kind: "discard", c, key: `h${pub.seq}` }); setHintTile(c.best.tile); setTab("coach"); };
  const newTable = () => go(gameUrl(urlOpts) + `&n=${Date.now()}`);

  // ---------- table pieces ----------
  const meldEl = (m: Meld, i: number, mi: number) => (
    <span key={`${pub.handNo}-m${mi}-${m.tiles.length}`} className={`mj-meld ${m.type}`} title={`${m.concealed ? "Concealed" : "Exposed"} ${m.type}`}>
      {m.tiles.map((t, k) => <MjTile key={k} tile={m.concealed && (k === 0 || k === 3) ? null : t} size={i === seat ? "sm" : "xs"} side={!m.concealed && k === 1 && m.from !== i}
        fly={animate ? { from: m.concealed || m.from === i ? `#mj-seat-${i}` : `#mj-pond-${m.from}`, order: 300 + k, gap: 60, dur: 360, flip: true } : null} />)}
    </span>);
  const seatEl = (i: number) => {
    const s = pub.seats[i]; const r = rel(i); const mine = i === seat; const w = pub.seatWinds[i];
    const tut = pub.hands?.[i]; const cnt = pub.handCount[i];
    const vert = r === 1 || r === 3;
    return (
      <div key={i} id={`mj-seat-${i}`} className={`mj-seat r${r} ${pub.phase === "play" && pub.turn === i ? "turn" : ""} ${pub.claim?.from === i && pub.step === "claim" ? "claiming" : ""} ${over && LH!.winner === i ? "won" : ""} ${mine ? "mine" : ""}`}>
        <div className="mj-plate">
          <Avatar name={s.name} size={mine ? 20 : 18} /><b className="nm">{names[i]}</b>
          <span className={`mj-wind ${w === 0 ? "east" : ""}`} title={`${WIND_NAME[w]} seat${w === 0 ? " — dealer" : ""}`}>{WIND_CN[w]}<small>{WIND_NAME[w][0]}</small></span>
          <span className="mj-pts" title="Points this game">{pub.points[i] > 0 ? "+" : ""}{pub.points[i]}</span>
        </div>
        {pub.act[i] && pub.phase === "play" && <span key={`${pub.seq}-${i}`} className={`mj-bubble ${/!/.test(pub.act[i]!) ? "loud" : ""}`}>{pub.act[i]}</span>}
        {s.kind === "bot" && !mine && <span className="mj-lvl tiny">{s.level}</span>}
        {s.pending && <span className="tiny pend">↪ {s.pending.name}</span>}
        {!mine && pub.phase !== "waiting" && <div className={`mj-backs ${vert ? "v" : "h"} ${tut ? "up" : ""}`} aria-label={`${cnt} tiles in hand`}>
          {tut ? tut.map((t, k) => <MjTile key={`${pub.handNo}-${k}-${t}`} tile={t} size="xs" fly={animate && dealingBacks ? { from: "#mj-wall", order: dealPos(i, k), gap: 34, dur: 260, flip: true } : null} />)
            : Array.from({ length: cnt }, (_, k) => <MjTile key={`${pub.handNo}-${k}`} tile={null} size="xs" className={vert ? "edge" : ""} fly={backFly(i, k)} />)}
        </div>}
        {(pub.melds[i].length > 0 || pub.flowers[i].length > 0) && <div className="mj-open">
          {pub.melds[i].map((m, mi) => meldEl(m, i, mi))}
          {pub.flowers[i].length > 0 && <span className="mj-flowers" title="Flowers & seasons">{pub.flowers[i].map((f, k) => <MjTile key={`${pub.handNo}-f${k}`} tile={f} size="xs" fly={animate ? { from: `#mj-seat-${i}`, order: 200 + k, gap: 80, flip: true } : null} />)}</span>}
        </div>}
      </div>
    );
  };
  const pondEl = (i: number) => (
    <div key={`p${i}`} id={`mj-pond-${i}`} className={`mj-pond r${rel(i)}`} aria-label={`${names[i]} discards`}>
      {pub.ponds[i].map((t, k) => { const last = pub.lastDiscard?.seat === i && k === pub.ponds[i].length - 1;
        return <MjTile key={`${pub.handNo}-${k}`} tile={t} size="xs" hint={last && pub.step === "claim"} className={last ? "last" : ""} fly={animate ? { from: i === seat ? "#mj-mine" : `#mj-seat-${i}`, order: 100, gap: 0, dur: 340, flip: i !== seat } : null} />; })}
    </div>);
  const stacks = Math.ceil(pub.wallCount / 2); const deadStacks = Math.ceil(pub.deadCount / 2);
  const center = (
    <div className="mj-center">
      {[0, 1, 2, 3].map((r) => pondEl((vs + r) % n))}
      <div className="mj-wallbox">
        <div className="mj-round"><b>{WIND_CN[pub.roundWind]}</b> {WIND_NAME[pub.roundWind]} round · hand {pub.handNo}</div>
        <div id="mj-wall" className="mj-wall" title={`Wall: ${pub.wallCount} tiles left`} aria-label={`Wall, ${pub.wallCount} tiles left`}>{Array.from({ length: stacks }, (_, k) => <i key={k} className={k === stacks - 1 && pub.wallCount % 2 ? "half" : ""} />)}</div>
        <div className="mj-wl"><span>Wall <b>{pub.wallCount}</b></span><span id="mj-dead" className="mj-dead" title={`Dead wall: ${pub.deadCount} replacement tiles`}>{Array.from({ length: deadStacks }, (_, k) => <i key={k} />)}<em>Dead {pub.deadCount}</em></span></div>
        {pub.phase === "play" && <div className="mj-turn tiny">{pub.step === "claim" && pub.claim ? `${names[pub.claim.from]} discarded ${tileName(pub.claim.tile)} — claims?` : pub.turn >= 0 ? (pub.turn === seat ? "Your turn" : `${names[pub.turn]}'s turn`) : ""}</div>}
      </div>
      {over && !LH!.draw && <div className="mj-reveal" aria-label={`${poss(LH!.winner)} winning hand`}>
        <div className="mj-reveal-h"><b>{LH!.winner === seat ? "Mahjong! You win" : `${names[LH!.winner]} wins`}</b> · {LH!.selfDraw ? "self-draw" : `on ${poss(LH!.from)} discard`}</div>
        <div className="mj-reveal-t">
          {LH!.hand.map((t, k) => <MjTile key={`${LH!.handNo}-r${k}`} tile={t} size="sm" hint={t === LH!.tile && k === LH!.hand.lastIndexOf(t)} fly={animate ? { from: LH!.winner === seat ? "#mj-mine" : `#mj-seat-${LH!.winner}`, order: 400 + k, gap: 60, dur: 320, flip: true } : null} />)}
          {LH!.melds.map((m, mi) => <span key={mi} className="mj-meld">{m.tiles.map((t, k) => <MjTile key={k} tile={t} size="sm" />)}</span>)}
        </div>
      </div>}
      {over && LH!.draw && <div className="mj-reveal draw"><b>Exhaustive draw</b><span className="tiny">The wall ran out. Nobody scores.</span></div>}
    </div>
  );

  // ---------- my hand ----------
  const myFlyDeal = myDealt.current !== pub.handNo && animate;
  const occ: Record<string, number> = {};
  const mine = myView && (
    <div id="mj-mine" className={`mj-mine ${myTurn ? "myturn" : ""}`} aria-label="Your hand">
      <div className="mj-hand-row">
        {myView.rest.map((t, k) => { const o = (occ[t] = (occ[t] ?? 0) + 1); const bestT = (tutorial && best?.best.tile === t) || hintTile === t;
          return <MjTile key={`${pub.handNo}-${t}-${o}`} tile={t} size="lg" sel={sel === t} hint={myTurn && bestT && sel !== t} onClick={myTurn ? () => tapTile(t) : undefined}
            fly={myFlyDeal ? { from: "#mj-wall", order: dealPos(seat, k), gap: 34, dur: 260, flip: true } : null} />; })}
        {myView.drawn && <span className="mj-drawn"><MjTile key={`${pub.handNo}-d-${pub.wallCount}-${pub.deadCount}`} tile={myView.drawn} size="lg" sel={sel === myView.drawn} hint={myTurn && ((tutorial && best?.best.tile === myView.drawn) || hintTile === myView.drawn) && sel !== myView.drawn}
          onClick={myTurn ? () => tapTile(myView.drawn!) : undefined} fly={animate && !myFlyDeal ? { from: pub.drewFrom === "dead" ? "#mj-dead" : "#mj-wall", order: 0, gap: 0, dur: 320, flip: true } : myFlyDeal ? { from: "#mj-wall", order: 52, gap: 34, dur: 260, flip: true } : null} /></span>}
      </div>
    </div>);

  // ---------- guided prompt ----------
  const ready13 = ok && seat >= 0 && P!.hand.length % 3 === 1 && pub.phase === "play" ? shanten(counts(P!.hand), pub.melds[seat].length) : null;
  const guide: ReactNode = !tutorial || pub.phase !== "play" ? null : myTurn && best ? (
    <><b>Your turn.</b> {myView?.drawn ? <>You drew <b>{tileName(myView.drawn)}</b> (on the right). </> : <>You claimed a set, so just discard. </>}Tap a tile, then tap it again to throw it.{" "}
      {P!.canWin ? <b>Your hand is complete — press Mahjong!</b> : <>Suggested: <b>{tileName(best.best.tile)}</b> (glowing) — keeps you {sh(best.best.shanten).toLowerCase()} with {best.best.live} useful tiles left.</>}</>
  ) : claimO && advice ? (<><b>{names[pub.claim!.from]} threw {tileName(pub.claim!.tile)}.</b> You can claim it. Tip: {advice.text}</>)
    : pub.turn >= 0 && pub.turn !== seat ? (<>Watching <b>{names[pub.turn]}</b>. {ready13 === 0 ? <>You're ready — you win on {waits(P!.hand, pub.melds[seat].length).map(tileName).join(" or ")}.</> : ready13 != null ? <>Your hand is {sh(ready13).toLowerCase()}.</> : null}</>) : null;

  // ---------- tips (tutorial) ----------
  const tips = myTurn && best && spot ? (() => {
    const b = best.best; const out: { tier: string; text: ReactNode }[] = [];
    out.push({ tier: "Beginner", text: <>{handRead(spot)} Throw tiles that don't connect to anything first — lone winds and dragons, then lone 1s and 9s. Keep pairs and tiles next to each other.</> });
    out.push({ tier: "Intermediate", text: <>Best discard: <b>{tileName(b.tile)}</b>. Afterwards you're {sh(b.shanten).toLowerCase()} with {b.kinds} kinds of useful tiles ({b.live} still live): {usefulText(best.all[0], 6) || "none"}.</> });
    const alt = best.all.find((o) => o.tile !== b.tile);
    out.push({ tier: "Expert", text: <>{alt ? <>Next best: {tileName(alt.tile)} ({sh(alt.shanten).toLowerCase()}, {alt.live} live). </> : null}Chance your next draw improves the hand: {pct(b.chance)} ({b.live} of {best.unseen} unseen tiles).{b.danger >= 1 ? " An opponent has two open sets — avoid feeding their suit." : ""}</> });
    if (pub.hands) { const inHands = best.all[0].useful.reduce((a, u) => a + pub.hands!.reduce((x, h, j) => x + (j === seat ? 0 : h.filter((t) => idx(t) === idx(u.tile)).length), 0), 0);
      out.push({ tier: "Peek", text: <>Of those {b.live} useful tiles, {inHands} are sitting in opponents' hands (you can see them in the guided game), so really {Math.max(0, b.live - inHands)} are left in the wall.</> }); }
    return out;
  })() : null;

  // ---------- controls ----------
  const secs = pub.deadline ? Math.max(0, Math.ceil((pub.deadline - nowMs) / 1000)) : null;
  const claimBox = claimO && pub.claim && (
    <div className="mj-claim pop-in" role="group" aria-label="Claim the discard">
      <div className="mj-claim-h"><MjTile tile={pub.claim.tile} size="lg" /><span><b>{names[pub.claim.from]}</b> discarded <b>{tileName(pub.claim.tile)}</b>.{secs !== null && <span className="tiny"> ⏱ {secs}s</span>}</span></div>
      <div className="controls">
        {claimO.win && <button className="pill win" disabled={T.busy} onClick={() => doClaim("win")}>Mahjong! 🀄</button>}
        {claimO.kong && <button className={`pill ${tutorial && advice?.best === "kong" ? "hinted" : ""}`} disabled={T.busy} onClick={() => doClaim("kong")}>Kong</button>}
        {claimO.pung && <button className={`pill ${tutorial && advice?.best === "pung" ? "hinted" : ""}`} disabled={T.busy} onClick={() => doClaim("pung")}>Pung</button>}
        {claimO.chows.map((c) => <button key={c.join("")} className={`pill ${tutorial && advice?.best === "chow" && advice.bestTiles?.join() === c.join() ? "hinted" : ""}`} disabled={T.busy} onClick={() => doClaim("chow", c)}>Chow <span className="mj-mini">{c.map((t) => <MjTile key={t} tile={t} size="xs" />)}</span></button>)}
        <button className={`pill ghost ${tutorial && advice?.best === "pass" ? "hinted" : ""}`} disabled={T.busy} onClick={() => doClaim("pass")}>Pass</button>
        {train && <button className="pill ghost sm" onClick={askHint}>💡 Hint</button>}
      </div>
    </div>);
  const turnBox = myTurn && P && (
    <div className="mj-actions">
      <div className="controls">
        {P.canWin && <button className="pill win" disabled={T.busy} onClick={() => { beep("tap"); T.act({ t: "win" }); }}>Mahjong! (self-draw) 🀄</button>}
        {P.kongs.map((k) => <button key={k} className="pill ghost" disabled={T.busy} onClick={() => { beep("tap"); T.act({ t: "kong", tile: k }); }}>Kong {tileName(k)}</button>)}
        {sel ? <button className="pill" disabled={T.busy} onClick={() => doDiscard(sel)}>Discard {tileName(sel)}</button> : <span className="small">Tap a tile to discard{secs !== null ? ` · ⏱ ${secs}s` : ""}</span>}
        {train && <button className="pill ghost sm" disabled={T.busy} onClick={askHint}>💡 Hint</button>}
      </div>
      {hintTile && <p className="tiny center">Hint: discard <b>{tileName(hintTile)}</b> (glowing).</p>}
    </div>);
  const breakdown = over && LH && (
    <div className="mj-result">
      <div className={`bj-banner ${(LH.pay[seat] ?? 0) > 0 ? "good" : (LH.pay[seat] ?? 0) < 0 ? "bad" : ""}`}>{LH.draw ? "Draw — nobody scores" : seat >= 0 && LH.pay[seat] ? `${LH.pay[seat] > 0 ? "+" : "−"}${Math.abs(LH.pay[seat])} points (${LH.pay[seat] > 0 ? "+" : "−"}${Math.abs(LH.pay[seat]) * 10} chips)` : "Hand over"}</div>
      {!LH.draw && LH.score && (<div className="mj-score">
        <h3>{names[LH.winner]} — {LH.score.faan} faan{LH.score.limit ? " (limit)" : ""} = {LH.score.points} point{LH.score.points === 1 ? "" : "s"}</h3>
        <table className="mj-faan"><tbody>
          {LH.score.items.length ? LH.score.items.map((it) => <tr key={it.name}><td>{it.name}</td><td className="tiny">{it.why}</td><td className="num">{it.faan}</td></tr>)
            : <tr><td>Chicken hand</td><td className="tiny">A winning shape with no scoring patterns.</td><td className="num">0</td></tr>}
          <tr className="mj-tot"><td>Total</td><td className="tiny">{LH.score.faan} faan → {POINTS[Math.min(10, LH.score.faan)]} points (table: {POINTS.slice(0, 6).join(" · ")} …)</td><td className="num">{LH.score.faan}</td></tr>
        </tbody></table>
        <p className="small">{LH.selfDraw ? <><b>Self-draw:</b> each of the other three players pays {LH.score.points}.</> : <><b>{names[LH.from]}</b> threw the winning tile, so only they pay — double: {LH.score.points * 2}.</>}</p>
      </div>)}
      {LH.draw && <p className="small">The wall ran out before anyone completed a hand (an <b>exhaustive draw</b>). No one pays and {names[pub.dealer]} stays East.</p>}
      <table className="mj-pay"><thead><tr><th>Player</th><th>This hand</th><th>Chips</th><th>Game total</th></tr></thead><tbody>
        {pub.seats.map((_, i) => <tr key={i} className={i === seat ? "me" : ""}><td>{names[i]}</td><td className={`num ${LH.pay[i] > 0 ? "good" : LH.pay[i] < 0 ? "bad" : ""}`}>{LH.pay[i] > 0 ? "+" : ""}{LH.pay[i]}</td><td className="num">{LH.pay[i] > 0 ? "+" : ""}{LH.pay[i] * 10}</td><td className="num">{pub.points[i] > 0 ? "+" : ""}{pub.points[i]}</td></tr>)}
      </tbody></table>
      <p className="tiny muted">{LH.dealerStays ? `${names[pub.dealer]} stays dealer (East).` : `East passes to ${names[pub.dealer]}.`} {WIND_NAME[pub.roundWind]} round. 1 point = 10 chips, settled to your bankroll every hand.</p>
      <div className="controls">
        {me && <button className="pill" disabled={T.busy} onClick={() => { setCoach(null); T.act({ t: "next" }); }}>Next hand</button>}
        {!live && <button className="pill ghost" onClick={newTable}>New table</button>}
      </div>
    </div>);

  const table = pub.phase === "waiting" ? (
    <div className="felt pk-felt">
      <div className="waitbox"><p><b>Table is open.</b> {live ? "Share the link — empty seats are bots until someone sits down." : ""}</p>
        <div className="players">{pub.seats.map((s, i) => <span key={i} className="player-chip"><Avatar name={s.name} size={22} /> {short(s.name)}{s.kind === "bot" ? " (bot)" : ""}</span>)}</div>
        {me ? <button className="pill xl" disabled={T.busy} onClick={() => T.act({ t: "start" })}>Deal the first hand</button> : <p className="muted">{T.pending >= 0 ? "You'll sit in when the next hand starts." : "Table full — watching."}</p>}
        {expect > 0 && <p className="tiny">Auto-deals when {expect} players are seated.</p>}
      </div>
    </div>
  ) : (
    <div className={`felt mj-table ${T.replaying ? "replaying" : ""}`}>
      {[2, 3, 1, 0].map((r) => seatEl((vs + r) % n))}
      {center}
    </div>
  );

  const introCard = intro && INTROS[intro] && <div className="mj-intro pop-in" role="note"><b>📘 {INTROS[intro].title}</b><p className="small">{INTROS[intro].body}</p><button className="pill sm" onClick={() => setIntro(null)}>Got it</button></div>;
  const coachBody = coach ? (coach.kind === "discard" ? <MjCoachCard c={coach.c} onClose={() => setCoach(null)} /> : <ClaimCard a={coach.a} chosen={coach.chosen} onClose={() => setCoach(null)} />)
    : <p className="small">🎓 After each discard a coach card compares it with up to three better options: shanten (how far from ready), useful tiles still live, and the chance your next draw helps. Claim decisions get an explanation too.</p>;
  const panel = coached && pub.phase !== "waiting" && (() => {
    const tabs: PanelTab[] = [];
    if (tutorial) tabs.push({ id: "tips", label: "📘 Tips", peek: intro ? `📘 ${INTROS[intro]?.title}: ${INTROS[intro]?.body}` : myTurn ? "📘 Your turn — open for Beginner → Expert tips" : hotTerm ? `${hotTerm.icon} ${hotTerm.title}: ${hotTerm.body}` : null, body: (<>
      {introCard}
      {hotTerm && <div className="lc-now"><span className="tiny">Right now at the table</span><div className="lc open hot"><span className="lc-t">{hotTerm.icon} {hotTerm.title}</span><span className="lc-b">{hotTerm.body}</span></div></div>}
      {tips ? <TutorTips tips={tips} sample="Guided game: every hand is face up. Beginner → Expert use only what you'd see at a real table; Peek uses the face-up hands." />
        : claimO && advice ? <div className="tutor"><div className="tutor-h">📘 Claim?</div><p className="small">{advice.text}</p></div>
        : <p className="small">Tips for your discard appear here on your turn, and claim advice when you can take a tile.</p>}
    </>) });
    tabs.push({ id: "coach", label: "🎓 Coach", badge: coach ? "new" : null, peek: coach ? (coach.kind === "discard" ? coach.c.gap : coach.a.text) : null, body: coachBody });
    tabs.push({ id: "learn", label: "📚 Learn", body: <LearnCards key={hot ?? ""} hot={hot} /> });
    tabs.push({ id: "rules", label: "📋 Rules", body: <><RulesQuiz /><details className="mj-sc"><summary className="small">⭐ Scoring table</summary><ScoringCard /></details></> });
    return <SidePanel tabs={tabs} active={tab} onTab={setTab} keepVisible=".mj-mine, .mj-actions, .mj-claim" attention={train && coach ? coach.key : tutorial ? intro : null} />;
  })();
  const myPts = seat >= 0 ? pub.points[seat] : 0;

  return (
    <div className={`game mj ${panel ? "has-panel" : ""}`}>
      <GameHeader title="Hong Kong Mahjong" game="mahjong" room={live ? room : null} status={T.err ? "offline" : "live"} peers={humansHere} />
      {(tutorial || train) && <TrainerStages cur={tutorial ? 3 : 4} bot={bot} />}
      <div className="bj-layout">
      <div className="bj-main">
      <div className="scorebar"><div className="team"><span className="nm">Round</span><b>{WIND_CN[pub.roundWind]} {WIND_NAME[pub.roundWind]}</b><span className="muted tiny">hand {pub.handNo}</span></div>
        <div className="team"><span className="nm">Your seat</span><b>{seat >= 0 ? `${WIND_CN[pub.seatWinds[seat]]} ${WIND_NAME[pub.seatWinds[seat]]}` : "—"}</b><span className="muted tiny">{seat >= 0 && pub.seatWinds[seat] === 0 ? "dealer" : `dealer: ${names[pub.dealer]}`}</span></div>
        <div className="team mine"><span className="nm">Your points</span><b>{myPts > 0 ? "+" : ""}{myPts}</b><span className="muted tiny">🪙 {me ? me.stack.toLocaleString() : "—"}</span></div></div>
      {table}
      {guide && <div className="mj-guide" aria-live="polite">{guide}</div>}
      {tutorial && intro && !panel && introCard}
      {mine}
      <ReplayBar replaying={T.replaying} skip={T.skip} />
      {T.err && <p className="warn center">{T.err}</p>}
      <div className="bj-controls">
        {seat < 0 && pub.phase !== "waiting" && (T.pending >= 0 ? <p className="muted center">You'll take over seat {T.pending + 1} when this hand ends.</p> : <p className="muted center">Table is full — you're watching.</p>)}
        {claimBox}
        {turnBox}
        {breakdown}
        {pub.phase === "play" && !myTurn && !claimO && seat >= 0 && !T.replaying && <p className="center muted small">{pub.step === "claim" ? "Waiting for claims…" : pub.turn >= 0 ? `Waiting for ${names[pub.turn]}…` : ""}</p>}
      </div>
      <div className="bj-foot">
        {me && <span>Bankroll <b>🪙 {me.stack.toLocaleString()}</b> · points settle as chips (×10) every hand</span>}
        <button className="pill ghost sm" onClick={() => go("/history?game=mahjong")}>🏆 Leaderboard</button>
        {!live && <button className="pill ghost sm" onClick={newTable}>New table</button>}
        {live && me && <button className="pill ghost sm" onClick={() => { T.leave(); go("/"); }}>Leave table</button>}
        <span className="muted tiny">Table {room} · {bot} bots{tutorial ? " · guided" : train ? " · hints" : ""}</span>
      </div>
      {!coached && <details className="bj-log"><summary className="muted small">⭐ Scoring & rules</summary><ScoringCard /></details>}
      <details className="bj-log"><summary className="muted small">Table log</summary>{pub.log.slice().reverse().map((e, i) => <div key={i} className="tiny muted">{e.text}</div>)}</details>
      <p className="muted tiny center">Hong Kong rules · 144 tiles with flowers · chow from the left only · win &gt; pung/kong &gt; chow · details in the 📚 Learn tab and docs/strategy/mahjong.md</p>
      </div>
      {panel}
      </div>
    </div>
  );
}
