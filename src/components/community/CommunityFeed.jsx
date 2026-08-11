import React from "react";
import { Rss } from "lucide-react";
import { Card, SectionTitle, EmptyState, Btn } from "../ui";
import CommunityComposer from "./CommunityComposer";
import CommunityPost from "./CommunityPost";

export default function CommunityFeed({ feed, currentUserId, myProfile, isModerator, moderation, mascot }) {
  const visiblePosts = feed.posts.filter((p) => !moderation.isBlocked(p.user_id));

  return (
    <Card>
      <SectionTitle icon={Rss}>Study Feed</SectionTitle>
      <CommunityComposer onSubmit={feed.createPost} />

      {feed.loading ? (
        <div className="sb-muted small" style={{ padding: 8 }}>Loading...</div>
      ) : visiblePosts.length === 0 ? (
        <EmptyState mascot={mascot} mood="idle" text="You're early." sub="Set your first accountability goal and start studying alongside the community." />
      ) : (
        <div className="sb-post-list">
          {visiblePosts.map((post) => (
            <CommunityPost
              key={post.id}
              post={post}
              reactions={feed.reactionsByPost[post.id]}
              currentUserId={currentUserId}
              myProfile={myProfile}
              isModerator={isModerator}
              moderation={moderation}
              onToggleReaction={feed.toggleReaction}
              replies={feed.repliesByPost[post.id]}
              onLoadReplies={feed.loadReplies}
              onAddReply={feed.addReply}
              onDelete={feed.deletePost}
            />
          ))}
        </div>
      )}

      {feed.hasMore && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Btn variant="soft" onClick={feed.loadMore}>Load more</Btn>
        </div>
      )}
    </Card>
  );
}
