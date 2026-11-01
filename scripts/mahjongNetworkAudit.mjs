// Two-browser Mahjong test: Alice opens a live table (4 seats, 2 bots), Bob joins by the share link, Alice deals; both play
// (tap-discard, claim sometimes) while every edge-function response and realtime frame is captured. Audit: no seat tokens/hashes,
// no wall/dead-wall arrays, public `hands` always null (not a tutorial), no other tile array that could be a concealed hand,
// and neither browser ever receives the other's concealed hand — except the winner's hand inside lastHand (revealed by the rules).
// Usage: BASE=<url> SECS=150 node scripts/mahjongNetworkAudit.mjs
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";
const B = process.env.BASE || "http://localhost:4317/";
const SECS = Number(process.env.SECS || 150), OUT = process.env.OUT || "/workspace/reports/mahjong-network-audit.json";
mkdirSync("/workspace/reports", { recursive: true });
const mk = async (name, w) => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: w, height: 860 } });
  await ctx.addInitScript((n) => { localStorage.setItem("gm_player", n); localStorage.setItem("gm_sound", "off"); }, name);
  const p = await ctx.newPage(); const cap = [];
  p.on("pageerror", (e) => console.log(name, "PAGEERR", e.message));
  p.on("response", async (r) => { if (r.url().includes("/functions/v1/cards")) { try { cap.push({ kind: "http", req: r.request().postData(), body: await r.text() }); } catch {} } });
  p.on("websocket", (ws) => ws.on("framereceived", (f) => { const t = String(f.payload); if (t.includes("card_games")) cap.push({ kind: "ws", body: t }); }));
  return { browser, p, cap, name };
};
const A = await mk("Alice", 390), Bo = await mk("Bob", 1280);
await A.p.goto(B + "#/play/mahjong"); await A.p.waitForTimeout(800);
await A.p.click("text=Live table"); await A.p.click("text=Start now & share link");
await A.p.waitForSelector(".waitbox", { timeout: 20000 });
const url = A.p.url(); console.log("table url", url);
await Bo.p.goto(url); await Bo.p.waitForSelector(".waitbox", { timeout: 20000 });
await A.p.waitForTimeout(1500);
await A.p.screenshot({ path: "/workspace/screenshots/mahjong/live-waiting-390.png", fullPage: true });
await A.p.click("text=Deal the first hand");
const stats = { Alice: { discards: 0, claims: 0, passes: 0, wins: 0 }, Bob: { discards: 0, claims: 0, passes: 0, wins: 0 } }; let hands = new Set(); let shot = 0;
async function step(X) {
  const S = stats[X.name];
  const claim = await X.p.$(".mj-claim");
  if (claim) {
    for (const s of ['button:has-text("Mahjong")', 'button:has-text("Pung")', 'button:has-text("Kong")', 'button:has-text("Chow")']) { const b = await claim.$(s); if (b && (s.includes("Mahjong") || Math.random() < 0.7)) { await b.click({ timeout: 1500 }).catch(() => {}); S.claims++; if (s.includes("Mahjong")) S.wins++; return "claim " + s.slice(17, -2); } }
    const p = await claim.$('button:has-text("Pass")'); if (p) { await p.click({ timeout: 1500 }).catch(() => {}); S.passes++; return "pass"; }
  }
  const win = await X.p.$('.mj-actions button:has-text("Mahjong")'); if (win) { await win.click({ timeout: 1500 }).catch(() => {}); S.wins++; return "tsumo"; }
  const tiles = await X.p.$$(".mj-mine.myturn button.mjt");
  if (tiles.length) { if (!shot && S.discards === 3) { shot = 1; await A.p.screenshot({ path: "/workspace/screenshots/mahjong/live-alice-390.png", fullPage: true }); await Bo.p.screenshot({ path: "/workspace/screenshots/mahjong/live-bob-1280.png", fullPage: true }); }
    const t = tiles[tiles.length - 1]; await t.click({ timeout: 1500 }).catch(() => {}); await X.p.waitForTimeout(120); await t.click({ timeout: 1500 }).catch(() => {}); S.discards++; return "discard"; }
  const res = await X.p.$(".mj-result"); if (res) { hands.add((await res.innerText()).slice(0, 80)); const nx = await X.p.$('.mj-result button:has-text("Next hand")'); if (nx) { await nx.click({ timeout: 1500 }).catch(() => {}); return "next"; } }
  return "-";
}
const t0 = Date.now();
while (Date.now() - t0 < SECS * 1000) { const a = await step(A); const b = await step(Bo); if (a !== "-" || b !== "-") console.log(((Date.now() - t0) / 1000).toFixed(1), "A", a, "| B", b); await A.p.waitForTimeout(300); }
await A.p.screenshot({ path: "/workspace/screenshots/mahjong/live-alice-end-390.png", fullPage: true });
await Bo.p.screenshot({ path: "/workspace/screenshots/mahjong/live-bob-end-1280.png", fullPage: true });
const tok = { Alice: await A.p.evaluate(() => localStorage.getItem("cards_token")), Bob: await Bo.p.evaluate(() => localStorage.getItem("cards_token")) };
// ---------- audit ----------
const isTile = (x) => typeof x === "string" && /^[1-9][mpszfg]$/.test(x);
const key = (h) => [...h].sort().join(",");
const report = { url, stats, handsFinished: hands.size, frames: {}, violations: [], winnerReveals: 0 };
const priv = { Alice: new Map(), Bob: new Map() }; // "handNo" -> Set of concealed-hand keys seen in own private views
const seatOf = { Alice: -1, Bob: -1 };
const parse = (b) => { try { return JSON.parse(b); } catch { return null; } };
for (const X of [A, Bo]) {
  for (const c of X.cap) { const j = parse(c.body); if (!j) continue; if (typeof j.seat === "number" && j.seat >= 0) seatOf[X.name] = j.seat;
    const pv = j.private; if (pv?.hand?.length) { const s = priv[X.name].get(pv.handNo) ?? new Set(); s.add(key(pv.hand)); if (pv.drawn) s.add(key(pv.hand.filter((t, i) => i !== pv.hand.indexOf(pv.drawn)))); priv[X.name].set(pv.handNo, s); } }
  report.frames[X.name] = { messages: X.cap.length, http: X.cap.filter((c) => c.kind === "http").length, ws: X.cap.filter((c) => c.kind === "ws").length };
}
const ALLOWED_ARR = new Set(["ponds", "melds", "flowers", "tiles", "chows", "kongs", "items"]);
for (const X of [A, Bo]) {
  const oName = X === A ? "Bob" : "Alice", other = tok[oName], oPriv = priv[oName];
  for (const c of X.cap) {
    if (other && c.body.includes(other)) report.violations.push(`${X.name} saw ${oName}'s seat token`);
    if (/tokenHash|"wall"\s*:\s*\[|"dead"\s*:\s*\[|nextWall/.test(c.body)) report.violations.push(`${X.name} received tokenHash / wall / dead wall arrays`);
    const j = parse(c.body); if (!j) continue;
    // walk everything; track the path so lastHand (winner's revealed hand) and own private view are recognised
    const walk = (o, path, hn) => {
      if (Array.isArray(o)) {
        const tiles = o.filter(isTile);
        if (tiles.length === o.length && o.length >= 7) {
          const k = path[path.length - 1]; const inLast = path.includes("lastHand"); const inPriv = path[0] === "private";
          if (inLast && k === "hand") { report.winnerReveals++; return; }
          if (inPriv && k === "hand") return;
          if (!ALLOWED_ARR.has(k) && !/^\d+$/.test(k ?? "")) report.violations.push(`${X.name}: unexpected tile array "${path.join(".")}" (${o.length} tiles)`);
          if (k === "hands") report.violations.push(`${X.name}: public hands present`);
          const set = hn !== undefined ? oPriv.get(hn) : null; if (set && set.has(key(o))) report.violations.push(`${X.name}: ${oName}'s concealed hand at ${path.join(".")} (hand ${hn})`);
        }
        o.forEach((v, i) => walk(v, [...path, String(i)], hn)); return;
      }
      if (o && typeof o === "object") { const h2 = o.game === "mahjong" && typeof o.handNo === "number" ? o.handNo : hn;
        if (o.game === "mahjong" && o.phase && o.hands) report.violations.push(`${X.name}: public hands non-null (hand ${o.handNo})`);
        for (const [k, v] of Object.entries(o)) walk(v, [...path, k], h2); }
    };
    walk(j, [], undefined);
    // the other player's concealed hand must never appear in my private view
    if (j.private?.hand) { const set = oPriv.get(j.private.handNo); if (set?.has(key(j.private.hand))) report.violations.push(`${X.name}'s private hand equals ${oName}'s`); }
  }
}
report.seats = seatOf; report.handsChecked = { Alice: [...priv.Alice.keys()], Bob: [...priv.Bob.keys()] };
report.violations = [...new Set(report.violations)];
writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
await A.browser.close(); await Bo.browser.close();
