import React, { useState } from "react";
import { Crown, Flame, Info, Sparkles } from "lucide-react";
import { Card, SectionTitle, EmptyState } from "../components/ui";
import Mascot from "../components/Mascot";
import { useLeaderboard } from "../hooks/useLeaderboard";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function ScoreRow({ row, rank, isMe, isStudyingNow }) {
  const medal = MEDAL[rank];
  return (
    <div className={`sb-lb-row ${isMe ? "me" : ""} ${medal ? `medal medal-${rank}` : ""}`} style={{ animationDelay: `${Math.min(rank, 14) * 0.03}s` }}>
      <div className="sb-lb-rank">{medal || `#${rank}`}</div>
      <div className="sb-lb-avatar-wrap">
        <div className="sb-lb-avatar"><Mascot species={row.mascot} mood="happy" size={34} ambient={false} /></div>
        {isStudyingNow && <span className="sb-lb-online-dot" title="Studying right now" />}
      </div>
      <div className="sb-lb-who">
        <div className="sb-lb-name">{row.display_name}{isMe && <span className="sb-lb-you-tag">You</span>}</div>
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
  const { top, myRank, amInTop, pointsToTop20, loading, error } = useLeaderboard();
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
        <div className="sb-hero-mascot-wrap">
          <Mascot species={p.mascot} mood="happy" size={68} />
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

      <Card washi>
        <SectionTitle icon={Crown}>Top 20</SectionTitle>
        {error && <p className="sb-muted" style={{ fontSize: 12.5 }}>Couldn't load the leaderboard right now — try again in a moment.</p>}
        {loading ? (
          <div className="sb-lb-list">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)}
          </div>
        ) : top.length === 0 ? (
          <EmptyState mascot={p.mascot} mood="idle" text="No scores yet" sub="Be the first to log a study session and claim the crown 👑" />
        ) : (
          <div className="sb-lb-list">
            {top.map((row, i) => (
              <ScoreRow
                key={row.user_id}
                row={row}
                rank={i + 1}
                isMe={row.user_id === userId}
                isStudyingNow={studyingIds.has(row.user_id)}
              />
            ))}
          </div>
        )}
      </Card>

      {!loading && !amInTop && myRank && (
        <Card className="sb-lb-you-card">
          <SectionTitle icon={Sparkles}>Your rank</SectionTitle>
          <div className="sb-lb-you-row">
            <div className="sb-lb-avatar-wrap">
              <div className="sb-lb-avatar"><Mascot species={p.mascot} mood="happy" size={40} /></div>
            </div>
            <div className="sb-lb-who">
              <div className="sb-lb-name">#{myRank.rank.toLocaleString()} <span className="sb-muted small">of {myRank.total_users.toLocaleString()}</span></div>
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
