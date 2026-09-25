import React, { useState } from "react";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";

// Only ever rendered when useCommunityFocusLock().eligible is true — see
// supabase/migration_focus_lock.sql. That flag (and the RPC it gates) is
// scoped to a per-user allowlist table, added by hand via SQL insert, so
// this can be handed to more people later without touching code.
//
// Deliberately styled nothing like ChannelLockToggle: different icon set
// (book instead of padlock), different color pair (violet "locked" vs
// the founder-only lock's red/green), and its own class namespace
// (sb-focus-lock-*, not sb-channel-lock-*) — so on the rare account that
// has both switches, they read as two unrelated controls, not two states
// of the same one. This one only ever affects the person clicking it.
export default function FocusLockToggle({ locked, onToggle }) {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(null);

  const handleClick = async () => {
    if (pending) return;
    setPending(true);
    setErr(null);
    const res = await onToggle(!locked);
    setPending(false);
    if (!res.ok) setErr(res.error || "Couldn't update that.");
  };

  return (
    <div className="sb-focus-lock">
      <button
        type="button"
        className={`sb-focus-lock-switch ${locked ? "locked" : "unlocked"}`}
        role="switch"
        aria-checked={locked}
        aria-label={locked ? "Turn off Focus Lock" : "Turn on Focus Lock — hide chat for yourself and study"}
        onClick={handleClick}
        disabled={pending}
        title={locked ? "Chat is hidden just for you — tap to turn off" : "Hide chat for yourself only, everyone else is unaffected"}
      >
        <span className="sb-focus-lock-track">
          <span className="sb-focus-lock-knob">
            {pending ? <Loader2 size={12} className="sb-spin" /> : locked ? <BookOpen size={12} /> : <Sparkles size={12} />}
          </span>
        </span>
        <span className="sb-focus-lock-label">{locked ? "Focus" : "Chat"}</span>
      </button>
      {err && <span className="sb-focus-lock-err">{err}</span>}
    </div>
  );
}
