import React, { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import { Reply as ReplyIcon, Trash2 } from "lucide-react";
import Mascot from "../Mascot";
import { PersonBadge } from "../ui";
import ImageLightbox from "./ImageLightbox";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// ChatMessage is wrapped in React.memo: in a busy channel, new messages
// arriving (or the composer's draft changing) used to re-render every message
// already on screen, including each one's Mascot SVG avatar. memo() keeps a
// message's render fixed once it's on screen — it only re-renders if its own
// props (e.g. `highlighted` flipping) change.
const ChatMessage = memo(forwardRef(function ChatMessage(
  { message, isOwn, myName, myMascotSpecies, isModerator, founderIds, memberIds, onDelete, onReply, onJumpToReply, highlighted, showMeta = true },
  forwardedRef
) {
  const [active, setActive] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const rootRef = useRef(null);

  const name = isOwn ? (myName || "You") : (message.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myMascotSpecies || "bunny") : (message.profiles?.mascot || "bunny");
  const canDelete = isOwn || isModerator;
  const isReply = !!message.reply_to_name;
  const time = formatTime(message.created_at);

  const hasImage = Boolean(message.image_url);
  const hasText = Boolean(message.content?.trim());

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

  const toggleActive = useCallback(() => setActive((v) => !v), []);

  const handleReply = useCallback((e) => {
    e.stopPropagation();
    setActive(false);
    // For image-only messages, use a placeholder content description for the
    // reply bar so it reads as "Replying to [Name] · 📷 Photo" not an empty string
    const replyContent = hasText ? message.content : "📷 Photo";
    onReply({ id: message.id, user_id: message.user_id, name, content: replyContent });
  }, [message.id, message.user_id, message.content, hasText, name, onReply]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    setActive(false);
    onDelete(message.id);
  }, [message.id, onDelete]);

  const handleReplyQuoteClick = useCallback((e) => {
    e.stopPropagation();
    if (message.reply_to_id) onJumpToReply(message.reply_to_id);
  }, [message.reply_to_id, onJumpToReply]);

  const handleImageClick = useCallback((e) => {
    e.stopPropagation();
    if (!imgError) setLightboxOpen(true);
  }, [imgError]);

  return (
    <>
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
              <span className="sb-chat-msg-name">
                {name}
                <PersonBadge founderIds={founderIds} memberIds={memberIds} userId={message.user_id} />
              </span>
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

          <div className={`sb-chat-bubble-wrap${hasImage ? " has-image" : ""}`}>
            {/* ── Image bubble (WhatsApp/TG style) ──────────────────────────
                Renders above the text caption (if any).
                • Tapping opens ImageLightbox.
                • On error: shows a muted broken-image placeholder.
                • Uses object-fit:cover inside a fixed aspect-ratio container
                  so portrait/landscape images never blow up the layout.
                  Max width is constrained by .sb-chat-msg-body's max-width. */}
            {hasImage && (
              <button
                type="button"
                className={`sb-chat-img-bubble ${imgError ? "sb-chat-img-bubble--error" : ""} ${!hasText ? "sb-chat-img-bubble--solo" : ""}`}
                onClick={handleImageClick}
                aria-label="View photo"
                title={showMeta ? undefined : time}
              >
                {!imgError ? (
                  <img
                    src={message.image_url}
                    alt="Shared photo"
                    className="sb-chat-img-bubble-img"
                    onError={() => setImgError(true)}
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <span className="sb-chat-img-bubble-broken">📷 Image unavailable</span>
                )}
              </button>
            )}

            {/* Text content — shown as caption below image, or as the full bubble */}
            {hasText && (
              <div className="sb-chat-msg-content" title={showMeta ? undefined : time}>
                {message.content}
              </div>
            )}

            {/* If image-only (no text), still render a minimal invisible spacer
                so the timestamp title attribute / grouped logic has a node to
                anchor to, but don't render an empty visible bubble — the image
                itself IS the bubble in that case. */}
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

      {/* Lightbox — rendered at the root of this component, not inside the
          message row, so it's outside the overflow-clipped scroll container
          and can cover the full viewport. React portals would also work but
          this keeps the component self-contained. Only mounts when open. */}
      {lightboxOpen && message.image_url && (
        <ImageLightbox
          images={[message.image_url]}
          startIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}));

export default ChatMessage;
