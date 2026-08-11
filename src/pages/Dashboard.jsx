import React from "react";
import {
  Target, Clock3, Flame, TrendingUp, BookOpen, Library, FolderClock, RotateCcw,
  HelpCircle, NotebookPen, ClipboardList, Trophy, CheckSquare, CalendarClock,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, ProgressRing, SectionTitle, EmptyState } from "../components/ui";
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

const num = (v) => Number(v) || 0;
// Same scoring formula Mocks.jsx uses (kept in sync deliberately — this is
// a read-only summary, not a new source of truth for mock scoring).
const mockTotal = (m) => num(m.physics_marks) + num(m.chemistry_marks) + num(m.math_marks);
const mockMax = (m) => num(m.total_marks) || (m.exam_type === "JEE Advanced" ? 360 : 300);
const mockPct = (m) => Math.round((mockTotal(m) / (mockMax(m) || 1)) * 100);

// A small, self-contained bento stat tile. Every value on the dashboard
// that isn't the hero countdown or a chart flows through this so the grid
// stays visually consistent no matter how many tiles get added later.
function StatCard({ icon: Icon, label, value, sub, onClick, warn }) {
  return (
    <Card paper glass className={`sb-stat-card${onClick ? " sb-clickable" : ""}`} onClick={onClick}>
      <div className="sb-stat-top">
        {Icon && <span className="sb-icon-badge"><Icon size={15} /></span>}
        <span className="sb-stat-label">{label}</span>
      </div>
      <div className={`sb-stat-value${warn ? " sb-stat-value--warn" : ""}`}>{value}</div>
      {sub && <div className="sb-stat-sub">{sub}</div>}
    </Card>
  );
}

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

  // Subject split as a donut + legend, sorted by time spent, sharing the
  // same per-subject colors as the rest of the app (SYLLABUS).
  const subjectTotal = p.subjectPie.reduce((a, s) => a + s.value, 0) || 1;
  const subjectRows = [...p.subjectPie].sort((a, b) => b.value - a.value);

  const backlogOpen = p.backlogItems.filter((b) => b.status !== "Completed").length;
  const revisionsDue = p.dueRevisions.length + p.overdueRevisions.length;
  const flame = flameTierFor(p.streak);

  // Extra data the old pinboard never surfaced -- pulled from props that
  // were already flowing into every page via App.jsx's shared pageProps,
  // just never rendered here. Every read below is defensively guarded so a
  // still-loading or empty list can never crash the page.
  const goalsList = p.goals || [];
  const activeGoals = goalsList.filter((g) => g.status !== "Completed").length;

  const mocksList = p.mocks || [];
  const latestMock = mocksList[0] || null;

  const achievementDefsList = p.achievementDefs || [];
  const unlockedCount = (p.unlockedAchievements || []).length;

  const tasksToday = (p.tasks || []).filter((t) => t.due_date === todayStr);
  const tasksDoneToday = tasksToday.filter((t) => t.status === "Completed").length;

  const weeksLeft = Math.floor((p.daysToExam || 0) / 7);
  const examDateLabel = p.profile.exam_date ? formatISTCalendarDate(p.profile.exam_date, { month: "long", day: "numeric", year: "numeric" }) : "";

  return (
    <div className="sb-page">
      <Card className="sb-hero" washi paper glass>
        <div>
          <div className="sb-hero-greet">{greeting}, {p.profile.name || "friend"} 🌸</div>
          <div className="sb-hero-line sb-quote">{line}</div>
          <div className="sb-hero-meta">{formatISTCalendarDate(todayStr, { weekday: "long", month: "long", day: "numeric" })} · {p.profile.exam}</div>
        </div>
        <div className="sb-hero-mascot-wrap">
          <Mascot species={p.mascot} mood={mascotMood} energy={mascotEnergyLevel} size={84} pettable />
        </div>
      </Card>

      {/* Big, bold, unmissable -- exactly what's actually urgent every day. */}
      <Card className="sb-days-hero" paper glass>
        <div>
          <SectionTitle icon={Target}>Countdown to {p.profile.exam}</SectionTitle>
          <div className="sb-days-hero-num-wrap">
            <span className="sb-days-hero-num">{p.daysToExam}</span>
            <span className="sb-days-hero-unit">days left</span>
          </div>
        </div>
        <div className="sb-days-hero-side">
          {examDateLabel && <div className="sb-days-hero-exam">{examDateLabel}</div>}
          {weeksLeft > 0 && <div className="sb-days-hero-weeks">≈ {weeksLeft} {weeksLeft === 1 ? "week" : "weeks"} to go</div>}
        </div>
      </Card>

      {/* A dense, self-reflowing bento grid -- every stat that used to live
          only on Analytics/Achievements/etc gets a quick-glance tile here,
          with the busiest ones wired straight to their full page. */}
      <div className="sb-stat-grid">
        <Card paper glass className="sb-stat-card">
          <div className="sb-stat-top"><span className="sb-icon-badge"><Clock3 size={15} /></span><span className="sb-stat-label">Today's goal</span></div>
          <div className="sb-goal-row" style={{ marginTop: 2 }}>
            <ProgressRing pct={goalPct} size={56} stroke={7} />
            <div><div className="sb-stat-value">{p.todayHours}<span>/ {p.profile.daily_goal}h</span></div><div className="sb-stat-sub">{p.todayLoggedHours}h logged · {p.todayTimerHours}h timer</div></div>
          </div>
        </Card>

        <Card paper glass className="sb-stat-card">
          <div className="sb-stat-top">
            <span className={`sb-icon-badge sb-streak-flame sb-flame-tier-${flame.tier}${p.streakActiveToday ? " sb-streak-flame--lit" : ""}`}><Flame size={15} /></span>
            <span className="sb-stat-label">Streak</span>
          </div>
          <div className="sb-stat-value">{p.streak}<span>day{p.streak === 1 ? "" : "s"}</span></div>
          <div className="sb-stat-sub">{flame.label || (p.streak === 0 ? "Log today to start one" : p.streakActiveToday ? "Today's logged 🔥" : "Study to keep it lit")}</div>
        </Card>

        <StatCard
          icon={Library} label="Syllabus"
          value={<>{Math.round(p.overallPct)}<span>%</span></>}
          sub={`${p.completedCount}/${(p.allChapters || []).length} chapters · ${p.masteredCount} mastered`}
          onClick={() => p.setPage("syllabus")}
        />

        <StatCard
          icon={CalendarClock} label="All-time"
          value={<>{p.totalHours}<span>h</span></>}
          sub={`${p.totalStudyDays} study days · best streak ${p.longestStreak}`}
        />

        <StatCard
          icon={FolderClock} label="Backlog"
          value={<>{backlogOpen}<span>open</span></>}
          sub={backlogOpen === 0 ? "All clear 🎉" : "Chapters waiting on you"}
          onClick={() => p.setPage("backlog")}
          warn={backlogOpen > 0}
        />

        <StatCard
          icon={RotateCcw} label="Revisions"
          value={<>{revisionsDue}<span>due</span></>}
          sub={p.overdueRevisions.length > 0 ? `${p.overdueRevisions.length} overdue` : "On schedule"}
          onClick={() => p.setPage("revision")}
          warn={p.overdueRevisions.length > 0}
        />

        <StatCard
          icon={HelpCircle} label="Questions"
          value={<>{p.todayQuestions}<span>today</span></>}
          sub={`${p.totalQuestions} solved all-time`}
          onClick={() => p.setPage("questions")}
        />

        <StatCard
          icon={CheckSquare} label="Today's plan"
          value={tasksToday.length ? <>{tasksDoneToday}<span>/{tasksToday.length}</span></> : "—"}
          sub={tasksToday.length ? "Tasks completed" : "Nothing planned yet"}
          onClick={() => p.setPage("planner")}
        />

        <StatCard
          icon={NotebookPen} label="Goals"
          value={<>{activeGoals}<span>active</span></>}
          sub={`${goalsList.length} total`}
          onClick={() => p.setPage("goals")}
        />

        <StatCard
          icon={ClipboardList} label="Mock tests"
          value={latestMock ? <>{mockPct(latestMock)}<span>%</span></> : mocksList.length}
          sub={latestMock ? `Latest · ${mocksList.length} taken` : "No mocks logged yet"}
          onClick={() => p.setPage("mocks")}
        />

        <StatCard
          icon={Trophy} label="Achievements"
          value={<>{unlockedCount}<span>/{achievementDefsList.length}</span></>}
          sub="Badges unlocked"
          onClick={() => p.setPage("achievements")}
        />
      </div>

      <div className="sb-grid-2">
        <Card paper>
          <SectionTitle icon={TrendingUp}>Weekly study hours</SectionTitle>
          <div className="sb-dash-chart">
            <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </Card>
        <Card paper>
          <SectionTitle icon={BookOpen}>Subject split</SectionTitle>
          {subjectRows.length ? (
            <div className="sb-subject-donut-wrap">
              <div className="sb-subject-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectRows}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="64%"
                      outerRadius="100%"
                      paddingAngle={4}
                      cornerRadius={6}
                      stroke="var(--card)"
                      strokeWidth={3}
                      isAnimationActive={true}
                    >
                      {subjectRows.map((s) => (
                        <Cell key={s.name} fill={SYLLABUS[s.name]?.color || "var(--accent)"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", fontFamily: "var(--font-body)" }}
                      formatter={(value, name) => [`${value}h`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="sb-subject-donut-center">
                  <div className="sb-subject-donut-total">{Math.round(subjectTotal)}h</div>
                  <div className="sb-subject-donut-label">total</div>
                </div>
              </div>
              <div className="sb-subject-legend">
                {subjectRows.map((s) => {
                  const pct = Math.round((s.value / subjectTotal) * 100);
                  return (
                    <div className="sb-subject-legend-row" key={s.name}>
                      <span className="sb-subject-dot" style={{ background: SYLLABUS[s.name]?.color || "var(--accent)" }} />
                      <span className="sb-subject-legend-name">{s.name}</span>
                      <span className="sb-subject-legend-meta">
                        <span className="sb-subject-legend-pct">{pct}%</span>
                        <span className="sb-subject-legend-hrs">{Math.round(s.value)}h</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <EmptyState mascot={p.mascot} mood="idle" text="No study logged yet." sub="Log your first session and I'll chart it here." />}
        </Card>
      </div>
    </div>
  );
}
