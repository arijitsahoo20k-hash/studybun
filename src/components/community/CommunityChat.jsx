import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Card, SectionTitle, EmptyState } from "../ui";
import ChatMessage from "./ChatMessage";
import ChatComposer from "./ChatComposer";
import ChannelSelector from "./ChannelSelector";

// Same-sender messages within this window are visually grouped (avatar
// and name shown once, bubbles pulled tighter) instead of repeating the
// header on every line — this is what actually fixes "cramped" at
// higher message volume: it's not smaller text, it's less repeated
// chrome per message.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

// How close to the bottom (px) counts as "still anchored to the latest
// message" for auto-scroll purposes.
const STICK_TO_BOTTOM_THRESHOLD_PX = 80;

function dateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

// Builds the render list: a date-separator entry whenever the calendar
// day changes, and `showMeta: false` on any message that immediately
// follows one from the same sender within GROUP_WINDOW_MS (a reply
// always keeps its own header, since it's referencing a different
// message and grouping it under someone else's name would be
// confusing).
function buildRenderItems(messages) {
  const items = [];
  let lastDay = null;
  let prev = null;
  for (const m of messages) {
    const day = new Date(m.created_at).toDateString();
    if (day !== lastDay) {
      items.push({ kind: "date", key: `date-${day}`, label: dateLabel(m.created_at) });
      lastDay = day;
      prev = null;
    }
    const sameSender = prev && prev.user_id === m.user_id;
    const withinWindow = prev && (new Date(m.created_at) - new Date(prev.created_at)) < GROUP_WINDOW_MS;
    const showMeta = !(sameSender && withinWindow && !m.reply_to_name);
    items.push({ kind: "msg", key: m.id, message: m, showMeta });
    prev = m;
  }
  return items;
}

