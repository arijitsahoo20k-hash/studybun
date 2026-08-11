import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { todayIST, daysAgoIST } from "../lib/dateIST";
import { attachProfiles } from "../lib/communityProfiles";

const SELECT = "id, user_id, goal_date, subject, chapter, goal_type, goal_text, target_value, actual_value, estimated_minutes, status, result_note, created_at, completed_at";

/**
 * Daily accountability check-ins: the student's own goal for today plus
 * a live feed of other students' active commitments (what the Community
 * page's "Today's check-ins" section renders). Real Supabase data only —
 * no fabricated counts.
 */
export function useAccountability() {
  const { user } = useAuth();
  const userId = user?.id;
  const [myGoal, setMyGoal] = useState(null); // today's row, or null
  const [activeGoals, setActiveGoals] = useState([]); // everyone's today rows (excluding own)
  const [weekly, setWeekly] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const today = todayIST();
    const weekAgo = daysAgoIST(6);

    const [mineRes, othersRes, weekRes] = await Promise.all([
      supabase.from("accountability_goals").select(SELECT).eq("user_id", userId).eq("goal_date", today).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("accountability_goals").select(SELECT).eq("goal_date", today).neq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("accountability_goals").select("id, status").eq("user_id", userId).gte("goal_date", weekAgo),
    ]);

    if (!mounted.current) return;
    if (!mineRes.error) setMyGoal(mineRes.data || null);
    if (!othersRes.error) {
      const withProfiles = await attachProfiles(othersRes.data || []);
      if (!mounted.current) return;
      setActiveGoals(withProfiles);
    }
    if (!weekRes.error) {
      const rows = weekRes.data || [];
      setWeekly({ total: rows.length, completed: rows.filter((r) => r.status === "completed").length });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    load();
    if (!userId) return () => { mounted.current = false; };

    const ch = supabase
      .channel(`rt:accountability_goals:${todayIST()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "accountability_goals" }, () => load())
      .subscribe();

    return () => { mounted.current = false; supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, load]);

  const checkIn = useCallback(
    async (form) => {
      if (!userId) return { ok: false };
      const payload = {
        subject: form.subject || null,
        chapter: form.chapter || null,
        goal_type: form.goalType || "custom",
        goal_text: form.goalText,
        target_value: form.targetValue ?? null,
        estimated_minutes: form.estimatedMinutes ?? null,
        status: "studying",
      };

      // One commitment per day: replace today's goal if one already exists
      // (e.g. the student changes their mind about what they're studying)
      // rather than creating a second row for the same day.
      if (myGoal?.id) {
        const { data, error: err } = await supabase
          .from("accountability_goals")
          .update(payload)
          .eq("id", myGoal.id)
          .select(SELECT)
          .single();
        if (err) return { ok: false, error: "Couldn't save your goal. Try again." };
        setMyGoal(data);
        return { ok: true, data };
      }

      const { data, error: err } = await supabase
        .from("accountability_goals")
        .insert({ user_id: userId, goal_date: todayIST(), ...payload })
        .select(SELECT)
        .single();
      if (err) return { ok: false, error: "Couldn't save your goal. Try again." };
      setMyGoal(data);
      return { ok: true, data };
    },
    [userId, myGoal]
  );

  const updateStatus = useCallback(
    async (id, status, extra = {}) => {
      const patch = { status, ...extra };
      if (status === "completed" || status === "partial" || status === "missed") {
        patch.completed_at = new Date().toISOString();
      }
      const { data, error: err } = await supabase.from("accountability_goals").update(patch).eq("id", id).select(SELECT).single();
      if (err) return { ok: false, error: "Couldn't update that goal." };
      setMyGoal(data);
      return { ok: true, data };
    },
    []
  );

  return { myGoal, activeGoals, weekly, loading, checkIn, updateStatus, refetch: load };
}
