import React, { useState } from "react";
import { Crown, Flame, Info, Sparkles, Medal } from "lucide-react";
import { Card, SectionTitle, EmptyState, PersonBadge } from "../components/ui";
import Mascot from "../components/Mascot";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useFounderIds } from "../hooks/useFounderIds";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function PodiumSpot({ row, rank, isMe, isStudyingNow, founderIds }) {
  if (!row) return <div className="sb-podium-spot empty" />;
  return (
    <div className={`sb-podium-spot p${rank} ${isMe ? "me" : ""}`} style={{ animationDelay: `${rank * 0.08}s` }}>
      <div className="sb-podium-medal">{MEDAL[rank]}</div>
      <div className="sb-podium-avatar-wrap">
        <div className="sb-podium-avatar"><Mascot species={row.mascot} mood="happy" size={rank === 1 ? 52 : 42} ambient={false} /></div>
        {isStudyingNow && <span className="sb-lb-online-dot" title="Studying right now" />}
      </div>
      <div className="sb-podium-name">{row.display_name}{isMe && <span className="sb-lb-you-tag">You</span>}</div>
      <PersonBadge founderIds={founderIds} userId={row.user_id} streak={row.current_streak} />
      {row.current_streak > 0 && (
        <div className="sb-lb-streak"><Flame size={11} /> {row.current_streak}</div>
      )}
      <div className="sb-podium-score">{Math.round(row.study_score).toLocaleString()}<span>pts</span></div>
      <div className="sb-podium-bar" />
    </div>
  );
}

function ScoreRow({ row, rank, isMe, isStudyingNow, founderIds }) {
  return (
    <div className={`sb-lb-row ${isMe ? "me" : ""}`} style={{ animationDelay: `${Math.min(rank, 14) * 0.03}s` }}>
      <div className="sb-lb-rank">#{rank}</div>
      <div className="sb-lb-avatar-wrap">
        <div className="sb-lb-avatar"><Mascot species={row.mascot} mood="happy" size={34} ambient={false} /></div>
        {isStudyingNow && <span className="sb-lb-online-dot" title="Studying right now" />}
      </div>
      <div className="sb-lb-who">
        <div className="sb-lb-name">{row.display_name}{isMe && <span className="sb-lb-you-tag">You</span>}<PersonBadge founderIds={founderIds} userId={row.user_id} streak={row.current_streak} /></div>
        {row.current_streak > 0 && (
          <div className="sb-lb-streak"><Flame size={11} /> {row.current_streak}-day streak</div>
        )}
      </div>
      <div className="sb-lb-score">
        {Math.round(row.study_score).toLocaleString()}
        <span>pts</span>
      </div>
    </div>
  );
}

function SkeletonRow({ i }) {
  return <div className="sb-lb-row sb-lb-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />;
}

