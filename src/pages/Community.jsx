import React, { useState } from "react";
import CommunityStyle from "../styles/CommunityStyle";
import PrivateChatStyle from "../styles/PrivateChatStyle";
import CommunityHeader from "../components/community/CommunityHeader";
import AccountabilityCard from "../components/community/AccountabilityCard";
import CheckInsList from "../components/community/CheckInsList";
import CommunityChat from "../components/community/CommunityChat";
import CommunityFeed from "../components/community/CommunityFeed";
import PrivateChatPage from "../components/community/private/PrivateChatPage";
import { useCommunityChannels } from "../hooks/useCommunityChannels";
import { useCommunityChat } from "../hooks/useCommunityChat";
import { useAccountability } from "../hooks/useAccountability";
import { useCommunityFeed } from "../hooks/useCommunityFeed";
import { useCommunityModeration } from "../hooks/useCommunityModeration";
import { useFounderIds } from "../hooks/useFounderIds";
import { useStreakMemberIds } from "../hooks/useStreakMemberIds";
import { usePrivateChatAccess } from "../hooks/usePrivateChatAccess";

// Same tab shape as Settings' TABS — each card that used to be stacked on
// one long page now lives behind its own side-nav entry, so only one card
// (and its own scroll/space budget) is on screen at a time.
const BASE_TABS = [
  { id: "checkins", emoji: "✅", label: "Check-ins", sub: "Who's studying now" },
  { id: "accountability", emoji: "🎯", label: "My accountability", sub: "Set & track today's goal" },
  { id: "chat", emoji: "💬", label: "Community chat", sub: "Talk with your group" },
  { id: "feed", emoji: "📰", label: "Study feed", sub: "Posts & updates" },
];
const PRIVATE_TAB = { id: "private", emoji: "🔒", label: "Private Chats", sub: "Just for your group" };

export default function CommunityPage(p) {
  const { channels, activeChannelId, setActiveChannelId } = useCommunityChannels();
  const chat = useCommunityChat(activeChannelId);
  const accountability = useAccountability();
  const feed = useCommunityFeed();
  const moderation = useCommunityModeration();
  const founderIds = useFounderIds();
  const memberIds = useStreakMemberIds();
  const privateAccess = usePrivateChatAccess();
  const [tab, setTab] = useState("checkins");

  const isFounder = moderation.isModerator;
  // Founders always see the entry; everyone else only once a founder has
  // actually added them to at least one private channel — mirrors the
  // "invisible until you're invited" behavior from the prototype.
  const showPrivateTab = isFounder || privateAccess.hasMembership;
  const TABS = showPrivateTab ? [...BASE_TABS, PRIVATE_TAB] : BASE_TABS;

  const studyingIds = p.studyingIds || new Set();
  // activeGoals is already grouped one-entry-per-person, so its length is
  // a distinct-person count on its own (a person with several goals today
  // still only counts once here).
  const checkedInToday = accountability.activeGoals.length + (accountability.myGoals.length > 0 ? 1 : 0);

  // Private Chats replaces the ENTIRE community page (hero + side nav +
  // card), not just the sb-settings-content card — same "swap the whole
  // page for a full-bleed detail view" pattern StudyStuffs uses for the
  // Periodic Table and its other tools. A two-pane WhatsApp-style layout
  // needs the full viewport; squeezing it into the settings-card shell
  // (like the other four tabs) would leave it cramped on anything but a
  // wide desktop window.
  if (tab === "private") {
    return (
      <div className="sb-page sb-page-private-chat">
        <PrivateChatStyle />
        <PrivateChatPage
          currentUserId={p.userId}
          myProfile={p.profile}
          isFounder={isFounder}
          founderIds={founderIds}
          mascot={p.mascot}
          onExit={() => setTab("feed")}
        />
      </div>
    );
  }

  return (
    <div className="sb-page sb-community-page">
      <CommunityStyle />
      <PrivateChatStyle />
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
              className={`sb-settings-nav-item ${tab === t.id ? "active" : ""} ${t.id === "private" ? "sb-private-nav-item" : ""}`}
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
              myGoals={accountability.myGoals}
              weekly={accountability.weekly}
              addGoal={accountability.addGoal}
              updateStatus={accountability.updateStatus}
              deleteGoal={accountability.deleteGoal}
              history={accountability.history}
              historyLoading={accountability.historyLoading}
              historyLoaded={accountability.historyLoaded}
              historyError={accountability.historyError}
              loadHistory={accountability.loadHistory}
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
              founderIds={founderIds}
              memberIds={memberIds}
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
              founderIds={founderIds}
              memberIds={memberIds}
              mascot={p.mascot}
            />
          )}
        </div>
      </div>
    </div>
  );
}
