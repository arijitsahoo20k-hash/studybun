import { SYLLABUS } from "../data/syllabus";

const num = (v) => Number(v) || 0;

/**
 * Builds a compact, real-data-only snapshot of the user's progress. Shared by
 * the AI Insights page (deep analysis) and the Smart Study Buddy chat
 * (grounded, in-the-moment guidance) so both are answering from the same
 * source of truth instead of drifting into generic filler.
 */
export function buildStatsSnapshot(p) {
  const bySubject = {};
  Object.keys(SYLLABUS).forEach((s) => {
    const chs = Object.values(SYLLABUS[s].groups).flat();
    const done = chs.filter((c) => ["Completed", "Mastered"].includes(p.getChStatus(`${s}::${c}`).status)).length;
    // Weightage-weighted backlog: not-done chapters weighted by real exam
    // frequency, so "high weightage still pending" outranks low-value gaps.
    const pendingWeightage = chs
      .filter((c) => !["Completed", "Mastered"].includes(p.getChStatus(`${s}::${c}`).status))
      .reduce((a, c) => a + num(p.getChStatus(`${s}::${c}`).weightage), 0);
    bySubject[s] = {
      total_chapters: chs.length,
      completed: done,
      backlog: chs.length - done,
      questions_solved: p.questions.filter((q) => q.subject === s).reduce((a, q) => a + Number(q.count || 0), 0),
      pending_weightage_total: pendingWeightage,
    };
  });

  // Mistake-pattern data from reviewed mocks (mock_analysis) — this is the
  // real error-type breakdown, not just correct/incorrect counts, so AI
  // Insights can reason about *why* marks were lost, not just how many.
  const analysisRows = Object.values(p.mockAnalysisMap || {});
  const mistakeTotals = { silly_mistakes: 0, concept_errors: 0, calculation_errors: 0, time_management_errors: 0, guess_work: 0 };
  const chapterFlagCounts = {};
  analysisRows.forEach((r) => {
    Object.keys(mistakeTotals).forEach((k) => { mistakeTotals[k] += num(r[k]); });
    (r.linked_chapters || []).forEach((c) => { chapterFlagCounts[c] = (chapterFlagCounts[c] || 0) + 1; });
  });
  const flaggedChapters = Object.entries(chapterFlagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([chapter, times_flagged]) => ({ chapter, times_flagged }));

  // Pacing: average time share vs score share per subject, across mocks that logged minutes.
  const pacingMocks = (p.mocks || []).filter((m) => num(m.physics_minutes) + num(m.chemistry_minutes) + num(m.math_minutes) > 0);
  let pacing = null;
  if (pacingMocks.length > 0) {
    const mins = { physics: 0, chemistry: 0, math: 0 };
    const marks = { physics: 0, chemistry: 0, math: 0 };
    pacingMocks.forEach((m) => {
      mins.physics += num(m.physics_minutes); mins.chemistry += num(m.chemistry_minutes); mins.math += num(m.math_minutes);
      marks.physics += num(m.physics_marks); marks.chemistry += num(m.chemistry_marks); marks.math += num(m.math_marks);
    });
    const totalMins = mins.physics + mins.chemistry + mins.math;
    const totalMarks = marks.physics + marks.chemistry + marks.math;
    if (totalMins > 0 && totalMarks > 0) {
      pacing = ["physics", "chemistry", "math"].map((s) => ({
        subject: s,
        time_share_pct: Math.round((mins[s] / totalMins) * 100),
        score_share_pct: Math.round((marks[s] / totalMarks) * 100),
      }));
    }
  }

  return {
    profile: { exam: p.profile.exam, days_to_exam: p.daysToExam, daily_goal_hours: p.profile.daily_goal },
    study_pattern: {
      today_hours: p.todayHours,
      weekly_hours: (p.weeklyData || []).map((d) => ({ day: d.day, hours: d.hours })),
      current_streak_days: p.streak,
    },
    subjects: bySubject,
    backlog: { total_pending_chapters: p.backlogChapters.length, overall_completion_pct: Math.round(p.overallPct) },
    questions: { total_lifetime: p.totalQuestions, today: p.todayQuestions },
    revisions: { due_today: p.dueRevisions.length, overdue: p.overdueRevisions.length, upcoming: p.upcomingRevisions.length },
    mocks: (p.mocks || []).slice(0, 10).map((m) => ({
      name: m.exam_name, date: m.mock_date,
      score: Number(m.physics_marks) + Number(m.chemistry_marks) + Number(m.math_marks),
      total: m.total_marks, correct: m.correct, incorrect: m.incorrect,
    })),
    mistake_patterns: analysisRows.length > 0 ? {
      mocks_reviewed: analysisRows.length,
      totals: mistakeTotals,
      most_flagged_chapters: flaggedChapters,
    } : null,
    pacing,
  };
}
