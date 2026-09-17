import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Lock } from "lucide-react";
import { Card, SectionTitle, EmptyState } from "../ui";
import ChatMessage from "./ChatMessage";
import ChatComposer from "./ChatComposer";
import ChannelSelector from "./ChannelSelector";
import ChannelLockToggle from "./ChannelLockToggle";
import ConfirmDialog from "./private/ConfirmDialog";
import MessageInfoModal from "./MessageInfoModal";

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
  channels, activeChannelId, onSelectChannel, setChannelLock,
  messages, loading, sending, sendMessage, deleteMessage, hasMore, loadOlder, markChannelRead,
  currentUserId, myProfile, moderation, founderIds, memberIds, mascot,
}) {
  // NOTE: the old `isModerator` prop is gone — "can I delete this" is now
  // a per-author question (a mod may not delete a founder's message), so
  // it's answered per message via moderation.canDelete(authorId) at the
  // ChatMessage call site below.
  const [replyTo, setReplyTo] = useState(null); // { id, user_id, name, content } | null
  const [highlightedId, setHighlightedId] = useState(null);
  // Message the "seen by" popup is currently showing — the full message
  // object (not just an id) since MessageInfoModal needs its created_at
  // and content/image_url for the preview line, and holding it here means
  // the popup keeps showing that content even if the message list
  // reorders underneath it.
  const [infoMessage, setInfoMessage] = useState(null);
  // Pending delete now goes through a confirm step instead of firing the
  // instant the trash icon is tapped — mirrors private chat's
  // requestDelete/confirmDelete split (see PrivateChatWindow.jsx). Holds
  // just the id; ChatMessage still calls onDelete(id) exactly as before,
  // this only intercepts what that callback does with it.
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
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

  // BUG FIX: id of a reply-jump target that wasn't in the currently
  // loaded page when scrollToMessage() was called. Only the most recent
  // PAGE_SIZE messages are loaded up front (see useCommunityChat) — so
  // tapping a reply quote that points further back than that "worked
  // sometimes" purely by luck of how much history happened to be loaded
  // already, and silently did nothing the rest of the time. The effect
  // below keeps calling loadOlder() while this is set, until the target
  // shows up in msgRefs (then it jumps) or hasMore runs out (then it
  // gives up — the message was deleted, or belongs to a blocked sender
  // filtered out of `visible`).
  const pendingJumpIdRef = useRef(null);

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
  // imageFile is the optional File object from ChatComposer — forwarded
  // straight through to useCommunityChat's sendMessage which handles upload.
  const handleSendMessage = useCallback(
    async (text, reply, imageFile) => {
      const res = await sendMessage(text, reply, imageFile);
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
    pendingJumpIdRef.current = null;
    msgRefs.current = {};
    refCallbacks.current = new Map();
    setReplyTo(null);
    setInfoMessage(null);
    setPendingDeleteId(null);
    setDeleteError(null);
  }, [activeChannelId]);

  useEffect(() => {
    return () => window.clearTimeout(highlightTimeoutRef.current);
  }, []);

  // Actually performs the scroll + highlight once the target is known to
  // be rendered. Split out so both the direct-hit path in scrollToMessage
  // and the "found it after loading more" path in the retry effect below
  // share the exact same behavior.
  //
  // BUG FIX (layout-dependent jump): this used to call el.scrollIntoView()
  // directly. scrollIntoView() walks *every* scrollable ancestor to bring
  // the target into view — not just .sb-chat-list. So whether the jump
  // "worked" also depended on where the Community Chat card itself
  // happened to sit in the surrounding page: if the card wasn't already
  // fully in view within .sb-main's own scroll (e.g. on a layout/breakpoint
  // where the card sits lower on the page, or the page was scrolled),
  // scrollIntoView would also drag the *outer page* scroll around trying
  // to satisfy block:"center", on top of (or sometimes instead of) the
  // inner list actually centering the message — a different, extra
  // failure mode from the pagination one already fixed. Computing the
  // scroll offset against our own list container via getBoundingClientRect
  // and calling container.scrollTo() keeps this 100% local to
  // .sb-chat-list, so it behaves identically no matter what page layout
  // or breakpoint it's sitting in.
  const jumpToLoadedMessage = useCallback((id) => {
    const el = msgRefs.current[id];
    const container = listRef.current;
    if (!el || !container) return false;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offsetWithinContainer = elRect.top - containerRect.top + container.scrollTop;
    const target = offsetWithinContainer - container.clientHeight / 2 + el.clientHeight / 2;
    const maxScroll = container.scrollHeight - container.clientHeight;
    container.scrollTo({ top: Math.max(0, Math.min(target, maxScroll)), behavior: "smooth" });
    setHighlightedId(id);
    window.clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = window.setTimeout(() => setHighlightedId(null), 1200);
    return true;
  }, []);

  // useCallback with a stable identity so ChatMessage's React.memo isn't
  // defeated by a new function reference on every parent render.
  const scrollToMessage = useCallback((id) => {
    if (jumpToLoadedMessage(id)) return;
    // Not currently loaded — most likely an older message than the
    // current page covers. Keep paging back until it turns up, instead
    // of giving up on the first miss.
    if (hasMore) {
      pendingJumpIdRef.current = id;
      handleLoadOlder();
    }
  }, [jumpToLoadedMessage, hasMore, handleLoadOlder]);

  // Resolves a pending jump once loadOlder() brings in a fresh page:
  // if the target is now rendered, jump to it; if it's still missing and
  // there's more history, keep paging back; otherwise give up quietly.
  useEffect(() => {
    const id = pendingJumpIdRef.current;
    if (!id) return;
    if (jumpToLoadedMessage(id)) {
      pendingJumpIdRef.current = null;
    } else if (hasMore) {
      handleLoadOlder();
    } else {
      pendingJumpIdRef.current = null;
    }
  }, [messages, hasMore, handleLoadOlder, jumpToLoadedMessage]);

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

  // Mark the channel read whenever it's open and has messages on screen —
  // covers both "just switched into this channel" and "a new message
  // arrived while it's open". markChannelRead itself throttles the actual
  // network write (see useCommunityChat), so this firing on every message
  // list change is cheap, not a write per message.
  useEffect(() => {
    if (!markChannelRead || visible.length === 0) return;
    markChannelRead();
  }, [activeChannelId, visible.length, markChannelRead]);

  // ChatMessage fires onDelete(id)/onShowInfo(message) the instant its
  // icon is tapped — requestDelete just intercepts what that does (same
  // split as PrivateChatWindow's requestDelete/confirmDelete) so a tap
  // opens a confirmation instead of deleting immediately.
  const requestDelete = useCallback((id) => {
    setDeleteError(null);
    setPendingDeleteId(id);
  }, []);
  const confirmDelete = useCallback(async () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    if (!id) return;
    const res = await deleteMessage(id);
    setDeleteError(res.ok ? null : (res.error || "Couldn't delete that message."));
  }, [pendingDeleteId, deleteMessage]);

  // Passing `myProfile` itself down to every ChatMessage meant *any* field
  // on your own profile row changing (theme, streak-freeze tokens, none of
  // it chat-related) — see useDeviceRow's realtime UPDATE handler — handed
  // out a new object reference and defeated React.memo for the *entire*
  // visible list, not just your own messages, since memo does a shallow
  // compare across all props. Deriving primitives here means memo only
  // breaks when the name/mascot text actually changes.
  const myName = myProfile?.name || "You";
  const myMascotSpecies = myProfile?.mascot || "bunny";

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );
  const isChannelLocked = !!activeChannel?.is_locked;

  // Stable identity so ChannelLockToggle's internal pending/error state
  // isn't reset by a fresh function reference on every parent render.
  const handleToggleLock = useCallback(
    (nextLocked) => setChannelLock(activeChannelId, nextLocked),
    [setChannelLock, activeChannelId]
  );

  return (
    <Card washi className="sb-community-chat">
      <SectionTitle
        icon={MessageCircle}
        right={
          moderation.isChannelLockAdmin && activeChannel ? (
            <ChannelLockToggle
              key={activeChannel.id}
              channelName={activeChannel.name}
              locked={isChannelLocked}
              onToggle={handleToggleLock}
            />
          ) : null
        }
      >
        Community Chat
      </SectionTitle>
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
                canDelete={moderation.canDelete(item.message.user_id)}
                founderIds={founderIds}
                memberIds={memberIds}
                onDelete={requestDelete}
                onReply={setReplyTo}
                onJumpToReply={scrollToMessage}
                onShowInfo={setInfoMessage}
                highlighted={highlightedId === item.message.id}
              />
            )
          )
        )}
      </div>

      {deleteError && <div className="sb-chat-delete-err">{deleteError}</div>}

      {isChannelLocked ? (
        // Replaces the composer entirely — for EVERYONE, including the
        // person who closed it. No half-measures like a disabled input;
        // a closed channel shouldn't even look like typing is an option.
        <div className="sb-channel-closed-banner" role="status">
          <Lock size={16} aria-hidden="true" />
          <span>This channel is closed right now — no new messages.</span>
        </div>
      ) : (
        <ChatComposer
          channelId={activeChannelId}
          replyTo={replyTo}
          onCancelReply={cancelReply}
          sendMessage={handleSendMessage}
          sending={sending}
        />
      )}

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Delete this message?"
        body="This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <MessageInfoModal
        open={!!infoMessage}
        channelId={activeChannelId}
        message={infoMessage}
        onClose={() => setInfoMessage(null)}
      />
    </Card>
  );
}
