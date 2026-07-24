# StudyBun 🐰🌸

Your cozy JEE study companion — real Supabase persistence + realtime sync, a multi-mascot system, and Gemini-powered AI Insights.

## 1. Install

```bash
npm install
```

## 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your project, paste the contents of `supabase/schema.sql`, and run it.
   This creates every table (profiles, study_sessions, chapter_progress, backlog, question_logs,
   mock_tests, revision_plans, tasks, achievements, ai_insights_history, etc.), turns on Row Level
   Security, and adds the live-updating tables to the Realtime publication.
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**.

## 3. Set up Gemini (for AI Insights)

1. Grab a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. AI Insights are **only** ever called when you press "Generate AI Insights" in the app —
   never on load, never on a timer, never in the background. See `src/services/gemini.js`.

## 4. Environment variables

```bash
cp .env.example .env
```

Fill in the three values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_GEMINI_API_KEY=your-gemini-key
```

Never commit `.env` — it's already in `.gitignore`.

## 5. Run it

```bash
npm run dev
```

Open the printed local URL. First launch takes you through onboarding (name, exam, daily goal,
mascot pick, theme pick), then straight into the dashboard.

## 6. Deploy

`npm run build` produces a static `dist/` folder deployable to Vercel, Netlify, Cloudflare Pages,
or any static host. Set the three `VITE_*` env vars in your host's dashboard the same way as `.env`.

## How data + realtime works right now

There's no login screen yet — each browser gets a random device ID (stored in `localStorage`,
see `src/lib/deviceId.js`) that scopes every Supabase row to that device. This means:

- ✅ Data really persists in Postgres, survives refreshes, and updates live via Supabase Realtime
  (open the app in two tabs and log a session in one — the other updates instantly).
- ✅ RLS is on, so no other unrelated user could scoop up your data through your API endpoint.
- ⚠️ It is **not** proper multi-device login — if you clear browser storage or switch browsers,
  you'll look like a new device. Swapping in real Supabase Auth later is a small change (replace
  `device_id` filters with `auth.uid()` and tighten the RLS policies in `schema.sql`) — happy to
  build that next when you're ready.

## What's built vs. what's next

**Built and wired to Supabase + realtime:** Dashboard, Study Tracker, Focus Timer, Syllabus
Manager (priority/difficulty/weightage/lecture-DPP-PYQ-notes tracking, favorites, deadlines),
Backlog Manager (pace-based forecasting, smart suggestions, subject breakdown, quick actions),
Question Practice, Mock Tests, Revision Planner, Daily Planner, Analytics, Achievements, Profile,
Settings, and AI Insights (Gemini 2.5 Flash, click-triggered only, history saved to
`ai_insights_history`). Six mascots (bunny, cat, fox, bear, hamster, penguin), each with 8
expressions mapped to real app events (celebrate on goal/streak/mock-improved, concerned on
backlog growth, reminder on overdue revision, sleepy on no-study-day, thinking during AI calls).
Eight theme packs.

**Not built yet, by design — tell me which to tackle next:**
- Real Supabase Auth (multi-device login/sign-up)
- Custom revision formula editor (you mentioned sending this later)
- Mock Review deep-dive (mistake tagging: silly/concept/calculation/time-management — the
  `mock_analysis` table already exists for this)
- PWA packaging (installable, offline shell, splash screen)
- Notification scheduling
- CSV/PDF/Excel export
- Theme-driven background illustrations/decorations (themes currently swap colors, not artwork)
- Global search across all modules
