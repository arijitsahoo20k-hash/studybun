import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { attachProfiles, fetchOneProfile, getCachedProfile } from "../lib/communityProfiles";

const PAGE_SIZE = 50;
const SELECT = "id, channel_id, user_id, content, created_at, expires_at, reply_to_id, reply_to_user_id, reply_to_name, reply_to_content";

// Inserts `msg` into `list` at the position its `created_at` belongs,
// instead of always appending. Realtime INSERT events render a message
// as soon as it arrives — before we've necessarily heard back about its
// sender's profile — so two messages sent a moment apart by different
// people can resolve in either order depending on network timing, not
// send order. Keeping the list sorted by `created_at` as items come in
// means the *render* order is always correct even when the *arrival*
// order isn't. `id` is deduped the same way the old plain-append code did.
function insertSorted(list, msg) {
  if (list.some((m) => m.id === msg.id)) return list;
  const t = new Date(msg.created_at).getTime();
  let idx = list.length;
  for (let i = list.length - 1; i >= 0; i--) {
    if (new Date(list[i].created_at).getTime() <= t) {
      idx = i + 1;
      break;
    }
    if (i === 0) idx = 0;
  }
  return [...list.slice(0, idx), msg, ...list.slice(idx)];
}

// Keeps the live message list bounded. A quick 5-person test never grows
// past a couple dozen messages, so this never mattered before — but 100
// people actively chatting over a real multi-hour session keeps adding to
// `messages` forever, and nothing ever removed anything. That has two
// costs that both get worse the longer the session runs, never better:
// every already-rendered message (Mascot SVG included) stays a live DOM
// node, and every *new* message triggers a handful of O(n) passes over
// the whole array (insertSorted's scan/copy, the moderation filter, the
// date/grouping pass) — cheap at 30 messages, not cheap at 3,000.
//
// Only trims once we're comfortably over the cap (not on every single
// message) so it doesn't repeatedly disturb anyone mid-session, only ever
// removes from the *oldest* end, and is only called from the two places
// the list grows *live* (a realtime INSERT, your own send) — never from
// loadOlder(), since trimming right after someone explicitly asked for
// more history would undo the very thing they just asked for.
const MAX_LOADED_MESSAGES = 400;
const TRIM_HIGH_WATER = 500;
function capMessages(list) {
  if (list.length <= TRIM_HIGH_WATER) return { list, trimmed: false };
  return { list: list.slice(list.length - MAX_LOADED_MESSAGES), trimmed: true };
}

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

  // Which channel is *currently* active, kept in sync the moment the
  // effect below switches — not just on true unmount. `mounted.current`
  // alone doesn't catch a channel switch: React runs the previous
  // effect's cleanup and the new effect's body in the same flush, so by
  // the time a stale Physics-channel `load()` call resumes after an
  // await, `mounted.current` is already back to `true` (set by the new
  // General-channel effect instance) and the guard silently passes. Any
  // async work below checks this ref, not just `mounted`, before writing
  // to state — so a slow response for a channel the user has since
  // switched away from can never overwrite what's currently on screen.
  const activeChannelIdRef = useRef(channelId);

  // Set (synchronously, inside a setMessages updater) whenever capMessages
  // above actually trims something. Read back in the effect right below —
  // trimming always means there's provably more history before the new
  // earliest message (we just removed it from state, not from Postgres),
  // so "Load earlier messages" needs to be able to reappear even if it had
  // already been exhausted earlier in the session.
  const trimmedRef = useRef(false);

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
    if (!mounted.current || activeChannelIdRef.current !== channelId) return; // stale — a newer load owns state now
    if (err) {
      setError(err);
    } else {
      setError(null);
      const withProfiles = await attachProfiles((data || []).slice().reverse());
      if (!mounted.current || activeChannelIdRef.current !== channelId) return;
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
    if (activeChannelIdRef.current !== channelId) return; // switched channels mid-fetch
    if (err) { setError(err); return; }
    const older = await attachProfiles((data || []).slice().reverse());
    if (activeChannelIdRef.current !== channelId) return;
    setHasMore((data || []).length === PAGE_SIZE);
    setMessages((prev) => {
      const existing = new Set(prev.map((m) => m.id));
      return [...older.filter((m) => !existing.has(m.id)), ...prev];
    });
  }, [channelId, messages]);

  useEffect(() => {
    if (trimmedRef.current) {
      trimmedRef.current = false;
      setHasMore(true);
    }
  }, [messages]);

  useEffect(() => {
    mounted.current = true;
    activeChannelIdRef.current = channelId; // synchronous, before load()'s await starts
    load();

    if (!channelId || !userId) return () => { mounted.current = false; };

    const rtChannel = supabase
      .channel(`rt:community_messages:${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages", filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          if (activeChannelIdRef.current !== channelId) return; // subscription cleanup hasn't landed yet
          const newMsg = payload.new;
          // Show the message right away using whatever's already cached
          // for its sender (possibly nothing) instead of waiting on a
          // profile round-trip first — see insertSorted() above for why
          // that wait was causing out-of-order rendering.
          const cachedProfile = getCachedProfile(newMsg.user_id);
          setMessages((prev) => {
            const { list, trimmed } = capMessages(insertSorted(prev, { ...newMsg, profiles: cachedProfile }));
            if (trimmed) trimmedRef.current = true;
            return list;
          });
          // In a busy 100-person channel most senders are already cached
          // (someone else in the room has posted before, or we have).
          // Awaiting fetchOneProfile even when it resolves instantly still
          // costs a microtask + a second setMessages/re-render of the
          // whole list per message — skip both entirely once we already
          // have everything this message needs.
          if (cachedProfile) return;
          const prof = await fetchOneProfile(newMsg.user_id);
          if (activeChannelIdRef.current !== channelId) return;
          setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, profiles: prof } : m)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          if (activeChannelIdRef.current !== channelId) return;
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "community_messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          // Fires when the scrub_reply_snapshot() trigger nulls out
          // reply_to_id/reply_to_content on rows that quoted a message
          // which just got deleted (self-delete, mod delete, or the
          // 5-day expiry cron) — flips the quote to "Message removed"
          // live, on every connected client.
          if (activeChannelIdRef.current !== channelId) return;
          setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)));
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
    async (content, replyTo) => {
      const trimmed = (content || "").trim();
      if (!trimmed || !channelId || !userId || sending) return { ok: false };
      if (trimmed.length > 1000) return { ok: false, error: "Message is too long (max 1000 characters)." };
      setSending(true);
      const { data, error: err } = await supabase
        .from("community_messages")
        .insert({
          channel_id: channelId,
          user_id: userId,
          content: trimmed,
          reply_to_id: replyTo?.id ?? null,
          reply_to_user_id: replyTo?.user_id ?? null,
          reply_to_name: replyTo?.name ?? null,
          reply_to_content: replyTo?.content ?? null,
        })
        .select("id, channel_id, user_id, content, created_at, expires_at, reply_to_id, reply_to_user_id, reply_to_name, reply_to_content")
        .single();
      setSending(false);
      if (err) {
        const friendly = err.message?.includes("rate_limited")
          ? "You're sending messages too fast — take a breath and try again in a bit."
          : err.message?.includes("invalid_reply")
          ? "That message isn't available to reply to anymore."
          : "Couldn't send that message. Try again.";
        return { ok: false, error: friendly };
      }
      // The insert always went to the right place in Postgres (`channelId`
      // was captured in this call's own closure) — but if the user
      // switched to a different channel while this await was in flight,
      // `messages` here now belongs to *that* channel, not the one this
      // message was sent to. Without this guard the message you just sent
      // to Physics could get spliced into whatever channel happens to be
      // on screen by the time the insert resolves. It'll still show up
      // correctly the moment they switch back — that channel's own
      // realtime subscription (or its next load()) will pick it up.
      if (activeChannelIdRef.current === channelId) {
        setMessages((prev) => {
          const { list, trimmed } = capMessages(insertSorted(prev, { ...data, profiles: getCachedProfile(userId) }));
          if (trimmed) trimmedRef.current = true;
          return list;
        });
      }
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