export default function LeaderboardPage(p) {
  const { top, myRank, amInTop, pointsToTop20, loading, error, refetch } = useLeaderboard();
  const founderIds = useFounderIds();
  const [showInfo, setShowInfo] = useState(false);
  const userId = p.userId;
  const studyingIds = p.studyingIds || new Set();

  return (
    <div className="sb-page">
      <Card className="sb-hero" washi>
        <div className="sb-hero-copy">
          <div className="sb-hero-greet"><Crown size={22} style={{ marginRight: 6, verticalAlign: "-3px" }} />Leaderboard</div>
          <div className="sb-hero-line">Top 20 study buddies, ranked by Study Score ✨</div>
        </div>
        <div className="sb-lb-live-badge"><span className="sb-lb-live-dot" />Live</div>
      </Card>

      <Card>
        <SectionTitle icon={Info} right={
          <button className="sb-chip small" onClick={() => setShowInfo((v) => !v)}>
            {showInfo ? "Hide" : "How scoring works"}
          </button>
        }>
          Fair &amp; anti-cheat scoring
        </SectionTitle>
        {showInfo && (
          <p className="sb-muted" style={{ fontSize: 12.5, lineHeight: 1.7, marginTop: 4 }}>
            Your Study Score looks at your last 30 days — genuine study days, completed focus sessions,
            minutes actually spent (timer-verified time counts more than self-logged time), questions
            practiced, mocks taken, and chapters finished — plus a bonus for your current streak. Every
            signal is capped per day, so logging one big fake session (or a hundred tiny ones) never earns
            more than a real day's worth of points. Idle or abandoned timers don't count — only sessions
            that actually finish.
          </p>
        )}
      </Card>

      {error && (
        <Card>
          <p className="sb-muted" style={{ fontSize: 12.5, marginBottom: 8 }}>Couldn't load the leaderboard right now — try again in a moment.</p>
          <button className="sb-chip small" onClick={refetch}>Retry</button>
        </Card>
      )}

      {loading ? (
        <Card washi>
          <SectionTitle icon={Crown}>Top 20</SectionTitle>
          <div className="sb-lb-list">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)}
          </div>
        </Card>
      ) : top.length === 0 ? (
        <Card washi>
          <SectionTitle icon={Crown}>Top 20</SectionTitle>
          <EmptyState mascot={p.mascot} mood="idle" text="No scores yet" sub="Be the first to log a study session and claim the crown 👑" />
        </Card>
      ) : (
        <>
          {top.length >= 2 && (
            <Card className="sb-podium-card" washi>
              <div className="sb-podium">
                <PodiumSpot row={top[1]} rank={2} isMe={top[1]?.user_id === userId} isStudyingNow={studyingIds.has(top[1]?.user_id)} founderIds={founderIds} />
                <PodiumSpot row={top[0]} rank={1} isMe={top[0]?.user_id === userId} isStudyingNow={studyingIds.has(top[0]?.user_id)} founderIds={founderIds} />
                <PodiumSpot row={top[2]} rank={3} isMe={top[2]?.user_id === userId} isStudyingNow={studyingIds.has(top[2]?.user_id)} founderIds={founderIds} />
              </div>
            </Card>
          )}

          <Card washi>
            <SectionTitle icon={Medal}>{top.length > 3 ? "Rest of the Top 20" : "Top 20"}</SectionTitle>
            <div className="sb-lb-list">
              {(top.length > 3 ? top.slice(3) : top).map((row, i) => {
                const rank = top.length > 3 ? i + 4 : i + 1;
                return (
                  <ScoreRow
                    key={row.user_id}
                    row={row}
                    rank={rank}
                    isMe={row.user_id === userId}
                    isStudyingNow={studyingIds.has(row.user_id)}
                    founderIds={founderIds}
                  />
                );
              })}
            </div>
          </Card>
        </>
      )}

      {!loading && !amInTop && myRank && (
        <Card className="sb-lb-you-card">
          <SectionTitle icon={Sparkles}>Your rank</SectionTitle>
          <div className="sb-lb-you-row">
            <div className="sb-lb-avatar-wrap">
              <div className="sb-lb-avatar"><Mascot species={p.mascot} mood="happy" size={40} /></div>
            </div>
            <div className="sb-lb-who">
              <div className="sb-lb-name">#{myRank.rank.toLocaleString()} <span className="sb-muted small">of {myRank.total_users.toLocaleString()}</span><PersonBadge founderIds={founderIds} userId={userId} streak={myRank.current_streak} /></div>
              {myRank.current_streak > 0 && (
                <div className="sb-lb-streak"><Flame size={11} /> {myRank.current_streak}-day streak</div>
              )}
            </div>
            <div className="sb-lb-score">
              {Math.round(myRank.study_score).toLocaleString()}
              <span>pts</span>
            </div>
          </div>
          {pointsToTop20 != null && (
            <p className="sb-muted" style={{ fontSize: 12, marginTop: 10 }}>
              {pointsToTop20 > 0
                ? `Just ${Math.ceil(pointsToTop20).toLocaleString()} points from cracking the Top 20 — keep going! 🐾`
                : "You're right on the edge of the Top 20 — one more session could do it!"}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
