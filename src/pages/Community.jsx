import React, { useState } from "react";
import CommunityStyle from "../styles/CommunityStyle";
import CommunityHeader from "../components/community/CommunityHeader";
import AccountabilityCard from "../components/community/AccountabilityCard";
import CheckInsList from "../components/community/CheckInsList";
import CommunityChat from "../components/community/CommunityChat";
import CommunityFeed from "../components/community/CommunityFeed";
import { useCommunityChannels } from "../hooks/useCommunityChannels";
import { useCommunityChat } from "../hooks/useCommunityChat";
import { useAccountability } from "../hooks/useAccountability";
import { useCommunityFeed } from "../hooks/useCommunityFeed";
import { useCommunityModeration } from "../hooks/useCommunityModeration";

// Same tab shape as Settings' TABS — each card that used to be stacked on
// one long page now lives behind its own side-nav entry, so only one card
// (and its own scroll/space budget) is on screen at a time.
const TABS = [
  { id: "checkins", emoji: "✅", label: "Check-ins", sub: "Who's studying now" },
  { id: "accountability", emoji: "🎯", label: "My accountability", sub: "Set & track today's goal" },
  { id: "chat", emoji: "💬", label: "Community chat", sub: "Talk with your group" },
  { id: "feed", emoji: "📰", label: "Study feed", sub: "Posts & updates" },
];

export default function CommunityPage(p) {
  const { channels, activeChannelId, setActiveChannelId } = useCommunityChannels();
  const chat = useCommunityChat(activeChannelId);
  const accountability = useAccountability();
  const feed = useCommunityFeed();
  const moderation = useCommunityModeration();
  const [tab, setTab] = useState("checkins");

  const studyingIds = p.studyingIds || new Set();
  const checkedInToday = accountability.activeGoals.length + (accountability.myGoal ? 1 : 0);

  return (
    <div className="sb-page sb-community-page">
      <CommunityStyle />
      <CommunityHeader activeNowCount={studyingIds.size} checkedInTodayCount={checkedInToday} />

      {/* Reuses the exact settings-page shell/nav classes from GlobalStyle so
          the community page behaves and looks like Settings: a sticky side
          toggle on the left, one card in view on the right. */}
      <div className="sb-settings-shell sb-community-shell">
        <nav className="sb-settings-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`sb-settings-nav-item ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="sb-settings-nav-icon">{t.emoji}</span>
              <span className="sb-settings-nav-text">
                <span className="sb-settings-nav-label">{t.label}</span>
                <span className="sb-settings-nav-sub">{t.sub}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="sb-settings-content sb-community-content" key={tab}>
          {tab === "checkins" && (
            <CheckInsList goals={accountability.activeGoals} mascot={p.mascot} />
          )}

          {tab === "accountability" && (
            <AccountabilityCard
              myGoal={accountability.myGoal}
              weekly={accountability.weekly}
              checkIn={accountability.checkIn}
              updateStatus={accountability.updateStatus}
              mascot={p.mascot}
            />
          )}

          {tab === "chat" && (
            <CommunityChat
              channels={channels}
              activeChannelId={activeChannelId}
              onSelectChannel={setActiveChannelId}
              messages={chat.messages}
              loading={chat.loading}
              sending={chat.sending}
              sendMessage={chat.sendMessage}
              deleteMessage={chat.deleteMessage}
              hasMore={chat.hasMore}
              loadOlder={chat.loadOlder}
              currentUserId={p.userId}
              myProfile={p.profile}
              isModerator={moderation.isModerator}
              moderation={moderation}
              mascot={p.mascot}
            />
          )}

          {tab === "feed" && (
            <CommunityFeed
              feed={feed}
              currentUserId={p.userId}
              myProfile={p.profile}
              isModerator={moderation.isModerator}
              moderation={moderation}
              mascot={p.mascot}
            />
          )}
        </div>
      </div>
    </div>
  );
}
