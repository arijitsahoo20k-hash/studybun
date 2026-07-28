import React from "react";
import { Target, Clock3, Flame, TrendingUp, BookOpen, FolderClock, RotateCcw, HelpCircle, Sparkles, Timer, Plus } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, ProgressRing, SectionTitle, EmptyState, Btn } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";
import { todayIST, formatISTCalendarDate } from "../lib/dateIST";

const MOTIVATIONAL = [
  "Small consistent hours beat rare long ones.",
  "Every chapter you close is one less thing pulling at your attention.",
  "Your streak is a record of showing up, not of being perfect.",
  "Revision is where marks are actually won.",
  "A slow day is still a day you didn't quit.",
];

// The streak flame escalates in look the longer the streak runs — a 3-day
// flame and a 90-day flame shouldn't look identical. Tier styling itself
// lives in GlobalStyle.jsx (.sb-flame-tier-N); this just picks the tier and
// its label from the streak length. Thresholds loosely track the existing
// streak achievement badges (3/7/30/90 days) so hitting a new flame look
// and unlocking a badge tend to land on the same day.
const FLAME_TIERS = [
  { min: 90, label: "Legendary blue flame 💎" },
  { min: 30, label: "Blazing hot 🔵" },
  { min: 7, label: "On fire 🔥" },
  { min: 3, label: "Warming up" },
  { min: 0, label: "" },
];
const flameTierFor = (streak) => {
  const idx = FLAME_TIERS.findIndex((t) => streak >= t.min);
  return { tier: FLAME_TIERS.length - idx, label: FLAME_TIERS[idx].label };
};

export default function Dashboard(p) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const goalPct = (p.todayHours / (p.profile.daily_goal || 6)) * 100;
  const todayStr = todayIST();
  const line = MOTIVATIONAL[Number(todayStr.slice(8, 10)) % MOTIVATIONAL.length];
  // Grounded in real numbers (streak, revisions, backlog, goal progress,
  // time of day) via the same engine BuddyGuide uses -- so the hero mascot
  // and the floating buddy always agree on how the day is actually going.
  const mascotMood = p.mascotMood || "idle";
  const mascotEnergyLevel = p.mascotEnergy;

  return (
    <div className="sb-page">
      <Card className="sb-hero" washi>
        <div>
          <div className="sb-hero-greet">{greeting}, {p.profile.name || "friend"} 🌸</div>
          <div className="sb-hero-line sb-quote">{line}</div>
          <div className="sb-hero-meta">{formatISTCalendarDate(todayStr, { weekday: "long", month: "long", day: "numeric" })} · {p.profile.exam}</div>
        </div>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <Mascot species={p.mascot} mood={mascotMood} energy={mascotEnergyLevel} size={84} pettable />
        </div>
      </Card>

      <div className="sb-grid-3">
        <Card>
          <SectionTitle icon={Target}>Countdown to {p.profile.exam}</SectionTitle>
          <div className="sb-countdown">{p.daysToExam}<span>days left</span></div>
        </Card>
        <Card>
          <SectionTitle icon={Clock3}>Today's goal</SectionTitle>
          <div className="sb-goal-row">
            <ProgressRing pct={goalPct} />
            <div><div className="sb-goal-num">{p.todayHours}h <span>/ {p.profile.daily_goal}h</span></div><div className="sb-muted">{p.todayLoggedHours}h logged · {p.todayTimerHours}h focus timer</div></div>
          </div>
        </Card>
        <Card>
          <div className="sb-section-title">
            <span>
              <span className={`sb-icon-badge sb-streak-flame sb-flame-tier-${flameTierFor(p.streak).tier}${p.streakActiveToday ? " sb-streak-flame--lit" : ""}`}>
                <Flame size={16} />
              </span> Streak
            </span>
            {flameTierFor(p.streak).label && (
              <span className="sb-chip" style={{ fontSize: 11, cursor: "default", boxShadow: "none" }}>{flameTierFor(p.streak).label}</span>
            )}
          </div>
          <div className="sb-countdown" style={{ color: "var(--outline)" }}>{p.streak}<span>day streak</span></div>
          <div className="sb-muted" style={{ marginTop: 2 }}>
            {p.streak === 0 ? "Log today or clear your plan to start one" : p.streakActiveToday ? "Today's logged 🔥" : "Study or clear today's plan to keep it lit"}
          </div>
          {p.profile.streak_freeze_tokens > 0 && (
            <div className="sb-muted" style={{ marginTop: 2, fontSize: 12 }}>
              ❄️ {p.profile.streak_freeze_tokens} freeze {p.profile.streak_freeze_tokens === 1 ? "token" : "tokens"} — covers a missed day automatically
            </div>
          )}
        </Card>
      </div>

      <div className="sb-grid-2">
        <Card>
          <SectionTitle icon={TrendingUp}>Weekly study hours</SectionTitle>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={p.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontFamily: "var(--font-body)" }} />
              <Legend wrapperStyle={{ fontSize: 11.5 }} />
              <Line type="monotone" dataKey="hours" name="Logged" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="timerHours" name="Focus Timer" stroke="var(--outline)" strokeWidth={3} strokeDasharray="5 3" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle icon={BookOpen}>Subject distribution</SectionTitle>
          {p.subjectPie.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={p.subjectPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={4}>
                  {p.subjectPie.map((e, i) => <Cell key={i} fill={SYLLABUS[e.name]?.color || "var(--accent)"} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState mascot={p.mascot} mood="idle" text="No study logged yet." sub="Log your first session and I'll chart it here." />}
        </Card>
      </div>

      <div className="sb-grid-3">
        <Card onClick={() => p.setPage("backlog")} className="sb-clickable">
          <SectionTitle icon={FolderClock}>Backlog</SectionTitle>
          <div className="sb-stat-big">{p.backlogItems.filter((b) => b.status !== "Completed").length} <span>items open</span></div>
        </Card>
        <Card onClick={() => p.setPage("revision")} className="sb-clickable">
          <SectionTitle icon={RotateCcw}>Revisions due</SectionTitle>
          <div className="sb-stat-big">{p.dueRevisions.length + p.overdueRevisions.length} <span>waiting on you</span></div>
        </Card>
        <Card onClick={() => p.setPage("questions")} className="sb-clickable">
          <SectionTitle icon={HelpCircle}>Questions today</SectionTitle>
          <div className="sb-stat-big">{p.todayQuestions} <span>solved</span></div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={Sparkles}>Quick actions</SectionTitle>
        <div className="sb-quick-actions">
          <Btn onClick={() => p.setPage("timer")}><Timer size={16} /> Start Focus Timer</Btn>
          <Btn variant="soft" onClick={() => p.setPage("study")}><Plus size={16} /> Add Study Session</Btn>
          <Btn variant="soft" onClick={() => p.setPage("mocks")}><Plus size={16} /> Add Mock</Btn>
          <Btn variant="soft" onClick={() => p.setPage("questions")}><Plus size={16} /> Add Questions</Btn>
          <Btn variant="soft" onClick={() => p.setPage("planner")}><Plus size={16} /> Add Task</Btn>
          <Btn variant="soft" onClick={() => p.setPage("ai")}><Sparkles size={16} /> Generate AI Insights</Btn>
        </div>
      </Card>
    </div>
  );
}
