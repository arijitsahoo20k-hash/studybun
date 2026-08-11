import React from "react";
import Mascot from "../Mascot";
import ContentActions from "./ContentActions";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatMessage({ message, isOwn, myProfile, currentUserId, isModerator, onReport, onBlock, onDelete }) {
  const name = isOwn ? (myProfile?.name || "You") : (message.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myProfile?.mascot || "bunny") : (message.profiles?.mascot || "bunny");

  return (
    <div className={`sb-chat-msg ${isOwn ? "own" : ""}`}>
      <div className="sb-chat-msg-avatar"><Mascot species={mascotSpecies} mood="happy" size={26} ambient={false} /></div>
      <div className="sb-chat-msg-body">
        <div className="sb-chat-msg-meta">
          <span className="sb-chat-msg-name">{name}</span>
          <span className="sb-chat-msg-time">{formatTime(message.created_at)}</span>
        </div>
        <div className="sb-chat-msg-content">{message.content}</div>
      </div>
      <ContentActions
        authorId={message.user_id}
        currentUserId={currentUserId}
        isModerator={isModerator}
        targetType="message"
        targetId={message.id}
        onReport={onReport}
        onBlock={() => onBlock(message.user_id)}
        onDelete={() => onDelete(message.id)}
      />
    </div>
  );
}
