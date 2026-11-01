// Hong Kong Mahjong table: authoritative in the "cards" edge function, mirrored on the client for types. Pure TS.
// Always four at the table (bots fill seats nobody sits in). 144 tiles incl. 8 flowers/seasons; 16-tile dead wall for replacements.
// Turn: draw (automatic) then discard. Claims on a discard: win > pung/kong > chow (chow only by the next player); ties for a win
// go to the first claimant in turn order. Kongs (concealed, exposed, added) draw a replacement from the dead wall.
// Scoring: faan table in hand.ts, base points 1·2·4·8·16·24·32·48·64·96·128 (0-10 faan). Self-draw: all three others pay the base.
// Win on a discard: only the discarder pays, double the base. Exhaustive draw: nobody pays, dealer stays. 1 point = 10 chips.
import { type Rng, shuffle, IllegalMove, clone, frame } from "../core.ts";
import { type Tile, fullSet, isBonus, sortTiles, removeTiles, counts, idx, tileName, WIND_NAME } from "./tiles.ts";
import { type Meld, type Score, scoreHand, isComplete, MIN_FAAN } from "./hand.ts";
import * as AI from "./ai.ts";
import { type BaseSeat, type Ctx, type Level, type Pending, type TableBase, botBase, humanBase, pushLog, humanCount, stripSeat } from "../seats.ts";

export const CHIPS_PER_POINT = 10;
export const DEAD_WALL = 16;
export const SEATS = { min: 4, max: 4 };
export type MSeat = BaseSeat;
export type Claim = { tile: Tile; from: number; opts: (AI.ClaimOpts | null)[]; resp: (AI.ClaimResp | null)[] };
export type Hand = {
  wall: Tile[]; dead: Tile[]; hands: Tile[][]; melds: Meld[][]; flowers: Tile[][]; ponds: Tile[][];
  turn: number; step: "discard" | "claim"; drawn: (Tile | null)[]; claim: Claim | null; lastDiscard: { seat: number; tile: Tile } | null;
  act: (string | null)[]; lastClaim: { seat: number; type: string; from: number; tile: Tile; n: number } | null; claims: number; kongDraw: boolean;
};
export type LastHand = {
  handNo: number; draw: boolean; winner: number; from: number; selfDraw: boolean; tile: Tile | null; hand: Tile[]; melds: Meld[]; flowers: Tile[];
  score: Score | null; pay: number[]; seatWind: number; dealerStays: boolean;
};
export type MjState = TableBase<MSeat> & {
  game: "mahjong"; n: number; phase: "waiting" | "play" | "handover"; handNo: number; dealer: number; passes: number; roundWind: number;
  h: Hand | null; lastHand: LastHand | null; points: number[]; seq: number; nextWall?: Tile[];
};
export type Move =
  | { t: "start" } | { t: "next" } | { t: "discard"; tile: Tile } | { t: "kong"; tile: Tile } | { t: "win" }
  | { t: "pass" } | { t: "pung" } | { t: "chow"; tiles: Tile[] } | { t: "claimkong" };

const fresh = (b: BaseSeat): MSeat => ({ ...b });
const name = (s: MjState, i: number) => s.seats[i].name;
export const seatWind = (s: { dealer: number; n: number }, i: number) => (i - s.dealer + s.n) % s.n;

export function newTable(o: { seats?: number; botLevel: Level; now: number; rng: Rng; timeoutMs?: number; tutorial?: boolean; live?: boolean; wall?: Tile[] }): MjState {
  const n = 4;
  return {
    game: "mahjong", n, seats: Array.from({ length: n }, (_, i) => fresh(botBase(i, o.botLevel, o.rng))), phase: "waiting", handNo: 0, dealer: 0, passes: 0, roundWind: 0,
    h: null, lastHand: null, points: new Array(n).fill(0), seq: 0, nextWall: o.wall,
    log: [], ledger: [], results: [], resultSeq: 0, reviews: [], reviewSeq: 0, deadline: null, timeoutMs: o.timeoutMs ?? 30000,
    botLevel: o.botLevel, tutorial: !!o.tutorial, live: !!o.live, startedAt: o.now, round: 0,
  };
}

