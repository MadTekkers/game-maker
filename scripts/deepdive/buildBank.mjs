#!/usr/bin/env node
// Builds src/games/deepdive/bank.json from scripts/deepdive/src/*.mjs.
// Rarity = popularity proxy: English Wikipedia pageviews (user agent, median month, Oct 2021 – Sep 2026).
// See docs/deepdive.md. Usage: node scripts/deepdive/buildBank.mjs [--offline]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CACHE = path.join(HERE, ".cache");
const OUT = path.join(ROOT, "src/games/deepdive/bank.json");
const REPORT = path.join(HERE, "report.txt");
const UA = "GameLobbyDeepDive/1.0 (https://github.com/MadTekkers/game-lobby; trivia trainer bank builder)";
const VIEWS_FROM = "20211001", VIEWS_TO = "20260930"; // 60 months; we use the MEDIAN month to damp news spikes
const OFFLINE = process.argv.includes("--offline");
fs.mkdirSync(CACHE, { recursive: true });

const CATS = [
  { id: "geo", name: "Geography", file: "geo.mjs" },
  { id: "mtv", name: "Movies & TV", file: "mtv.mjs" },
  { id: "sp", name: "Sport", file: "sport.mjs" },
  { id: "pc", name: "Pop culture", file: "pop.mjs" },
  { id: "sci", name: "Science", file: "sci.mjs" },
  { id: "hi", name: "History", file: "hist.mjs" },
];

// Shared country aliases (applied to any answer whose display name matches).
const COUNTRY_ALIASES = {
  "United States": ["USA", "US", "U.S.", "America", "United States of America", "U.S.A."],
  "United Kingdom": ["UK", "Britain", "Great Britain", "U.K."],
  "Czech Republic": ["Czechia"],
  "Ivory Coast": ["Côte d'Ivoire", "Cote d'Ivoire"],
  "DR Congo": ["DRC", "Democratic Republic of the Congo", "Congo-Kinshasa", "Zaire", "Congo"],
  "Republic of the Congo": ["Congo-Brazzaville", "Congo", "Congo Republic"],
  "Eswatini": ["Swaziland"],
  "North Macedonia": ["Macedonia"],
  "Myanmar": ["Burma"],
  "East Timor": ["Timor-Leste"],
  "Cape Verde": ["Cabo Verde"],
  "Vatican City": ["Vatican", "Holy See"],
  "Micronesia": ["Federated States of Micronesia", "FSM"],
  "Netherlands": ["Holland", "The Netherlands"],
  "Turkey": ["Türkiye", "Turkiye"],
  "United Arab Emirates": ["UAE", "Emirates"],
  "Bosnia and Herzegovina": ["Bosnia", "BiH"],
  "Gambia": ["The Gambia"],
  "Bahamas": ["The Bahamas"],
  "South Korea": ["Korea", "Republic of Korea"],
  "North Korea": ["DPRK"],
  "Soviet Union": ["USSR", "Soviet"],
  "Russia": ["Russian Federation"],
  "China": ["PRC", "People's Republic of China"],
  "Taiwan": ["Republic of China", "ROC"],
  "Palestine": ["State of Palestine"],
  "Saint Kitts and Nevis": ["St Kitts", "Saint Kitts", "St Kitts and Nevis"],
  "Saint Vincent and the Grenadines": ["St Vincent", "Saint Vincent"],
  "Trinidad and Tobago": ["Trinidad"],
  "Antigua and Barbuda": ["Antigua"],
  "São Tomé and Príncipe": ["Sao Tome", "São Tomé"],
  "Papua New Guinea": ["PNG"],
  "Central African Republic": ["CAR"],
  "Laos": ["Lao"],
  "Moldova": ["Moldavia"],
  "Belarus": ["Byelorussia"],
  "Sri Lanka": ["Ceylon"],
  "Iran": ["Persia"],
  "Thailand": ["Siam"],
  "Germany": ["West Germany"],
  "England": [],
};
const COUNTRY_WIKI = {
  Georgia: "Georgia (country)", Ireland: "Republic of Ireland", Gambia: "The Gambia", Bahamas: "The Bahamas",
  Micronesia: "Federated States of Micronesia", "DR Congo": "Democratic Republic of the Congo",
  "Republic of the Congo": "Republic of the Congo", Palestine: "State of Palestine",
};

