# StudyBun 🐰🌸

Your cozy JEE study companion — real Supabase persistence + realtime sync, a multi-mascot system, Gemini-powered
AI Insights, and a Groq-powered Smart AI Comparison between your JEE Main and JEE Advanced mocks.

## 1. Install

```bash
npm install
```

## 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your project, paste the contents of `supabase/schema.sql`, and run it.
   This creates every table (profiles, study_sessions, chapter_progress, backlog, question_logs,
   mock_tests, revision_plans, tasks, achievements, ai_insights_history, etc.), turns on Row Level
   Security scoped to `auth.uid()`, and adds the live-updating tables to the Realtime publication.
   (Already ran the old device-id version of this schema before? Use
   `supabase/migration_to_auth.sql` instead — see the comment at the top of that file first.)
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**.
4. Email/password auth is on by default. Optional: in **Authentication → Providers → Email**,
   turn off "Confirm email" if you don't want new sign-ups to have to click a confirmation link
   first (fine for personal/local use; leave it on if others will sign up).

## 3. Set up Gemini (for AI Insights + the Smart Study Buddy)

1. Grab a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. AI Insights are **only** ever called when you press "Generate AI Insights" in the app —
   never on load, never on a timer, never in the background. See `src/services/gemini.js`.
3. Not locked to one Gemini version: set `VITE_GEMINI_MODEL` in `.env` to pin a specific
   model (e.g. `gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-2.5-flash`), or leave
   it blank and the app will automatically try a list of current models — Gemini 3.x down
   to 2.5 — until one works for your key.
4. The **Smart Study Buddy** (the chat-style instructor mascot, see `src/services/buddyAI.js`)
   uses its own separate pool of keys, configured by you — not typed in by whoever's using the
   app. Set `VITE_GEMINI_BUDDY_API_KEYS` to a comma-separated list of keys to give it multiple
   keys to rotate across (useful if you expect enough chat traffic to hit rate limits on one
   key); if you leave it unset it falls back to reusing `VITE_GEMINI_API_KEY`. It tries Gemini
   3.0-family models first, then falls back through 2.0/2.5 — see `src/services/geminiModels.js`.
   Users can see key status (masked) and pick a model family preference under Settings, but
   never enter or edit keys themselves.

## 3b. Set up Groq (optional — for Smart AI Comparison on Mock Tests)