export default function CommunityChat({
  channels, activeChannelId, onSelectChannel,
  messages, loading, sending, sendMessage, deleteMessage, hasMore, loadOlder,
  currentUserId, myProfile, isModerator, moderation, founderIds, memberIds, mascot,
}) {
  const [replyTo, setReplyTo] = useState(null); // { id, user_id, name, content } | null
  const [highlightedId, setHighlightedId] = useState(null);
  const listRef = useRef(null);
  const msgRefs = useRef({});
  const refCallbacks = useRef(new Map());
  const highlightTimeoutRef = useRef(null);

  // Whether the reader is currently anchored to the bottom of the list.
  // Kept up to date on scroll; read (not a dependency) whenever a new
  // message decides if it should pull the view down. Without this, a
  // message arriving while someone's scrolled up reading history yanks
  // them straight back to the bottom — exactly the kind of thing that
  // gets more disruptive, not less, the more people are chatting at once.
  const stickToBottomRef = useRef(true);

  // Set right before calling loadOlder() so the effect below can restore
  // the reader's scroll position instead of snapping to the bottom once
  // the older messages are prepended. Without this, "Load earlier
  // messages" immediately undoes itself: prepending grows messages.length,
  // which used to trigger scrollTop = scrollHeight every time.
  const pendingOlderLoadRef = useRef(null); // previous scrollHeight, or null

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < STICK_TO_BOTTOM_THRESHOLD_PX;
  }, []);

  const handleLoadOlder = useCallback(() => {
    const el = listRef.current;
    pendingOlderLoadRef.current = el ? el.scrollHeight : null;
    loadOlder();
  }, [loadOlder]);

  // Sending your own message should always take you to the bottom, even
  // if you'd scrolled up to read older messages before replying.
  const handleSendMessage = useCallback(
    async (text, reply) => {
      const res = await sendMessage(text, reply);
      if (res.ok) stickToBottomRef.current = true;
      return res;
    },
    [sendMessage]
  );

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (pendingOlderLoadRef.current != null) {
      el.scrollTop = el.scrollHeight - pendingOlderLoadRef.current;
      pendingOlderLoadRef.current = null;
      return;
    }
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Fresh channel: always open anchored to the latest messages, and
    // drop everything scoped to the previous channel (stale refs would
    // otherwise point at DOM nodes for messages that no longer exist in
    // this list).
    stickToBottomRef.current = true;
    pendingOlderLoadRef.current = null;
    msgRefs.current = {};
    refCallbacks.current = new Map();
    setReplyTo(null);
  }, [activeChannelId]);

  useEffect(() => {
    return () => window.clearTimeout(highlightTimeoutRef.current);
  }, []);

  // useCallback with a stable identity so ChatMessage's React.memo isn't
  // defeated by a new function reference on every parent render.
  const scrollToMessage = useCallback((id) => {
    const el = msgRefs.current[id];
    if (!el) return; // not currently loaded (e.g. older page) — no-op for v1
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    window.clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = window.setTimeout(() => setHighlightedId(null), 1200);
  }, []);

  const cancelReply = useCallback(() => setReplyTo(null), []);

  // Stable per-message ref callback. A fresh inline `(el) => {...}` on
  // every render made React re-invoke every message's ref callback (null,
  // then the node) any time the list re-rendered for an unrelated reason
  // — harmless, but unnecessary churn on every message whenever a new one
  // arrives. Caching one callback per id fixes that.
  const getRefCallback = useCallback((id) => {
    let fn = refCallbacks.current.get(id);
    if (!fn) {
      fn = (el) => { msgRefs.current[id] = el; };
      refCallbacks.current.set(id, fn);
    }
    return fn;
  }, []);

  const visible = useMemo(
    () => messages.filter((m) => !moderation.isBlocked(m.user_id)),
    [messages, moderation]
  );
  const renderItems = useMemo(() => buildRenderItems(visible), [visible]);

  // Passing `myProfile` itself down to every ChatMessage meant *any* field
  // on your own profile row changing (theme, streak-freeze tokens, none of
  // it chat-related) — see useDeviceRow's realtime UPDATE handler — handed
  // out a new object reference and defeated React.memo for the *entire*
  // visible list, not just your own messages, since memo does a shallow
  // compare across all props. Deriving primitives here means memo only
  // breaks when the name/mascot text actually changes.
  const myName = myProfile?.name || "You";
  const myMascotSpecies = myProfile?.mascot || "bunny";

  return (
    <Card washi className="sb-community-chat">
      <SectionTitle icon={MessageCircle}>Community Chat</SectionTitle>
      <ChannelSelector channels={channels} activeId={activeChannelId} onSelect={onSelectChannel} />

      <div className="sb-chat-list" ref={listRef} onScroll={handleScroll}>
        {hasMore && (
          <button type="button" className="sb-chat-load-older" onClick={handleLoadOlder}>Load earlier messages</button>
        )}
        {loading ? (
          <div className="sb-muted small" style={{ padding: 8 }}>Loading...</div>
        ) : visible.length === 0 ? (
          <EmptyState mascot={mascot} mood="idle" text="Start the conversation." sub="What are you studying today?" />
        ) : (
          renderItems.map((item) =>
            item.kind === "date" ? (
              <div key={item.key} className="sb-chat-date-sep"><span>{item.label}</span></div>
            ) : (
              <ChatMessage
                key={item.key}
                ref={getRefCallback(item.message.id)}
                message={item.message}
                showMeta={item.showMeta}
                isOwn={item.message.user_id === currentUserId}
                myName={myName}
                myMascotSpecies={myMascotSpecies}
                isModerator={isModerator}
                founderIds={founderIds}
                memberIds={memberIds}
                onDelete={deleteMessage}
                onReply={setReplyTo}
                onJumpToReply={scrollToMessage}
                highlighted={highlightedId === item.message.id}
              />
            )
          )
        )}
      </div>

      <ChatComposer
        channelId={activeChannelId}
        replyTo={replyTo}
        onCancelReply={cancelReply}
        sendMessage={handleSendMessage}
        sending={sending}
      />
    </Card>
  );
}
