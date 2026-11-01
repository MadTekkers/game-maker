-- Hong Kong Mahjong runs on the same server-authoritative card tables.
alter table public.card_games drop constraint if exists card_games_game_check;
alter table public.card_games add constraint card_games_game_check check (game in ('blackjack','spades','hearts','holdem','mahjong'));
