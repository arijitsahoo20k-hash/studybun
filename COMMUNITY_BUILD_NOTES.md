# StudyBun Community + Accountability — Build Notes

## Setup

1. Run `supabase/migration_community.sql` in your Supabase SQL editor (safe
   to re-run; everything is idempotent).
2. Deploy as usual — `vercel.json` now also schedules
   `api/cron/community-cleanup.js` every 30 minutes to physically delete
   expired chat messages. It reuses the same `CRON_SECRET` /
   `SUPABASE_SERVICE_ROLE_KEY` env vars as the existing notify cron.
3. Nothing else to configure — Community reuses your existing Supabase
   client, auth, profile, and presence systems.
4. To promote a user to moderator/admin, insert/update a row in
   `user_roles` using the Supabase dashboard or service role — this is
   intentional; there is no in-app UI or client-writable path to grant
   roles.

## What's included

- **Chat**: realtime, per-channel (General / JEE Main / JEE Advanced /
  Physics / Chemistry / Maths), 1000-char limit, server-side rate limiting
  and duplicate-message guard, mandatory 5-day expiry enforced by an
  actual `DELETE` in Postgres (cron), not a client-side filter.
- **Accountability**: daily check-in with JEE-oriented goal types, live
  "today's check-ins" list of other students, non-shaming status language,
  lightweight completion reporting, weekly summary.
- **Feed**: five post types (check-in/progress/question/tip/milestone),
  three simple reactions, one-level replies, pagination.
- **Safety**: reporting (six reason categories, reporter identity never
  exposed to anyone but the reporter/moderators), blocking (enforced at
  the RLS layer, not just client-side filtering), a `user_roles` table
  that's never writable from the client.
- **Real numbers only**: the "studying now" count reuses the app's
  existing Realtime Presence channel (`useStudyPresence`/`studyingIds`,
  already wired at the app root for Leaderboard); "checked in today" is a
  genuine count of today's `accountability_goals` rows. Nothing is
  fabricated.

## Scope decisions worth knowing about

- **Expiry applies to chat messages only.** The brief calls the 5-day
  rule "mandatory" specifically for messages/chat (§14, §16). Feed posts
  and their replies are treated like the rest of a student's study
  history (sessions, mocks, revisions) and are kept — they just aren't
  chat, so an ever-growing archive isn't the same UX problem the 5-day
  rule exists to solve. Easy to extend later if you'd rather they expire
  too (same trigger-default pattern as `community_messages.expires_at`).
- **Reactions attach to posts, not chat messages** — matches the brief's
  framing of reactions around check-ins/feed items, and keeps message
  deletion free of cascading reaction cleanup.
- **Not implemented** (flagged in the brief as optional/nice-to-have, and
  skipped in the interest of "do not create unnecessary complexity"):
  accountability pairing/buddy matching, full-text search across
  chat/feed, AI-generated daily prompts. All are additive — nothing here
  blocks adding them later.
- **Roles**: `user_roles` is a separate table (not a `profiles.role`
  column) specifically so a compromised or buggy client write can never
  self-grant moderator/admin — there is no RLS policy that allows
  authenticated inserts/updates on it at all.

## Files touched/added

```
supabase/migration_community.sql        (new)
api/cron/community-cleanup.js           (new)
vercel.json                             (cron + function entry added)
src/lib/communityProfiles.js            (new)
src/hooks/useCommunityChannels.js       (new)
src/hooks/useCommunityChat.js           (new)
src/hooks/useAccountability.js          (new)
src/hooks/useCommunityFeed.js           (new)
src/hooks/useCommunityModeration.js     (new)
src/pages/Community.jsx                 (new)
src/components/community/*.jsx          (new, 10 files)
src/styles/CommunityStyle.jsx           (new)
src/App.jsx                             (nav entry + route wired in)
```

`npm run build` passes clean; the Community page code-splits into its own
chunk (~43 kB) exactly like every other page.
