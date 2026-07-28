import { todayIST, istHour, daysUntilIST, daysAgoIST } from "../../src/lib/dateIST.js";

/**
 * Pulls together everything the notification AI needs to say something
 * genuinely specific to this student's actual day — not a generic
 * "keep studying!" ping. Every query is scoped to `user_id` and this file
 * only ever runs server-side with the service-role key.
 */
export async function buildUserContext(admin, userId) {
  const today = todayIST();
  const weekAgo = daysAgoIST(6);

  const [
    profileRes,
    tasksRes,
    revisionsRes,
    studyTodayRes,
    studyWeekRes,
    timerTodayRes,
    backlogRes,
    goalsRes,
    lastMockRes,
    statsRes,
  ] = await Promise.all([
    admin.from("profiles").select("name, exam, exam_date, daily_goal").eq("user_id", userId).maybeSingle(),
    admin.from("tasks").select("title, subject, priority, status, due_date, category")
      .eq("user_id", userId).eq("due_date", today).neq("status", "Completed"),
    admin.from("revision_plans").select("subject, chapter, revision_number, due_date, status")
      .eq("user_id", userId).eq("status", "Pending").lte("due_date", today).order("due_date", { ascending: true }).limit(20),
    admin.from("study_sessions").select("minutes").eq("user_id", userId).eq("session_date", today),
    admin.from("study_sessions").select("minutes, session_date").eq("user_id", userId).gte("session_date", weekAgo),
    admin.from("timer_sessions").select("actual_minutes, completed, created_at")
      .eq("user_id", userId).eq("completed", true).gte("created_at", `${today}T00:00:00Z`),
    admin.from("backlog_items").select("title, subject, status").eq("user_id", userId).neq("status", "Completed").limit(50),
    admin.from("goals").select("title, deadline, starred").eq("user_id", userId).eq("status", "Active").limit(10),
    admin.from("mock_tests").select("exam_name, mock_date, total_marks, percentile")
      .eq("user_id", userId).order("mock_date", { ascending: false }).limit(1),
    admin.from("user_statistics").select("current_streak, longest_streak").eq("user_id", userId).maybeSingle(),
  ]);

  const profile = profileRes.data || {};
  const minutesToday =
    (studyTodayRes.data || []).reduce((s, r) => s + Number(r.minutes || 0), 0) +
    (timerTodayRes.data || []).reduce((s, r) => s + Number(r.actual_minutes || 0), 0);
  const minutesWeek = (studyWeekRes.data || []).reduce((s, r) => s + Number(r.minutes || 0), 0);

  const revisions = revisionsRes.data || [];
  const overdueRevisions = revisions.filter((r) => r.due_date < today);
  const dueTodayRevisions = revisions.filter((r) => r.due_date === today);

  return {
    hour_ist: istHour(),
    date_ist: today,
    student_name: profile.name || null,
    exam: profile.exam || null,
    days_to_exam: profile.exam_date ? daysUntilIST(profile.exam_date) : null,
    daily_goal_hours: profile.daily_goal ?? null,
    study_minutes_today: Math.round(minutesToday),
    study_hours_today: Math.round((minutesToday / 60) * 10) / 10,
    study_minutes_last_7_days: Math.round(minutesWeek),
    current_streak: statsRes.data?.current_streak ?? null,
    tasks_due_today: (tasksRes.data || []).map((t) => ({
      title: t.title, subject: t.subject, priority: t.priority, category: t.category,
    })),
    tasks_due_today_count: (tasksRes.data || []).length,
    revisions_overdue_count: overdueRevisions.length,
    revisions_due_today_count: dueTodayRevisions.length,
    revisions_sample: revisions.slice(0, 6).map((r) => ({
      subject: r.subject, chapter: r.chapter, rep: r.revision_number, due_date: r.due_date,
    })),
    backlog_open_count: (backlogRes.data || []).length,
    backlog_sample: (backlogRes.data || []).slice(0, 5).map((b) => ({ title: b.title, subject: b.subject })),
    active_goals: (goalsRes.data || []).map((g) => ({ title: g.title, deadline: g.deadline, starred: g.starred })),
    last_mock: lastMockRes.data?.[0]
      ? { exam_name: lastMockRes.data[0].exam_name, date: lastMockRes.data[0].mock_date, percentile: lastMockRes.data[0].percentile }
      : null,
  };
}
