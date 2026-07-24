import React, { useState } from "react";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, SectionTitle, Btn } from "../components/ui";
import Mascot from "../components/Mascot";
import { generateAIInsights } from "../services/gemini";
import { supabase } from "../lib/supabaseClient";
import { deviceId } from "../lib/deviceId";
import { SYLLABUS } from "../data/syllabus";

function buildStatsSnapshot(p) {
  const bySubject = {};
  Object.keys(SYLLABUS).forEach((s) => {
    const chs = Object.values(SYLLABUS[s].groups).flat();
    const done = chs.filter((c) => ["Completed", "Mastered"].includes(p.getChStatus(`${s}::${c}`).status)).length;
    bySubject[s] = {
      total_chapters: chs.length,
      completed: done,
      backlog: chs.length - done,
      questions_solved: p.questions.filter((q) => q.subject === s).reduce((a, q) => a + Number(q.count || 0), 0),
    };
  });

  return {
    profile: { exam: p.profile.exam, days_to_exam: p.daysToExam, daily_goal_hours: p.profile.daily_goal },
    study_pattern: {
      today_hours: p.todayHours,
      weekly_hours: p.weeklyData.map((d) => ({ day: d.day, hours: d.hours })),
      current_streak_days: p.streak,
    },
    subjects: bySubject,
    backlog: { total_pending_chapters: p.backlogChapters.length, overall_completion_pct: Math.round(p.overallPct) },
    questions: { total_lifetime: p.totalQuestions, today: p.todayQuestions },
    revisions: { due_today: p.dueRevisions.length, overdue: p.overdueRevisions.length, upcoming: p.upcomingRevisions.length },
    mocks: p.mocks.slice(0, 10).map((m) => ({
      name: m.exam_name, date: m.mock_date,
      score: Number(m.physics_marks) + Number(m.chemistry_marks) + Number(m.math_marks),
      total: m.total_marks, correct: m.correct, incorrect: m.incorrect,
    })),
  };
}

export default function AIInsightsPage(p) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);

  const hasEnoughData = p.sessions.length > 0 || p.questions.length > 0 || p.mocks.length > 0;

  const generate = async () => {
    setLoading(true);
    setError(null);
    const snapshot = buildStatsSnapshot(p);
    try {
      const output = await generateAIInsights(snapshot);
      setResult(output);
      setGeneratedAt(new Date());
      // Persist to history — non-blocking, failure here shouldn't hide the result the user already has.
      supabase.from("ai_insights_history").insert({ device_id: deviceId, input_snapshot: snapshot, output }).then(({ error: err }) => {
        if (err) console.error("[StudyBun] failed to save AI insight history:", err.message);
      });
    } catch (e) {
      setError(e.message || "Something went wrong generating insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sb-page">
      <Card className="sb-hero">
        <div>
          <div className="sb-hero-greet">StudyBun AI</div>
          <div className="sb-hero-line">I analyzed your study data and found some interesting insights.</div>
          {generatedAt && <div className="sb-hero-meta">Generated {generatedAt.toLocaleString()}</div>}
        </div>
        <Mascot species={p.mascot} mood={loading ? "thinking" : "idle"} size={84} />
      </Card>

      {!hasEnoughData && !result && (
        <Card><div className="sb-empty"><Mascot species={p.mascot} mood="idle" size={64} /><p className="sb-empty-text">Not much data yet.</p><p className="sb-empty-sub">Log a few study sessions, questions, or a mock first — insights are only useful once there's something real to analyze.</p></div></Card>
      )}

      <Card>
        <Btn onClick={generate} disabled={loading}>
          {loading ? <><RefreshCw size={16} className="sb-spin" /> Thinking...</> : <><Sparkles size={16} /> Generate AI Insights</>}
        </Btn>
        <div className="sb-muted" style={{ marginTop: 8, fontSize: 12 }}>Only calls Gemini when you click this — never automatically, never in the background.</div>
      </Card>

      {error && (
        <Card style={{ borderColor: "var(--accent)" }}>
          <SectionTitle icon={AlertTriangle}>Couldn't generate insights</SectionTitle>
          <p className="sb-muted">{error}</p>
        </Card>
      )}

      {result && (
        <>
          <div className="sb-grid-2">
            <Card>
              <SectionTitle icon={Sparkles}>🌸 What's going well</SectionTitle>
              <ul className="sb-suggestion-list">{(result.going_well || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </Card>
            <Card>
              <SectionTitle icon={AlertTriangle}>⚠️ Needs attention</SectionTitle>
              <ul className="sb-suggestion-list">{(result.needs_attention || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </Card>
          </div>

          <Card>
            <SectionTitle icon={Sparkles}>🎯 Top priorities</SectionTitle>
            <ul className="sb-suggestion-list">{(result.top_priorities || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Card>

          <div className="sb-grid-2">
            <Card><SectionTitle icon={Sparkles}>📈 Performance trends</SectionTitle><p>{result.performance_trends}</p></Card>
            <Card><SectionTitle icon={Sparkles}>🔥 Backlog strategy</SectionTitle><p>{result.backlog_strategy}</p></Card>
          </div>

          <div className="sb-grid-2">
            <Card><SectionTitle icon={Sparkles}>📝 Mock suggestions</SectionTitle><p>{result.mock_suggestions}</p></Card>
            <Card><SectionTitle icon={Sparkles}>🔄 Revision advice</SectionTitle><p>{result.revision_advice}</p></Card>
          </div>

          <Card>
            <SectionTitle icon={Sparkles}>📚 Recommended chapters</SectionTitle>
            <div className="sb-quick-actions">
              {(result.recommended_chapters || []).map((c, i) => (
                <Btn key={i} variant="soft" onClick={() => p.setPage("syllabus")}>{c}</Btn>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Sparkles}>💡 Productivity tips</SectionTitle>
            <ul className="sb-suggestion-list">{(result.productivity_tips || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Card>

          {result.predictions && (
            <Card>
              <SectionTitle icon={Sparkles}>Predictions <span className="sb-muted" style={{ fontSize: 11 }}>(estimates, not guarantees)</span></SectionTitle>
              <div className="sb-grid-3">
                <div className="sb-mini-stat"><div className="sb-mini-num" style={{ fontSize: 15 }}>{result.predictions.estimated_syllabus_completion}</div><div className="sb-muted">Syllabus completion</div></div>
                <div className="sb-mini-stat"><div className="sb-mini-num" style={{ fontSize: 15 }}>{result.predictions.estimated_backlog_completion}</div><div className="sb-muted">Backlog completion</div></div>
                <div className="sb-mini-stat"><div className="sb-mini-num" style={{ fontSize: 15, textTransform: "capitalize" }}>{result.predictions.confidence}</div><div className="sb-muted">Confidence</div></div>
              </div>
              <p className="sb-muted" style={{ marginTop: 10, fontSize: 12.5 }}>{result.predictions.reasoning}</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
