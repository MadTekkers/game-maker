// UI smoke for Mahjong: solo table vs 3 bots in a browser. Discards (tap twice), claims whenever offered (win > pung > chow),
// closes coach cards, plays until HANDS hands have finished; screenshots mid-game, coach card and the end-of-hand breakdown.
// Usage: BASE=<url> W=390 Q="bot=easy&train=1" HANDS=1 TAG=x node scripts/mahjongUiSmoke.mjs
import { chromium } from "playwright-core";
const B = process.env.BASE || "http://localhost:4317/"; const W = +(process.env.W || 390); const Q = process.env.Q || "bot=easy&train=1";
const HANDS = +(process.env.HANDS || 1); const TAG = process.env.TAG || `${W}`; const OUT = "/workspace/screenshots/mahjong";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: W, height: W < 600 ? 844 : 900 } });
await ctx.addInitScript(() => { localStorage.setItem("gm_player", "UiTester"); localStorage.setItem("gm_sound", "off"); });
const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
const shot = async (n) => { await p.screenshot({ path: `${OUT}/${n}-${TAG}.png`, fullPage: true }); console.log("shot", `${OUT}/${n}-${TAG}.png`); };
let discards = 0, claims = 0, passes = 0, coach = 0, done = 0, maxOver = 0, shots = new Set(), lastScore = "";
await p.goto(B + "#/mahjong?mode=solo&" + Q); await p.waitForSelector(".mj-table", { timeout: 40000 });
const t0 = Date.now();
while (done < HANDS && Date.now() - t0 < 600000) {
  await p.waitForTimeout(350);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (ov > 2 && ov > maxOver) { const who = await p.evaluate(() => { const W = innerWidth, out = []; for (const e of document.querySelectorAll("body *")) { const b = e.getBoundingClientRect(); if (b.right > W + 1 && b.width) { let a = e.parentElement, clip = false; while (a) { if (getComputedStyle(a).overflowX !== "visible") { clip = true; break; } a = a.parentElement; } if (!clip) out.push(`${e.tagName}.${e.className?.baseVal ?? e.className} r=${Math.round(b.right)}`.slice(0, 90)); } } return out.slice(0, 6); }); console.log("OVERFLOW", ov, JSON.stringify(who)); await shot("overflow"); }
  maxOver = Math.max(maxOver, ov);
  if (await p.locator(".coach-h .x").count()) { coach++; if (!shots.has("coach")) { shots.add("coach"); await p.waitForTimeout(500); await shot("comparison-card"); } await p.locator(".coach-h .x").first().click().catch(() => {}); continue; }
  if (await p.locator(".mj-intro button").count() && !(await p.locator(".side-panel").count())) { await p.locator(".mj-intro button").first().click().catch(() => {}); }
  const claim = p.locator(".mj-claim");
  if (await claim.count()) {
    const order = ['button:has-text("Mahjong")', 'button:has-text("Kong")', 'button:has-text("Pung")', 'button:has-text("Chow")'];
    let did = false; for (const s of order) { const b = claim.locator(s); if (await b.count()) { await b.first().click().catch(() => {}); claims++; did = true; console.log("claim", s); break; } }
    if (!did) { await claim.locator('button:has-text("Pass")').click().catch(() => {}); passes++; }
    await p.waitForTimeout(900); continue;
  }
  const win = p.locator('.mj-actions button:has-text("Mahjong")'); if (await win.count()) { await win.click().catch(() => {}); console.log("self-draw win"); await p.waitForTimeout(900); continue; }
  const mine = p.locator(".mj-mine.myturn button.mjt");
  if (await mine.count()) {
    if (discards === 4 && !shots.has("mid")) { shots.add("mid"); await shot("table-midgame"); }
    const hinted = p.locator(".mj-mine.myturn button.mjt.hinted"); const t = (await hinted.count()) ? hinted.first() : mine.last();
    await t.click().catch(() => {}); await p.waitForTimeout(150); await t.click().catch(() => {}); discards++; await p.waitForTimeout(700); continue;
  }
  if (await p.locator(".mj-result").count()) {
    const sc = await p.locator(".mj-result").innerText(); if (sc !== lastScore) { lastScore = sc; done++; console.log("HAND OVER:", sc.replace(/\s+/g, " ").slice(0, 400)); await p.waitForTimeout(1500); await shot(`end-of-hand-${done}`); }
    if (done < HANDS) await p.locator('.mj-result button:has-text("Next hand")').click().catch(() => {});
    continue;
  }
  const nx = p.locator('button:has-text("Deal the first hand")'); if (await nx.count()) await nx.click().catch(() => {});
}
console.log(JSON.stringify({ W, Q, discards, claims, passes, coach, handsDone: done, overflow: maxOver, errors: errs.slice(0, 5) }));
await browser.close(); process.exit(errs.length || done < HANDS ? 1 : 0);
