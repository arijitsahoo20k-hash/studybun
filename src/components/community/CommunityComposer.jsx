import React, { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Btn } from "../ui";

const TYPES = [
  { value: "CHECK_IN", label: "Check-in" },
  { value: "PROGRESS", label: "Progress" },
  { value: "QUESTION", label: "Question" },
  { value: "TIP", label: "Tip" },
  { value: "MILESTONE", label: "Milestone" },
];

const MAX_LEN = 2000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB raw upload cap, before client-side compression

export default function CommunityComposer({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("PROGRESS");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const fileInputRef = useRef(null);

  const pickImage = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("That file isn't an image."); return; }
    if (file.size > MAX_IMAGE_BYTES) { setErr("That image is too big (max 8MB)."); return; }
    setErr(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErr(null);
    const res = await onSubmit({ type, content, subject: subject || null, imageFile });
    setSubmitting(false);
    if (res.ok) {
      setContent(""); setSubject(""); removeImage(); setOpen(false);
    } else setErr(res.error);
  };

  if (!open) {
    return (
      <button type="button" className="sb-composer-trigger" onClick={() => setOpen(true)}>
        Share a check-in, progress update, question, tip, or milestone...
      </button>
    );
  }

  return (
    <form className="sb-composer-form" onSubmit={submit}>
      <div className="sb-composer-types">
        {TYPES.map((t) => (
          <button key={t.value} type="button" className={`sb-chip small ${type === t.value ? "active" : ""}`} onClick={() => setType(t.value)}>
            {t.label}
          </button>
        ))}
      </div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" maxLength={40} />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={MAX_LEN}
        rows={3}
        autoFocus
      />

      {/* Images belong to posts, not chat — this is the whole point of
          having both: chat is for quick back-and-forth, a post is for
          something you want to actually show (a mock score screenshot,
          a solved problem, notes) and have stick around. */}
      {imagePreview ? (
        <div className="sb-composer-image-preview">
          <img src={imagePreview} alt="Attached preview" />
          <button type="button" className="sb-composer-image-remove" onClick={removeImage} aria-label="Remove image">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" className="sb-composer-attach" onClick={pickImage}>
          <ImagePlus size={15} /> Add a photo
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} hidden />

      {err && <p className="sb-cm-error">{err}</p>}
      <div className="sb-checkin-btn-row">
        <Btn variant="soft" onClick={() => { removeImage(); setOpen(false); }}>Cancel</Btn>
        <Btn type="submit" disabled={submitting || !content.trim()}>{submitting ? (imageFile ? "Uploading..." : "Posting...") : "Post"}</Btn>
      </div>
    </form>
  );
}
