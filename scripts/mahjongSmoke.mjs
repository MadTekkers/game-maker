// API smoke test for Mahjong tables on the deployed "cards" function: solo table vs 3 bots, plays N hands with a simple policy
// (discard the drawn tile, always claim wins, pung when offered) and checks the redaction of every reply.
// Usage: node --env-file=/workspace/.secrets/game-lobby.env scripts/mahjongSmoke.mjs [hands] [bot]
import { randomBytes } from "node:crypto";
const FN = `${process.env.SUPABASE_URL}/functions/v1/cards`, KEY = process.env.SUPABASE_ANON_KEY;
const hands = Number(process.argv[2] || 2), bot = process.argv[3] || "medium";
const token = randomBytes(24).toString("hex"), id = "mjs" + randomBytes(6).toString("hex"); const times = [];
async function call(body) { const t0 = Date.now(); const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}` }, body: JSON.stringify({ id, token, ...body }) }); const j = await r.json(); times.push(Date.now() - t0); if (j.error) throw new Error(j.error + " " + JSON.stringify(body)); return j; }
const leaks = []; let claims = 0, frames = 0;
const check = (x) => { const pub = JSON.stringify(x.public); for (const k of ["tokenHash", "\"wall\":", "\"dead\":", "nextWall", "\"resp\"", "\"opts\""]) if (pub.includes(k)) leaks.push(k); if (x.public.hands) leaks.push("hands"); frames += x.public.frames?.length ?? 0; };
let r = await call({ action: "join", game: "mahjong", seats: 4, bot, name: "MjSmoke" });
console.log("seat", r.seat, "phase", r.public.phase, "hand", r.private?.hand?.length, "wall", r.public.wallCount);
const start = r.public.handNo; let steps = 0; const ends = [];
while (steps++ < 400) {
  check(r); const p = r.public, v = r.private;
  if (p.phase === "handover") { const L = p.lastHand; ends.push(L.draw ? "draw" : `${L.winner}${L.selfDraw ? " self" : " ron"} ${L.score.faan}f ${L.score.items.map((i) => i.name).join("+")} pay ${L.pay}`); if (p.handNo >= start + hands - 1) break; r = await call({ action: "act", move: { t: "next" } }); continue; }
  if (v?.claim) { const c = v.claim; const m = c.win ? { t: "win" } : c.pung ? { t: "pung" } : c.chows.length ? { t: "chow", tiles: c.chows[0] } : { t: "pass" }; if (m.t !== "pass") claims++; r = await call({ action: "act", move: m }); continue; }
  if (p.turn === r.seat && p.step === "discard" && v?.hand?.length) { r = await call({ action: "act", move: v.canWin ? { t: "win" } : { t: "discard", tile: v.drawn ?? v.hand[v.hand.length - 1] } }); continue; }
  r = await call({ action: "view" });
}
check(r);
console.log("steps", steps, "ends", ends, "claims by me", claims, "frames", frames, "leaks", [...new Set(leaks)], "points", r.public.points, "bankroll", r.public.seats[r.seat].stack);
const s = [...times].sort((a, b) => a - b); console.log("latency ms p50", s[s.length >> 1], "p90", s[Math.floor(s.length * 0.9)], "max", s[s.length - 1]);
await call({ action: "leave" }); console.log("table", id);
