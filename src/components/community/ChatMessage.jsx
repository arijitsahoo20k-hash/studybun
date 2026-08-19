import React, { forwardRef, useState } from "react";
import { MoreHorizontal, Reply as ReplyIcon, Trash2 } from "lucide-react";
import Mascot from "../Mascot";
import { PersonBadge } from "../ui";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Report and Block were removed from chat messages entirely (not just
// hidden) — this component still doesn't take onReport/onBlock props.
// They're still available on feed posts (see CommunityPost.jsx), which
// is a separate use of the shared ContentActions component. Delete now
// lives inside the same ⋯ menu as Reply, instead of a standalone button.
const ChatMessage = forwardRef(function ChatMessage(
  { message, isOwn, myProfile, isModerator, founderIds, memberIds, onDelete, onReply, onJumpToReply, highlighted },
  ref
) {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = isOwn ? (myProfile?.name || "You") : (message.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myProfile?.mascot || "bunny") : (message.profiles?.mascot || "bunny");
  const canDelete = isOwn || isModerator;
  const isReply = !!message.reply_to_name;

  const handleReply = () => {
    setMenuOpen(false);
    onReply({ id: message.id, user_id: message.user_id, name, content: message.content });
  };

  return (
    <div ref={ref} className={`sb-chat-msg ${isOwn ? "own" : ""} ${highlighted ? "highlight" : ""}`}>
      <div className="sb-chat-msg-avatar"><Mascot species={mascotSpecies} mood="happy" size={26} ambient={false} /></div>
      <div className="sb-chat-msg-body">
        <div className="sb-chat-msg-meta">
          <span className="sb-chat-msg-name">{name}<PersonBadge founderIds={founderIds} memberIds={memberIds} userId={message.user_id} /></span>
          <span className="sb-chat-msg-time">{formatTime(message.created_at)}</span>
          <div className="sb-cm-actions">
            <button type="button" className="sb-cm-actions-trigger" onClick={() => setMenuOpen((v) => !v)} aria-label="Message actions">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="sb-cm-actions-menu" role="menu">
                <button type="button" role="menuitem" onClick={handleReply}>
                  <ReplyIcon size={13} /> Reply
                </button>
                {canDelete && (
                  <button type="button" role="menuitem" className="danger" onClick={() => { setMenuOpen(false); onDelete(message.id); }}>
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            )}
            {menuOpen && <div className="sb-cm-actions-backdrop" onClick={() => setMenuOpen(false)} />}
          </div>
        </div>

        {isReply && (
          <button
            type="button"
            className="sb-chat-reply-quote"
            onClick={() => message.reply_to_id && onJumpToReply(message.reply_to_id)}
          >
            <span className="sb-chat-reply-quote-name">{message.reply_to_name}</span>
            <span className="sb-chat-reply-quote-text">
              {message.reply_to_content || "Message removed"}
            </span>
          </button>
        )}

        <div className="sb-chat-msg-content">{message.content}</div>
      </div>
    </div>
  );
});

export default ChatMessage;
