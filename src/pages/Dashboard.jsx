import React from "react";
import { Target, Clock3, Flame, TrendingUp, BookOpen, FolderClock, RotateCcw, HelpCircle, Sparkles, Timer, Plus } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, ProgressRing, SectionTitle, EmptyState, Btn } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";

const MOTIVATIONAL = [
  "Small consistent hours beat rare long ones.",
  "Every chapter you close is one less thing pulling at your attention.",
  "Your streak is a record of showing up, not of being perfect.",
  "Revision is where marks are actually won.",
  "A slow day is still a day you didn't quit.",
];

export default function Dashboard(p) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const goalPct = (p.todayHours / (p.profile.daily_goal || 6)) * 100;
  const line = MOTIVATIONAL[new Date().getDate() % MOTIVATIONAL.length];
  const mascotMood = p.todayHours > 0 ? "happy" : "sleepy";

  return (
    <div className="sb-page">
      <Card className="sb-hero" washi>
        <div>
          <div className="sb-hero-greet">{greeting}, {p.profile.name || "friend"} 🌸</div>
          <div className="sb-hero-line sb-quote">{line}</div>
          <div className="sb-hero-meta">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {p.profile.exam}</div>
        </div>
        <Mascot species={p.mascot} mood={mascotMood} size={84} />
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
            <div><div className="sb-goal-num">{p.todayHours}h <span>/ {p.profile.daily_goal}h</span></div><div className="sb-muted">Keep going, bun 🐰</div></div>
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Flame}>Streak</SectionTitle>
          <div className="sb-countdown" style={{ color: "var(--outline)" }}>{p.streak}<span>day streak</span></div>
        </Card>
      </div>

      <div className="sb-grid-2">
        <Card>
          <SectionTitle icon={TrendingUp}>Weekly study hours</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={p.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontFamily: "var(--font-body)" }} />
              <Line type="monotone" dataKey="hours" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
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
          <div className="sb-stat-big">{p.backlogChapters.length} <span>chapters pending</span></div>
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
