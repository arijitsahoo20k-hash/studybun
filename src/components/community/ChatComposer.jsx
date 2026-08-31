import React, { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

const MAX_LEN = 1000;
const TEXTAREA_MAX_HEIGHT = 140;

// Split out from CommunityChat on purpose: `draft` used to live in the
// same component as the whole message list, so every keystroke re-ran
// that component and re-rendered every visible message (each with its
// own Mascot SVG avatar). In a busy channel that's what made typing feel
// laggy while other people were also posting. Keeping draft/err/textarea
// state in here means a keystroke only re-renders this small composer,
// never the list above it.
export default function ChatComposer({ channelId, replyTo, onCancelReply, sendMessage, sending }) {
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState(null);
  const textareaRef = useRef(null);
  const submittingRef = useRef(false);

  // A draft typed for one channel must never end up posted in another.
  // CommunityChat resets its own replyTo/refs on channel switch, but this
  // component's `draft` is local state the parent has no reach into — so
  // without this, typing something in Physics, switching to General, and
  // hitting send would silently post the Physics draft into General.
  useEffect(() => {
    setDraft("");
    setErr(null);
  }, [channelId]);

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [draft]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const text = draft.trim();
    if (!text) return;
    submittingRef.current = true;
    setErr(null);
    const res = await sendMessage(text, replyTo);
    submittingRef.current = false;
    if (res.ok) {
      setDraft("");
      onCancelReply();
    } else {
      setErr(res.error || "Couldn't send that.");
    }
    // `disabled={sending}` below blurs the textarea the moment a send
    // starts (browsers blur an element when it's disabled while focused).
    // Restore focus after every attempt, success or failure — previously
    // this only ran on the success branch, so a failed send could
    // silently leave the cursor gone with no visible focus anywhere.
    textareaRef.current?.focus();
  };

  const nearLimit = draft.length > MAX_LEN * 0.85;

  return (
    <div className="sb-chat-composer-zone">
      {replyTo && (
        <div className="sb-chat-reply-bar">
          <div className="sb-chat-reply-bar-info">
            <span className="sb-chat-reply-bar-name">Replying to {replyTo.name}</span>
            <span className="sb-chat-reply-bar-text">{replyTo.content}</span>
          </div>
          <button type="button" className="sb-chat-reply-bar-cancel" onClick={onCancelReply} aria-label="Cancel reply">
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
          disabled={sending}
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
    </div>
  );
}
