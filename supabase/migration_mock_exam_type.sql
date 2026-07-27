-- ============================================================
-- Migration: JEE Main vs JEE Advanced on Mock Tests
-- ============================================================
-- Safe to run on an existing StudyBun database — every statement here
-- is idempotent (add column if not exists), so re-running it is harmless.
-- Skip this file entirely on a brand new install; supabase/schema.sql
-- already includes these columns.
--
-- What this adds to mock_tests:
--   1. exam_type — "JEE Main" or "JEE Advanced", so a mock knows which
--      paper it belongs to (defaults existing rows to "JEE Main").
--   2. physics_correct / physics_incorrect (+ chemistry_*, math_*) —
--      the raw per-subject question counts behind a JEE Main mock's
--      auto-calculated +4/-1 marks. Nullable — JEE Advanced mocks don't
--      use these since Advanced's marking scheme varies per question.
-- ============================================================

alter table mock_tests add column if not exists exam_type text not null default 'JEE Main';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mock_tests_exam_type_check'
  ) then
    alter table mock_tests
      add constraint mock_tests_exam_type_check check (exam_type in ('JEE Main', 'JEE Advanced'));
  end if;
end $$;

alter table mock_tests add column if not exists physics_correct numeric;
alter table mock_tests add column if not exists physics_incorrect numeric;
alter table mock_tests add column if not exists chemistry_correct numeric;
alter table mock_tests add column if not exists chemistry_incorrect numeric;
alter table mock_tests add column if not exists math_correct numeric;
alter table mock_tests add column if not exists math_incorrect numeric;
