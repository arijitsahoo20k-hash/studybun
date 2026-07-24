import React, { useMemo } from "react";
import { FolderClock, TrendingDown, Sparkles, Plus, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, ProgressRing, ProgressBar, SectionTitle, Btn, EmptyState } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";

const AVG_LECTURE_HOURS = 1; // fallback assumption, shown to the user, used only when we have no logged data
const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

export default function BacklogPage(p) {
  // Real average lecture length, computed from actual logged sessions when available.
  const avgLectureHours = useMemo(() => {
    const lectureSessions = p.sessions.filter((s) => s.session_type === "Lecture");
    if (!lectureSessions.length) return AVG_LECTURE_HOURS;
    const totalMin = lectureSessions.reduce((a, s) => a + Number(s.minutes || 0), 0);
    return +((totalMin / lectureSessions.length) / 60).toFixed(2);
  }, [p.sessions]);

  const enriched = useMemo(() => {
    return p.backlogChapters.map((c) => {
      const st = p.getChStatus(c.key);
      const pendingLectures = Math.max(0, (st.lectures_total || 0) - (st.lectures_done || 0));
      const pendingHours = +(pendingLectures * avgLectureHours + (st.dpp_pending || 0) * 0.25 + (st.pyq_pending || 0) * 0.15 + (st.notes_pending || 0) * 0.5).toFixed(1);
      return { ...c, st, pendingLectures, pendingHours };
    }).sort((a, b) => (PRIORITY_WEIGHT[b.st.priority] || 0) - (PRIORITY_WEIGHT[a.st.priority] || 0) || b.st.weightage - a.st.weightage);
  }, [p.backlogChapters, p.getChStatus, avgLectureHours]);

  const totalPendingHours = enriched.reduce((a, c) => a + c.pendingHours, 0);

  // Recent pace: chapters marked Completed/Mastered in the last 14 days, using chapter_progress.updated_at.
  const recentCompletions = useMemo(() => {
    const cutoff = Date.now() - 14 * 86400000;
    return p.allChapters.filter((c) => {
      const st = p.getChStatus(c.key);
      if (!["Completed", "Mastered"].includes(st.status) || !st.updated_at) return false;
      return new Date(st.updated_at).getTime() >= cutoff;
    }).length;
  }, [p.allChapters, p.getChStatus]);

  const pacePerDay = recentCompletions / 14;
  const forecastDays = pacePerDay > 0 ? Math.ceil(enriched.length / pacePerDay) : null;

  const bySubject = {};
  enriched.forEach((c) => { (bySubject[c.subject] = bySubject[c.subject] || []).push(c); });

  const subjectChart = Object.entries(bySubject).map(([subject, chs]) => ({
    subject, pending: chs.length, hours: +chs.reduce((a, c) => a + c.pendingHours, 0).toFixed(1),
  }));

  const mostUrgent = [...enriched].sort((a, b) => {
    const ad = a.st.deadline ? new Date(a.st.deadline).getTime() : Infinity;
    const bd = b.st.deadline ? new Date(b.st.deadline).getTime() : Infinity;
    return ad - bd;
  })[0];
  const highestPriority = enriched[0];

  const bump = (c, field, delta, min = 0, max = Infinity) => {
    const next = Math.max(min, Math.min(max, (c.st[field] || 0) + delta));
    p.setChapterField(c.subject, c.name, { [field]: next });
  };

  return (
    <div className="sb-page">
      <Card className="sb-hero" washi>
        <div>
          <div className="sb-hero-greet">Backlog Manager</div>
          <div className="sb-hero-line">{enriched.length} chapters open · roughly {totalPendingHours}h of work left</div>
          {forecastDays ? (
            <div className="sb-hero-meta">At your recent pace ({pacePerDay.toFixed(2)} chapters/day), that's about <b>{forecastDays} days</b> to clear.</div>
          ) : (
            <div className="sb-hero-meta">Complete a few chapters this week and I'll start forecasting your clear-by date.</div>
          )}
        </div>
        <ProgressRing pct={p.overallPct} color="var(--accent)" />
      </Card>

      {enriched.length === 0 ? (
        <Card><EmptyState mascot={p.mascot} mood="happy" text="No backlog! You're fully caught up." sub="That almost never happens — enjoy it." /></Card>
      ) : (
        <>
          <Card>
            <SectionTitle icon={Sparkles}>Smart suggestions</SectionTitle>
            <ul className="sb-suggestion-list">
              {highestPriority && <li>Your highest-priority pending chapter is <b>{highestPriority.name}</b> ({highestPriority.subject}, weightage {highestPriority.st.weightage}/10) — tackle that first.</li>}
              {mostUrgent?.st.deadline && <li><b>{mostUrgent.name}</b> has the nearest deadline ({new Date(mostUrgent.st.deadline).toLocaleDateString()}).</li>}
              {subjectChart.length > 0 && (
                <li>{[...subjectChart].sort((a, b) => b.pending - a.pending)[0].subject} carries the largest share of your backlog — {[...subjectChart].sort((a, b) => b.pending - a.pending)[0].pending} chapters.</li>
              )}
              <li>Clearing {Math.max(1, Math.ceil(enriched.length * 0.1))} chapters/week would finish this backlog in about {Math.ceil(enriched.length / Math.max(1, Math.ceil(enriched.length * 0.1)))} weeks.</li>
            </ul>
          </Card>

          <Card>
            <SectionTitle icon={TrendingDown}>Backlog by subject</SectionTitle>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
                <XAxis dataKey="subject" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar dataKey="pending" radius={[8, 8, 0, 0]}>
                  {subjectChart.map((e, i) => <Cell key={i} fill={SYLLABUS[e.subject]?.color || "var(--accent)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {Object.entries(bySubject).map(([subject, chs]) => (
            <Card key={subject}>
              <SectionTitle icon={FolderClock}>{subject} <span className="sb-muted">({chs.length} pending · ~{chs.reduce((a, c) => a + c.pendingHours, 0).toFixed(1)}h)</span></SectionTitle>
              <div className="sb-chapter-grid">
                {chs.map((c) => (
                  <div key={c.key} className="sb-chapter-card">
                    <div className="sb-chapter-name">{c.name}</div>
                    <div className="sb-chapter-tags">
                      <span className={`sb-tag priority-${c.st.priority?.toLowerCase()}`}>{c.st.priority}</span>
                      <span className="sb-tag">~{c.pendingHours}h left</span>
                    </div>
                    <div className="sb-chapter-progress-row">
                      <span className="sb-muted small">Lectures {c.st.lectures_done}/{c.st.lectures_total}</span>
                      <ProgressBar pct={(c.st.lectures_done / (c.st.lectures_total || 1)) * 100} color={SYLLABUS[subject].color} />
                    </div>
                    <div className="sb-backlog-actions">
                      <button className="sb-mini-action" onClick={() => bump(c, "lectures_done", 1, 0, c.st.lectures_total)}><Plus size={12} /> Lecture</button>
                      {c.st.dpp_pending > 0 && <button className="sb-mini-action" onClick={() => bump(c, "dpp_pending", -1)}><Check size={12} /> DPP</button>}
                      {c.st.pyq_pending > 0 && <button className="sb-mini-action" onClick={() => bump(c, "pyq_pending", -1)}><Check size={12} /> PYQ</button>}
                    </div>
                    <Btn variant="soft" onClick={() => p.completeChapter(c)}>Mark complete</Btn>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