function view(s: MjState, i: number): AI.View {
  const h = s.h!; return { hand: h.hands[i], melds: h.melds[i], ponds: h.ponds, allMelds: h.melds, seat: i, wallCount: h.wall.length };
}
/** Draw from the dead wall (replacement for a flower or a kong); falls back to the live wall's tail. */
function drawDead(h: Hand): Tile | null { return h.dead.length ? h.dead.shift()! : h.wall.length ? h.wall.pop()! : null; }
/** Put drawn flowers aside and replace them. Returns false if the wall ran out. */
function settleFlowers(s: MjState, i: number, ctx: Ctx): boolean {
  const h = s.h!;
  for (let g = 0; g < 20; g++) {
    const f = h.hands[i].find(isBonus); if (!f) return true;
    h.hands[i] = removeTiles(h.hands[i], [f]); h.flowers[i].push(f); h.act[i] = "Flower!";
    const r = drawDead(h); if (!r) return false; h.hands[i].push(r); h.drawn[i] = r;
    pushLog(s, `${name(s, i)} sets aside ${tileName(f)} and draws a replacement`, ctx.now);
  }
  return true;
}

function dealHand(s: MjState, ctx: Ctx) {
  for (let i = 0; i < s.n; i++) { const p = s.seats[i].pending; if (p) { s.seats[i] = fresh(humanBase(p)); pushLog(s, `${p.name} sat down`, ctx.now); } }
  const tiles = s.nextWall && s.nextWall.length === 144 ? s.nextWall : shuffle(fullSet(true), ctx.rng); s.nextWall = undefined;
  const dead = tiles.slice(144 - DEAD_WALL); const wall = tiles.slice(0, 144 - DEAD_WALL);
  const h: Hand = { wall, dead, hands: [[], [], [], []], melds: [[], [], [], []], flowers: [[], [], [], []], ponds: [[], [], [], []], turn: s.dealer, step: "discard",
    drawn: [null, null, null, null], claim: null, lastDiscard: null, act: [null, null, null, null], lastClaim: null, claims: 0, kongDraw: false };
  s.h = h; s.phase = "play"; s.handNo++; s.round++; s.lastHand = null; s.seq++;
  // deal in blocks of four, starting with the dealer, then one more each and a 14th for the dealer
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const i = (s.dealer + k) % 4; h.hands[i].push(...h.wall.splice(0, 4)); }
  for (let k = 0; k < 4; k++) h.hands[(s.dealer + k) % 4].push(h.wall.shift()!);
  h.hands[s.dealer].push(h.wall.shift()!); h.drawn[s.dealer] = h.hands[s.dealer][13];
  pushLog(s, `Hand ${s.handNo}: ${name(s, s.dealer)} is East (dealer) · ${WIND_NAME[s.roundWind]} round`, ctx.now);
  frame(s);
  for (let k = 0; k < 4; k++) { const i = (s.dealer + k) % 4; if (!settleFlowers(s, i, ctx)) return endDraw(s, ctx); }
  for (let i = 0; i < 4; i++) h.hands[i] = sortTiles(h.hands[i]);
  h.act = [null, null, null, null];
  frame(s);
}

function startTurn(s: MjState, i: number, ctx: Ctx) {
  const h = s.h!; h.turn = i; h.step = "discard"; h.claim = null; h.kongDraw = false;
  if (!h.wall.length) return endDraw(s, ctx);
  const t = h.wall.shift()!; h.hands[i].push(t); h.drawn[i] = t; h.act[i] = "Draw";
  if (!settleFlowers(s, i, ctx)) return endDraw(s, ctx);
  s.seq++; frame(s);
}

