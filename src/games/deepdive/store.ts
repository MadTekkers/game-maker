// Per-player progress in localStorage: answer log, dive results and the spaced-repetition queue.
import { getPlayer } from "../../lib/player";
import type { CatId } from "./types";

export type Attempt = { at: number; pid: string; cat: CatId; ok: boolean; pts: number; ms: number; src: "daily" | "endless" | "review" | "drill" };
export type DiveLog = { at: number; kind: "daily" | "endless" | "review"; day?: string; depth: number; n: number; hits: number };
/** One spaced-repetition card per prompt: `step` 0 → due in 1 day, 1 → 3 days, 2 → 7 days, then it graduates. */
export type SrsItem = { pid: string; due: number; step: number; missed: string[] };
export type Store = { attempts: Attempt[]; dives: DiveLog[]; srs: Record<string, SrsItem> };

const DAY = 86400000;
export const SRS_DAYS = [1, 3, 7];
const key = () => `dd_v1:${(getPlayer() || "guest").toLowerCase()}`;
export function load(): Store {
  try { const s = JSON.parse(localStorage.getItem(key()) || "null"); if (s?.attempts) return s; } catch { /* corrupted: start over */ }
  return { attempts: [], dives: [], srs: {} };
}
function save(s: Store) {
  s.attempts = s.attempts.slice(-1500); s.dives = s.dives.slice(-300);
  localStorage.setItem(key(), JSON.stringify(s));
}
export function logAttempt(a: Attempt) { const s = load(); s.attempts.push(a); save(s); }
export function logDive(d: DiveLog) { const s = load(); s.dives.push(d); save(s); }

/** Missed or slow: (re)schedule for tomorrow. */
export function srsMiss(pid: string, missedAnswers: string[] = [], now = Date.now()) {
  const s = load();
  const prev = s.srs[pid];
  s.srs[pid] = { pid, step: 0, due: now + SRS_DAYS[0] * DAY, missed: [...new Set([...(prev?.missed ?? []), ...missedAnswers])].slice(0, 6) };
  save(s);
}
/** Reviewed successfully: push to the next interval (1 → 3 → 7 days), then graduate. */
export function srsPass(pid: string, now = Date.now()) {
  const s = load();
  const it = s.srs[pid];
  if (!it) return;
  if (it.due > now) return; // only a *due* review advances the card
  const step = it.step + 1;
  if (step >= SRS_DAYS.length) delete s.srs[pid];
  else s.srs[pid] = { ...it, step, due: now + SRS_DAYS[step] * DAY };
  save(s);
}
export const dueItems = (now = Date.now()) => Object.values(load().srs).filter((x) => x.due <= now).sort((a, b) => a.due - b.due);
export const queuedItems = () => Object.values(load().srs).sort((a, b) => a.due - b.due);

const ymd = (t: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date(t));
/** Consecutive days (ending today or yesterday) with at least one finished dive, plus the best run. */
export function streaks(s: Store, now = Date.now()) {
  const days = new Set(s.dives.map((d) => ymd(d.at)));
  const sorted = [...days].sort();
  let best = 0, run = 0, prev = "";
  for (const d of sorted) {
    const p = new Date(d + "T12:00:00Z"); p.setUTCDate(p.getUTCDate() - 1);
    run = prev === p.toISOString().slice(0, 10) ? run + 1 : 1; best = Math.max(best, run); prev = d;
  }
  let cur = 0; const t = new Date(ymd(now) + "T12:00:00Z");
  if (!days.has(ymd(now))) t.setUTCDate(t.getUTCDate() - 1);
  while (days.has(t.toISOString().slice(0, 10))) { cur++; t.setUTCDate(t.getUTCDate() - 1); }
  return { current: cur, best };
}
export const dailyDone = (day: string) => load().dives.find((d) => d.kind === "daily" && d.day === day) || null;
