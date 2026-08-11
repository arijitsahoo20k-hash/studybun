import React, { useState } from "react";
import { Btn } from "../ui";

const TYPES = [
  { value: "CHECK_IN", label: "Check-in" },
  { value: "PROGRESS", label: "Progress" },
  { value: "QUESTION", label: "Question" },
  { value: "TIP", label: "Tip" },
  { value: "MILESTONE", label: "Milestone" },
];

const MAX_LEN = 2000;

export default function CommunityComposer({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("PROGRESS");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErr(null);
    const res = await onSubmit({ type, content, subject: subject || null });
    setSubmitting(false);
    if (res.ok) { setContent(""); setSubject(""); setOpen(false); }
    else setErr(res.error);
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
      {err && <p className="sb-cm-error">{err}</p>}
      <div className="sb-checkin-btn-row">
        <Btn variant="soft" onClick={() => setOpen(false)}>Cancel</Btn>
        <Btn type="submit" disabled={submitting || !content.trim()}>{submitting ? "Posting..." : "Post"}</Btn>
      </div>
    </form>
  );
}
