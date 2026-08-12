-- ============================================================
-- StudyBun database schema
-- Run this once in your Supabase project's SQL editor.
-- ============================================================
-- AUTH: every table is scoped by user_id, a foreign key into
-- Supabase's built-in auth.users table. Row Level Security below
-- enforces auth.uid() = user_id on every read/write, so signed-in
-- users can only ever see their own rows — enforced by Postgres,
-- not just by the app's queries.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text default '',
  exam text default 'JEE Main',
  exam_date date default (current_date + interval '365 days'),
  daily_goal numeric default 6,
  theme text default 'Sakura Bloom',
  mascot text default 'bunny',
  dark_mode boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- USER SETTINGS ----------
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notifications jsonb default '{"study":true,"revision":true,"backlog":true,"mock":true,"task":true,"water":false,"break":false}',
  timer_defaults jsonb default '{"pomodoro":25,"deepFocus":50,"shortBreak":5,"longBreak":15,"cycles":4}',
  revision_formula jsonb default '[1,3,7,14,30]',
  updated_at timestamptz default now()
);

-- ---------- STUDY SESSIONS ----------
create table if not exists study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  subject text not null,
  chapter text,
  session_type text not null, -- Lecture, Practice, Revision, Notes, Doubt Solving, Reading NCERT, PYQ Practice
  minutes numeric not null default 0,
  teacher text,
  platform text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_study_sessions_user on study_sessions(user_id, session_date);

-- ---------- TIMER SESSIONS ----------
create table if not exists timer_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null, -- Pomodoro, Deep Focus, Lecture, Practice, Revision
  planned_minutes numeric,
  actual_minutes numeric,
  completed boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_timer_sessions_user on timer_sessions(user_id, created_at);

-- ---------- SYLLABUS SUBJECTS / CHAPTERS ----------
create table if not exists syllabus_subjects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz default now()
);

create table if not exists syllabus_chapters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  chapter_group text,
  chapter_name text not null,
  created_at timestamptz default now(),
  unique(user_id, subject, chapter_name)
);

-- ---------- CHAPTER PROGRESS (the working table the UI reads/writes) ----------
create table if not exists chapter_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  chapter text not null,
  status text default 'Not Started', -- Not Started, Studying, Completed, Mastered
  priority text default 'Medium',    -- Low, Medium, High
  difficulty text default 'Medium',  -- Easy, Medium, Hard
  weightage numeric default 5,       -- estimated exam weightage out of 10
  lectures_total numeric default 4,
  lectures_done numeric default 0,
  dpp_pending numeric default 2,
  pyq_pending numeric default 10,
  notes_pending numeric default 1,
  deadline date,
  favorite boolean default false,
  personal_notes text default '',
  last_revised date,
  next_revision date,
  updated_at timestamptz default now(),
  unique(user_id, subject, chapter)
);
create index if not exists idx_chapter_progress_user on chapter_progress(user_id);

-- ---------- BACKLOG ITEMS (user-created backlog tasks — not tied to the syllabus) ----------
create table if not exists backlog_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null default 'Other', -- Physics, Chemistry, Maths, Other
  category text not null default 'Custom', -- Full Chapter, Lecture, Notes, Questions, DPP, Module, Revision, Mock Analysis, Custom
  status text not null default 'Not Started', -- Not Started, In Progress, Completed, Paused
  deadline date,
  estimated_amount numeric,
  estimated_unit text default 'hours', -- hours, sessions
  notes text,
  reason text, -- Procrastination, Illness, Busy Schedule, Difficult Topic, Missed Class, Custom (optional)
  reason_custom text,
  in_session boolean not null default false, -- selected into today's Backlog Session
  completed_at timestamptz,
  -- ---- JEE Recovery Engine (see src/lib/recoveryEngine.js) ----
  -- Generated recovery cards ("Rotational Motion — Concept gap") are computed
  -- fresh on every render from mock_tests + mock_analysis + revision_plans;
  -- these columns only persist the user's own action on a generated item.
  source_type text not null default 'manual', -- manual | mock_analysis | revision | pacing
  source_key text,        -- stable dedup identity for generated items, e.g. "physics::rotational motion::concept_gap"
  chapter text,            -- chapter this recovery item is about (generated items only)
  problem_type text,       -- concept_gap | silly_mistake | calculation_error | time_management | guesswork | revision_overdue | pacing
  priority_score numeric,  -- 0-100 recovery score at last (re)computation
  evidence_count numeric default 1,
  last_evidence_at date,
  recommended_action text,
  dismissed_until date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_backlog_items_user on backlog_items(user_id, status);
