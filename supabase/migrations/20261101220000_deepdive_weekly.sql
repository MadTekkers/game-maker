-- Deep Dive daily sets live in weekly_puzzles (game = 'deepdive', difficulty = '').
alter table public.weekly_puzzles drop constraint if exists weekly_puzzles_game_check;
alter table public.weekly_puzzles add constraint weekly_puzzles_game_check
  check (game = any (array['wordle', 'connections', 'strands', 'bee', 'mini', 'deepdive']));
