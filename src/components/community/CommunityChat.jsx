import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Card, SectionTitle, EmptyState } from "../ui";
import ChatMessage from "./ChatMessage";
import ChannelSelector from "./ChannelSelector";

const MAX_LEN = 1000;
const TEXTAREA_MAX_HEIGHT = 140;

export default function CommunityChat({
  channels, activeChannelId, onSelectChannel,
  messages, loading, sending, sendMessage, deleteMessage, hasMore, loadOlder,
  currentUserId, myProfile, isModerator, moderation, founderIds, mascot,
}) {
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, activeChannelId]);

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
    const res = await sendMessage(text);
    submittingRef.current = false;
    if (res.ok) setDraft("");
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
              message={m}
              isOwn={m.user_id === currentUserId}
              myProfile={myProfile}
              isModerator={isModerator}
              founderIds={founderIds}
              onDelete={deleteMessage}
            />
          ))
        )}
      </div>

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