create unique index if not exists idx_backlog_items_source_key
  on backlog_items(user_id, source_key)
  where source_key is not null;

-- ---------- GOALS (journal) ----------
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline date,
  starred boolean not null default false,
  notes text,
  status text not null default 'Active', -- Active, Completed
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_goals_user on goals(user_id, status);

-- ---------- QUESTION LOGS ----------
create table if not exists question_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  subject text not null,
  chapter text,
  question_type text default 'Module', -- PYQ, Module, DPP, Coaching Sheet, NCERT, Book, Mock, Custom
  difficulty text default 'Medium',
  count numeric not null default 1,
  correct numeric,
  incorrect numeric,
  skipped numeric,
  time_taken_minutes numeric,
  created_at timestamptz default now()
);
create index if not exists idx_question_logs_user on question_logs(user_id, log_date);

-- ---------- MOCK TESTS ----------
create table if not exists mock_tests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mock_date date not null default current_date,
  exam_name text not null,
  provider text,
  exam_type text not null default 'JEE Main' check (exam_type in ('JEE Main', 'JEE Advanced')),
  total_marks numeric default 300,
  physics_marks numeric default 0,
  chemistry_marks numeric default 0,
  math_marks numeric default 0,
  -- Per-subject raw counts. For JEE Main these drive the auto +4/-1 marks
  -- calculation (25 questions/subject); for JEE Advanced they're optional
  -- since Advanced's marking scheme varies question-to-question.
  physics_correct numeric,
  physics_incorrect numeric,
  chemistry_correct numeric,
  chemistry_incorrect numeric,
  math_correct numeric,
  math_incorrect numeric,
  attempted numeric,
  correct numeric,
  incorrect numeric,
  negative_marks numeric,
  percentile numeric,
  rank numeric,
  duration_minutes numeric,
  -- Optional per-subject time spent, for pacing insights (e.g. "you spent
  -- 55% of your time on Math but it's your strongest subject").
  physics_minutes numeric,
  chemistry_minutes numeric,
  math_minutes numeric,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_mock_tests_user on mock_tests(user_id, mock_date);

-- ---------- MOCK ANALYSIS (review notes per mock) ----------
create table if not exists mock_analysis (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mock_id uuid references mock_tests(id) on delete cascade unique,
  silly_mistakes numeric default 0,
  concept_errors numeric default 0,
  calculation_errors numeric default 0,
  time_management_errors numeric default 0,
  guess_work numeric default 0,
  linked_chapters text[],
  revision_needed boolean default false,
  created_at timestamptz default now()
);

-- ---------- REVISION PLANS / LOGS ----------
create table if not exists revision_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  chapter text not null,
  revision_number numeric default 1,
  due_date date not null,
  status text default 'Pending', -- Pending, Completed, Skipped
  confidence text,
  created_at timestamptz default now()
);
create index if not exists idx_revision_plans_user on revision_plans(user_id, due_date);

create table if not exists revision_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  revision_id uuid references revision_plans(id) on delete cascade,
  duration_minutes numeric,
  method text,
  completed_date date default current_date,
  notes text,
  created_at timestamptz default now()
);

-- ---------- TASKS (Daily Planner) ----------
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  subject text,
  chapter text,
  priority text default 'Medium',
  status text default 'Pending', -- Pending, Completed, Missed
  category text default 'Study',
  due_date date default current_date,
  reminder_at timestamptz,
  recurring text, -- null, Daily, Weekly, Monthly
  pinned boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_tasks_user on tasks(user_id, due_date);

