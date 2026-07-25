import { SYLLABUS } from "../data/syllabus";

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
  };
}
