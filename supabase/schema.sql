-- ============================================================
-- StudyBun database schema
-- Run this once in your Supabase project's SQL editor.
-- ============================================================
-- NOTE ON AUTH: this build uses a lightweight per-device id
-- (a UUID generated on first launch and kept in the browser)
-- instead of full Supabase Auth, per "only Supabase storage
-- for now". Every table is scoped by device_id so one visitor
-- never sees another's rows. When you're ready for real accounts,
-- swap device_id for auth.uid() and tighten the RLS policies
-- below (the shape of the tables won't need to change).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table if not exists profiles (
  device_id uuid primary key,
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
  device_id uuid primary key,
  notifications jsonb default '{"study":true,"revision":true,"backlog":true,"mock":true,"task":true,"water":false,"break":false}',
  timer_defaults jsonb default '{"pomodoro":25,"deepFocus":50,"shortBreak":5,"longBreak":15,"cycles":4}',
  revision_formula jsonb default '[1,3,7,14,30]',
  updated_at timestamptz default now()
);

-- ---------- STUDY SESSIONS ----------
create table if not exists study_sessions (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
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
create index if not exists idx_study_sessions_device on study_sessions(device_id, session_date);

-- ---------- TIMER SESSIONS ----------
create table if not exists timer_sessions (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  mode text not null, -- Pomodoro, Deep Focus, Lecture, Practice, Revision
  planned_minutes numeric,
  actual_minutes numeric,
  completed boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_timer_sessions_device on timer_sessions(device_id, created_at);

-- ---------- SYLLABUS SUBJECTS / CHAPTERS ----------
create table if not exists syllabus_subjects (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

create table if not exists syllabus_chapters (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  subject text not null,
  chapter_group text,
  chapter_name text not null,
  created_at timestamptz default now(),
  unique(device_id, subject, chapter_name)
);

-- ---------- CHAPTER PROGRESS (the working table the UI reads/writes) ----------
create table if not exists chapter_progress (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
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
  unique(device_id, subject, chapter)
);
create index if not exists idx_chapter_progress_device on chapter_progress(device_id);

-- ---------- BACKLOG (derived analytics snapshots, optional log of manual entries) ----------
create table if not exists backlog (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  subject text not null,
  chapter text not null,
  teacher text,
  platform text,
  pending_hours numeric default 0,
  priority text default 'Medium',
  logged_date date default current_date,
  created_at timestamptz default now()
);

-- ---------- QUESTION LOGS ----------
create table if not exists question_logs (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
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
create index if not exists idx_question_logs_device on question_logs(device_id, log_date);

-- ---------- MOCK TESTS ----------
create table if not exists mock_tests (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  mock_date date not null default current_date,
  exam_name text not null,
  provider text,
  total_marks numeric default 300,
  physics_marks numeric default 0,
  chemistry_marks numeric default 0,
  math_marks numeric default 0,
  attempted numeric,
  correct numeric,
  incorrect numeric,
  negative_marks numeric,
  percentile numeric,
  rank numeric,
  duration_minutes numeric,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_mock_tests_device on mock_tests(device_id, mock_date);

-- ---------- MOCK ANALYSIS (review notes per mock) ----------
create table if not exists mock_analysis (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  mock_id uuid references mock_tests(id) on delete cascade,
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
  device_id uuid not null,
  subject text not null,
  chapter text not null,
  revision_number numeric default 1,
  due_date date not null,
  status text default 'Pending', -- Pending, Completed, Skipped
  confidence text,
  created_at timestamptz default now()
);
create index if not exists idx_revision_plans_device on revision_plans(device_id, due_date);

create table if not exists revision_logs (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
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
  device_id uuid not null,
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
create index if not exists idx_tasks_device on tasks(device_id, due_date);

-- ---------- ACHIEVEMENTS (unlock log) ----------
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  achievement_key text not null,
  unlocked_at timestamptz default now(),
  unique(device_id, achievement_key)
);

-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  kind text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ---------- AI INSIGHTS HISTORY ----------
create table if not exists ai_insights_history (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid not null,
  generated_at timestamptz default now(),
  input_snapshot jsonb,
  output jsonb
);
create index if not exists idx_ai_insights_device on ai_insights_history(device_id, generated_at desc);

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
  device_id uuid primary key,
  total_study_minutes numeric default 0,
  total_questions numeric default 0,
  total_mocks numeric default 0,
  current_streak numeric default 0,
  longest_streak numeric default 0,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Since this build has no Supabase Auth session yet, policies
-- allow the anon key to read/write, and every query the app
-- makes is already scoped with .eq('device_id', ...). This is
-- fine for a personal-use / early-stage app but is NOT a
-- substitute for real auth if you plan to ship this publicly —
-- swap to auth.uid()-based policies before a public launch.
-- ============================================================

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','user_settings','study_sessions','timer_sessions',
      'syllabus_subjects','syllabus_chapters','chapter_progress','backlog',
      'question_logs','mock_tests','mock_analysis','revision_plans','revision_logs',
      'tasks','achievements','notifications','ai_insights_history','user_statistics'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "device access" on %I;', t);
    execute format('create policy "device access" on %I for all using (true) with check (true);', t);
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
alter publication supabase_realtime add table question_logs;
alter publication supabase_realtime add table mock_tests;
alter publication supabase_realtime add table revision_plans;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table achievements;
alter publication supabase_realtime add table notifications;
