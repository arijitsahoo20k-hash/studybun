import React from "react";
import { Target, Clock3, Flame, TrendingUp, BookOpen, Sparkles, Timer, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

  // Subject split as horizontal bars, sorted by time spent, sharing the
  // same per-subject colors as the rest of the app (SYLLABUS).
  const subjectTotal = p.subjectPie.reduce((a, s) => a + s.value, 0) || 1;
  const subjectRows = [...p.subjectPie].sort((a, b) => b.value - a.value);

  const backlogOpen = p.backlogItems.filter((b) => b.status !== "Completed").length;
  const revisionsDue = p.dueRevisions.length + p.overdueRevisions.length;

  return (
    <div className="sb-page">
      <div className="sb-dash-layout">
        <div className="sb-dash-main">
          <Card className="sb-hero" plastic>
            <div>
              <div className="sb-hero-greet">{greeting}, {p.profile.name || "friend"} 🌸</div>
              <div className="sb-hero-meta">{formatISTCalendarDate(todayStr, { weekday: "long", month: "long", day: "numeric" })} · {p.profile.exam}</div>
            </div>
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Mascot species={p.mascot} mood={mascotMood} energy={mascotEnergyLevel} size={84} pettable />
            </div>
          </Card>

          <div className="sb-grid-3">
            <Card plastic>
              <SectionTitle icon={Target}>Countdown</SectionTitle>
              <div className="sb-countdown sb-countdown-hero">{p.daysToExam}<span>days left</span></div>
            </Card>
            <Card plastic>
              <SectionTitle icon={Clock3}>Today</SectionTitle>
              <div className="sb-goal-row">
                <ProgressRing pct={goalPct} size={44} stroke={6} paw={false} />
                <div><div className="sb-goal-num">{p.todayHours}h <span>/ {p.profile.daily_goal}h</span></div></div>
              </div>
            </Card>
            <Card plastic style={{ background: "var(--soft)" }}>
              <SectionTitle icon={Flame}>Streak</SectionTitle>
              <div className="sb-countdown" style={{ color: "var(--outline)" }}>{p.streak} 🔥<span>day streak</span></div>
            </Card>
          </div>

          <div className="sb-grid-2">
            <Card plastic>
              <SectionTitle icon={TrendingUp}>Weekly hours</SectionTitle>
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
            <Card plastic>
              <SectionTitle icon={BookOpen}>Subject split</SectionTitle>
              {subjectRows.length ? (
                <div className="sb-subject-split">
                  {subjectRows.map((s) => {
                    const pct = Math.round((s.value / subjectTotal) * 100);
                    return (
                      <div className="sb-subject-row" key={s.name}>
                        <div className="sb-subject-row-top"><span>{s.name}</span><span>{pct}%</span></div>
                        <div className="sb-subject-track">
                          <div className="sb-subject-fill" style={{ width: `${pct}%`, background: SYLLABUS[s.name]?.color || "var(--accent)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <EmptyState mascot={p.mascot} mood="idle" text="No study logged yet." sub="Log your first session and I'll chart it here." />}
            </Card>
          </div>
        </div>

        <div className="sb-pinboard">
          <div className="sb-pinboard-title">pinboard</div>
          <div className="sb-pin-note sb-pin-quote sb-plastic">"{line}"</div>
          <div className="sb-pin-note sb-plastic sb-clickable" style={{ background: "var(--p2)" }} onClick={() => p.setPage("backlog")}>
            <div className="sb-pin-label">backlog</div>
            <div className="sb-pin-value">{backlogOpen} open</div>
          </div>
          <div className="sb-pin-note sb-plastic sb-clickable" style={{ background: "var(--p5)" }} onClick={() => p.setPage("revision")}>
            <div className="sb-pin-label">revisions</div>
            <div className="sb-pin-value">{revisionsDue} due</div>
          </div>
          <div className="sb-pin-note sb-plastic sb-clickable" style={{ background: "var(--p1)" }} onClick={() => p.setPage("questions")}>
            <div className="sb-pin-label">questions</div>
            <div className="sb-pin-value">{p.todayQuestions} solved</div>
          </div>
        </div>
      </div>

      <Card plastic>
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
