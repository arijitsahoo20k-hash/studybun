-- Run this once in the Supabase SQL editor (safe to re-run).
-- Needs is_study_group_member() from migration_group_timer.sql.

-- Roster of the groups the CALLER belongs to, as (group_id, user_id) pairs.
-- Used by the Group Timer lobby to confirm that a "studying in this room"
-- presence tag really comes from a member of a room you are also in.
-- Mirrors the existing study_group_members RLS (members see their own rooms'
-- rosters; nobody else's), so it exposes nothing new. The lobby still works
-- if this function is missing -- it just skips the roster cross-check.
create or replace function gt_visible_group_members()
returns table(group_id uuid, user_id uuid)
language sql stable security definer set search_path = public as $$
  select m.group_id, m.user_id
  from study_group_members m
  where auth.uid() is not null
    and is_study_group_member(m.group_id);
$$;
revoke all on function gt_visible_group_members() from public;
grant execute on function gt_visible_group_members() to authenticated;

-- Quick check afterwards (as a signed-in user, via the app or an RPC call):
--   select * from gt_visible_group_members();
-- should list (group_id, user_id) for every room you are a member of.
