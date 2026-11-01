# Hong Kong Mahjong strategy (as played in this app)

**Rules here** ([Wikipedia: Hong Kong mahjong](https://en.wikipedia.org/wiki/Hong_Kong_mahjong),
[Mahjong Pros: HK rules](https://www.mahjongpros.com/hong-kong-mahjong-rules/), [Sloperama scoring](https://www.sloperama.com/mjfaq/mjfaq20.html)):
four players, **144 tiles**: three suits (dots 筒, bamboo 索, characters 萬) numbered 1–9, four of each; four winds (East 東, South 南,
West 西, North 北) and three dragons (Red 中, Green 發, White), four of each; plus 8 bonus tiles (4 flowers 梅蘭菊竹, 4 seasons 春夏秋冬).
Everyone gets 13 tiles; the dealer (**East**) gets 14 and discards first. A flower or season is set aside face up and replaced from the
**dead wall** (16 tiles at the end of the wall). On your turn you draw one tile and discard one.

**Claims.** When a tile is discarded the other players may claim it, in priority order **win > pung/kong > chow**:
**chow** (a run of three in one suit, e.g. 3-4-5 dots) only from the player on your **left** (the one who plays just before you);
**pung** (three of a kind) or **kong** (four of a kind) from anyone. After a kong you draw a replacement from the dead wall. Claimed sets
are laid face up (exposed). A kong can also be declared from your own hand (concealed kong) or by adding a drawn tile to an exposed pung.
Play then continues to the right of the claimer.

**Winning.** A complete hand is **4 sets + 1 pair** (14 tiles, kongs count as sets), or **Seven Pairs**, or **Thirteen Orphans** (one of every
1, 9, wind and dragon plus one duplicate). Win on a discard ("Mahjong!") or by **self-draw**. If the wall runs out, the hand is an
**exhaustive draw**: nobody scores and the dealer stays East.

**Scoring (faan → points).** Each pattern is worth *faan*:

| Pattern | Faan |
|---|---|
| Self-draw · Concealed hand (no claimed sets) · No flowers · each own flower/season (number matches your seat: East=1 … North=4) | 1 each |
| Each dragon pung/kong · seat-wind pung · round-wind pung | 1 each |
| All chows (four runs) | 1 |
| All pungs | 3 |
| Half flush (one suit + honours) | 3 |
| Seven Pairs | 4 |
| Full flush (one suit only) | 7 |
| All honours · Thirteen Orphans | 10 (limit) |

Faan → base points: 0→1, 1→2, 2→4, 3→8, 4→16, 5→24, 6→32, 7→48, 8→64, 9→96, 10+→128 (limit).
**Who pays:** self-draw — each of the other three pays the base; win on a discard — **only the discarder pays, double**. 1 point = 10
chips, settled against your bankroll every hand, so your running total follows your name like chips in the other card games.
**Dealer rotation:** if East wins or the hand is drawn, East deals again; otherwise East passes to the next seat. Seat winds rotate with
the dealer; this app plays an East round, then South, and so on.

Engine: `src/cards/mahjong/engine.ts` · tiles: `tiles.ts` · shanten/ukeire/scoring: `hand.ts` · bots: `ai.ts` · coach: `coach.ts`.

## Words you need
- **Shanten** — how many tile swaps you are from **ready**. "2 away" means two good draws make you ready.
- **Ready (tenpai)** — one tile from winning. The tiles you're waiting for are your **waits**.
- **Useful tiles / ukeire** — every draw that lowers your shanten. **Live** = 4 minus the copies you can already see (your hand, every
  pond, every exposed set and flower). The coach card counts live useful tiles and turns them into "chance the next draw helps":
  live ÷ unseen tiles.

## Beginner
1. **Throw the loners first.** A wind or dragon you hold only one of can only ever become a pung, so it's usually the first discard
   (keep your own seat wind, the round wind and dragons a bit longer if you already have two: those pungs are worth faan).
2. **Then lone 1s and 9s.** A 1 only connects to 2-3; a 5 connects to 3-4-6-7. Middle tiles are more flexible.
3. **Keep pairs and neighbours.** 4-5 waits on 3 or 6 (8 tiles); 4-6 waits only on 5 (4 tiles). Two-sided waits beat gaps.
4. **One pair is plenty.** You need exactly one pair at the end; extra pairs are good pung candidates but slow you down.
5. **Claim to speed up, but it costs faan.** A pung or chow saves a whole draw, but loses "Concealed hand" (1 faan) and shows opponents
   what you're collecting.

## Intermediate
- **Count shanten and useful tiles** (the drills and the coach do this for you): of two discards that leave you equally far from
  ready, keep the one with more live useful tiles.
- **Watch the pond.** Tiles already discarded are dead for you. If three 7-bamboo are out, a 6-8 gap waiting on 7 is nearly hopeless.
- **Chow only from the left.** You can pung anyone's tile, but a run only from the player who discards right before you.
- **Kong** gives a free replacement draw, but tells the table what you hold.

## Expert
- **Defence.** When an opponent has two or more exposed sets or keeps discarding one suit, they may be ready. Throw tiles that are
  already in the pond ("safe" tiles) and avoid feeding the suit they're collecting. The hard bot weighs this ("danger" in the coach).
- **Shape for value.** A half or full flush (3 / 7 faan) multiplies the payout; the coach card shows speed, not value, so trade a
  little speed for a flush only when the hand is already leaning that way.
- **Discard wins are paid double by the discarder**, so late in the hand avoid throwing new, unseen tiles.

## How the bots play
- **easy** — loose: discards among the tiles that keep it on track but chooses blindly, sometimes slips back, claims almost everything.
- **medium** — shanten-greedy: always the discard that keeps it closest to ready; claims when it lowers shanten.
- **hard** — shanten + most live useful tiles + defence against opponents with several exposed sets; chows only when close to ready.

## Simplified / not implemented
- Always four seats; East round then South etc. with simple dealer rotation (no full 16-hand game end).
- Minimum faan to win is **0** (many HK tables require 3). No "robbing the kong", no bonus for winning on a kong replacement, no
  all-flowers bonus, and the dead wall isn't replenished (16 tiles).
- Losing hands are not revealed at the end of a hand.
