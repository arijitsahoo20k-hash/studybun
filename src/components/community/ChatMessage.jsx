import React, { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import { Reply as ReplyIcon, Trash2 } from "lucide-react";
import Mascot from "../Mascot";
import { PersonBadge } from "../ui";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Report and Block were removed from chat messages entirely (not just
// hidden) — this component still doesn't take onReport/onBlock props.
// They're still available on feed posts (see CommunityPost.jsx), which
// is a separate use of the shared ContentActions component.
//
// Reply/Delete used to live behind a "⋯" trigger inside the meta row —
// which only renders on the first message of a grouped run, so grouped
// messages had no way to reply at all. Fixed by giving every message its
// own small actions strip next to the bubble (see .sb-chat-msg-actions in
// CommunityStyle.jsx) instead of a dropdown tucked into a header that not
// every message has:
//  - Desktop: plain CSS :hover on the row reveals it. No JS involved.
//  - Touch (no real hover): tapping the row toggles `active`, which the
//    same CSS also treats as "revealed". Tapping anywhere else closes it
//    again via a document-level pointerdown listener that checks whether
//    the tap landed outside this message's own DOM node.
// That listener — not a full-viewport backdrop — is the deliberate choice
// here: an earlier version used an invisible fixed-position backdrop (the
// same pattern this app's old "⋯" dropdown used) to catch outside taps,
// but on a real desktop that backdrop opened on every plain click (not
// just hover) and then sat there swallowing the *next* click anywhere
// else in the app — composer, another message, "load earlier" — until it
// was dismissed. A passive listener that only *reacts* to outside clicks,
// instead of an overlay that *intercepts* them, can't cause that: it
// never consumes the click, it just notices it happened elsewhere.
//
// Wrapped in React.memo: in a busy channel, new messages arriving (or
// the composer's draft changing) used to re-render every message
// already on screen, including each one's Mascot SVG avatar. memo()
// keeps a message's render fixed once it's on screen — it only
// re-renders if its own props (e.g. `highlighted` flipping) change.
const ChatMessage = memo(forwardRef(function ChatMessage(
  { message, isOwn, myName, myMascotSpecies, isModerator, founderIds, memberIds, onDelete, onReply, onJumpToReply, highlighted, showMeta = true },
  forwardedRef
) {
  const [active, setActive] = useState(false);
  const rootRef = useRef(null);
  const name = isOwn ? (myName || "You") : (message.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myMascotSpecies || "bunny") : (message.profiles?.mascot || "bunny");
  const canDelete = isOwn || isModerator;
  const isReply = !!message.reply_to_name;
  const time = formatTime(message.created_at);

  // The parent (CommunityChat) tracks message DOM nodes itself via a
  // callback ref, for scroll-to-reply — it has no way to hand that node
  // back to us. We need our own handle on the same node (to know what
  // counts as "inside" for the outside-click check below), so this sets
  // both: our own ref, and whatever the parent passed in, whichever form
  // it takes.
  const setRefs = useCallback((el) => {
    rootRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  }, [forwardedRef]);

  useEffect(() => {
    if (!active) return undefined;
    const handlePointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setActive(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [active]);

  // Tap-to-reveal for touch. A tap anywhere on the row toggles the strip;
  // taps on the reply quote or the action buttons themselves stop here
  // first so they don't also fire this (they have their own job to do).
  const toggleActive = useCallback(() => setActive((v) => !v), []);

  const handleReply = useCallback((e) => {
    e.stopPropagation();
    setActive(false);
    onReply({ id: message.id, user_id: message.user_id, name, content: message.content });
  }, [message.id, message.user_id, message.content, name, onReply]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    setActive(false);
    onDelete(message.id);
  }, [message.id, onDelete]);

  const handleReplyQuoteClick = useCallback((e) => {
    e.stopPropagation();
    if (message.reply_to_id) onJumpToReply(message.reply_to_id);
  }, [message.reply_to_id, onJumpToReply]);

  return (
    <div
      ref={setRefs}
      className={`sb-chat-msg ${isOwn ? "own" : ""} ${highlighted ? "highlight" : ""} ${showMeta ? "" : "grouped"} ${active ? "active" : ""}`}
      onClick={toggleActive}
    >
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
            onClick={handleReplyQuoteClick}
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

      <div className="sb-chat-msg-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sb-chat-msg-action-btn" onClick={handleReply} aria-label="Reply">
          <ReplyIcon size={13} />
        </button>
        {canDelete && (
          <button type="button" className="sb-chat-msg-action-btn danger" onClick={handleDelete} aria-label="Delete">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}));

export default ChatMessage;