export function claimOptions(h: Hand, j: number, tile: Tile, from: number): AI.ClaimOpts | null {
  const hand = h.hands[j]; const c = counts(hand); const k = idx(tile);
  const win = isComplete(counts([...hand, tile]), h.melds[j].length);
  const pung = c[k] >= 2; const kong = c[k] >= 3 && h.wall.length > 0;
  const chows: Tile[][] = [];
  if (j === (from + 1) % 4 && tile[1] !== "z") {
    const r = +tile[0], su = tile[1];
    for (const a of [r - 2, r - 1, r]) {
      if (a < 1 || a + 2 > 9) continue; const set = [a, a + 1, a + 2].map((x) => `${x}${su}`);
      const need = removeTiles(set, [tile]); const cc = counts(hand);
      if (need.every((t) => cc[idx(t)]-- > 0)) chows.push(set);
    }
  }
  if (!win && !pung && !kong && !chows.length) return null;
  return { win, pung, kong, chows };
}

function discard(s: MjState, i: number, tile: Tile, ctx: Ctx) {
  const h = s.h!;
  if (!h.hands[i].includes(tile)) throw new IllegalMove("You don't hold that tile");
  h.hands[i] = sortTiles(removeTiles(h.hands[i], [tile])); h.drawn[i] = null; h.ponds[i].push(tile); h.lastDiscard = { seat: i, tile };
  h.act = h.act.map((a, k) => (k === i ? `Discards ${tileName(tile)}` : a === "Draw" ? null : a));
  pushLog(s, `${name(s, i)} discards ${tileName(tile)}`, ctx.now); s.seq++;
  frame(s);
  const opts = h.hands.map((_, j) => (j === i ? null : claimOptions(h, j, tile, i)));
  if (opts.every((o) => !o)) return startTurn(s, (i + 1) % 4, ctx);
  h.step = "claim"; h.claim = { tile, from: i, opts, resp: opts.map(() => null) };
  for (let j = 0; j < 4; j++) if (opts[j] && s.seats[j].kind === "bot") h.claim.resp[j] = botClaim(s, j, ctx);
  tryResolve(s, ctx);
}
function botClaim(s: MjState, j: number, ctx: Ctx): AI.ClaimResp {
  const h = s.h!; const c = h.claim!;
  return AI.chooseClaim(view(s, j), c.tile, c.opts[j]!, s.seats[j].level, ctx.rng, { seat: seatWind(s, j), round: s.roundWind });
}
function tryResolve(s: MjState, ctx: Ctx) {
  const h = s.h!; const c = h.claim; if (!c) return;
  if (c.opts.some((o, j) => o && !c.resp[j])) return; // still waiting on a human
  const order = [1, 2, 3].map((d) => (c.from + d) % 4);
  const winner = order.find((j) => c.resp[j]?.t === "win");
  if (winner !== undefined) {
    h.ponds[c.from].pop(); h.hands[winner].push(c.tile);
    return endWin(s, winner, c.from, c.tile, ctx);
  }
  const pk = order.find((j) => c.resp[j]?.t === "pung" || c.resp[j]?.t === "kong");
  const ch = order.find((j) => c.resp[j]?.t === "chow");
  const j = pk ?? ch;
  if (j === undefined) { h.claim = null; return startTurn(s, (c.from + 1) % 4, ctx); }
  const r = c.resp[j]!; h.ponds[c.from].pop();
  let meld: Meld;
  if (r.t === "chow") { meld = { type: "chow", tiles: sortTiles(r.tiles), concealed: false, from: c.from }; h.hands[j] = removeTiles(h.hands[j], removeTiles(r.tiles, [c.tile])); }
  else if (r.t === "kong") { meld = { type: "kong", tiles: [c.tile, c.tile, c.tile, c.tile], concealed: false, from: c.from }; h.hands[j] = removeTiles(h.hands[j], [c.tile, c.tile, c.tile]); }
  else { meld = { type: "pung", tiles: [c.tile, c.tile, c.tile], concealed: false, from: c.from }; h.hands[j] = removeTiles(h.hands[j], [c.tile, c.tile]); }
  h.melds[j].push(meld); h.claims++;
  h.lastClaim = { seat: j, type: meld.type, from: c.from, tile: c.tile, n: h.claims };
  h.act = h.act.map(() => null); h.act[j] = meld.type === "chow" ? "Chow!" : meld.type === "pung" ? "Pung!" : "Kong!";
  pushLog(s, `${name(s, j)} claims ${tileName(c.tile)} for a ${meld.type}`, ctx.now);
  h.claim = null; h.turn = j; h.step = "discard"; h.drawn[j] = null; s.seq++;
  frame(s);
  if (meld.type === "kong") kongReplacement(s, j, ctx);
}
function kongReplacement(s: MjState, j: number, ctx: Ctx) {
  const h = s.h!; const r = drawDead(h); if (!r) return endDraw(s, ctx);
  h.hands[j].push(r); h.drawn[j] = r; h.kongDraw = true;
  if (!settleFlowers(s, j, ctx)) return endDraw(s, ctx);
  s.seq++; frame(s);
}
export function selfKongs(h: Hand, i: number): Tile[] {
  if (h.turn !== i || h.step !== "discard" || (!h.wall.length && !h.dead.length)) return [];
  const c = counts(h.hands[i]); const out: Tile[] = [];
  for (let k = 0; k < 34; k++) if (c[k] === 4) out.push(sortTiles(h.hands[i]).find((t) => idx(t) === k)!);
  for (const m of h.melds[i]) if (m.type === "pung" && h.hands[i].includes(m.tiles[0])) out.push(m.tiles[0]);
  return out;
}
function selfKong(s: MjState, i: number, tile: Tile, ctx: Ctx) {
  const h = s.h!; if (!selfKongs(h, i).includes(tile)) throw new IllegalMove("No kong with that tile");
  const pung = h.melds[i].find((m) => m.type === "pung" && m.tiles[0] === tile);
  if (pung) { pung.type = "kong"; pung.tiles.push(tile); h.hands[i] = removeTiles(h.hands[i], [tile]); }
  else { h.melds[i].push({ type: "kong", tiles: [tile, tile, tile, tile], concealed: true, from: i }); h.hands[i] = removeTiles(h.hands[i], [tile, tile, tile, tile]); }
  h.claims++; h.lastClaim = { seat: i, type: "kong", from: i, tile, n: h.claims }; h.act[i] = "Kong!";
  pushLog(s, `${name(s, i)} declares a ${pung ? "kong (added to a pung)" : "concealed kong"}`, ctx.now); s.seq++;
  frame(s);
  kongReplacement(s, i, ctx);
}
export const canSelfWin = (h: Hand, i: number) => h.turn === i && h.step === "discard" && h.hands[i].length % 3 === 2 && isComplete(counts(h.hands[i]), h.melds[i].length);