// ---------- parsing ----------
function parseLine(raw, prompt) {
  let s = raw.trim();
  const out = { aliases: [] };
  let m = s.match(/\s=(\d{1,3})\s*$/); if (m) { out.points = +m[1]; s = s.slice(0, m.index).trim(); }
  m = s.match(/\s#\s(.+)$/); if (m) { out.tip = m[1].trim(); s = s.slice(0, m.index).trim(); }
  m = s.match(/\s@(.+)$/); if (m) { out.titles = m[1].split(";").map((x) => x.trim()).filter(Boolean); s = s.slice(0, m.index).trim(); }
  m = s.match(/\s~(\d{4})$/); if (m) { out.year = m[1]; s = s.slice(0, m.index).trim(); }
  const parts = s.split("|").map((x) => x.trim()).filter(Boolean);
  let display = parts.shift();
  out.aliases.push(...parts);
  if (prompt.team && display.includes("/")) {
    const [city, nick] = display.split("/").map((x) => x.trim());
    display = `${city} ${nick}`;
    out.aliases.push(nick, city);
  }
  out.display = display;
  if (prompt.person) {
    const words = display.replace(/,? (Jr\.?|Sr\.?|II|III)$/, "").split(/\s+/);
    const last = words[words.length - 1];
    if (words.length > 1 && last.replace(/[^\p{L}]/gu, "").length >= 3) out.aliases.push(last);
  }
  if (COUNTRY_ALIASES[display]) out.aliases.push(...COUNTRY_ALIASES[display]);
  // de-dupe, drop alias equal to display
  const seen = new Set([display.toLowerCase()]);
  out.aliases = out.aliases.filter((a) => { const k = a.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  // candidate titles
  if (!out.titles) {
    if (prompt.country && COUNTRY_WIKI[display]) out.titles = [COUNTRY_WIKI[display]];
    else if (prompt.wt) out.titles = prompt.wt.filter((t) => !t.includes("{y}") || out.year).map((t) => t.replace("{}", display).replace("{y}", out.year));
    else out.titles = [display];
  }
  return out;
}

// ---------- http with cache ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function cachedJson(url) {
  const f = path.join(CACHE, crypto.createHash("sha1").update(url).digest("hex") + ".json");
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  if (OFFLINE) return null;
  for (let attempt = 0; attempt < 8; attempt++) {
    let res;
    try { res = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } }); } catch { await sleep(2000 * (attempt + 1)); continue; }
    if (res.status === 404) { const v = { notFound: true }; fs.writeFileSync(f, JSON.stringify(v)); return v; }
    if (res.status === 429 || res.status >= 500) { if (attempt > 2) console.warn(`  ${res.status} retry ${attempt}`); await sleep(Math.min(30000, 1500 * 2 ** attempt)); continue; }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const v = await res.json();
    fs.writeFileSync(f, JSON.stringify(v));
    return v;
  }
  throw new Error(`gave up: ${url}`);
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}
const API = "https://en.wikipedia.org/w/api.php";

async function resolveTitles(titles) {
  const info = new Map(); // requested title -> {title, desc, disambig, missing}
  const uniq = [...new Set(titles)];
  for (let i = 0; i < uniq.length; i += 50) {
    const batch = uniq.slice(i, i + 50);
    const url = `${API}?action=query&format=json&formatversion=2&redirects=1&prop=description%7Cpageprops&ppprop=disambiguation&titles=${encodeURIComponent(batch.join("|"))}`;
    const j = await cachedJson(url);
    if (!j?.query) continue;
    const norm = Object.fromEntries((j.query.normalized || []).map((x) => [x.from, x.to]));
    const redir = Object.fromEntries((j.query.redirects || []).map((x) => [x.from, x.to]));
    const pages = Object.fromEntries((j.query.pages || []).map((p) => [p.title, p]));
    for (const t of batch) {
      let k = norm[t] || t; k = redir[k] || k; k = norm[k] || k;
      const p = pages[k];
      if (!p || p.missing || p.invalid) { info.set(t, { missing: true }); continue; }
      info.set(t, { title: p.title, desc: p.description || "", disambig: !!p.pageprops?.disambiguation });
    }
  }
  return info;
}
async function fetchViews(title) {
  const t = encodeURIComponent(title.replace(/ /g, "_"));
  const j = await cachedJson(`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${t}/monthly/${VIEWS_FROM}00/${VIEWS_TO}00`);
  if (!j || j.notFound || !j.items?.length) return 0;
  const v = j.items.map((x) => x.views).sort((a, b) => a - b);
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; // median monthly views
}
async function fetchExtracts(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 20) {
    const batch = titles.slice(i, i + 20);
    const url = `${API}?action=query&format=json&formatversion=2&prop=extracts&exintro=1&explaintext=1&exsentences=1&exlimit=20&titles=${encodeURIComponent(batch.join("|"))}`;
    const j = await cachedJson(url);
    for (const p of j?.query?.pages || []) if (p.extract) out.set(p.title, p.extract);
  }
  return out;
}
function stripParens(s) { let prev; do { prev = s; s = s.replace(/\s*[(\[][^()\[\]]*[)\]]/g, ""); } while (s !== prev); return s; }
function tipFromExtract(ex) {
  if (!ex) return undefined;
  let s = stripParens(ex).replace(/\s+/g, " ").replace(/\s+([,.;])/g, "$1").trim();
  s = s.split(/(?<=[a-z0-9)]\.)\s+(?=[A-Z])/)[0];
  if (s.length > 140) { const cut = s.slice(0, 137); const at = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(" ")); s = cut.slice(0, at > 80 ? at : 137).replace(/[,;:\s]+$/, "") + "…"; }
  return s;
}

