import React from "react";
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

export default function CommunityPage(p) {
  const { channels, activeChannelId, setActiveChannelId } = useCommunityChannels();
  const chat = useCommunityChat(activeChannelId);
  const accountability = useAccountability();
  const feed = useCommunityFeed();
  const moderation = useCommunityModeration();

  const studyingIds = p.studyingIds || new Set();
  const checkedInToday = accountability.activeGoals.length + (accountability.myGoal ? 1 : 0);

  return (
    <div className="sb-page sb-community-page">
      <CommunityStyle />
      <CommunityHeader activeNowCount={studyingIds.size} checkedInTodayCount={checkedInToday} />

      <div className="sb-community-grid">
        <div className="sb-community-col-main">
          <CheckInsList goals={accountability.activeGoals} mascot={p.mascot} />
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
          <CommunityFeed
            feed={feed}
            currentUserId={p.userId}
            myProfile={p.profile}
            isModerator={moderation.isModerator}
            moderation={moderation}
            mascot={p.mascot}
          />
        </div>
        <div className="sb-community-col-side">
          <AccountabilityCard
            myGoal={accountability.myGoal}
            weekly={accountability.weekly}
            checkIn={accountability.checkIn}
            updateStatus={accountability.updateStatus}
            mascot={p.mascot}
          />
        </div>
      </div>
    </div>
  );
}
