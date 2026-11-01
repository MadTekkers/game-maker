#!/usr/bin/env node
// Deep Dive daily sets: 7 prompts per day (one per category + one extra), a week (Mon..Sun) at a time.
// Stored in Supabase weekly_puzzles (game "deepdive", day 0-6, data {prompts, bankVersion}) via the insert_weekly RPC,
// plus a JSON snapshot in puzzles/deepdive/<monday>.json. Idempotent: existing rows are left alone.
//   npm run deepdive:weekly                       -> current and next week
//   npm run deepdive:weekly -- --week 2026-11-02  -> one specific week (Monday date)
//   npm run deepdive:weekly -- --dry-run          -> print the sets, write nothing
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2); const flag = (f) => args.includes(f); const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const DRY = flag("--dry-run");
const envFile = "/workspace/.secrets/game-lobby.env";
const env = { ...Object.fromEntries((fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])), ...process.env };
const URL_ = env.SUPABASE_URL || env.VITE_SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
const H = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, "src/games/deepdive/bank.json"), "utf8"));

function ctToday() { const s = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date()); return new Date(s + "T00:00:00Z"); }
const iso = (d) => d.toISOString().slice(0, 10);
function monday(d) { const x = new Date(d); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x; }
const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };
const weeks = val("--week") ? [iso(monday(new Date(val("--week") + "T00:00:00Z")))] : [iso(monday(ctToday())), iso(addDays(monday(ctToday()), 7))];

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

async function existingRows() {
  if (!URL_) return [];
  const r = await fetch(`${URL_}/rest/v1/weekly_puzzles?select=week_start,day,data&game=eq.deepdive&order=week_start.desc,day&limit=200`, { headers: H });
  const j = await r.json(); if (!Array.isArray(j)) throw new Error("could not read weekly_puzzles");
  return j;
}
async function insert(week, day, data, fingerprint) {
  if (DRY) return "dry";
  const r = await fetch(`${URL_}/rest/v1/rpc/insert_weekly`, { method: "POST", headers: H, body: JSON.stringify({ secret: env.CROSSWORD_INGEST_SECRET, p_week: week, p_day: day, p_game: "deepdive", p_difficulty: "", p_data: data, p_fingerprint: fingerprint }) });
  if (!r.ok) throw new Error(`insert failed ${r.status} ${(await r.text()).slice(0, 300)}`);
  return await r.json(); // null = already existed
}

/** One prompt per category plus one extra, avoiding anything used this week or in the previous few weeks. */
function weekSets(week, recent) {
  const r = rng(hash(`deepdive-week:${week}`));
  const cats = bank.categories.map((c) => c.id);
  const used = new Set();
  const days = [];
  for (let d = 0; d < 7; d++) {
    const order = [...cats].sort(() => r() - 0.5);
    order.push(cats[Math.floor(r() * cats.length)]);
    const set = [];
    for (const c of order) {
      const tiers = [(p) => !used.has(p.id) && !recent.has(p.id), (p) => !used.has(p.id), () => true];
      for (const ok of tiers) {
        const pool = bank.prompts.filter((p) => p.cat === c && !set.includes(p.id) && ok(p));
        if (pool.length) { const p = pool[Math.floor(r() * pool.length)]; set.push(p.id); used.add(p.id); break; }
      }
    }
    for (let i = set.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [set[i], set[j]] = [set[j], set[i]]; }
    days.push(set);
  }
  return days;
}

const rows = await existingRows();
const outDir = path.join(ROOT, "puzzles/deepdive"); fs.mkdirSync(outDir, { recursive: true });
for (const week of weeks) {
  const have = rows.filter((x) => x.week_start === week);
  let days;
  if (have.length === 7) { days = [...have].sort((a, b) => a.day - b.day).map((x) => x.data.prompts); console.log(`${week}: already in Supabase`); }
  else {
    const recent = new Set(rows.filter((x) => x.week_start < week && x.week_start >= iso(addDays(new Date(week + "T00:00:00Z"), -21))).flatMap((x) => x.data?.prompts ?? []));
    days = weekSets(week, recent);
    let added = 0;
    for (let d = 0; d < 7; d++) {
      if (have.some((x) => x.day === d)) { days[d] = have.find((x) => x.day === d).data.prompts; continue; }
      const id = await insert(week, d, { prompts: days[d], bankVersion: bank.version }, `deepdive:${days[d].join(",")}`);
      if (id) added++;
    }
    console.log(`${week}: ${DRY ? "dry run" : `inserted ${added} day(s)`}`);
    days.forEach((prompts, d) => { if (!have.some((x) => x.day === d)) rows.push({ week_start: week, day: d, data: { prompts } }); }); // so next week avoids these
  }
  const snap = { week, bankVersion: bank.version, days: days.map((ids, d) => ({ day: d, prompts: ids.map((id) => { const p = bank.prompts.find((x) => x.id === id); return { id, cat: p?.cat, q: p?.q }; }) })) };
  if (!DRY) fs.writeFileSync(path.join(outDir, `${week}.json`), JSON.stringify(snap, null, 1) + "\n");
  for (const d of snap.days) console.log(`  ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d.day]}: ${d.prompts.map((p) => p.id).join(", ")}`);
}