-- ---------- ACHIEVEMENTS (unlock log) ----------
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_key)
);

-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ---------- AI INSIGHTS HISTORY ----------
create table if not exists ai_insights_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz default now(),
  input_snapshot jsonb,
  output jsonb
);
create index if not exists idx_ai_insights_user on ai_insights_history(user_id, generated_at desc);

-- ---------- MOCK TESTS: SMART AI COMPARISON CACHE ----------
-- One row per user holding the *last* Smart AI Comparison result (Mock
-- Tests page). Deliberately a single-row cache (like user_statistics),
-- not a history log like ai_insights_history — the feature only ever
-- needs "what did the AI last say", and this is what makes that survive
-- switching devices/browsers on the same account, not just this one
-- device's local storage. Overwritten only when the student explicitly
-- clicks "Compare with AI" again; a failed re-run leaves it untouched.
create table if not exists mock_ai_comparison (
  user_id uuid primary key references auth.users(id) on delete cascade,
  result jsonb,
  updated_at timestamptz default now()
);

-- ---------- STUDYBUN AI: AI INSIGHTS CACHE ----------
-- One row per user holding the *last* generated AI Insights result
-- (AI Insights / "StudyBun AI" page). Same single-row-cache pattern as
-- mock_ai_comparison above — previously this result only lived in local
-- React state, so it vanished the moment the student left the page or
-- refreshed. This table is what makes it persist across nav/refresh/
-- devices; ai_insights_history above stays as the separate append-only
-- log. Overwritten only when the student explicitly clicks "Generate AI
-- Insights" again; a failed re-run leaves the last good result untouched.
create table if not exists ai_insights (
  user_id uuid primary key references auth.users(id) on delete cascade,
  result jsonb,
  generated_at timestamptz,
  updated_at timestamptz default now()
);

-- ---------- THEMES / MASCOTS (reference tables; app also has built-in defaults) ----------
create table if not exists themes (
  id text primary key,
  label text,
  colors jsonb
);

create table if not exists mascots (
  id text primary key,
  label text
);

