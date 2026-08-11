import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Card, SectionTitle, EmptyState } from "../ui";
import ChatMessage from "./ChatMessage";
import ChannelSelector from "./ChannelSelector";

const MAX_LEN = 1000;

export default function CommunityChat({
  channels, activeChannelId, onSelectChannel,
  messages, loading, sending, sendMessage, deleteMessage, hasMore, loadOlder,
  currentUserId, myProfile, isModerator, moderation, mascot,
}) {
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState(null);
  const listRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, activeChannelId]);

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
              currentUserId={currentUserId}
              isModerator={isModerator}
              onReport={moderation.report}
              onBlock={moderation.blockUser}
              onDelete={deleteMessage}
            />
          ))
        )}
      </div>

      <form className="sb-chat-composer" onSubmit={handleSend}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
          placeholder="Say something to your study group..."
          maxLength={MAX_LEN}
          rows={2}
        />
        <button type="submit" disabled={sending || !draft.trim()} aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
      {err && <p className="sb-cm-error">{err}</p>}
      <p className="sb-muted small sb-chat-expiry-note">Messages disappear after 5 days.</p>
    </Card>
  );
}