// ---------- main ----------
const report = [];
const prompts = [];
for (const cat of CATS) {
  const mod = await import(path.join(HERE, "src", cat.file));
  for (const p of mod.default) {
    const answers = p.list.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//")).map((l) => parseLine(l, p));
    const dupes = answers.map((a) => a.display).filter((d, i, arr) => arr.indexOf(d) !== i);
    if (dupes.length) report.push(`DUP ${p.id}: ${dupes.join(", ")}`);
    prompts.push({ cat: cat.id, def: p, answers });
  }
}
// Resolve wiki titles for non-manual prompts.
const allTitles = prompts.filter((p) => !p.def.manual).flatMap((p) => p.answers.flatMap((a) => a.titles));
console.log(`resolving ${new Set(allTitles).size} titles…`);
const info = await resolveTitles(allTitles);
for (const p of prompts) {
  if (p.def.manual) continue;
  for (const a of p.answers) {
    let pick = null, fallback = null;
    for (const t of a.titles) {
      const r = info.get(t);
      if (!r || r.missing || r.disambig) continue;
      if (!p.def.wm || !r.desc || p.def.wm.test(r.desc)) { pick = r; break; }
      fallback ||= r;
    }
    if (!pick && fallback) { report.push(`DESC ${p.def.id}: "${a.display}" -> ${fallback.title} [${fallback.desc}]`); pick = fallback; }
    if (!pick) report.push(`MISSING ${p.def.id}: "${a.display}" tried ${a.titles.join(" ; ")}`);
    a.wiki = pick?.title;
    if (pick && !pick.desc) report.push(`NODESC ${p.def.id}: "${a.display}" -> ${pick.title}`);
  }
}
const wikiTitles = [...new Set(prompts.flatMap((p) => p.answers.map((a) => a.wiki)).filter(Boolean))];
console.log(`pageviews for ${wikiTitles.length} articles…`);
const views = new Map();
let done = 0;
await pool(wikiTitles, 4, async (t) => { views.set(t, await fetchViews(t)); if (++done % 250 === 0) console.log(`  ${done}/${wikiTitles.length}`); });

// Points.
for (const p of prompts) {
  const n = p.answers.length;
  if (p.def.manual) {
    p.answers.forEach((a, i) => { a.pts = a.points ?? Math.round(10 + 90 * (n > 1 ? i / (n - 1) : 0)); });
    continue;
  }
  for (const a of p.answers) a.views = a.wiki ? views.get(a.wiki) || 0 : 0;
  const sorted = [...p.answers].sort((x, y) => y.views - x.views);
  const vs = sorted.map((a) => Math.max(a.views, 1));
  const lmax = Math.log(vs[0]), lmin = Math.log(vs[vs.length - 1]);
  sorted.forEach((a, i) => {
    // ties share the best rank
    const rank = sorted.findIndex((b) => b.views === a.views);
    const pct = n > 1 ? rank / (n - 1) : 0;
    const l = lmax > lmin ? (lmax - Math.log(Math.max(a.views, 1))) / (lmax - lmin) : 0;
    a.pts = a.points ?? Math.round(10 + 90 * (0.5 * pct + 0.5 * l));
    if (!a.views && a.wiki) report.push(`ZEROVIEWS ${p.def.id}: ${a.wiki}`);
  });
}
// Tips from extracts for rarer answers without a custom tip.
const needTip = [...new Set(prompts.flatMap((p) => p.answers.filter((a) => !a.tip && a.wiki && a.pts >= 40).map((a) => a.wiki)))];
console.log(`extracts for ${needTip.length} tips…`);
const extracts = await fetchExtracts(needTip);
for (const p of prompts) for (const a of p.answers) if (!a.tip && a.wiki && a.pts >= 40) a.tip = tipFromExtract(extracts.get(a.wiki));

const outPrompts = prompts.map((p) => ({
  id: p.def.id, cat: p.cat, q: p.def.q, ...(p.def.note ? { note: p.def.note } : {}),
  answers: [...p.answers].sort((x, y) => x.pts - y.pts).map((a) => ({
    t: a.display, ...(a.aliases.length ? { a: a.aliases } : {}), p: a.pts, ...(a.tip ? { tip: a.tip } : {}), ...(a.wiki ? { w: a.wiki } : {}),
  })),
}));
const body = JSON.stringify(outPrompts);
const version = `${new Date().toISOString().slice(0, 10)}-${crypto.createHash("sha1").update(body).digest("hex").slice(0, 8)}`;
const bank = { version, source: `median monthly English Wikipedia pageviews (user agent) ${VIEWS_FROM}–${VIEWS_TO}`, categories: CATS.map(({ id, name }) => ({ id, name })), prompts: outPrompts };
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(bank, null, 0) + "\n");
fs.writeFileSync(REPORT, report.join("\n") + "\n");
const counts = CATS.map((c) => `${c.name}: ${outPrompts.filter((p) => p.cat === c.id).length} prompts / ${outPrompts.filter((p) => p.cat === c.id).reduce((s, p) => s + p.answers.length, 0)} answers`);
console.log(`bank ${version}: ${outPrompts.length} prompts\n  ${counts.join("\n  ")}\nreport: ${report.length} lines -> ${path.relative(ROOT, REPORT)}`);
