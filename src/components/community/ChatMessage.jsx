import React, { forwardRef, memo, useEffect, useRef, useState } from "react";
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
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const name = isOwn ? (myName || "You") : (message.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myMascotSpecies || "bunny") : (message.profiles?.mascot || "bunny");
  const canDelete = isOwn || isModerator;
  const isReply = !!message.reply_to_name;
  const time = formatTime(message.created_at);

  const handleReply = () => {
    setMenuOpen(false);
    onReply({ id: message.id, user_id: message.user_id, name, content: message.content });
  };

  // The chat list scrolls (`overflow-y: auto` on `.sb-chat-list`), and the
  // actions menu used to be positioned absolute *inside* it — which meant
  // opening it on a message near the bottom of the visible scroll area
  // clipped the dropdown against that boundary, with no way to scroll to
  // reveal the clipped part (an absolutely-positioned popup doesn't add to
  // its scroll ancestor's scrollable height). That hit exactly the
  // messages people interact with most — the newest ones — and more often
  // the busier the channel. Computing fixed viewport coordinates from the
  // trigger button's own position sidesteps the scroll-container clipping
  // entirely, and flips the menu upward/leftward when it would otherwise
  // run off the edge of the screen.
  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const MENU_HEIGHT_ESTIMATE = 100;
      const openUp = rect.bottom + MENU_HEIGHT_ESTIMATE + 8 > window.innerHeight;
      const alignRight = rect.left > window.innerWidth / 2;
      // Every one of these four must be set explicitly (never left
      // `undefined`) — an omitted key doesn't reset the CSS class's own
      // top:100%/right:0 defaults, it just leaves them active alongside
      // whichever edge we DID set here. That combination is what stretched
      // the menu into a full-width bar instead of a small dropdown.
      setMenuStyle({
        position: "fixed",
        top: openUp ? "auto" : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : "auto",
        left: alignRight ? "auto" : rect.left,
        right: alignRight ? window.innerWidth - rect.right : "auto",
      });
    }
    setMenuOpen(true);
  };

  // Scrolling the chat list (or resizing the window) moves the message
  // out from under a fixed-position menu that isn't scroll-anchored to
  // it — close it rather than leave a stale dropdown floating in place.
  // Scroll events don't bubble, but a capture-phase listener on window
  // still fires for them regardless of where in the DOM they originate.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menuOpen]);

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
          <div className="sb-cm-actions">
            <button ref={triggerRef} type="button" className="sb-cm-actions-trigger" onClick={toggleMenu} aria-label="Message actions">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="sb-cm-actions-menu" role="menu" style={menuStyle || undefined}>
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
      </div>
    </div>
  );
}));

export default ChatMessage;
