import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Card, SectionTitle, EmptyState } from "../ui";
import ChatMessage from "./ChatMessage";
import ChannelSelector from "./ChannelSelector";

const MAX_LEN = 1000;
const TEXTAREA_MAX_HEIGHT = 140;

export default function CommunityChat({
  channels, activeChannelId, onSelectChannel,
  messages, loading, sending, sendMessage, deleteMessage, hasMore, loadOlder,
  currentUserId, myProfile, isModerator, moderation, founderIds, memberIds, mascot,
}) {
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState(null);
  const [replyTo, setReplyTo] = useState(null); // { id, user_id, name, content } | null
  const [highlightedId, setHighlightedId] = useState(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const submittingRef = useRef(false);
  const msgRefs = useRef({});
  const highlightTimeoutRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, activeChannelId]);

  useEffect(() => {
    msgRefs.current = {};
    setReplyTo(null);
  }, [activeChannelId]);

  useEffect(() => {
    return () => window.clearTimeout(highlightTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  const scrollToMessage = (id) => {
    const el = msgRefs.current[id];
    if (!el) return; // not currently loaded (e.g. older page) — no-op for v1
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    window.clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = window.setTimeout(() => setHighlightedId(null), 1200);
  };

  // Auto-grow the textarea with content instead of staying a fixed
  // 2-row box — it now behaves like a real chat input (grows up to ~5
  // lines, then scrolls internally) rather than looking untouched next
  // to the bigger card around it.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [draft]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return; // guard against double-submit / double-click spam
    const text = draft.trim();
    if (!text) return;
    submittingRef.current = true;
    setErr(null);
    const res = await sendMessage(text, replyTo);
    submittingRef.current = false;
    if (res.ok) { setDraft(""); setReplyTo(null); }
    else setErr(res.error || "Couldn't send that.");
  };

  const visible = messages.filter((m) => !moderation.isBlocked(m.user_id));
  const nearLimit = draft.length > MAX_LEN * 0.85;

  return (
    <Card washi className="sb-community-chat">
      <SectionTitle icon={MessageCircle}>Community Chat</SectionTitle>
      <ChannelSelector channels={channels} activeId={activeChannelId} onSelect={onSelectChannel} />

      <div className="sb-chat-list" ref={listRef}>
        {hasMore && (
          <button type="button" className="sb-chat-load-older" onClick={loadOlder}>Load earlier messages</button>
        )}
        {loading ? (
          <div className="sb-muted small" style={{ padding: 8 }}>Loading...</div>
        ) : visible.length === 0 ? (
          <EmptyState mascot={mascot} mood="idle" text="Start the conversation." sub="What are you studying today?" />
        ) : (
          visible.map((m) => (
            <ChatMessage
              key={m.id}
              ref={(el) => { msgRefs.current[m.id] = el; }}
              message={m}
              isOwn={m.user_id === currentUserId}
              myProfile={myProfile}
              isModerator={isModerator}
              founderIds={founderIds}
              memberIds={memberIds}
              onDelete={deleteMessage}
              onReply={setReplyTo}
              onJumpToReply={scrollToMessage}
              highlighted={highlightedId === m.id}
            />
          ))
        )}
      </div>

      {replyTo && (
        <div className="sb-chat-reply-bar">
          <div className="sb-chat-reply-bar-info">
            <span className="sb-chat-reply-bar-name">Replying to {replyTo.name}</span>
            <span className="sb-chat-reply-bar-text">{replyTo.content}</span>
          </div>
          <button type="button" className="sb-chat-reply-bar-cancel" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
            <X size={16} />
          </button>
        </div>
      )}
      <form className="sb-chat-composer" onSubmit={handleSend}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
          placeholder="Say something to your study group..."
          maxLength={MAX_LEN}
          rows={1}
        />
        <button type="submit" disabled={sending || !draft.trim()} aria-label="Send message">
          <Send size={18} />
        </button>
      </form>
      <div className="sb-chat-composer-foot">
        <span className="sb-chat-hint"><kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line</span>
        {draft.length > 0 && (
          <span className={`sb-chat-counter ${nearLimit ? "warn" : ""}`}>{draft.length}/{MAX_LEN}</span>
        )}
      </div>
      {err && <p className="sb-cm-error">{err}</p>}
      <p className="sb-muted small sb-chat-expiry-note">Messages disappear after 5 days.</p>
    </Card>
  );
}