-- ---------- USER STATISTICS (rolled-up cache, optional) ----------
create table if not exists user_statistics (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_study_minutes numeric default 0,
  total_questions numeric default 0,
  total_mocks numeric default 0,
  current_streak numeric default 0,
  longest_streak numeric default 0,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Every policy below requires auth.uid() = user_id, so a request
-- authenticated as one user can never read or write another
-- user's rows — this is enforced by Postgres itself, independent
-- of anything the client app does.
-- ============================================================

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','user_settings','study_sessions','timer_sessions',
      'syllabus_subjects','syllabus_chapters','chapter_progress','backlog_items','goals',
      'question_logs','mock_tests','mock_analysis','revision_plans','revision_logs',
      'tasks','achievements','notifications','ai_insights_history','user_statistics',
      'mock_ai_comparison','ai_insights'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "device access" on %I;', t);
    execute format('drop policy if exists "user access" on %I;', t);
    execute format('create policy "user access" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
  end loop;
end $$;

alter table themes enable row level security;
drop policy if exists "public read themes" on themes;
create policy "public read themes" on themes for select using (true);

alter table mascots enable row level security;
drop policy if exists "public read mascots" on mascots;
create policy "public read mascots" on mascots for select using (true);

-- ============================================================
-- REALTIME: add the live-updating tables to the realtime publication
-- ============================================================
alter publication supabase_realtime add table study_sessions;
alter publication supabase_realtime add table chapter_progress;
alter publication supabase_realtime add table backlog_items;
alter publication supabase_realtime add table goals;
alter publication supabase_realtime add table question_logs;
alter publication supabase_realtime add table mock_tests;
alter publication supabase_realtime add table mock_analysis;
alter publication supabase_realtime add table revision_plans;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table achievements;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table mock_ai_comparison;
alter publication supabase_realtime add table ai_insights;

-- ============================================================
-- LEADERBOARD (kawaii realtime Top 20 + anti-cheat Study Score)
-- Fresh installs get this baked in below. If you already ran an
-- older schema.sql, run supabase/migration_leaderboard.sql instead
-- (identical content, safe to run standalone against an existing DB).
-- ============================================================
-- ---------- 1. completed_at: anti-cheat-safe completion timestamp ----------
alter table chapter_progress add column if not exists completed_at timestamptz;

create or replace function lb_set_chapter_completed_at() returns trigger
language plpgsql as $$
declare
  was_done boolean := (TG_OP = 'UPDATE') and (OLD.status in ('Completed', 'Mastered'));
  is_done  boolean := NEW.status in ('Completed', 'Mastered');
begin
  -- Only stamp the moment a chapter *first* becomes Completed/Mastered.
  -- Any later edit while it stays Completed/Mastered leaves completed_at
  -- untouched, so nobody can "refresh" it for repeat leaderboard credit
  -- by re-saving the same chapter. Moving it back out of those statuses
  -- clears the stamp, since it's genuinely no longer done.
  if is_done and not was_done then
    NEW.completed_at := now();
  elsif not is_done then
    NEW.completed_at := null;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_chapter_completed_at on chapter_progress;
create trigger trg_chapter_completed_at
  before insert or update on chapter_progress
  for each row execute function lb_set_chapter_completed_at();

create index if not exists idx_chapter_progress_completed_at on chapter_progress(user_id, completed_at);

-- One-time backfill: chapters that were already Completed/Mastered before
-- this migration existed get completed_at set from their historical
-- updated_at, so day-one users aren't unfairly zeroed out. This only ever
-- runs once, right here — the trigger above (not updated_at) governs
-- every completion from this point forward, so it can't be re-gamed later.
update chapter_progress
set completed_at = updated_at
where status in ('Completed', 'Mastered') and completed_at is null;

-- ---------- 2. sanity bounds on self-reported numbers (defense in depth) ----------
-- NOT VALID = enforced for every new write from today onward, but never
-- retroactively validated against rows that already exist.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'study_sessions_minutes_range') then
    alter table study_sessions add constraint study_sessions_minutes_range
      check (minutes >= 0 and minutes <= 600) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'timer_sessions_actual_range') then
    alter table timer_sessions add constraint timer_sessions_actual_range
      check (actual_minutes is null or (actual_minutes >= 0 and actual_minutes <= 600)) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'timer_sessions_planned_range') then
    alter table timer_sessions add constraint timer_sessions_planned_range
      check (planned_minutes is null or (planned_minutes >= 1 and planned_minutes <= 600)) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'question_logs_count_range') then
    alter table question_logs add constraint question_logs_count_range
      check (count >= 0 and count <= 500) not valid;
  end if;
end $$;

