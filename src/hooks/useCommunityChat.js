import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { attachProfiles, fetchOneProfile } from "../lib/communityProfiles";

const PAGE_SIZE = 50;
const SELECT = "id, channel_id, user_id, content, created_at, expires_at";

/**
 * Realtime chat for one community channel. Unlike useRealtimeTable (which
 * is always scoped to `user_id = the signed-in user`), a chat room needs
 * every message in the channel, so this subscribes with a `channel_id`
 * filter instead and handles INSERT/DELETE itself — DELETE matters here
 * more than anywhere else in the app, since it's how a 5-day-expired
 * message disappears from everyone's screen the moment the cleanup cron
 * removes it from Postgres.
 */
export function useCommunityChat(channelId) {
  const { user } = useAuth();
  const userId = user?.id;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!channelId || !userId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("community_messages")
      .select(SELECT)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (!mounted.current) return;
    if (err) setError(err);
    else {
      setError(null);
      const withProfiles = await attachProfiles((data || []).slice().reverse());
      if (!mounted.current) return;
      setMessages(withProfiles);
      setHasMore((data || []).length === PAGE_SIZE);
    }
    setLoading(false);
  }, [channelId, userId]);

  const loadOlder = useCallback(async () => {
    if (!channelId || messages.length === 0) return;
    const oldest = messages[0]?.created_at;
    const { data, error: err } = await supabase
      .from("community_messages")
      .select(SELECT)
      .eq("channel_id", channelId)
      .lt("created_at", oldest)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (err) { setError(err); return; }
    const older = await attachProfiles((data || []).slice().reverse());
    setHasMore((data || []).length === PAGE_SIZE);
    setMessages((prev) => [...older, ...prev]);
  }, [channelId, messages]);

  useEffect(() => {
    mounted.current = true;
    load();

    if (!channelId || !userId) return () => { mounted.current = false; };

    const rtChannel = supabase
      .channel(`rt:community_messages:${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages", filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          // The realtime payload doesn't include the joined profile, so
          // fetch just that row's display info once. Goes through the
          // get_community_profiles RPC, not a direct profiles select —
          // see attachProfiles() for why.
          const prof = await fetchOneProfile(payload.new.user_id);
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, { ...payload.new, profiles: prof }];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(rtChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, userId]);

  const sendMessage = useCallback(
    async (content) => {
      const trimmed = (content || "").trim();
      if (!trimmed || !channelId || !userId || sending) return { ok: false };
      if (trimmed.length > 1000) return { ok: false, error: "Message is too long (max 1000 characters)." };
      setSending(true);
      const { data, error: err } = await supabase
        .from("community_messages")
        .insert({ channel_id: channelId, user_id: userId, content: trimmed })
        .select("id, channel_id, user_id, content, created_at, expires_at")
        .single();
      setSending(false);
      if (err) {
        const friendly = err.message?.includes("rate_limited")
          ? "You're sending messages too fast — take a breath and try again in a bit."
          : "Couldn't send that message. Try again.";
        return { ok: false, error: friendly };
      }
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, { ...data, profiles: { } }]));
      return { ok: true, data };
    },
    [channelId, userId, sending]
  );

  const deleteMessage = useCallback(async (id) => {
    const { error: err } = await supabase.from("community_messages").delete().eq("id", id);
    if (err) return { ok: false, error: "Couldn't delete that message." };
    setMessages((prev) => prev.filter((m) => m.id !== id));
    return { ok: true };
  }, []);

  return { messages, loading, error, sending, sendMessage, deleteMessage, hasMore, loadOlder, refetch: load };
}
