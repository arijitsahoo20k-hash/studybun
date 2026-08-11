import React, { useState } from "react";
import { HeartHandshake, Lightbulb, Rocket, MessageSquare } from "lucide-react";
import Mascot from "../Mascot";
import ContentActions from "./ContentActions";

const TYPE_LABEL = { CHECK_IN: "CHECK-IN", PROGRESS: "PROGRESS", QUESTION: "QUESTION", TIP: "TIP", MILESTONE: "MILESTONE" };
const REACTIONS = [
  { key: "support", label: "Support", icon: HeartHandshake },
  { key: "helpful", label: "Helpful", icon: Lightbulb },
  { key: "lets_go", label: "Let's go", icon: Rocket },
];

function timeAgo(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function CommunityPost({ post, reactions, currentUserId, myProfile, isModerator, moderation, onToggleReaction, replies, onLoadReplies, onAddReply, onDelete }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const isOwn = post.user_id === currentUserId;
  const name = isOwn ? (myProfile?.name || "You") : (post.profiles?.name || "Study Buddy");
  const mascotSpecies = isOwn ? (myProfile?.mascot || "bunny") : (post.profiles?.mascot || "bunny");
  const r = reactions || { support: 0, helpful: 0, lets_go: 0, mine: new Set() };

  const toggleReplies = () => {
    setShowReplies((v) => !v);
    if (!showReplies && !replies) onLoadReplies(post.id);
  };

  const submitReply = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    const res = await onAddReply(post.id, text);
    if (res.ok) setReplyText("");
  };

  return (
    <div className="sb-post">
      <div className="sb-post-head">
        <Mascot species={mascotSpecies} mood="happy" size={30} ambient={false} />
        <div className="sb-post-who">
          <div className="sb-post-name">{name}</div>
          <div className="sb-post-meta"><span className="sb-post-type">{TYPE_LABEL[post.type]}</span> · {timeAgo(post.created_at)}</div>
        </div>
        <ContentActions
          authorId={post.user_id}
          currentUserId={currentUserId}
          isModerator={isModerator}
          targetType="post"
          targetId={post.id}
          onReport={moderation.report}
          onBlock={() => moderation.blockUser(post.user_id)}
          onDelete={() => onDelete(post.id)}
        />
      </div>
      {(post.subject || post.chapter) && (
        <div className="sb-post-tag">{post.subject}{post.chapter ? ` — ${post.chapter}` : ""}</div>
      )}
      <div className="sb-post-content">{post.content}</div>

      <div className="sb-post-actions">
        {REACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`sb-post-reaction ${r.mine?.has(key) ? "active" : ""}`}
            onClick={() => onToggleReaction(post.id, key)}
          >
            <Icon size={13} /> {label}{r[key] ? ` (${r[key]})` : ""}
          </button>
        ))}
        <button type="button" className="sb-post-reaction" onClick={toggleReplies}>
          <MessageSquare size={13} /> {replies?.length ? `${replies.length} repl${replies.length === 1 ? "y" : "ies"}` : "Reply"}
        </button>
      </div>

      {showReplies && (
        <div className="sb-post-replies">
          {(replies || []).map((rp) => (
            <div key={rp.id} className="sb-post-reply">
              <span className="sb-post-reply-name">{rp.user_id === currentUserId ? (myProfile?.name || "You") : (rp.profiles?.name || "Study Buddy")}:</span>
              <span>{rp.content}</span>
            </div>
          ))}
          <form className="sb-post-reply-form" onSubmit={submitReply}>
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Reply..." maxLength={1000} />
            <button type="submit" disabled={!replyText.trim()}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
