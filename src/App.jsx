import React, { useMemo, useState, useEffect, useLayoutEffect, useRef, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Timer, Library, FolderClock, HelpCircle, ClipboardList,
  RotateCcw, CheckSquare, BarChart3, Sparkles, Trophy, Crown, User, Settings, Menu,
  NotebookPen,
} from "lucide-react";

import { THEMES, themeVars, timeWash } from "./data/themes";
import { ALL_CHAPTERS, DEFAULT_CHAPTER_PROGRESS, defaultChapterProgressFor } from "./data/syllabus";
import { useDeviceRow, useRealtimeTable, useChapterProgress, useMockAnalysis } from "./hooks/useRealtimeTable";
import { useFocusTimer } from "./hooks/useFocusTimer";
import { useStudyPresence } from "./hooks/useStudyPresence";
import { getActiveRadio } from "./lib/radio";
import { isSupabaseConfigured, supabase } from "./lib/supabaseClient";
import { useAuth } from "./lib/AuthContext";
import { buildExportPayload, downloadJSON, readFileAsJSON, importPayload, totalImported } from "./lib/dataPortability";
import { todayIST, toISTDateStr, tsToISTDateStr, daysFromNowIST, daysUntilIST, formatISTCalendarDate, istHour } from "./lib/dateIST";