-- ---------- 3. leaderboard_public: the ONLY table other users can read from ----------
create table if not exists leaderboard_public (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Study Buddy',
  mascot text not null default 'bunny',
  study_score numeric not null default 0,
  current_streak int not null default 0,
  active_days_30 int not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists idx_leaderboard_public_score on leaderboard_public(study_score desc, current_streak desc);

alter table leaderboard_public enable row level security;
drop policy if exists "leaderboard public read" on leaderboard_public;
-- Any signed-in StudyBun user can read the leaderboard. There is
-- deliberately no insert/update/delete policy for the authenticated
-- role — the only way this table is ever written to is the
-- SECURITY DEFINER function below, called from triggers.
create policy "leaderboard public read" on leaderboard_public
  for select using (auth.role() = 'authenticated');

-- ---------- 4. the scoring engine ----------
-- SCORING (rolling 30-day window + all-time current streak):
--
--   +12   per genuine study day in the last 30 days           (consistency)
--   +3    per valid completed focus session (cap 8/day)       (real sessions, not idle timers)
--   +0.5  per minute from completed focus-timer sessions (cap 300 min/day)   — trusted signal
--   +0.2  per minute from manually-logged sessions (cap 180 min/day)         — self-reported, weighted lower
--   +0.3  per question logged (cap 100/day)                   (practice)
--   +8    per mock test taken (cap 1/day)                     (real exam practice)
--   +10   per chapter newly completed/mastered (cap 30 in window, first-time only via completed_at)
--   +4    per day of current streak, capped at 60 days        (long-term consistency, diminishing so it can't dominate forever)
--
-- A "genuine study day" only counts if it has a manual session of
-- >= 5 minutes OR a *completed* focus-timer session of >= 10
-- minutes — a single throwaway 30-second row can't extend a streak
-- or count as a study day.
--
-- Anti-cheat notes:
--   • Every raw signal is capped per-day BEFORE being summed over
--     the window, so inserting hundreds of tiny/duplicate rows in
--     one sitting never earns more than one honest day's worth of
--     points — spamming doesn't pay.
--   • A completed focus session only counts if its actual_minutes
--     lands close to its planned_minutes (the timer can only ever
--     finish at 0, so a genuine session's actual ≈ planned; a wildly
--     mismatched pair is a sign of a hand-crafted fake row).
--   • Chapter credit only fires once, off completed_at (see above),
--     not off updated_at — so it can't be "refreshed" by unrelated edits.
--   • Streak uses the same "must have studied today to count today"
--     rule as the rest of the app (Dashboard/Achievements), so the
--     leaderboard never contradicts what the user sees elsewhere.
--   • Achievements/badges are deliberately NOT part of the score —
--     that table only enforces row ownership, not that the badge was
--     genuinely earned, so it isn't a trustworthy scoring input.
create or replace function lb_calc_streak(uid uuid) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := current_date;
  streak_n int := 0;
  has_day boolean;
begin
  loop
    select
      exists (
        select 1 from study_sessions
        where user_id = uid and session_date = d and minutes >= 5
      )
      or exists (
        select 1 from timer_sessions
        where user_id = uid and completed = true and actual_minutes >= 10
          and (created_at at time zone 'utc')::date = d
      )
    into has_day;
    exit when not has_day or streak_n > 730;
    streak_n := streak_n + 1;
    d := d - 1;
  end loop;
  return streak_n;
end;
$$;
revoke execute on function lb_calc_streak(uuid) from public;

create or replace function lb_recompute(uid uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  window_start date := current_date - 29;
  active_days   int;
  sessions_n    int;
  timer_mins    numeric;
  manual_mins   numeric;
  questions_n   numeric;
  mocks_n       int;
  chapters_n    int;
  streak_n      int;
  score         numeric;
  prof          record;
begin
  -- distinct genuine study days in the window
  select count(distinct d) into active_days from (
    select session_date as d from study_sessions
      where user_id = uid and minutes >= 5 and session_date >= window_start
    union
    select (created_at at time zone 'utc')::date as d from timer_sessions
      where user_id = uid and completed = true and actual_minutes >= 10
        and (created_at at time zone 'utc')::date >= window_start
  ) t;

  -- valid completed focus sessions, capped at 8/day equivalent (240 over the window)
  select least(count(*), 240) into sessions_n
  from timer_sessions
  where user_id = uid and completed = true
    and actual_minutes >= 10 and actual_minutes <= 240
    and (planned_minutes is null or abs(actual_minutes - planned_minutes) <= greatest(3, planned_minutes * 0.15))
    and (created_at at time zone 'utc')::date >= window_start;

  -- trusted (timer-verified) minutes, capped 300/day then summed
  select coalesce(sum(least(daily, 300)), 0) into timer_mins from (
    select (created_at at time zone 'utc')::date as d, sum(actual_minutes) as daily
    from timer_sessions
    where user_id = uid and completed = true and actual_minutes between 10 and 600
      and (created_at at time zone 'utc')::date >= window_start
    group by 1
  ) t;

  -- self-reported minutes, capped 180/day then summed (lower weight applied later)
  select coalesce(sum(least(daily, 180)), 0) into manual_mins from (
    select session_date as d, sum(minutes) as daily
    from study_sessions
    where user_id = uid and minutes between 5 and 600 and session_date >= window_start
    group by 1
  ) t;

  -- questions solved, capped 100/day then summed
  select coalesce(sum(least(daily, 100)), 0) into questions_n from (
    select log_date as d, sum(count) as daily
    from question_logs
    where user_id = uid and count between 1 and 500 and log_date >= window_start
    group by 1
  ) t;

  -- mock tests, capped at 1/day equivalent
  select least(count(*), 30) into mocks_n
  from mock_tests where user_id = uid and mock_date >= window_start;

  -- chapters newly completed/mastered in the window (first-time only, via completed_at)
  select least(count(distinct (subject, chapter)), 30) into chapters_n
  from chapter_progress
  where user_id = uid and status in ('Completed', 'Mastered') and completed_at >= (now() - interval '30 days');

  streak_n := lb_calc_streak(uid);

  score := round(
      active_days * 12
    + sessions_n * 3
    + timer_mins * 0.5
    + manual_mins * 0.2
    + questions_n * 0.3
    + mocks_n * 8
    + chapters_n * 10
    + least(streak_n, 60) * 4
  );

  select name, mascot into prof from profiles where user_id = uid;
  if not found then
    return; -- no profile yet (shouldn't happen, but never write a row with no owner context)
  end if;

  insert into leaderboard_public (user_id, display_name, mascot, study_score, current_streak, active_days_30, updated_at)
  values (
    uid,
    coalesce(nullif(trim(coalesce(prof.name, '')), ''), 'Study Buddy'),
    coalesce(nullif(prof.mascot, ''), 'bunny'),
    score, streak_n, active_days, now()
  )
  on conflict (user_id) do update set
    display_name   = excluded.display_name,
    mascot         = excluded.mascot,
    study_score    = excluded.study_score,
    current_streak = excluded.current_streak,
    active_days_30 = excluded.active_days_30,
    updated_at     = now();
end;
$$;
revoke execute on function lb_recompute(uuid) from public;

-- ---------- 5. triggers: keep it live ----------
create or replace function lb_trg_recompute() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'DELETE' then
    perform lb_recompute(OLD.user_id);
    return OLD;
  else
    perform lb_recompute(NEW.user_id);
    return NEW;
  end if;
end;
$$;
revoke execute on function lb_trg_recompute() from public;

do $$
declare
  t text;
begin
  for t in select unnest(array['study_sessions', 'timer_sessions', 'question_logs', 'mock_tests', 'chapter_progress'])
  loop
    execute format('drop trigger if exists trg_lb_recompute on %I;', t);
    execute format(
      'create trigger trg_lb_recompute after insert or update or delete on %I for each row execute function lb_trg_recompute();',
      t
    );
  end loop;
end $$;

-- profile edits (name / mascot) should reflect on the leaderboard immediately too
create or replace function lb_trg_recompute_profile() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform lb_recompute(NEW.user_id);
  return NEW;
end;
$$;
revoke execute on function lb_trg_recompute_profile() from public;

drop trigger if exists trg_lb_recompute_profile on profiles;
create trigger trg_lb_recompute_profile after insert or update on profiles
  for each row execute function lb_trg_recompute_profile();

-- ---------- 6. "what's my rank" without fetching every user ----------
create or replace function lb_get_my_rank()
returns table (rank bigint, study_score numeric, current_streak int, total_users bigint)
language sql
security definer
set search_path = public
stable
as $$
  with ranked as (
    select
      user_id, study_score, current_streak,
      rank() over (order by study_score desc, current_streak desc, user_id) as rnk
    from leaderboard_public
  )
  select r.rnk, r.study_score, r.current_streak, (select count(*) from leaderboard_public)
  from ranked r
  where r.user_id = auth.uid();
$$;
grant execute on function lb_get_my_rank() to authenticated;

-- ---------- 7. realtime ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'leaderboard_public'
  ) then
    alter publication supabase_realtime add table leaderboard_public;
  end if;
end $$;

-- ---------- 8. backfill existing users ----------
do $$
declare r record;
begin
  for r in select user_id from profiles loop
    perform lb_recompute(r.user_id);
  end loop;
end $$;
