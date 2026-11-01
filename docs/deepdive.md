# Deep Dive — solo rare-answer trivia trainer

Route: `#/deepdive` (lobby id `deepdive`, status `active`, solo only). Practice for rare-answer trivia
games: each prompt is a closed list ("A US state"); any accepted answer scores, and rarer answers score
more (10–100 points, 1 point = 10 m of depth, a perfect 7-prompt dive = 700 points = 7,000 m).
All questions are our own lists; no third-party game name, logo or questions are used.

## Modes
- **Study** (`?v=study`): every list sorted common → rare with rarity bars, aliases and tips; *Self-quiz*
  hides the answers as flip cards that turn when you type a match (or tap).
- **Drills** (`?v=drill`): *Name them all* (timer off/60/120 s) and *Name a rare one* (only answers ≥ 40/60/80
  points count; timer off/25 s).
- **Practice** (`?v=dive&k=daily|endless|review`): 3 s preview → 25 s countdown ring → one answer.
  Unrecognised text can be retried while time remains. *Daily Dive* = 7 prompts (one per category + one
  extra), *Endless* runs until 3 misses, *Review* plays due spaced-repetition items.
- **Progress** (`?v=progress`): dives, average/best depth, streak, depth trend chart, per-category
  accuracy + average points with Strong/Weak badges, review queue.

## Question bank
- Sources: `scripts/deepdive/src/{geo,mtv,sport,pop,sci,hist}.mjs`. One line per answer:
  `Display | alias | alias ~year @Wikipedia title;Alt title # custom tip =NN`
  (`=NN` forces points; `@` picks the Wikipedia article; prompt flags `team`, `person`, `country`,
  `manual` add automatic aliases or skip lookups).
- Build: `npm run deepdive:bank` → `src/games/deepdive/bank.json` (+ `scripts/deepdive/report.txt` listing
  titles whose Wikipedia description looked off). API responses are cached in `scripts/deepdive/.cache/`
  (gitignored); a cold build takes ~10 minutes because of Wikimedia rate limits.

### Rarity method (Wikipedia pageviews proxy)
There is no public data on how often players give each answer, so we use popularity as a proxy: the
better-known an answer, the more people say it.
1. Each answer is resolved to its English Wikipedia article (redirects followed, disambiguation pages flagged).
2. Views = **median monthly pageviews, Oct 2021 – Sep 2026** (60 months, human "user" agent traffic only, Wikimedia
   REST per-article API). The median damps one-off news spikes (a death, a scandal, a World Cup run).
3. Within a prompt, sort by views. `p` = rank percentile (0 = most viewed, 1 = least; ties share a rank),
   `l` = log-scaled position between the max and min views.
   **points = round(10 + 90 × (0.5·p + 0.5·l))**, so the most common answer is 10 and the rarest 100.
4. Lists without meaningful pageviews (`manual`, e.g. sports positions) are spread linearly 10→100 in the
   order written; `=NN` overrides a single answer.
5. Tips: answers worth ≥ 40 points get the first sentence of their Wikipedia extract (≤ 140 chars) unless a
   custom `#` tip is written.

## Matching (`src/games/deepdive/match.ts`)
Normalise (accents stripped, lower case, `&`→and, punctuation removed, saint→st, mount→mt, Roman numerals
II–X→digits, leading "the" dropped), then: exact display name → unique alias → ambiguous alias
("Be more specific") → spacing-insensitive match → Damerau-Levenshtein fuzzy match (0 edits for ≤ 3
letters, 1 for 4–7, 2 for 8+; numbers must match exactly). Titles with ": " also accept either half.

## Spaced repetition and storage
`localStorage["dd_v1:<player>"]` (player = lobby name `gm_player`) stores attempts, dives and the SRS queue.
A miss, or an answer slower than 15 s, schedules the prompt for review in 1 day; each on-time review hit
moves it to 3, then 7 days, then it graduates. A miss resets it to 1 day. The home screen shows
"Review due" when anything is due.

## Weekly daily sets
`npm run deepdive:weekly` (default: current and next Monday-start week, America/Chicago) picks 7 prompts per
day (one per category + one extra, no repeats within the week or the previous 21 days) and inserts rows into
`weekly_puzzles` (`game = 'deepdive'`, `difficulty = ''`) via the `insert_weekly` RPC; existing rows are left
alone. It also writes `puzzles/deepdive/<week>.json`. Options: `--week YYYY-MM-DD`, `--dry-run`.
`scripts/weekly-cron.sh` (Sunday 3 AM) runs it right after `npm run weekly`. If no row exists for today the
client falls back to a date-seeded set, so the game never breaks.

## Tests
`npx vitest run src/games/deepdive` (matcher) and `BASE=<url> node scripts/deepdive/smoke.mjs` (Playwright
smoke test of all modes at 390 and 1280 px; writes screenshots to `/workspace/screenshots/deepdive/`).