import Mascot from "./components/Mascot";
import BuddyGuide from "./components/BuddyGuide";
import { reactionMood, mascotEnergy, mascotTheme, MASCOTS } from "./data/mascots";
import PWAPrompt from "./components/PWAPrompt";
import { Confetti, LoadingScreen, DecorLayer } from "./components/ui";
import Onboarding from "./pages/onboarding";
import Dashboard from "./pages/Dashboard";
import StudyTracker from "./pages/StudyTracker";
import FocusTimer from "./pages/FocusTimer";
import SyllabusPage from "./pages/Syllabus";
import BacklogPage from "./pages/Backlog";
import GoalsPage from "./pages/Goals";
import QuestionsPage from "./pages/Questions";
import MocksPage from "./pages/Mocks";
import RevisionPage from "./pages/Revision";
import PlannerPage from "./pages/Planner";
import AnalyticsPage from "./pages/Analytics";
import AchievementsPage from "./pages/Achievements";
import LeaderboardPage from "./pages/Leaderboard";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import AIInsightsPage from "./pages/AIInsights";
import GlobalStyle from "./styles/GlobalStyle";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "study", label: "Study Tracker", icon: BookOpen },
  { id: "timer", label: "Focus Timer", icon: Timer },
  { id: "syllabus", label: "Syllabus", icon: Library },
  { id: "backlog", label: "Backlog", icon: FolderClock },
  { id: "goals", label: "Goals", icon: NotebookPen },
  { id: "questions", label: "Question Practice", icon: HelpCircle },
  { id: "mocks", label: "Mock Tests", icon: ClipboardList },
  { id: "revision", label: "Revision Planner", icon: RotateCcw },
  { id: "planner", label: "Daily Planner", icon: CheckSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai", label: "AI Insights", icon: Sparkles },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "leaderboard", label: "Leaderboard", icon: Crown },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

// Mirrors the same check Mascot.jsx makes independently -- kept local here
// too rather than shared, since it's a one-line read of the media query and
// both call sites want it available at mount without an extra import.
function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// "Today" for the whole app is IST, not the device's local/UTC date — see
// src/lib/dateIST.js for why the naive version silently broke around midnight.
const todayStr = todayIST;

// Study streak needed before the AI-powered features unlock. Keeps Smart
// Buddy chat / AI Insights (both of which spend real Gemini quota) tied to
// actual, sustained use of the app rather than being available from minute one.
export const FEATURE_UNLOCK_STREAK = 6;

export default function App() {
  const { user } = useAuth();
  const { row: profile, loading: profileLoading, save: saveProfile, refetch: refetchProfile } = useDeviceRow("profiles", {
    name: "", exam: "JEE Main", exam_date: "2027-01-24", daily_goal: 6, theme: "Sakura Bloom", mascot: "bunny",
    streak_freeze_tokens: 1, streak_freeze_granted_days: 0,
  });

  const sessionsQ = useRealtimeTable("study_sessions", { orderBy: "session_date" });
  const timerSessionsQ = useRealtimeTable("timer_sessions", { orderBy: "created_at" });
  const chapters = useChapterProgress();
  const questionsQ = useRealtimeTable("question_logs", { orderBy: "log_date" });
  const mocksQ = useRealtimeTable("mock_tests", { orderBy: "mock_date" });
  const mockAnalysis = useMockAnalysis();
  const revisionsQ = useRealtimeTable("revision_plans", { orderBy: "due_date", ascending: true });
  const tasksQ = useRealtimeTable("tasks", { orderBy: "due_date" });
  const backlogItemsQ = useRealtimeTable("backlog_items", { orderBy: "created_at" });
  const goalsQ = useRealtimeTable("goals", { orderBy: "created_at", ascending: true });
  const achievementsQ = useRealtimeTable("achievements", { orderBy: "unlocked_at" });
  // Streak-freeze tokens: see supabase/migration_streak_freeze.sql. A frozen
  // date is treated exactly like a genuine study day (folded into
  // streakDays below), so a missed day doesn't reset the streak to 0.
  const streakFreezesQ = useRealtimeTable("streak_freezes", { orderBy: "frozen_date" });

  // Lives here (not inside FocusTimer) so switching pages never resets it.
  // Every completed session is logged to timer_sessions automatically —
  // that's what lets focus-timer time count toward study hours even if the
  // user never fills in the "what did you study" card afterward.
  const focusTimer = useFocusTimer({
    onComplete: ({ mode, plannedMinutes, actualMinutes }) => {
      timerSessionsQ.insert({ mode, planned_minutes: plannedMinutes, actual_minutes: actualMinutes, completed: true });
    },
  });
  // Derived here (not inside FocusTimer's page component) for the same
  // reason the timer itself lives here: so the actual playing <iframe>,
  // rendered below outside the `page === "timer"` switch, never unmounts
  // when the user navigates to another page or the settings panel closes.
  const activeRadio = getActiveRadio(focusTimer);

  // Lifted to the root (not inside the Leaderboard page) so presence stays
  // accurate — and other users can see it — even while running the timer
  // from a completely different page.
  const studyingIds = useStudyPresence(focusTimer.running);

  const [page, setPage] = useState("dashboard");
  const reducedMotion = useMemo(prefersReducedMotion, []);
  // <main> is the app's only scroll container, so without this a nav switch
  // could land you mid-scroll on the new page if the old one had you scrolled
  // down -- jarring on its own, and doubly so once page switches animate.
  const mainRef = useRef(null);
  useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [page]);

  // StudyBun's push notifications deep-link to a page id (dashboard,
  // planner, revision, backlog, analytics, goals) via the service worker
  // (src/sw.js). Two delivery paths land here:
  //  1. Cold start / new tab: the SW opens "<origin>/?page=revision".
  //  2. App already open: the SW postMessages the existing tab instead of
  //     force-navigating it (see notificationclick in sw.js).
  useEffect(() => {
    const validPages = new Set(NAV.map((n) => n.id));
    const applyPage = (id) => { if (validPages.has(id)) setPage(id); };

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("page");
    if (fromUrl) {
      applyPage(fromUrl);
      params.delete("page");
      const rest = params.toString();
      window.history.replaceState({}, "", rest ? `?${rest}` : window.location.pathname);
    }

    const onMessage = (event) => {
      if (event.data?.type === "studybun-notification-click") applyPage(event.data.page);
    };
    navigator.serviceWorker?.addEventListener?.("message", onMessage);
    return () => navigator.serviceWorker?.removeEventListener?.("message", onMessage);
  }, []);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, undo? }
  const [celebrateType, setCelebrateType] = useState(null); // null | "confetti" | "petals"
  const [hopping, setHopping] = useState(false);
  const toastTimer = useRef(null);

  // Sidebar nav highlight: a single pill sliding between nav items, moved
  // with a plain CSS transform transition via refs rather than a re-measuring
  // approach (e.g. framer-motion's layoutId), so the browser only does layout
  // math once per page change and the slide itself is a compositor-only
  // transform animation -- no per-frame stutter at high refresh rates.
  const navItemRefs = useRef({});
  const navPillRef = useRef(null);
  const navPillMounted = useRef(false);
  const mobileNavItemRefs = useRef({});
  const mobileNavPillRef = useRef(null);

  const positionNavPill = (pillEl, itemEl, instant) => {
    if (!pillEl || !itemEl) return;
    const targetW = itemEl.offsetWidth;
    const targetH = itemEl.offsetHeight;
    const targetX = itemEl.offsetLeft;
    const targetY = itemEl.offsetTop;

    if (instant) {
      pillEl.style.transition = "none";
      pillEl.style.width = `${targetW}px`;
      pillEl.style.height = `${targetH}px`;
      pillEl.style.transform = `translate(${targetX}px, ${targetY}px)`;
      // Force a reflow so the "transition: none" above actually applies
      // before we hand control back to the stylesheet's transition on the
      // next frame (otherwise the browser can coalesce both style writes
      // into one frame and animate from the old position anyway).
      void pillEl.offsetHeight;
      requestAnimationFrame(() => { pillEl.style.transition = ""; });
      pillEl.__sbW = targetW; pillEl.__sbH = targetH; pillEl.__sbX = targetX; pillEl.__sbY = targetY;
      return;
    }

    // Animate purely via `transform` (translate + scale) instead of
    // transitioning width/height directly. Transitioning width/height forces
    // a real layout+paint pass on the main thread every frame -- cheap
    // enough to hide at 60Hz but enough to drop frames at 120Hz+ once
    // anything else is competing for the main thread. `transform` alone can
    // run entirely on the compositor thread, so it stays smooth regardless
    // of refresh rate. This is the standard FLIP technique: snap the box to
    // its FINAL width/height instantly (cheap, done once, not animated),
    // start its transform at a scaled-down stand-in for the OLD box, then
    // let the transition animate the scale/translate back to identity --
    // same visual slide-and-resize, GPU-only.
    const prevW = pillEl.__sbW || targetW;
    const prevH = pillEl.__sbH || targetH;
    const prevX = pillEl.__sbX ?? targetX;
    const prevY = pillEl.__sbY ?? targetY;

    pillEl.style.transition = "none";
    pillEl.style.width = `${targetW}px`;
    pillEl.style.height = `${targetH}px`;
    const scaleX = targetW ? prevW / targetW : 1;
    const scaleY = targetH ? prevH / targetH : 1;
    pillEl.style.transform = `translate(${prevX}px, ${prevY}px) scale(${scaleX}, ${scaleY})`;
    void pillEl.offsetHeight; // force the "from" state to actually paint first
    pillEl.style.transition = "";
    requestAnimationFrame(() => {
      pillEl.style.transform = `translate(${targetX}px, ${targetY}px) scale(1, 1)`;
    });

    pillEl.__sbW = targetW; pillEl.__sbH = targetH; pillEl.__sbX = targetX; pillEl.__sbY = targetY;
  };

  useLayoutEffect(() => {
    positionNavPill(navPillRef.current, navItemRefs.current[page], reducedMotion || !navPillMounted.current);
    if (navItemRefs.current[page]) navPillMounted.current = true;
  }, [page, reducedMotion, profileLoading, profile]);

  useEffect(() => {
    const onResize = () => positionNavPill(navPillRef.current, navItemRefs.current[page], true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [page]);

  // GlobalStyle's @font-face (Baloo 2 / Nunito) loads async and swaps in
  // after first paint (display: swap). The pill above is measured from the
  // nav button's live DOM rect, so if that swap changes button width/height
  // even slightly, the pill is left sized and positioned for the old
  // fallback-font metrics until the next page change or resize repositions
  // it. Repositioning once fonts finish loading closes that gap. Reading
  // page/mobileNavOpen via refs (instead of closing over the values at
  // effect-creation time) keeps this correct even if the user has already
  // navigated by the time the fonts.ready promise resolves.
  const pageRef = useRef(page);
  pageRef.current = page;
  const mobileNavOpenRef = useRef(mobileNavOpen);
  mobileNavOpenRef.current = mobileNavOpen;
  useEffect(() => {
    if (!document.fonts?.ready) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      positionNavPill(navPillRef.current, navItemRefs.current[pageRef.current], true);
      if (mobileNavOpenRef.current) {
        positionNavPill(mobileNavPillRef.current, mobileNavItemRefs.current[pageRef.current], true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useLayoutEffect(() => {
    if (mobileNavOpen) positionNavPill(mobileNavPillRef.current, mobileNavItemRefs.current[page], true);
  }, [page, mobileNavOpen]);

  // Pass an `undo` callback for any action that can't otherwise be reversed —
  // the toast then stays up longer and shows an Undo button.
  const showToast = (msg, undo) => {
    setToast({ message: msg, undo: undo || null });
    setHopping(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), undo ? 5200 : 2600);
    setTimeout(() => setHopping(false), 650);
  };
  const runUndo = () => {
    if (toast?.undo) toast.undo();
    clearTimeout(toastTimer.current);
    setToast(null);
  };
  const fireCelebrate = (type = "confetti") => {
    setCelebrateType(type);
    setTimeout(() => setCelebrateType(null), type === "petals" ? 1900 : 1400);
  };

  const theme = THEMES[profile?.theme] || THEMES["Sakura Bloom"];
  const mascot = profile?.mascot || "bunny";
  const mTheme = mascotTheme(mascot);
  const cssVars = { ...themeVars(theme), "--time-wash": timeWash() };

  /* ---------- derived stats (shared by Dashboard / Analytics / AI Insights) ---------- */
  const sessions = sessionsQ.rows;
  const timerSessions = timerSessionsQ.rows;
  const questions = questionsQ.rows;
  const mocks = mocksQ.rows;
  const revisions = revisionsQ.rows;
  const tasks = tasksQ.rows;
  const backlogItems = backlogItemsQ.rows;
  const goals = goalsQ.rows;

  const getChStatus = (key) => {
    const [subject, chapter] = key.split("::");
    return chapters.map[key] || { ...defaultChapterProgressFor(chapter), subject, chapter };
  };

  // A study_sessions row logged from the "what did you study?" card after a
  // focus-timer session is tagged platform: "Focus Timer" so its minutes
  // aren't double counted — the real minutes for that session already live
  // in timer_sessions, logged automatically the moment the timer finishes.
  const manualSessions = sessions.filter((s) => s.platform !== "Focus Timer");

  const todaySessions = sessions.filter((s) => s.session_date === todayStr());
  const todayManualMinutes = manualSessions.filter((s) => s.session_date === todayStr()).reduce((a, s) => a + Number(s.minutes || 0), 0);
  const todayTimerMinutes = timerSessions.filter((ts) => tsToISTDateStr(ts.created_at) === todayStr()).reduce((a, ts) => a + Number(ts.actual_minutes || 0), 0);
  const todayMinutes = todayManualMinutes + todayTimerMinutes;
  const todayHours = +(todayMinutes / 60).toFixed(1);
  const todayLoggedHours = +(todayManualMinutes / 60).toFixed(1);
  const todayTimerHours = +(todayTimerMinutes / 60).toFixed(1);

  // A day also qualifies if the user planned tasks for it (Daily Planner)
  // and cleared every single one — finishing your whole plan for the day is
  // just as real a signal of "showing up" as logging minutes, and it means
  // someone who plans light but finishes everything isn't locked out of a
  // streak just because they didn't hit a timer. Requires at least one task
  // due that day (an empty day doesn't vacuously count), and every task due
  // that day — not just the one just toggled — has to be Completed.
  const taskDayCompletion = useMemo(() => {
    const byDay = new Map();
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const bucket = byDay.get(t.due_date) || { total: 0, completed: 0 };
      bucket.total += 1;
      if (t.status === "Completed") bucket.completed += 1;
      byDay.set(t.due_date, bucket);
    });
    const days = new Set();
    byDay.forEach((v, day) => { if (v.total > 0 && v.completed === v.total) days.add(day); });
    return days;
  }, [tasks]);

  // What counts as a "genuine study day" here must exactly match the
  // server-side rule in lb_calc_streak() (supabase/migration_leaderboard.sql,
  // supabase/migration_streak_tasks.sql, supabase/migration_streak_freeze.sql)
  // — otherwise Dashboard/Profile can show a streak the Leaderboard
  // disagrees with. The rule: a manual session of >= 5 minutes, OR a
  // *completed* focus-timer session of >= 10 minutes, OR at least one
  // logged question set, OR every planned task for the day completed, OR
  // a streak-freeze token spent on that date. Keep these in sync if any of
  // them ever changes.
  const streakDays = useMemo(() => {
    const days = new Set();
    sessions.forEach((s) => { if (Number(s.minutes || 0) >= 5) days.add(s.session_date); });
    timerSessions.forEach((ts) => {
      if (ts.completed && Number(ts.actual_minutes || 0) >= 10) days.add(tsToISTDateStr(ts.created_at));
    });
    questions.forEach((q) => { if (Number(q.count || 0) >= 1) days.add(q.log_date); });
    taskDayCompletion.forEach((d) => days.add(d));
    streakFreezesQ.rows.forEach((r) => days.add(r.frozen_date));
    return days;
  }, [sessions, timerSessions, questions, taskDayCompletion, streakFreezesQ.rows]);

  // A streak only breaks after a full missed day, not the instant "today"
  // hasn't been logged yet (it might still be 9am!). So: if today has no
  // qualifying day yet, start counting from yesterday instead of returning
  // 0 outright. That means the number only drops to 0 once *both* today and
  // yesterday have gone by with nothing logged — i.e. a real 2-day gap.
  const streakActiveToday = useMemo(() => streakDays.has(todayStr()), [streakDays]);

  const streak = useMemo(() => {
    const days = streakDays;
    let d = todayStr();
    if (!days.has(d)) d = toISTDateStr(new Date(d).getTime() - 86400000);
    let n = 0;
    while (days.has(d)) { n++; d = toISTDateStr(new Date(d).getTime() - 86400000); }
    return n;
  }, [streakDays]);

  const backlogChapters = ALL_CHAPTERS.filter((c) => !["Completed", "Mastered"].includes(getChStatus(c.key).status));
  const completedCount = ALL_CHAPTERS.length - backlogChapters.length;
  const overallPct = (completedCount / ALL_CHAPTERS.length) * 100;
  const masteredCount = ALL_CHAPTERS.filter((c) => getChStatus(c.key).status === "Mastered").length;

  // All-time history stats — these power the long-haul achievements. They're
  // deliberately based on *lifetime* records (longest streak ever hit, total
  // days logged) rather than the live `streak` above, so a badge earned once
  // stays earned even after a day gets missed and the current streak resets.
  const sortedStudyDays = useMemo(() => Array.from(streakDays).sort(), [streakDays]);
  const totalStudyDays = sortedStudyDays.length;
  const totalManualMinutes = manualSessions.reduce((a, s) => a + Number(s.minutes || 0), 0);
  const totalTimerMinutes = timerSessions.reduce((a, ts) => a + Number(ts.actual_minutes || 0), 0);
  const totalHours = +((totalManualMinutes + totalTimerMinutes) / 60).toFixed(1);
  const totalLoggedHours = +(totalManualMinutes / 60).toFixed(1);
  const totalTimerHours = +(totalTimerMinutes / 60).toFixed(1);
  const { longestStreak, hadComeback } = useMemo(() => {
    let longest = 0, run = 0, prev = null, comeback = false;
    sortedStudyDays.forEach((d) => {
      if (prev) {
        const gap = Math.round((new Date(d) - new Date(prev)) / 86400000);
        if (gap === 1) run += 1;
        else { if (gap >= 14) comeback = true; run = 1; }
      } else run = 1;
      longest = Math.max(longest, run);
      prev = d;
    });
    return { longestStreak: longest, hadComeback: comeback };
  }, [sortedStudyDays]);
  const revisionsCompletedCount = revisions.filter((r) => r.status === "Completed").length;
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const backlogClearedCount = backlogItems.filter((b) => b.status === "Completed").length;

  const weeklyData = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = toISTDateStr(Date.now() - i * 86400000);
      const loggedMins = manualSessions.filter((s) => s.session_date === d).reduce((a, s) => a + Number(s.minutes || 0), 0);
      const timerMins = timerSessions.filter((ts) => tsToISTDateStr(ts.created_at) === d).reduce((a, ts) => a + Number(ts.actual_minutes || 0), 0);
      arr.push({
        day: formatISTCalendarDate(d, { weekday: "short" }),
        hours: +(loggedMins / 60).toFixed(1),
        timerHours: +(timerMins / 60).toFixed(1),
      });
    }
    return arr;
  }, [manualSessions, timerSessions]);

  const subjectPie = useMemo(() => {
    const map = {};
    sessions.forEach((s) => { map[s.subject] = (map[s.subject] || 0) + Number(s.minutes || 0); });
    return Object.entries(map).map(([name, mins]) => ({ name, value: +(mins / 60).toFixed(2) }));
  }, [sessions]);

  const totalQuestions = questions.reduce((a, q) => a + Number(q.count || 0), 0);
  const todayQuestions = questions.filter((q) => q.log_date === todayStr()).reduce((a, q) => a + Number(q.count || 0), 0);

  const daysToExam = profile ? daysUntilIST(profile.exam_date) : 0;

  const dueRevisions = revisions.filter((r) => r.status === "Pending" && r.due_date <= todayStr());
  const upcomingRevisions = revisions.filter((r) => r.status === "Pending" && r.due_date > todayStr());
  const overdueRevisions = revisions.filter((r) => r.status === "Pending" && r.due_date < todayStr());

  const buddyMood = reactionMood({
    finishedGoal: todayHours >= (profile?.daily_goal || 6),
    streak: streak >= 3,
    revisionOverdue: overdueRevisions.length > 0,
    noStudyToday: todayHours === 0,
    hour: istHour(),
  });
  // Shared "how alive should the mascot look" value -- same numbers that
  // picked the mood also pick how energetically it plays that mood, so a
  // mascot at 5.9/6h feels visibly more energetic than one at 0.5/6h even
  // though both are technically "happy".
  const buddyEnergy = mascotEnergy({ mood: buddyMood, todayHours, dailyGoal: profile?.daily_goal || 6 });

  const lectureSessions = sessions.filter((s) => s.session_type === "Lecture").length;
  const finishedGoalToday = todayHours >= (profile?.daily_goal || 6);

  // Full achievement roster, grouped loosely by how hard it is to earn.
  // `current` / `target` drive the progress bar on the Achievements page;
  // `goal` is the plain-language "what to achieve" and `howTo` is the
  // explicit "how you unlock it" instruction shown on that page too.
  const achievementDefs = [
    // ---- Bronze: first steps ----
    { id: "first_hop", tier: "Bronze", label: `First ${mTheme.verbing}`, emoji: MASCOTS[mascot]?.emoji || "🐰",
      goal: "Log your very first study session.", howTo: "Add one session in Study Tracker.",
      current: sessions.length, target: 1, cond: sessions.length >= 1 },
    { id: "lecture_bunny", tier: "Bronze", label: `Lecture ${MASCOTS[mascot]?.label || "Bunny"}`, emoji: "📚",
      goal: "Log 5 Lecture-type sessions.", howTo: "Set Session Type to \"Lecture\" 5 times in Study Tracker.",
      current: lectureSessions, target: 5, cond: lectureSessions >= 5 },
    { id: "carrot_collector", tier: "Bronze", label: `${mTheme.collectible.name[0].toUpperCase()}${mTheme.collectible.name.slice(1)} Collector`, emoji: mTheme.collectible.emoji,
      goal: "Solve 100 questions in total.", howTo: "Log question counts in Question Practice until your lifetime total passes 100.",
      current: totalQuestions, target: 100, cond: totalQuestions >= 100 },
    { id: "mock_warrior", tier: "Bronze", label: "Mock Warrior", emoji: "🎯",
      goal: "Log your first mock test.", howTo: "Add a mock in Mock Tests after you take one.",
      current: mocks.length, target: 1, cond: mocks.length >= 1 },
    { id: "sakura_scholar", tier: "Bronze", label: "Sakura Scholar", emoji: "🌸",
      goal: "Complete 10 chapters.", howTo: "Mark 10 chapters Completed or Mastered in Syllabus.",
      current: completedCount, target: 10, cond: completedCount >= 10 },
    { id: "productivity_wizard", tier: "Bronze", label: "Productivity Wizard", emoji: "✨",
      goal: "Hit your daily study goal on any single day.", howTo: `Log ${profile?.daily_goal || 6}+ hours in one day (check Settings for your goal).`,
      current: finishedGoalToday ? 1 : 0, target: 1, cond: finishedGoalToday },
    { id: "task_tackler", tier: "Bronze", label: "Task Tackler", emoji: "✅",
      goal: "Complete 10 tasks from your Daily Planner.", howTo: "Check off tasks in Daily Planner until 10 are marked Completed.",
      current: completedTasksCount, target: 10, cond: completedTasksCount >= 10 },
    { id: "backlog_breaker", tier: "Bronze", label: "Backlog Breaker", emoji: "🧹",
      goal: "Clear 5 items from your backlog.", howTo: "Mark 5 Backlog entries as Completed.",
      current: backlogClearedCount, target: 5, cond: backlogClearedCount >= 5 },

    // ---- Silver: a couple of real weeks ----
    { id: "consistency", tier: "Silver", label: "Consistency Champion", emoji: "🔥",
      goal: "Reach a 3-day study streak.", howTo: "Log at least one session on 3 days in a row.",
      current: longestStreak, target: 3, cond: longestStreak >= 3 },
    { id: "week_warrior", tier: "Silver", label: "Week Warrior", emoji: "🗓️",
      goal: "Reach a 7-day study streak.", howTo: "Study every day for a full week without a gap.",
      current: longestStreak, target: 7, cond: longestStreak >= 7 },
    { id: "question_machine", tier: "Silver", label: "Question Machine", emoji: "💯",
      goal: "Solve 500 questions in total.", howTo: "Keep logging Question Practice sessions.",
      current: totalQuestions, target: 500, cond: totalQuestions >= 500 },
    { id: "revision_hero", tier: "Silver", label: "Revision Hero", emoji: "📖",
      goal: "Complete 10 revisions.", howTo: "Mark 10 entries Completed in Revision Planner.",
      current: revisionsCompletedCount, target: 10, cond: revisionsCompletedCount >= 10 },
    { id: "chapter_crusher", tier: "Silver", label: "Chapter Crusher", emoji: "⚔️",
      goal: "Complete 25 chapters.", howTo: "Push 25 chapters to Completed or Mastered in Syllabus.",
      current: completedCount, target: 25, cond: completedCount >= 25 },
    { id: "mock_marathoner", tier: "Silver", label: "Mock Marathoner", emoji: "🏃",
      goal: "Log 5 mock tests.", howTo: "Add 5 mocks over time in Mock Tests.",
      current: mocks.length, target: 5, cond: mocks.length >= 5 },
    { id: "century_club", tier: "Silver", label: "Century Club", emoji: "⏳",
      goal: "Rack up 100 total study hours.", howTo: "Keep logging sessions — hours add up across all time, not just today.",
      current: totalHours, target: 100, cond: totalHours >= 100 },

    // ---- Gold: weeks of real discipline ----
    { id: "monthly_master", tier: "Gold", label: "Monthly Master", emoji: "🌕",
      goal: "Reach a 30-day study streak.", howTo: "Study every single day for a full month, no exceptions.",
      current: longestStreak, target: 30, cond: longestStreak >= 30 },
    { id: "half_century", tier: "Gold", label: "Half Century", emoji: "🏏",
      goal: "Complete 50 chapters.", howTo: "Keep clearing Syllabus chapters to Completed or Mastered.",
      current: completedCount, target: 50, cond: completedCount >= 50 },
    { id: "thousand_carrots", tier: "Gold", label: `Thousand ${mTheme.collectible.plural}`, emoji: mTheme.collectible.emoji,
      goal: "Solve 1,000 questions in total.", howTo: "Consistent daily Question Practice logging.",
      current: totalQuestions, target: 1000, cond: totalQuestions >= 1000 },
    { id: "mock_titan", tier: "Gold", label: "Mock Titan", emoji: "🛡️",
      goal: "Log 20 mock tests.", howTo: "Sit and log 20 mocks over your prep.",
      current: mocks.length, target: 20, cond: mocks.length >= 20 },
    { id: "syllabus_slayer", tier: "Gold", label: "Syllabus Slayer", emoji: "📘",
      goal: "Finish 100% of the syllabus.", howTo: "Every chapter marked Completed or Mastered in Syllabus.",
      current: Math.round(overallPct), target: 100, cond: overallPct >= 100 },
    { id: "three_hundred_club", tier: "Gold", label: "300 Hour Club", emoji: "⌛",
      goal: "Rack up 300 total study hours.", howTo: "Keep logging sessions across months of prep.",
      current: totalHours, target: 300, cond: totalHours >= 300 },

    // ---- Platinum: months of grind ----
    { id: "quarter_champion", tier: "Platinum", label: "Quarter Champion", emoji: "🏆",
      goal: "Reach a 90-day (3-month) study streak.", howTo: "Study daily, without a single missed day, for 3 months straight.",
      current: longestStreak, target: 90, cond: longestStreak >= 90 },
    { id: "question_overlord", tier: "Platinum", label: "Question Overlord", emoji: "🔱",
      goal: "Solve 2,500 questions in total.", howTo: "Long-term Question Practice grind.",
      current: totalQuestions, target: 2500, cond: totalQuestions >= 2500 },
    { id: "mastermind", tier: "Platinum", label: "Mastermind", emoji: "🧠",
      goal: "Get 30 chapters to Mastered status.", howTo: "In Syllabus, take 30 chapters all the way to \"Mastered\" (not just Completed).",
      current: masteredCount, target: 30, cond: masteredCount >= 30 },
    { id: "five_hundred_vault", tier: "Platinum", label: "500 Hour Vault", emoji: "🗝️",
      goal: "Rack up 500 total study hours.", howTo: "Keep logging sessions — this is roughly 3 hrs/day for 6 months.",
      current: totalHours, target: 500, cond: totalHours >= 500 },

    // ---- Legendary: the ones that actually take 6 months of daily use ----
    { id: "six_month_sage", tier: "Legendary", label: "Six-Month Sage", emoji: "🐉",
      goal: "Study every single day for 6 months straight.", howTo: "Log at least one session on 180 consecutive days — miss one day and the streak restarts.",
      current: longestStreak, target: 180, cond: longestStreak >= 180 },
    { id: "half_year_hustle", tier: "Legendary", label: "Half-Year Hustle", emoji: "🌾",
      goal: "Log study sessions on 180 different days.", howTo: "These don't need to be back-to-back — rack up 180 total distinct study days over your prep.",
      current: totalStudyDays, target: 180, cond: totalStudyDays >= 180 },
    { id: "year_of_grit", tier: "Legendary", label: "Year of Grit", emoji: "💎",
      goal: "Reach an unbroken 365-day study streak.", howTo: "A full year of daily study, zero gaps. The hardest badge in StudyBun.",
      current: longestStreak, target: 365, cond: longestStreak >= 365 },

    // ---- Special: earned by a specific moment, not a running total ----
    { id: "comeback_kid", tier: "Special", label: "Comeback Kid", emoji: "🌱",
      goal: "Fall off for 14+ days, then come back and rebuild a streak.", howTo: "Life happens — this unlocks the first time you resume studying after a 2+ week gap.",
      current: hadComeback ? 1 : 0, target: 1, cond: hadComeback },
    { id: "perfectionist", tier: "Special", label: "Perfectionist", emoji: "💮",
      goal: "Hold a 30-day streak with zero overdue revisions.", howTo: "Reach a 30-day streak while keeping your Revision Planner completely caught up.",
      current: (longestStreak >= 30 && overdueRevisions.length === 0) ? 1 : 0, target: 1,
      cond: longestStreak >= 30 && overdueRevisions.length === 0 },
  ];
  const unlockedAchievements = achievementDefs.filter((a) => a.cond);

  // All the queries that feed achievementDefs' conditions (streaks, totals,
  // overdue counts, etc.) start empty and load in async on every reload.
  // Reading unlockedAchievements before they've all settled makes it look
  // like achievements just got unlocked, when really the data just caught
  // up — that's what was causing the celebration to fire on every reload.
  const dataReady = !sessionsQ.loading && !timerSessionsQ.loading && !questionsQ.loading &&
    !mocksQ.loading && !revisionsQ.loading && !tasksQ.loading && !backlogItemsQ.loading && !achievementsQ.loading &&
    !streakFreezesQ.loading;

  // Persist newly unlocked achievements once data has actually settled —
  // inserting against a still-loading (empty) achievementsQ.rows would just
  // try to re-insert everything the user already has, every reload.
  useEffect(() => {
    if (!dataReady) return;
    unlockedAchievements.forEach((a) => {
      if (!achievementsQ.rows.some((r) => r.achievement_key === a.id)) {
        achievementsQ.insert({ achievement_key: a.id });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, unlockedAchievements.length]);

  // null (not 0) means "no real baseline yet" — the first time dataReady
  // flips true, whatever count we see becomes the baseline silently; it's
  // never treated as a new unlock, even on a fresh page load where the
  // count is already >0 from past sessions.
  const prevUnlockedCount = useRef(null);
  useEffect(() => {
    if (!dataReady) return;
    if (prevUnlockedCount.current === null) {
      prevUnlockedCount.current = unlockedAchievements.length;
      return;
    }
    if (unlockedAchievements.length > prevUnlockedCount.current) {
      fireCelebrate("petals");
      showToast("Achievement unlocked! 🏆");
    }
    prevUnlockedCount.current = unlockedAchievements.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, unlockedAchievements.length]);

  // Streak-freeze tokens (supabase/migration_streak_freeze.sql). Two jobs:
  //
  // 1. Earn: every time lifetime study days changes, ask the server to
  //    check whether a new 7-day chunk has been crossed and hand out a
  //    token if so (capped at 2 held). Cheap and idempotent — no-ops most
  //    of the time.
  useEffect(() => {
    if (!dataReady || !user) return;
    supabase.rpc("sb_recompute_streak_freeze_grants").then(({ error }) => {
      if (!error) refetchProfile();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, user?.id, totalStudyDays]);

  // 2. Spend: the streak only actually breaks once *two* consecutive days
  //    (today + yesterday) have nothing logged — see streakDays/streak
  //    above. So the moment to step in is when yesterday is the lone gap:
  //    the day before it still qualifies, meaning a real streak is at risk
  //    of dying tomorrow. Auto-spend a token now to cover yesterday, before
  //    that happens, rather than asking the person to notice and act.
  //    appliedFreezeDates just prevents firing the RPC repeatedly for the
  //    same date within one session; the unique constraint in the DB is
  //    what actually stops a date from ever being frozen (and charged)
  //    twice, even across reloads or tabs.
  const appliedFreezeDates = useRef(new Set());
  useEffect(() => {
    if (!dataReady || !user || !profile) return;
    const tokens = profile.streak_freeze_tokens || 0;
    if (tokens <= 0) return;
    const y = toISTDateStr(Date.now() - 86400000);
    const dayBefore = toISTDateStr(Date.now() - 2 * 86400000);
    if (streakDays.has(y) || !streakDays.has(dayBefore)) return;
    if (appliedFreezeDates.current.has(y)) return;
    appliedFreezeDates.current.add(y);
    supabase.rpc("sb_apply_streak_freeze", { p_frozen_date: y }).then(({ data, error }) => {
      if (error || !data) { appliedFreezeDates.current.delete(y); return; }
      refetchProfile();
      showToast("❄️ Streak freeze used — yesterday's gap is covered, your streak lives on.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, user?.id, profile?.streak_freeze_tokens, streakDays]);

  /* ---------- actions ---------- */
  const addSession = async (payload) => {
    const row = await sessionsQ.insert({ session_date: todayStr(), ...payload });
    let chapterBumped = false;
    if (payload.subject && payload.chapter) {
      const cur = getChStatus(`${payload.subject}::${payload.chapter}`);
      if (cur.status === "Not Started") {
        await chapters.upsert(payload.subject, payload.chapter, { status: "Studying" });
        chapterBumped = true;
      }
    }
    showToast("Session logged — nice work! ✨", () => {
      if (row) sessionsQ.remove(row.id);
      if (chapterBumped) chapters.upsert(payload.subject, payload.chapter, { status: "Not Started" });
    });
  };

  const setChapterField = (subject, chapter, patch) => chapters.upsert(subject, chapter, patch);

  const completeChapter = async (c) => {
    const prior = getChStatus(c.key);
    const priorSnapshot = { status: prior.status, last_revised: prior.last_revised, next_revision: prior.next_revision };
    await chapters.upsert(c.subject, c.name, { status: "Completed", last_revised: null, next_revision: null });
    const due = daysFromNowIST(3);
    const newRevision = await revisionsQ.insert({ subject: c.subject, chapter: c.name, due_date: due, revision_number: 1, status: "Pending" });
    fireCelebrate();
    showToast(`${c.name} completed! First revision scheduled 🌸`, () => {
      chapters.upsert(c.subject, c.name, priorSnapshot);
      if (newRevision) revisionsQ.remove(newRevision.id);
    });
  };

  const addQuestions = async (payload) => {
    const row = await questionsQ.insert({ log_date: todayStr(), ...payload });
    showToast(`+${payload.count} questions logged 🥕`, row && (() => questionsQ.remove(row.id)));
  };
  const addMock = async (m) => {
    const row = await mocksQ.insert({ mock_date: todayStr(), ...m });
    fireCelebrate();
    showToast("Mock added — great effort showing up for it.", row && (() => mocksQ.remove(row.id)));
  };
  const updateMock = async (id, patch) => {
    const prior = mocks.find((m) => m.id === id);
    if (!prior) return;
    await mocksQ.update(id, patch);
    const { id: _oldId, user_id: _userId, created_at: _createdAt, ...rest } = prior;
    showToast("Mock updated ✏️", () => mocksQ.update(id, rest));
  };
  const deleteMock = async (id) => {
    const row = mocks.find((m) => m.id === id);
    if (!row) return;
    await mocksQ.remove(id);
    const { id: _oldId, user_id: _userId, created_at: _createdAt, ...rest } = row;
    showToast("Mock deleted", () => mocksQ.insert(rest));
  };

  // Mistake-tagging on mock review — this is what turns "how many did I get
  // wrong" into "why did I get them wrong", which is what actually drives
  // Backlog/AI Insights priority instead of just session counts.
  const saveMockAnalysis = async (mockId, patch) => {
    const row = await mockAnalysis.upsert(mockId, patch);
    if (row) showToast("Mistake breakdown saved 🔍");
    return row;
  };
  const completeRevision = async (id) => {
    const priorStatus = revisions.find((r) => r.id === id)?.status || "Pending";
    await revisionsQ.update(id, { status: "Completed" });
    fireCelebrate("petals");
    showToast("Revision complete — that chapter just got stickier 🌷", () => revisionsQ.update(id, { status: priorStatus }));
  };
  const addRevision = async (payload) => {
    const row = await revisionsQ.insert({ status: "Pending", revision_number: 1, ...payload });
    showToast("Revision planned 🗓️", row && (() => revisionsQ.remove(row.id)));
  };
  const deleteRevision = async (id) => {
    const row = revisions.find((r) => r.id === id);
    if (!row) return;
    await revisionsQ.remove(id);
    const { id: _oldId, user_id: _userId, created_at: _createdAt, ...rest } = row;
    showToast("Revision entry deleted", () => revisionsQ.insert(rest));
  };
  const addTask = async (t) => {
    const row = await tasksQ.insert({ due_date: todayStr(), status: "Pending", ...t });
    showToast("Task added 📝", row && (() => tasksQ.remove(row.id)));
  };
  const toggleTask = async (t) => {
    const nextStatus = t.status === "Pending" ? "Completed" : "Pending";

    // Finishing the last pending task of the day can, on its own, complete
    // today's streak day (see taskDayCompletion in the derived-stats block
    // above) even with zero minutes logged. That's worth a bigger reaction
    // than a routine checkbox — but only the first time it happens today,
    // so ticking off tasks after the streak is already locked in doesn't
    // spam confetti on every click.
    const todaysTasks = tasks.filter((x) => x.due_date === todayStr());
    const completesTodaysPlan = nextStatus === "Completed" && todaysTasks.length > 0 &&
      todaysTasks.every((x) => x.id === t.id || x.status === "Completed");

    await tasksQ.update(t.id, { status: nextStatus });

    if (completesTodaysPlan && !streakActiveToday) {
      fireCelebrate();
      showToast("Whole day's plan cleared — streak day locked in! 🔥", () => tasksQ.update(t.id, { status: t.status }));
    } else {
      showToast(nextStatus === "Completed" ? "Task done ✅" : "Task reopened", () => tasksQ.update(t.id, { status: t.status }));
    }
  };
  const updateTask = async (id, patch) => {
    const row = tasks.find((t) => t.id === id);
    if (!row) return;
    await tasksQ.update(id, patch);
    showToast("Task updated ✏️", () => tasksQ.update(id, { title: row.title, subject: row.subject, priority: row.priority, category: row.category }));
  };
  const deleteTask = async (id) => {
    const row = tasks.find((t) => t.id === id);
    if (!row) return;
    await tasksQ.remove(id);
    const { id: _oldId, user_id: _userId, created_at: _createdAt, ...rest } = row;
    showToast("Task deleted", () => tasksQ.insert(rest));
  };

  const addBacklogItem = async (item) => {
    const row = await backlogItemsQ.insert({ status: "Not Started", in_session: false, ...item });
    showToast("Added to backlog 📚", row && (() => backlogItemsQ.remove(row.id)));
  };
  const updateBacklogItem = async (id, patch) => {
    await backlogItemsQ.update(id, { ...patch, updated_at: new Date().toISOString() });
    showToast("Backlog item updated");
  };
  const setBacklogStatus = async (item, status) => {
    const patch = { status, updated_at: new Date().toISOString() };
    if (status === "Completed") { patch.completed_at = new Date().toISOString(); patch.in_session = false; }
    if (item.status === "Completed" && status !== "Completed") patch.completed_at = null;
    await backlogItemsQ.update(item.id, patch);
    if (status === "Completed") fireCelebrate();
    showToast(
      status === "Completed" ? `${item.title} cleared! 🌸` : `Marked ${status.toLowerCase()}`,
      () => backlogItemsQ.update(item.id, { status: item.status, completed_at: item.completed_at || null })
    );
  };
  const toggleSessionItem = async (item) => {
    await backlogItemsQ.update(item.id, { in_session: !item.in_session });
  };
  const deleteBacklogItem = async (id) => {
    const row = backlogItems.find((b) => b.id === id);
    if (!row) return;
    await backlogItemsQ.remove(id);
    const { id: _oldId, user_id: _userId, created_at: _createdAt, ...rest } = row;
    showToast("Backlog item deleted", () => backlogItemsQ.insert(rest));
  };

  const addGoal = async (item) => {
    const row = await goalsQ.insert({ status: "Active", starred: false, ...item });
    showToast("New page written 📝", row && (() => goalsQ.remove(row.id)));
  };
  const updateGoal = async (id, patch) => {
    await goalsQ.update(id, { ...patch, updated_at: new Date().toISOString() });
  };
  const completeGoal = async (goal) => {
    const wasCompleted = goal.status === "Completed";
    const patch = wasCompleted
      ? { status: "Active", completed_at: null }
      : { status: "Completed", completed_at: new Date().toISOString() };
    await goalsQ.update(goal.id, { ...patch, updated_at: new Date().toISOString() });
    if (!wasCompleted) fireCelebrate();
    showToast(
      wasCompleted ? "Goal reopened" : `${goal.title} — done! ✂️`,
      () => goalsQ.update(goal.id, { status: goal.status, completed_at: goal.completed_at || null })
    );
  };
  const deleteGoal = async (id) => {
    const row = goals.find((g) => g.id === id);
    if (!row) return;
    await goalsQ.remove(id);
    const { id: _oldId, user_id: _userId, created_at: _createdAt, ...rest } = row;
    showToast("Page torn out", () => goalsQ.insert(rest));
  };

  /* ---------- lifetime data backup (Settings → Import/Export) ---------- */
  const exportBackup = () => {
    const payload = buildExportPayload(
      {
        study_sessions: sessions,
        timer_sessions: timerSessions,
        chapter_progress: chapters.rows,
        question_logs: questions,
        mock_tests: mocks,
        revision_plans: revisions,
        tasks,
        backlog_items: backlogItems,
        goals,
        achievements: achievementsQ.rows,
      },
      profile
    );
    downloadJSON(payload, `studybun-backup-${todayStr()}.json`);
    showToast("Backup downloaded 💾");
  };

  const importBackup = async (file, { applyProfile = true } = {}) => {
    if (!user) { showToast("Sign in first, then import your backup"); return { ok: false }; }
    try {
      const payload = await readFileAsJSON(file);
      const summary = await importPayload(supabase, user.id, payload, { applyProfile, saveProfile });
      // Bulk writes above go straight through the Supabase client, bypassing
      // each hook's own insert() (and thus its optimistic local update) — so
      // pull fresh rows for every table that might have changed.
      sessionsQ.refetch(); timerSessionsQ.refetch(); questionsQ.refetch(); mocksQ.refetch();
      revisionsQ.refetch(); tasksQ.refetch(); backlogItemsQ.refetch(); goalsQ.refetch(); achievementsQ.refetch();
      chapters.refetch(); refetchProfile();
      const total = totalImported(summary);
      if (summary.errors.length) {
        showToast(`Imported ${total} records, ${summary.errors.length} table(s) had issues`);
        console.error("[StudyBun] import errors:", summary.errors);
      } else {
        showToast(`Imported ${total} records 🎉`);
      }
      return { ok: true, summary };
    } catch (e) {
      showToast(e.message || "Import failed");
      return { ok: false, error: e.message };
    }
  };

  if (profileLoading || !profile) {
    return (
      <div style={cssVars}>
        <GlobalStyle />
        <DecorLayer theme={theme} />
        <LoadingScreen message="Preparing your study desk..." />
      </div>
    );
  }

  if (!profile.name) {
    return (
      <div style={cssVars}>
        <GlobalStyle />
        <DecorLayer theme={theme} />
        <Onboarding profile={profile} onSave={async (form) => { await saveProfile(form); }} />
      </div>
    );
  }

  const pageProps = {
    profile, saveProfile, mascot,
    userId: user?.id, studyingIds,
    sessions, timerSessions, addSession, allChapters: ALL_CHAPTERS, getChStatus, setChapterField, completeChapter,
    questions, addQuestions, mocks, addMock, updateMock, deleteMock,
    mockAnalysisMap: mockAnalysis.map, saveMockAnalysis,
    revisions, completeRevision, addRevision, deleteRevision,
    tasks, addTask, toggleTask, updateTask, deleteTask, backlogChapters, todayHours, todayMinutes,
    todayLoggedHours, todayTimerHours, totalLoggedHours, totalTimerHours,
    backlogItems, addBacklogItem, updateBacklogItem, setBacklogStatus, toggleSessionItem, deleteBacklogItem,
    goals, addGoal, updateGoal, completeGoal, deleteGoal,
    streak, streakActiveToday, weeklyData, subjectPie, totalQuestions, todayQuestions, daysToExam,
    dueRevisions, upcomingRevisions, overdueRevisions, overallPct, completedCount,
    unlockedAchievements, achievementDefs, achievementRows: achievementsQ.rows, setPage, showToast, fireCelebrate,
    longestStreak, totalStudyDays, totalHours, masteredCount,
    featureUnlockStreak: FEATURE_UNLOCK_STREAK,
    mascotMood: buddyMood, mascotEnergy: buddyEnergy,
    focusTimer,
    exportBackup, importBackup,
  };

  return (
    <div className="sb-app" style={cssVars} data-stitched={theme.stitched ? "true" : "false"} data-blocky={theme.blocky ? "true" : "false"}>
      <GlobalStyle />
      <DecorLayer theme={theme} />
      <PWAPrompt />
      {celebrateType && <Confetti type={celebrateType} theme={theme} />}
      {/* Lives here, not inside the Focus Timer page, so switching pages or
          closing the timer's settings panel never unmounts (and thus never
          silences) the radio. */}
      {activeRadio.embedSrc && (
        <div className="sb-radio-embed-tucked">
          <iframe
            key={activeRadio.embedSrc}
            src={activeRadio.embedSrc}
            title={activeRadio.label}
            width="1"
            height="1"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}
      {toast && (
        <div className="sb-toast">
          <Mascot species={mascot} mood="celebrate" size={28} hop={hopping} />
          <span className="sb-quote">{toast.message}</span>
          {toast.undo && <button className="sb-toast-undo" onClick={runUndo}>Undo</button>}
        </div>
      )}
      {!isSupabaseConfigured && (
        <div className="sb-env-banner">
          Supabase isn't configured yet — copy <code>.env.example</code> to <code>.env</code> and add your project URL + anon key. Data won't save until then.
        </div>
      )}

      <aside className="sb-sidebar">
        <div className="sb-brand"><Mascot species={mascot} mood="happy" size={40} hop={hopping} peek /><div><div className="sb-brand-title">StudyBun</div><div className="sb-brand-sub">Cozy JEE companion</div></div></div>
        <nav className="sb-nav">
          <span ref={navPillRef} className="sb-nav-pill" aria-hidden="true" />
          {NAV.map((n) => (
            <button
              key={n.id}
              ref={(el) => { navItemRefs.current[n.id] = el; }}
              className={`sb-nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => startTransition(() => setPage(n.id))}
            >
              <n.icon size={18} /><span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <button className="sb-mobile-toggle" onClick={() => setMobileNavOpen((v) => !v)}><Menu size={20} /></button>
      {mobileNavOpen && (
        <div className="sb-mobile-nav">
          <span ref={mobileNavPillRef} className="sb-nav-pill" aria-hidden="true" />
          {NAV.map((n) => (
            <button
              key={n.id}
              ref={(el) => { mobileNavItemRefs.current[n.id] = el; }}
              className={`sb-nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => { startTransition(() => setPage(n.id)); setMobileNavOpen(false); }}
            >
              <n.icon size={18} /><span>{n.label}</span>
            </button>
          ))}
        </div>
      )}

      <main className="sb-main" ref={mainRef}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={page}
            className="sb-page-transition"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            {page === "dashboard" && <Dashboard {...pageProps} />}
            {page === "study" && <StudyTracker {...pageProps} />}
            {page === "timer" && <FocusTimer {...pageProps} />}
            {page === "syllabus" && <SyllabusPage {...pageProps} />}
            {page === "backlog" && <BacklogPage {...pageProps} />}
            {page === "goals" && <GoalsPage {...pageProps} />}
            {page === "questions" && <QuestionsPage {...pageProps} />}
            {page === "mocks" && <MocksPage {...pageProps} />}
            {page === "revision" && <RevisionPage {...pageProps} />}
            {page === "planner" && <PlannerPage {...pageProps} />}
            {page === "analytics" && <AnalyticsPage {...pageProps} />}
            {page === "ai" && <AIInsightsPage {...pageProps} />}
            {page === "achievements" && <AchievementsPage {...pageProps} />}
            {page === "leaderboard" && <LeaderboardPage {...pageProps} />}
            {page === "profile" && <ProfilePage {...pageProps} />}
            {page === "settings" && <SettingsPage {...pageProps} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BuddyGuide {...pageProps} page={page} mood={buddyMood} energy={buddyEnergy} hopping={hopping} />
    </div>
  );
}
