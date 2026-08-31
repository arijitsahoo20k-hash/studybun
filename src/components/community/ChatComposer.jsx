import React, { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, ImagePlus } from "lucide-react";
import { validateImageFile } from "../../lib/imageValidation";

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
  const [imageFile, setImageFile] = useState(null);   // File | null
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // blob URL | null
  const [err, setErr] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const submittingRef = useRef(false);

  // Resets imageFile/imagePreviewUrl without revoking the blob URL itself —
  // revocation happens in exactly one place (the effect below), so this can
  // be a stable, dependency-free callback instead of a plain function that
  // gets redefined (and re-closes over whatever `imagePreviewUrl` happened
  // to be) on every render.
  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // A draft typed for one channel must never end up posted in another.
  useEffect(() => {
    setDraft("");
    setErr(null);
    clearImage();
  }, [channelId, clearImage]);

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [draft]);

  // BUG FIX (stale closure / double revoke): this is now the *only* place
  // that ever calls URL.revokeObjectURL. Previously clearImage() and
  // handleImagePick() each also revoked `imagePreviewUrl` directly from
  // their own closures before updating state — which meant every image
  // swap or clear revoked the same blob URL twice (once inline, once again
  // here when the effect's cleanup ran for the old value on the next
  // render). Revoking an already-revoked URL doesn't throw, so this was
  // silent and harmless, but it's wasted work and relied on `clearImage`'s
  // closure always having a fresh `imagePreviewUrl` — a plain (non-memoized)
  // function is redefined every render, so it usually did, but that's an
  // implicit invariant, not a guarantee.
  //
  // Now clearImage()/handleImagePick() only ever call the state setters.
  // React runs this cleanup with the *previous* imagePreviewUrl right
  // before the effect re-runs for the new one, so every replacement (or a
  // clear, which sets it to null) revokes the old URL exactly once, and
  // unmounting revokes whatever was still set. Single source of truth,
  // no closures to go stale.
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validErr = validateImageFile(file);
    if (validErr) { setErr(validErr); return; }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setErr(null);
    // Refocus the textarea so the user can add a caption without extra taps
    textareaRef.current?.focus();
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const text = draft.trim();
    if (!text && !imageFile) return;
    submittingRef.current = true;
    setErr(null);
    const res = await sendMessage(text, replyTo, imageFile);
    submittingRef.current = false;
    if (res.ok) {
      setDraft("");
      onCancelReply();
      clearImage();
    } else {
      setErr(res.error || "Couldn't send that.");
    }
    textareaRef.current?.focus();
  };

  const nearLimit = draft.length > MAX_LEN * 0.85;
  const canSend = !sending && (draft.trim().length > 0 || imageFile !== null);

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

      {/* Image preview strip — shown above the text row when an image is picked */}
      {imageFile && imagePreviewUrl && (
        <div className="sb-chat-img-preview-strip">
          <div className="sb-chat-img-preview-thumb">
            <img src={imagePreviewUrl} alt="Attachment preview" />
            <button
              type="button"
              className="sb-chat-img-preview-remove"
              onClick={clearImage}
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <form className="sb-chat-composer" onSubmit={handleSend}>
        {/* Hidden file input — triggered by the camera button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={handleImagePick}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Image attach button */}
        <button
          type="button"
          className="sb-chat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          aria-label="Attach image"
          title="Attach image"
        >
          <ImagePlus size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
          placeholder={imageFile ? "Add a caption (optional)..." : "Say something to your study group..."}
          maxLength={MAX_LEN}
          rows={1}
          disabled={sending}
        />
        <button type="submit" disabled={!canSend} aria-label="Send message">
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