function endWin(s: MjState, w: number, from: number, tile: Tile, ctx: Ctx) {
  const h = s.h!; const self = from < 0;
  const score = scoreHand({ concealed: h.hands[w], melds: h.melds[w], flowers: h.flowers[w], seatWind: seatWind(s, w), roundWind: s.roundWind, selfDraw: self });
  if (!score || score.faan < MIN_FAAN) throw new IllegalMove("That hand doesn't score enough to win");
  const pay = new Array(4).fill(0);
  if (self) { for (let k = 0; k < 4; k++) if (k !== w) { pay[k] -= score.points; pay[w] += score.points; } }
  else { pay[from] -= score.points * 2; pay[w] += score.points * 2; }
  const dealerStays = w === s.dealer;
  s.lastHand = { handNo: s.handNo, draw: false, winner: w, from, selfDraw: self, tile, hand: sortTiles(h.hands[w]), melds: clone(h.melds[w]), flowers: [...h.flowers[w]], score, pay, seatWind: seatWind(s, w), dealerStays };
  h.act = h.act.map(() => null); h.act[w] = self ? "Self-draw win!" : "Mahjong!";
  pushLog(s, `${name(s, w)} wins ${self ? "by self-draw" : `on ${name(s, from)}'s ${tileName(tile)}`} — ${score.faan} faan, ${score.points} pts`, ctx.now);
  finishHand(s, ctx);
}
function endDraw(s: MjState, ctx: Ctx) {
  const h = s.h!;
  s.lastHand = { handNo: s.handNo, draw: true, winner: -1, from: -1, selfDraw: false, tile: null, hand: [], melds: [], flowers: [], score: null, pay: [0, 0, 0, 0], seatWind: 0, dealerStays: true };
  h.act = h.act.map(() => null); pushLog(s, `Hand ${s.handNo}: the wall ran out — a draw, nobody scores`, ctx.now);
  finishHand(s, ctx);
}
function finishHand(s: MjState, _ctx: Ctx) {
  const L = s.lastHand!; const h = s.h!;
  for (let k = 0; k < 4; k++) s.points[k] += L.pay[k];
  s.results = [];
  for (let k = 0; k < 4; k++) {
    const x = s.seats[k]; if (x.kind !== "human") continue;
    const chips = L.pay[k] * CHIPS_PER_POINT;
    if (chips) s.ledger.push({ seat: k, name: x.name, delta: chips, reason: "hand", clamp: true });
    s.results.push({ seat: k, name: x.name, kind: "human", net: chips, won: L.winner === k, detail: { hand: s.handNo, points: L.pay[k], chips, faan: L.winner === k ? L.score?.faan ?? 0 : null, draw: L.draw, selfDraw: L.selfDraw } });
  }
  if (s.results.length) s.resultSeq++;
  if (!L.dealerStays) { s.dealer = (s.dealer + 1) % 4; s.passes++; s.roundWind = Math.floor(s.passes / 4) % 4; }
  s.phase = "handover"; h.turn = -1; h.claim = null; s.seq++;
}

function botTurn(s: MjState, i: number, ctx: Ctx) {
  const h = s.h!; const lv = s.seats[i].level;
  if (canSelfWin(h, i)) return endWin(s, i, -1, h.drawn[i] ?? h.hands[i][h.hands[i].length - 1], ctx);
  const k = AI.chooseSelfKong(view(s, i), selfKongs(h, i), lv);
  if (k) return selfKong(s, i, k, ctx);
  discard(s, i, AI.chooseDiscard(view(s, i), lv, ctx.rng), ctx);
}
function advance(s: MjState, ctx: Ctx): MjState {
  for (let g = 0; g < 800; g++) {
    if (!humanCount(s)) break;
    if (s.phase === "waiting") { if (!s.live) { dealHand(s, ctx); continue; } break; }
    if (s.phase !== "play") break;
    const h = s.h!;
    if (h.step === "claim") { const c = h.claim!; if (c.opts.some((o, j) => o && !c.resp[j])) break; tryResolve(s, ctx); continue; }
    if (s.seats[h.turn].kind !== "bot") break;
    botTurn(s, h.turn, ctx);
  }
  const multi = humanCount(s) > 1; const h = s.h;
  s.deadline = !multi ? null : s.phase === "handover" ? ctx.now + 25000
    : s.phase === "play" && h ? (h.step === "claim" ? ctx.now + 10000 : s.seats[h.turn].kind === "human" ? ctx.now + s.timeoutMs : null) : null;
  return s;
}

export function apply(s0: MjState, i: number, m: Move, ctx: Ctx): MjState {
  const s = clone(s0); const x = s.seats[i];
  if (!x || x.kind !== "human") throw new IllegalMove("Not your seat");
  x.idle = 0;
  if (m.t === "start") { if (s.phase !== "waiting") throw new IllegalMove("The game is already running"); dealHand(s, ctx); return advance(s, ctx); }
  if (m.t === "next") { if (s.phase !== "handover") throw new IllegalMove("Hand still in progress"); dealHand(s, ctx); return advance(s, ctx); }
  if (s.phase !== "play" || !s.h) throw new IllegalMove("No hand in progress");
  const h = s.h;
  if (h.step === "claim") {
    const c = h.claim!; const o = c.opts[i];
    if (!o || c.resp[i]) throw new IllegalMove("Nothing to claim right now");
    let r: AI.ClaimResp;
    if (m.t === "pass") r = { t: "pass" };
    else if (m.t === "win") { if (!o.win) throw new IllegalMove("That tile doesn't complete your hand"); r = { t: "win" }; }
    else if (m.t === "pung") { if (!o.pung) throw new IllegalMove("You need two matching tiles to pung"); r = { t: "pung" }; }
    else if (m.t === "claimkong" || m.t === "kong") { if (!o.kong) throw new IllegalMove("You need three matching tiles to kong"); r = { t: "kong" }; }
    else if (m.t === "chow") {
      const want = sortTiles(m.tiles ?? []).join(","); const ok = o.chows.find((ch) => sortTiles(ch).join(",") === want);
      if (!ok) throw new IllegalMove("You can only chow the tile from the player on your left, as a run of three"); r = { t: "chow", tiles: ok };
    } else throw new IllegalMove("Claim, or pass");
    c.resp[i] = r; tryResolve(s, ctx); return advance(s, ctx);
  }
  if (h.turn !== i) throw new IllegalMove("Not your turn");
  if (m.t === "discard") discard(s, i, m.tile, ctx);
  else if (m.t === "kong") selfKong(s, i, m.tile, ctx);
  else if (m.t === "win") { if (!canSelfWin(h, i)) throw new IllegalMove("Your hand isn't complete yet"); endWin(s, i, -1, h.drawn[i] ?? h.hands[i][h.hands[i].length - 1], ctx); }
  else throw new IllegalMove(`Can't ${m.t} now`);
  return advance(s, ctx);
}
export function seatHuman(s0: MjState, i: number, p: Pending, ctx: Ctx): MjState {
  const s = clone(s0); const x = s.seats[i]; if (!x) throw new IllegalMove("No such seat");
  if (x.kind === "human") { if (x.tokenHash === p.tokenHash) { x.stack = p.stack; return s; } throw new IllegalMove("Seat taken"); }
  if (s.phase === "play") { x.pending = p; pushLog(s, `${p.name} takes over ${x.name} after this hand`, ctx.now); }
  else { s.seats[i] = fresh(humanBase(p)); pushLog(s, `${p.name} sat down`, ctx.now); }
  return advance(s, ctx);
}
export function leaveSeat(s0: MjState, i: number, ctx: Ctx): MjState {
  const s = clone(s0); const x = s.seats[i]; if (x?.kind !== "human") return s;
  pushLog(s, `${x.name} left — a bot takes the seat`, ctx.now);
  s.seats[i] = fresh(botBase(i, s.botLevel, ctx.rng));
  const h = s.h;
  if (s.phase === "play" && h?.step === "claim" && h.claim?.opts[i] && !h.claim.resp[i]) h.claim.resp[i] = botClaim(s, i, ctx);
  return advance(s, ctx);
}
export { findSeat } from "../seats.ts";
/** Clock ran out (multi-human tables only): pass open claims, auto-discard the drawn tile, deal the next hand. */
export function timeout(s0: MjState, ctx: Ctx): MjState {
  if (!s0.deadline || ctx.now < s0.deadline) return s0;
  let s = clone(s0);
  if (s.phase === "handover") { dealHand(s, ctx); return advance(s, ctx); }
  const h = s.h; if (s.phase !== "play" || !h) return advance(s, ctx);
  if (h.step === "claim") { const c = h.claim!; c.opts.forEach((o, j) => { if (o && !c.resp[j]) { c.resp[j] = { t: "pass" }; s.seats[j].idle++; } }); tryResolve(s, ctx); return advance(s, ctx); }
  const a = h.turn; if (s.seats[a].kind !== "human") return advance(s, ctx);
  s.seats[a].idle++;
  if (canSelfWin(h, a)) endWin(s, a, -1, h.drawn[a] ?? h.hands[a][0], ctx);
  else discard(s, a, h.drawn[a] ?? AI.chooseDiscard(view(s, a), "medium", ctx.rng), ctx);
  if (s.seats[a]?.idle >= 3) s = leaveSeat(s, a, ctx);
  return advance(s, ctx);
}
/** Self-play (tests): deal one hand and let all four bots play it to the end. */
export function botsHand(s: MjState, ctx: Ctx) {
  dealHand(s, ctx);
  for (let g = 0; g < 800 && s.phase === "play"; g++) {
    const h = s.h!;
    if (h.step === "claim") { const c = h.claim!; c.opts.forEach((o, j) => { if (o && !c.resp[j]) c.resp[j] = botClaim(s, j, ctx); }); tryResolve(s, ctx); continue; }
    botTurn(s, h.turn, ctx);
  }
  return s;
}

/** Everyone's view: tile counts only for concealed hands (except the solo tutorial), wall/dead wall as counts, never their order. */
export function publicView(s: MjState) {
  const h = s.h;
  return {
    game: s.game, n: s.n, phase: s.phase, handNo: s.handNo, round: s.round, dealer: s.dealer, roundWind: s.roundWind, seq: s.seq,
    seatWinds: s.seats.map((_, i) => seatWind(s, i)), turn: h?.turn ?? -1, step: h?.step ?? null,
    wallCount: h?.wall.length ?? 0, deadCount: h?.dead.length ?? 0, handCount: h?.hands.map((x) => x.length) ?? [0, 0, 0, 0],
    melds: h?.melds ?? [[], [], [], []], flowers: h?.flowers ?? [[], [], [], []], ponds: h?.ponds ?? [[], [], [], []],
    lastDiscard: h?.lastDiscard ?? null, claim: h?.claim ? { tile: h.claim.tile, from: h.claim.from } : null, act: h?.act ?? [null, null, null, null],
    lastClaim: h?.lastClaim ?? null, drewFrom: h && h.turn >= 0 && h.step === "discard" ? (h.kongDraw ? "dead" : "wall") : null,
    points: s.points, lastHand: s.lastHand, seats: s.seats.map((x) => stripSeat(x)),
    deadline: s.deadline, botLevel: s.botLevel, tutorial: s.tutorial, live: s.live, log: s.log.slice(-25), results: s.results, resultSeq: s.resultSeq,
    hands: s.tutorial && h ? h.hands.map((x) => sortTiles(x)) : null,
  };
}
export type PublicMj = ReturnType<typeof publicView>;
/** Only for the seat's owner: their concealed tiles, the tile just drawn, and what they may do right now. */
export function privateView(s: MjState, i: number) {
  const h = s.h; if (!s.seats[i]) return null;
  if (!h || s.phase !== "play") return { handNo: s.handNo, seq: s.seq, hand: h && s.phase === "handover" ? sortTiles(h.hands[i]) : [], drawn: null, canWin: false, kongs: [] as Tile[], claim: null as AI.ClaimOpts | null };
  const myTurn = h.turn === i && h.step === "discard";
  const c = h.claim; const claim = c && c.opts[i] && !c.resp[i] ? c.opts[i] : null;
  return { handNo: s.handNo, seq: s.seq, hand: sortTiles(h.hands[i]), drawn: myTurn ? h.drawn[i] : null, canWin: canSelfWin(h, i), kongs: selfKongs(h, i), claim };
}
export type PrivateMj = NonNullable<ReturnType<typeof privateView>>;
