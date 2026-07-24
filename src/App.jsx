import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Home, BookOpen, Timer, Library, FolderClock, HelpCircle, ClipboardList,
  RotateCcw, CheckSquare, BarChart3, Sparkles, Trophy, User, Settings, Menu,
} from "lucide-react";

import { THEMES, themeVars, timeWash } from "./data/themes";
import { ALL_CHAPTERS, DEFAULT_CHAPTER_PROGRESS } from "./data/syllabus";
import { useDeviceRow, useRealtimeTable, useChapterProgress } from "./hooks/useRealtimeTable";
import { isSupabaseConfigured } from "./lib/supabaseClient";

import Mascot from "./components/Mascot";
import PWAPrompt from "./components/PWAPrompt";
import { Confetti, LoadingScreen, DecorLayer, ThemePicker } from "./components/ui";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import StudyTracker from "./pages/StudyTracker";
import FocusTimer from "./pages/FocusTimer";
import SyllabusPage from "./pages/Syllabus";
import BacklogPage from "./pages/Backlog";
import QuestionsPage from "./pages/Questions";
import MocksPage from "./pages/Mocks";
import RevisionPage from "./pages/Revision";
import PlannerPage from "./pages/Planner";
import AnalyticsPage from "./pages/Analytics";
import AchievementsPage from "./pages/Achievements";
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
  { id: "questions", label: "Question Practice", icon: HelpCircle },
  { id: "mocks", label: "Mock Tests", icon: ClipboardList },
  { id: "revision", label: "Revision Planner", icon: RotateCcw },
  { id: "planner", label: "Daily Planner", icon: CheckSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai", label: "AI Insights", icon: Sparkles },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const { row: profile, loading: profileLoading, save: saveProfile } = useDeviceRow("profiles", {
    name: "", exam: "JEE Main", exam_date: "2027-01-24", daily_goal: 6, theme: "Sakura Bloom", mascot: "bunny",
  });

  const sessionsQ = useRealtimeTable("study_sessions", { orderBy: "session_date" });
  const chapters = useChapterProgress();
  const questionsQ = useRealtimeTable("question_logs", { orderBy: "log_date" });
  const mocksQ = useRealtimeTable("mock_tests", { orderBy: "mock_date" });
  const revisionsQ = useRealtimeTable("revision_plans", { orderBy: "due_date", ascending: true });
  const tasksQ = useRealtimeTable("tasks", { orderBy: "due_date" });
  const achievementsQ = useRealtimeTable("achievements", { orderBy: "unlocked_at" });

  const [page, setPage] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, undo? }
  const [celebrateType, setCelebrateType] = useState(null); // null | "confetti" | "petals"
  const [hopping, setHopping] = useState(false);
  const toastTimer = useRef(null);

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
  const cssVars = { ...themeVars(theme), "--time-wash": timeWash() };

  /* ---------- derived stats (shared by Dashboard / Analytics / AI Insights) ---------- */
  const sessions = sessionsQ.rows;
  const questions = questionsQ.rows;
  const mocks = mocksQ.rows;
  const revisions = revisionsQ.rows;
  const tasks = tasksQ.rows;

  const getChStatus = (key) => chapters.map[key] || { ...DEFAULT_CHAPTER_PROGRESS, subject: key.split("::")[0], chapter: key.split("::")[1] };

  const todaySessions = sessions.filter((s) => s.session_date === todayStr());
  const todayMinutes = todaySessions.reduce((a, s) => a + Number(s.minutes || 0), 0);
  const todayHours = +(todayMinutes / 60).toFixed(1);

  const streak = useMemo(() => {
    const days = new Set(sessions.map((s) => s.session_date));
    let n = 0, d = new Date();
    while (days.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [sessions]);

  const backlogChapters = ALL_CHAPTERS.filter((c) => !["Completed", "Mastered"].includes(getChStatus(c.key).status));
  const completedCount = ALL_CHAPTERS.length - backlogChapters.length;
  const overallPct = (completedCount / ALL_CHAPTERS.length) * 100;

  const weeklyData = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const mins = sessions.filter((s) => s.session_date === d).reduce((a, s) => a + Number(s.minutes || 0), 0);
      arr.push({ day: new Date(d).toLocaleDateString(undefined, { weekday: "short" }), hours: +(mins / 60).toFixed(1) });
    }
    return arr;
  }, [sessions]);

  const subjectPie = useMemo(() => {
    const map = {};
    sessions.forEach((s) => { map[s.subject] = (map[s.subject] || 0) + Number(s.minutes || 0); });
    return Object.entries(map).map(([name, mins]) => ({ name, value: +(mins / 60).toFixed(2) }));
  }, [sessions]);

  const totalQuestions = questions.reduce((a, q) => a + Number(q.count || 0), 0);
  const todayQuestions = questions.filter((q) => q.log_date === todayStr()).reduce((a, q) => a + Number(q.count || 0), 0);

  const daysToExam = profile ? Math.max(0, Math.ceil((new Date(profile.exam_date) - new Date()) / 86400000)) : 0;

  const dueRevisions = revisions.filter((r) => r.status === "Pending" && r.due_date <= todayStr());
  const upcomingRevisions = revisions.filter((r) => r.status === "Pending" && r.due_date > todayStr());
  const overdueRevisions = revisions.filter((r) => r.status === "Pending" && r.due_date < todayStr());

  const achievementDefs = [
    { id: "first_hop", label: "First Hop", emoji: "🐰", cond: sessions.length >= 1 },
    { id: "lecture_bunny", label: "Lecture Bunny", emoji: "📚", cond: sessions.filter((s) => s.session_type === "Lecture").length >= 5 },
    { id: "carrot_collector", label: "Carrot Collector", emoji: "🥕", cond: totalQuestions >= 100 },
    { id: "consistency", label: "Consistency Champion", emoji: "🔥", cond: streak >= 3 },
    { id: "mock_warrior", label: "Mock Warrior", emoji: "🎯", cond: mocks.length >= 1 },
    { id: "revision_hero", label: "Revision Hero", emoji: "📖", cond: revisions.filter((r) => r.status === "Completed").length >= 3 },
    { id: "sakura_scholar", label: "Sakura Scholar", emoji: "🌸", cond: completedCount >= 10 },
    { id: "productivity_wizard", label: "Productivity Wizard", emoji: "✨", cond: todayHours >= (profile?.daily_goal || 6) },
  ];
  const unlockedAchievements = achievementDefs.filter((a) => a.cond);

  // Persist newly unlocked achievements once (fire-and-forget; harmless if it races).
  useMemo(() => {
    unlockedAchievements.forEach((a) => {
      if (!achievementsQ.rows.some((r) => r.achievement_key === a.id)) {
        achievementsQ.insert({ achievement_key: a.id });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedAchievements.length]);

  const prevUnlockedCount = useRef(unlockedAchievements.length);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; prevUnlockedCount.current = unlockedAchievements.length; return; }
    if (unlockedAchievements.length > prevUnlockedCount.current) {
      fireCelebrate("petals");
      showToast("Achievement unlocked! 🏆");
    }
    prevUnlockedCount.current = unlockedAchievements.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedAchievements.length]);

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
    const due = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
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
  const completeRevision = async (id) => {
    const priorStatus = revisions.find((r) => r.id === id)?.status || "Pending";
    await revisionsQ.update(id, { status: "Completed" });
    fireCelebrate();
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
    await tasksQ.update(t.id, { status: nextStatus });
    showToast(nextStatus === "Completed" ? "Task done ✅" : "Task reopened", () => tasksQ.update(t.id, { status: t.status }));
  };
  const deleteTask = async (id) => {
    const row = tasks.find((t) => t.id === id);
    if (!row) return;
    await tasksQ.remove(id);
    const { id: _oldId, user_id: _userId, created_at: _createdAt, ...rest } = row;
    showToast("Task deleted", () => tasksQ.insert(rest));
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
    sessions, addSession, allChapters: ALL_CHAPTERS, getChStatus, setChapterField, completeChapter,
    questions, addQuestions, mocks, addMock, revisions, completeRevision, addRevision, deleteRevision,
    tasks, addTask, toggleTask, deleteTask, backlogChapters, todayHours, todayMinutes,
    streak, weeklyData, subjectPie, totalQuestions, todayQuestions, daysToExam,
    dueRevisions, upcomingRevisions, overdueRevisions, overallPct, completedCount,
    unlockedAchievements, achievementDefs, setPage, showToast, fireCelebrate,
  };

  return (
    <div className="sb-app" style={cssVars} data-stitched={theme.stitched ? "true" : "false"}>
      <GlobalStyle />
      <DecorLayer theme={theme} />
      <PWAPrompt />
      {celebrateType && <Confetti type={celebrateType} theme={theme} />}
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
          {NAV.map((n) => (
            <button key={n.id} className={`sb-nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <n.icon size={18} /><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sb-sidebar-footer">
          <div className="sb-sidebar-footer-label">Theme</div>
          <ThemePicker compact value={profile.theme} onChange={(name) => saveProfile({ theme: name })} />
        </div>
      </aside>

      <button className="sb-mobile-toggle" onClick={() => setMobileNavOpen((v) => !v)}><Menu size={20} /></button>
      {mobileNavOpen && (
        <div className="sb-mobile-nav">
          {NAV.map((n) => (
            <button key={n.id} className={`sb-nav-item ${page === n.id ? "active" : ""}`} onClick={() => { setPage(n.id); setMobileNavOpen(false); }}>
              <n.icon size={18} /><span>{n.label}</span>
            </button>
          ))}
        </div>
      )}

      <main className="sb-main">
        {page === "dashboard" && <Dashboard {...pageProps} />}
        {page === "study" && <StudyTracker {...pageProps} />}
        {page === "timer" && <FocusTimer {...pageProps} />}
        {page === "syllabus" && <SyllabusPage {...pageProps} />}
        {page === "backlog" && <BacklogPage {...pageProps} />}
        {page === "questions" && <QuestionsPage {...pageProps} />}
        {page === "mocks" && <MocksPage {...pageProps} />}
        {page === "revision" && <RevisionPage {...pageProps} />}
        {page === "planner" && <PlannerPage {...pageProps} />}
        {page === "analytics" && <AnalyticsPage {...pageProps} />}
        {page === "ai" && <AIInsightsPage {...pageProps} />}
        {page === "achievements" && <AchievementsPage {...pageProps} />}
        {page === "profile" && <ProfilePage {...pageProps} />}
        {page === "settings" && <SettingsPage {...pageProps} />}
      </main>

      <nav className="sb-bottom-nav">
        {NAV.slice(0, 5).map((n) => (
          <button key={n.id} className={`sb-bottom-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
            <n.icon size={20} /><span>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
