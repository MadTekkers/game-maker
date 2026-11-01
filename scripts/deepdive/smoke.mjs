// Deep Dive smoke test + screenshots (phone 390 and laptop 1280).
// Usage: BASE=https://game-lobby-games.vercel.app/ OUT=/workspace/screenshots/deepdive node scripts/deepdive/smoke.mjs
// Plays: home, study (browse + self-quiz), both drills, a full Daily Dive, an Endless prompt with a retry, progress.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const B = (process.env.BASE || "http://localhost:4297/").replace(/\/?$/, "/");
const OUT = process.env.OUT || "/workspace/screenshots/deepdive";
const WIDTHS = (process.env.WIDTHS || "390,1280").split(",").map(Number);
const bank = JSON.parse(readFileSync(new URL("../../src/games/deepdive/bank.json", import.meta.url)));
const byQ = new Map(bank.prompts.map((p) => [p.q, p]));
const pick = (q, f = 0.6) => { const p = byQ.get(q); if (!p) throw new Error(`prompt not in local bank: ${q}`); return p.answers[Math.min(p.answers.length - 1, Math.floor(p.answers.length * f))].t; };
mkdirSync(OUT, { recursive: true });
const fails = [];
const vis = (loc, ms = 4000) => loc.waitFor({ state: "visible", timeout: ms }).then(() => true, () => false);
const ok = (c, m) => { if (!c) { fails.push(m); console.log("FAIL", m); } else console.log("ok  ", m); };
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 800 }, deviceScaleFactor: w < 600 ? 2 : 1 });
  await ctx.addInitScript(() => { if (!localStorage.getItem("gm_player")) localStorage.setItem("gm_player", "SmokeTest"); });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  const shot = (n) => p.screenshot({ path: `${OUT}/${n}-${w}.png` });
  const T = `[${w}]`;
  // lobby
  await p.goto(B + "#/");
  ok(await vis(p.getByText("Deep Dive", { exact: true }).first(), 15000), `${T} lobby lists Deep Dive`);
  // first open shows walkthrough
  await p.goto(B + "#/deepdive");
  ok(await vis(p.locator(".dd-walk, [role=dialog]").first(), 15000), `${T} walkthrough on first open`);
  await shot("walkthrough");
  await p.evaluate(() => localStorage.setItem("dd_intro_v1", "1")); await p.reload();
  await p.waitForSelector(".dd-home", { timeout: 20000 });
  // study
  await p.goto(B + "#/deepdive?v=study"); await p.waitForSelector(".dd-pcard");
  ok((await p.locator(".dd-pcard").count()) >= 150, `${T} study lists ≥150 prompts`);
  await p.locator(".dd-pcard", { hasText: "A James Bond film" }).click(); await p.waitForSelector(".dd-browse");
  await p.waitForTimeout(500); await shot("study");
  await p.getByRole("button", { name: "Self-quiz" }).click();
  await p.getByLabel("Self-quiz answer").fill("moonraker"); await p.getByRole("button", { name: "Check" }).click();
  await p.waitForTimeout(400);
  ok(await vis(p.locator(".dd-cards").getByText("Moonraker").first()), `${T} self-quiz flips Moonraker`);
  await shot("study-quiz");
  // drill: name them all
  await p.goto(B + "#/deepdive?v=drill&t=all&p=sci-planets"); await p.getByRole("button", { name: "Start this list" }).click();
  for (const a of ["mars", "jupitr", "earth"]) { await p.getByLabel("Your answer").fill(a); await p.keyboard.press("Enter"); }
  await p.getByRole("button", { name: "Finish" }).click();
  ok(await vis(p.getByText("You named 3 of 8"), 3000), `${T} name-all drill scores 3/8 (fuzzy 'jupitr')`);
  await shot("drill-all");
  // drill: rare one (give up → review queue)
  await p.goto(B + "#/deepdive?v=drill&t=rare&p=geo-us-states"); await p.getByRole("button", { name: "Start this list" }).click();
  await p.getByLabel("Your answer").fill("california"); await p.keyboard.press("Enter");
  ok(await vis(p.getByText(/only 10 pts/), 3000), `${T} rare drill rejects common answer`);
  await p.getByLabel("Your answer").fill("north dakota"); await p.keyboard.press("Enter");
  ok(await vis(p.locator(".coach").first(), 3000), `${T} rare drill accepts North Dakota`);
  await shot("drill-rare");
  await p.goto(B + "#/deepdive?v=drill&t=rare&p=sp-nba"); await p.getByRole("button", { name: "Start this list" }).click();
  await p.getByRole("button", { name: "Give up" }).click(); await p.waitForTimeout(300);
  // daily dive
  await p.goto(B + "#/deepdive?v=dive&k=daily"); await p.getByRole("button", { name: /Start dive/ }).click();
  const src = await p.locator(".dd-status .subtle").textContent().catch(() => "");
  console.log(`${T} daily source: ${src}`);
  for (let i = 0; i < 7; i++) {
    await p.waitForSelector(".dd-preview", { timeout: 10000 });
    const q = (await p.locator(".dd-prompt").first().textContent()).trim();
    if (i === 0) await shot("practice-preview");
    await p.waitForSelector(".dd-answer input", { timeout: 6000 });
    if (i === 0) {
      await p.locator(".dd-answer input").fill("zzqx not real"); await p.keyboard.press("Enter");
      ok(await vis(p.getByText(/isn't recognised/), 2000), `${T} unrecognised answer allows retry`);
      await p.waitForTimeout(1200); await shot("practice");
    }
    await p.locator(".dd-answer input").fill(pick(q, i === 0 ? 0.85 : 0.5)); await p.keyboard.press("Enter");
    await p.waitForSelector(".dd-fb", { timeout: 5000 });
    if (i === 0) { await p.waitForTimeout(500); await shot("feedback"); }
    await p.getByRole("button", { name: /Next prompt|Finish dive/ }).click();
  }
  await p.waitForSelector(".dd-summary", { timeout: 5000 });
  const depth = await p.locator(".dd-sum-depth b").textContent();
  ok(/\d/.test(depth) && !/^0 m$/.test(depth.trim()), `${T} daily dive finished at ${depth}`);
  await shot("daily-done");
  // endless: one hit then surface
  await p.goto(B + "#/deepdive?v=dive&k=endless"); await p.getByRole("button", { name: /Start dive/ }).click();
  await p.waitForSelector(".dd-answer input", { timeout: 8000 });
  const q2 = (await p.locator(".dd-prompt").first().textContent()).trim();
  await p.locator(".dd-answer input").fill(pick(q2, 0.3)); await p.keyboard.press("Enter");
  await p.waitForSelector(".dd-fb"); await p.getByRole("button", { name: "Surface now" }).click();
  ok(await vis(p.locator(".dd-summary"), 3000), `${T} endless dive surfaces`);
  // progress + home
  await p.goto(B + "#/deepdive?v=progress"); await p.waitForSelector(".dd-chart", { timeout: 8000 }).catch(() => {});
  ok(await vis(p.locator(".dd-chart")), `${T} progress shows depth chart`);
  await p.waitForTimeout(400); await shot("progress");
  await p.goto(B + "#/deepdive"); await p.waitForSelector(".dd-home"); await p.waitForTimeout(400); await shot("home");
  ok(errs.length === 0, `${T} no page errors ${errs.slice(0, 3).join(" | ")}`);
  await ctx.close();
}
await browser.close();
console.log(fails.length ? `${fails.length} FAILED` : "ALL OK");
process.exit(fails.length ? 1 : 0);
