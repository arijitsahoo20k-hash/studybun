import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

const TOP_N = 20;

/**
 * Top 20 rows of `leaderboard_public`, kept live via Supabase Realtime, plus
 * the signed-in user's own rank (fetched separately through the
 * `lb_get_my_rank` RPC so we never have to pull every user down just to
 * find one row). All scoring/anti-cheat happens server-side — this hook
 * only ever reads the already-computed public columns.
 */
export function useLeaderboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const [top, setTop] = useState([]);
  const [myRank, setMyRank] = useState(null); // { rank, study_score, current_streak, total_users } | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mounted = useRef(true);
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    const [topRes, rankRes] = await Promise.all([
      supabase
        .from("leaderboard_public")
        .select("user_id, display_name, mascot, study_score, current_streak, active_days_30")
        .order("study_score", { ascending: false })
        .order("current_streak", { ascending: false })
        .limit(TOP_N),
      userId ? supabase.rpc("lb_get_my_rank") : Promise.resolve({ data: null, error: null }),
    ]);
    if (!mounted.current) return;

    if (topRes.error) setError(topRes.error);
    else {
      setError(null);
      setTop(topRes.data || []);
    }

    if (rankRes && !rankRes.error && rankRes.data && rankRes.data.length) {
      setMyRank(rankRes.data[0]);
    } else {
      setMyRank(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    load();

    const channel = supabase
      .channel("rt:leaderboard_public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard_public" },
        () => {
          // Any row anywhere could have just entered/left the top 20 or
          // shifted someone's rank — debounce so a burst of updates (e.g.
          // several users finishing sessions around the same moment)
          // collapses into a single refetch instead of one per row.
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(load, 350);
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const amInTop = userId ? top.some((r) => r.user_id === userId) : true;
  const pointsToTop20 =
    !amInTop && myRank && top.length >= TOP_N ? Math.max(0, top[TOP_N - 1].study_score - myRank.study_score) : null;

  return { top, myRank, amInTop, pointsToTop20, loading, error, refetch: load };
}
