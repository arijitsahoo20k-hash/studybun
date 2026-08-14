import React from "react";
import { Trash2 } from "lucide-react";
import Mascot from "../Mascot";
import { FounderBadge } from "../ui";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Report and Block were removed from chat messages entirely (not just
// hidden) — this component no longer takes onReport/onBlock props at
// all. They're still available on feed posts (see CommunityPost.jsx),
// which is a separate use of the shared ContentActions component.
export default function ChatMessage({ message, isOwn, myProfile, isModerator, founderIds, onDelete }) {
  const name = isOwn ? (myProfile?.name || "You") : (message.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myProfile?.mascot || "bunny") : (message.profiles?.mascot || "bunny");
  const canDelete = isOwn || isModerator;

  return (
    <div className={`sb-chat-msg ${isOwn ? "own" : ""}`}>
      <div className="sb-chat-msg-avatar"><Mascot species={mascotSpecies} mood="happy" size={26} ambient={false} /></div>
      <div className="sb-chat-msg-body">
        <div className="sb-chat-msg-meta">
          <span className="sb-chat-msg-name">{name}{founderIds?.has(message.user_id) && <FounderBadge />}</span>
          <span className="sb-chat-msg-time">{formatTime(message.created_at)}</span>
        </div>
        <div className="sb-chat-msg-content">{message.content}</div>
      </div>
      {canDelete && (
        <button
          type="button"
          className="sb-chat-msg-delete"
          aria-label="Delete message"
          onClick={() => onDelete(message.id)}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
