import React, { forwardRef, memo, useState } from "react";
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
//
// Wrapped in React.memo: in a busy channel, new messages arriving (or
// the composer's draft changing) used to re-render every message
// already on screen, including each one's Mascot SVG avatar. memo()
// keeps a message's render fixed once it's on screen — it only
// re-renders if its own props (e.g. `highlighted` flipping) change.
const ChatMessage = memo(forwardRef(function ChatMessage(
  { message, isOwn, myName, myMascotSpecies, isModerator, founderIds, memberIds, onDelete, onReply, onJumpToReply, highlighted, showMeta = true },
  ref
) {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = isOwn ? (myName || "You") : (message.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myMascotSpecies || "bunny") : (message.profiles?.mascot || "bunny");
  const canDelete = isOwn || isModerator;
  const isReply = !!message.reply_to_name;
  const time = formatTime(message.created_at);

  const handleReply = () => {
    setMenuOpen(false);
    onReply({ id: message.id, user_id: message.user_id, name, content: message.content });
  };

  // Reverted the fixed-position/getBoundingClientRect approach from the
  // last redesign — it was meant to dodge scroll-container clipping, but
  // it kept mispositioning the menu (see the two bug reports before this
  // one: full-width stretch, then landing far from the trigger). A plain
  // relative dropdown is what the old file had, and it's what's reliable:
  // the menu is a normal absolutely-positioned child of the trigger's own
  // wrapper, so it always opens right where the trigger actually is and
  // scrolls together with the message. The one known tradeoff (also true
  // of the old file) is that opening it on a message right at the bottom
  // edge of the scrollable message list can clip the dropdown against
  // that edge — acceptable, and far better than teleporting elsewhere.

  return (
    <div ref={ref} className={`sb-chat-msg ${isOwn ? "own" : ""} ${highlighted ? "highlight" : ""} ${showMeta ? "" : "grouped"}`}>
      <div className="sb-chat-msg-avatar">
        {showMeta && <Mascot species={mascotSpecies} mood="happy" size={26} ambient={false} />}
      </div>
      <div className="sb-chat-msg-body">
        {showMeta && (
          <div className="sb-chat-msg-meta">
            <span className="sb-chat-msg-name">{name}<PersonBadge founderIds={founderIds} memberIds={memberIds} userId={message.user_id} /></span>
            <span className="sb-chat-msg-time">{time}</span>
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
        )}

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

        <div className="sb-chat-bubble-wrap">
          {/* title carries the timestamp even when showMeta is false (grouped
              messages), so it's still available on hover instead of being
              completely lost for anything but the first message in a group. */}
          <div className="sb-chat-msg-content" title={showMeta ? undefined : time}>{message.content}</div>
        </div>
      </div>
    </div>
  );
}));

export default ChatMessage;