1. Grab a free API key at [console.groq.com/keys](https://console.groq.com/keys) — Groq's free
   tier is generous and works well for this.
2. On the **Mock Tests** page, once you've logged at least one JEE Main and one JEE Advanced mock,
   a "Compare with AI" button sends both score histories to Groq and returns a plain-language
   comparison (stronger paper, subject-by-subject gaps, trend, what to focus on). See
   `src/services/groqMockCompare.js`. Like AI Insights, this is **only** ever called when you
   press the button — never on load, never in the background.
3. Like the Smart Study Buddy, this uses its own key pool configured by you (not typed in by
   whoever's using the app). Set `VITE_GROQ_API_KEYS` to a comma-separated list to rotate across
   multiple free-tier keys if you expect enough usage to hit rate limits on one; if you leave it
   unset it falls back to a single `VITE_GROQ_API_KEY`. Model defaults to trying
   `llama-3.3-70b-versatile`, then `llama-3.1-8b-instant`, then `gemma2-9b-it` — set
   `VITE_GROQ_MODEL` to pin a specific one instead.
4. Mock Tests also now has an exam-type toggle: pick **JEE Main** and just enter each subject's
   correct/incorrect count out of 25 — marks (+4/-1) and the 300 total are calculated for you. Pick
   **JEE Advanced** and enter each subject's marks directly, since Advanced's marking scheme varies
   per question. A comparison chart plots both papers' scores (as % of each mock's total) on one
   graph once you've logged mocks from both. If you already ran `schema.sql` before this feature
   existed, run `supabase/migration_mock_exam_type.sql` once to add the new columns.

## 4. Environment variables

```bash
cp .env.example .env
```

Fill in the values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_GEMINI_MODEL=                        # optional — leave blank for auto model fallback
VITE_GEMINI_BUDDY_API_KEYS=               # optional — comma-separated list, e.g. key_one,key_two
VITE_GEMINI_BUDDY_MODEL_FAMILY=           # optional — "auto" | "gemini3" | "gemini2"
VITE_GROQ_API_KEYS=                       # optional — comma-separated list, e.g. key_one,key_two (Smart AI Comparison)
VITE_GROQ_MODEL=                          # optional — leave blank for auto model fallback
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
or any static host. Set the `VITE_*` env vars in your host's dashboard the same way as `.env`.

> **Heads up:** any `VITE_*` variable is bundled into the client-side JS at build time — that's
> how Vite env vars work. Treat this the same way you already treat `VITE_GEMINI_API_KEY`: fine
> for a personal/small-audience deployment, but not a substitute for a real server-side secret if
> you're shipping this to a large public audience and want to hide usage/cost from users entirely.

## Installable as an app (PWA)

StudyBun is a installable Progressive Web App:

- **Android / desktop Chrome, Edge:** a bottom banner ("Install StudyBun...") shows up once the
  browser decides the app is installable — tap **Install** to add it to the home screen / app
  list. You can also use the browser's own install icon in the address bar.
- **iOS Safari:** Safari doesn't expose an install prompt to sites, so add it manually — Share
  button → **Add to Home Screen**.
- **Updates:** when a new build is deployed, a small "New version available" banner appears with
  a **Refresh** button — nothing swaps under you mid-session.
- The app shell (HTML/CSS/JS/icons) is precached by a service worker so the app opens instantly
  and the UI loads even with a flaky connection. Actual study data still requires a connection to
  Supabase (and AI Insights still requires a connection to Gemini) — those calls are never cached.
- Icons/manifest live in `public/` (`pwa-192.png`, `pwa-512.png`, `maskable-*.png`,
  `apple-touch-icon.png`) and are wired up via `vite-plugin-pwa` in `vite.config.js`. Swap those
  PNGs if you want different artwork — no other config changes needed.
- `npm run dev` does **not** register a service worker (PWA features only build in `npm run
  build` / `npm run preview`), so local development behaves like a normal page reload each time.

## How auth + data + realtime works

StudyBun uses real Supabase Auth (email + password) — sign up, sign in, sign out, and
password-reset are all built (see `src/pages/Auth.jsx` and `src/lib/AuthContext.jsx`). Until
you're signed in, the app shows the auth screen instead of your study data.

- ✅ Every table is scoped by `user_id`, a foreign key into Supabase's `auth.users`, and Row
  Level Security policies require `auth.uid() = user_id` on every read/write — enforced by
  Postgres itself, not just by the queries the app happens to send. One account can never see
  another's rows, even if the client were compromised.
- ✅ Data persists in Postgres, survives refreshes, and updates live via Supabase Realtime (open
  the app in two tabs signed into the same account and log a session in one — the other updates
  instantly).
- ✅ Real multi-device login — sign into the same account from your phone and laptop and see the
  same data on both.
- ⚠️ Forgot-password emails and (if you leave "Confirm email" on) sign-up confirmation emails
  are sent by Supabase's default email service, which is rate-limited and fine for testing but
  not for real production traffic — swap in a custom SMTP provider under **Authentication →
  Settings** before a public launch.

## What's built vs. what's next

**Built and wired to Supabase + realtime:** Dashboard, Study Tracker, Focus Timer, Syllabus
Manager (priority/difficulty/weightage/lecture-DPP-PYQ-notes tracking, favorites, deadlines),
Backlog Manager (pace-based forecasting, smart suggestions, subject breakdown, quick actions),
Question Practice, Mock Tests, Revision Planner, Daily Planner, Analytics, Achievements, Profile,
Settings, and AI Insights (Gemini, model configurable, click-triggered only, history saved to
`ai_insights_history`). Six mascots (bunny, cat, fox, bear, hamster, penguin), each with 8
expressions mapped to real app events (celebrate on goal/streak/mock-improved, concerned on
backlog growth, reminder on overdue revision, sleepy on no-study-day, thinking during AI calls).
Eight theme packs. Installable as a PWA with offline app-shell caching and update prompts (see
"Installable as an app" above). Real Supabase Auth — email/password sign-up, sign-in, sign-out,
and password reset, with RLS enforced per-user via `auth.uid()` (see "How auth + data + realtime
works" above).

**Not built yet, by design — tell me which to tackle next:**
- Custom revision formula editor (you mentioned sending this later)
- Mock Review deep-dive (mistake tagging: silly/concept/calculation/time-management — the
  `mock_analysis` table already exists for this)
- Notification scheduling
- CSV/PDF/Excel export
- Theme-driven background illustrations/decorations (themes currently swap colors, not artwork)
- Global search across all modules
