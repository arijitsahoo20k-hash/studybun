import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { weightageFor } from "../data/syllabus";

/**
 * Keeps a Supabase table's rows (scoped to the signed-in user) in sync in
 * real time. If there's no signed-in user yet (e.g. Supabase isn't
 * configured), it stays idle with empty rows rather than erroring.
 */
export function useRealtimeTable(table, { orderBy = "created_at", ascending = false, enabled = true } = {}) {
  const { user } = useAuth();
  const userId = user?.id;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const loadRef = useRef(null);

  useEffect(() => {
    mounted.current = true;

    if (!userId) {
      setRows([]);
      setLoading(false);
      loadRef.current = null;
      return () => { mounted.current = false; };
    }

    if (!enabled) {
      // Keep the last successful page snapshot in memory so navigating back
      // is instant; only the network subscription/query is paused.
      setLoading(false);
      loadRef.current = null;
      return () => { mounted.current = false; };
    }

    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .order(orderBy, { ascending });
      if (!mounted.current) return;
      if (err) setError(err);
      else setRows(data || []);
      setLoading(false);
    }
    load();
    loadRef.current = load;

    const channel = supabase
      .channel(`rt:${table}:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((r) => r.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((r) => (r.id === payload.new.id ? payload.new : r));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, enabled]);

  const insert = useCallback(
    async (row) => {
      if (!userId) return null;
      const { data, error: err } = await supabase
        .from(table)
        .insert({ ...row, user_id: userId })
        .select()
        .single();
      if (err) { setError(err); console.error(`[StudyBun] insert into ${table} failed:`, err.message); return null; }
      // Optimistic add in case the realtime echo is slow/disabled on this table.
      setRows((prev) => (prev.some((r) => r.id === data.id) ? prev : [data, ...prev]));
      return data;
    },
    [table, userId]
  );

  const update = useCallback(
    async (id, patch) => {
      const { data, error: err } = await supabase.from(table).update(patch).eq("id", id).select().single();
      if (err) { setError(err); console.error(`[StudyBun] update on ${table} failed:`, err.message); return null; }
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
      return data;
    },
    [table]
  );

  const remove = useCallback(
    async (id) => {
      const { error: err } = await supabase.from(table).delete().eq("id", id);
      if (err) { setError(err); console.error(`[StudyBun] delete on ${table} failed:`, err.message); return; }
      setRows((prev) => prev.filter((r) => r.id !== id));
    },
    [table]
  );

  const refetch = useCallback(() => loadRef.current?.(), []);

  return { rows, loading, error, insert, update, remove, setRows, refetch };
}

/** Single-row-per-user table (profiles, user_settings, user_statistics). */
export function useDeviceRow(table, defaults = {}, { enabled = true } = {}) {
  const { user } = useAuth();
  const userId = user?.id;
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(null);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setRow(null);
      setLoading(false);
      return () => { active = false; };
    }

    if (!enabled) {
      // Same "keep the last snapshot, just pause the network" behavior as
      // useRealtimeTable's enabled flag — lets a page-scoped single-row
      // cache (e.g. mock_ai_comparison, ai_insights) skip its query/channel
      // entirely while some other page is open.
      setLoading(false);
      loadRef.current = null;
      return () => { active = false; };
    }

    async function load() {
      const { data, error } = await supabase.from(table).select("*").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (!data && !error) {
        const { data: created } = await supabase
          .from(table)
          .insert({ user_id: userId, ...defaults })
          .select()
          .single();
        setRow(created);
      } else {
        setRow(data);
      }
      setLoading(false);
    }
    load();
    loadRef.current = load;

    const channel = supabase
      .channel(`rt:${table}:row:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` },
        (payload) => setRow(payload.new || null)
      )
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, enabled]);

  const save = useCallback(
    async (patch) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from(table)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select()
        .single();
      if (error) { console.error(`[StudyBun] update on ${table} failed:`, error.message); return null; }
      setRow(data);
      return data;
    },
    [table, userId]
  );

  const refetch = useCallback(() => loadRef.current?.(), []);

  return { row, loading, save, refetch };
}

/** mock_analysis is 1:1 with a mock_tests row (keyed by mock_id) — a thin wrapper with upsert semantics. */
export function useMockAnalysis(options = {}) {
  const { rows, loading, insert, update, remove, refetch } = useRealtimeTable("mock_analysis", { orderBy: "created_at", ...options });

  const map = {};
  rows.forEach((r) => { map[r.mock_id] = r; });

  const upsert = useCallback(
    async (mockId, patch) => {
      const existing = map[mockId];
      if (existing) return update(existing.id, patch);
      return insert({ mock_id: mockId, ...patch });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
  );

  return { map, rows, loading, upsert, remove, refetch };
}

/** chapter_progress is keyed by (subject, chapter) rather than id-first — a thin wrapper with upsert semantics. */
export function useChapterProgress(options = {}) {
  const { rows, loading, insert, update, refetch } = useRealtimeTable("chapter_progress", { orderBy: "updated_at", ...options });

  const map = {};
  rows.forEach((r) => { map[`${r.subject}::${r.chapter}`] = r; });

  const upsert = useCallback(
    async (subject, chapter, patch) => {
      const key = `${subject}::${chapter}`;
      const existing = map[key];
      if (existing) return update(existing.id, { ...patch, updated_at: new Date().toISOString() });
      // First time this chapter gets a row: seed weightage from real
      // historical PYQ data unless the caller already specified one.
      const seededWeightage = patch.weightage != null ? {} : { weightage: weightageFor(chapter) };
      return insert({ subject, chapter, ...seededWeightage, ...patch });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
  );

  return { map, rows, loading, upsert, refetch };
}
