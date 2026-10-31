import React, { useEffect, useState } from "react";
import {
  Globe2, Lock, KeyRound, Plus, ChevronRight, Users, RefreshCw, AlertTriangle, CheckCircle2, Timer as TimerIcon,
} from "lucide-react";
import { EmptyState } from "../ui";
import { CreateGroupDialog, JoinCodeDialog } from "./GroupDialogs";
import { LOBBY_STATIC_SRC } from "../../lib/groupTimer";
import { roomPresenceTag } from "../../lib/roomGlow";

/* ------------------------------------------------------------------ */
/* Helper: does this room have someone studying INSIDE it right now?    */
/* ------------------------------------------------------------------ */
// Presence publishes, per studying person, an opaque tag of the room they are
// currently in (see roomPresenceTag). A room is "live" when any of its
// verified members is studying with THAT room's tag -- so someone
// studying in room A never lights up room B, and a non-member can't fake a
// private room (its tag is unguessable). Returns a boolean on purpose: the
// lobby shows a glow, never a count or a name. If the roster RPC isn't
// available (SQL not run yet) we fall back to the tag alone rather than
// showing nothing.
export function isRoomLive(g, { membersByRoom, membersVerified, studyingRooms }) {
  if (!g || !(studyingRooms instanceof Map) || studyingRooms.size === 0) return false;
  const tag = roomPresenceTag(g.id);
  if (!tag) return false;
  // Rooms I belong to have a server-verified roster: require a real member.
  // Rooms I'm only browsing (public list) have no roster for me, so the
  // room-specific tag is the evidence.
  const memberSet = membersVerified && membersByRoom instanceof Map ? membersByRoom.get(g.id) : null;
  if (memberSet && memberSet.size > 0) {
    for (const uid of memberSet) if (studyingRooms.get(uid) === tag) return true;
    return false;
  }
  for (const t of studyingRooms.values()) if (t === tag) return true;
  return false;
}

/* ------------------------------------------------------------------ */
/* Left pane: the static picture + the one-line instruction on top      */
/* ------------------------------------------------------------------ */
function HeroPane() {
  return (
    <section className="sb-card sb-gt-hero" aria-label="Group Timer">
      <img className="sb-gt-hero-img" src={LOBBY_STATIC_SRC} alt="" draggable={false} decoding="async" />
      <span className="sb-gt-hero-scrim" aria-hidden="true" />
      <p className="sb-gt-hero-text">
        Select a <b>public group</b> or enter a <b>code</b> to join a <b>private group</b>
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Right pane, tab 1: public groups as full-width pills                 */
/* ------------------------------------------------------------------ */
function PublicList({ groups, loading, busyId, onJoin, isLive }) {
  if (loading && groups.length === 0) {
    return (
      <ul className="sb-gt-list" aria-busy="true">
        {[0, 1, 2, 3].map((i) => <li key={i} className="sb-gt-row sb-gt-row-skeleton" aria-hidden="true" />)}
      </ul>
    );
  }
  if (groups.length === 0) {
    return <EmptyState mood="idle" text="No public groups yet" sub="Create a private group and invite your friends instead." />;
  }
  return (
    <ul className="sb-gt-list">
      {groups.map((g) => {
        const live = !!isLive?.(g);
        return (
          <li key={g.id}>
            <button
              type="button"
              className={`sb-gt-row ${live ? "sb-gt-row-live" : ""}`}
              onClick={() => onJoin(g)}
              disabled={busyId === g.id}
              aria-label={`${g.is_member ? "Open" : "Join"} ${g.name}`}
            >
              <span className={`sb-gt-row-icon ${live ? "live" : ""}`} aria-hidden="true"><Globe2 size={17} /></span>
              <span className="sb-gt-row-main">
                <span className="sb-gt-row-name">{g.name}</span>
                <span className="sb-gt-row-meta">
                  <Users size={12} /> {Number(g.member_count)} {Number(g.member_count) === 1 ? "member" : "members"}
                </span>
              </span>
              <span className={`sb-gt-row-cta ${g.is_member ? "joined" : ""}`}>
                {busyId === g.id ? "Opening…" : g.is_member ? <><CheckCircle2 size={13} /> Joined</> : <>Join <ChevronRight size={14} /></>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Right pane, tab 2: join with a code / make a group / my private ones */
/* ------------------------------------------------------------------ */
function PrivatePanel({ myGroups, loading, busyId, onJoinOpen, onCreateOpen, onOpenGroup, isLive }) {
  const mine = myGroups.filter((g) => !g.is_public);
  return (
    <div className="sb-gt-private">
      <div className="sb-gt-options">
        <button type="button" className="sb-gt-option" onClick={onJoinOpen}>
          <span className="sb-gt-option-icon" aria-hidden="true"><KeyRound size={20} /></span>
          <span className="sb-gt-option-title">Join with a code</span>
          <span className="sb-gt-option-sub">Got a 6-character code from a friend?</span>
        </button>
        <button type="button" className="sb-gt-option" onClick={onCreateOpen}>
          <span className="sb-gt-option-icon" aria-hidden="true"><Plus size={20} /></span>
          <span className="sb-gt-option-title">Create a group</span>
          <span className="sb-gt-option-sub">Make a room and share its code</span>
        </button>
      </div>

      <h3 className="sb-gt-subhead">Your private groups</h3>
      {loading && mine.length === 0 ? (
        <ul className="sb-gt-list" aria-busy="true">
          {[0, 1].map((i) => <li key={i} className="sb-gt-row sb-gt-row-skeleton" aria-hidden="true" />)}
        </ul>
      ) : mine.length === 0 ? (
        <p className="sb-muted sb-gt-none">You haven't joined any private groups yet.</p>
      ) : (
        <ul className="sb-gt-list">
          {mine.map((g) => {
            const live = !!isLive?.(g);
            return (
              <li key={g.id}>
                <button
                  type="button"
                  className={`sb-gt-row ${live ? "sb-gt-row-live" : ""}`}
                  onClick={() => onOpenGroup(g)}
                  disabled={busyId === g.id}
                  aria-label={`Open ${g.name}`}
                >
                  <span className={`sb-gt-row-icon priv ${live ? "live" : ""}`} aria-hidden="true"><Lock size={16} /></span>
                  <span className="sb-gt-row-main">
                    <span className="sb-gt-row-name">{g.name}</span>
                    <span className="sb-gt-row-meta">
                      <Users size={12} /> {Number(g.member_count)} {Number(g.member_count) === 1 ? "member" : "members"}
                    </span>
                  </span>
                  <span className="sb-gt-row-cta">{busyId === g.id ? "Opening…" : <>Open <ChevronRight size={14} /></>}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The lobby                                                            */
/* ------------------------------------------------------------------ */
export default function GroupLobby({
  groups, studyingRooms, canMakePublic,
  finishedSessionWaiting, onOpenFocusTimer, onEnter, notice, onDismissNotice,
}) {
  const [tab, setTab] = useState("public");
  const [dialog, setDialog] = useState(null); // null | "join" | "create"
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // The roster behind the glow check only loads on mount; re-read it now and
  // then (foreground only) so someone who joins a room while the lobby is open
  // still lights it up.
  const refreshGroups = groups.refresh;
  useEffect(() => {
    if (!refreshGroups) return undefined;
    const id = setInterval(() => { if (!document.hidden) refreshGroups(); }, 45000);
    return () => clearInterval(id);
  }, [refreshGroups]);

  const isLive = (g) =>
    isRoomLive(g, {
      membersByRoom: groups.membersByRoom,
      membersVerified: groups.membersVerified,
      studyingRooms,
    });

  const openPublic = async (g) => {
    setBusyId(g.id);
    setActionError(null);
    const res = await groups.joinPublic(g.id);
    setBusyId(null);
    if (res.error) setActionError(res.error);
    else onEnter(res.group);
  };

  // A private group in "Your groups" is already joined (membership is what
  // lists it), and the row from gt_my_groups has everything a room needs --
  // including the join code -- so it opens straight away.
  const openMine = (g) => {
    setActionError(null);
    onEnter(g);
  };

  const join = async (code) => {
    const res = await groups.joinByCode(code);
    if (res.error) return res;
    setDialog(null);
    onEnter(res.group);
    return res;
  };

  return (
    <div className="sb-gt-lobby">
      <div className="sb-gt-titlebar">
        <h1 className="sb-gt-title">Group Timer</h1>
        <span className="sb-gt-tagline">Everyone on their own timer — together.</span>
      </div>

      {notice && (
        <p className="sb-gt-banner" role="status">
          <AlertTriangle size={15} /> {notice}
          <button type="button" className="sb-gt-banner-x" onClick={onDismissNotice} aria-label="Dismiss">×</button>
        </p>
      )}

      {finishedSessionWaiting && (
        <p className="sb-gt-banner" role="status">
          <TimerIcon size={15} /> Your last focus session is waiting to be saved.
          <button type="button" className="sb-gt-banner-link" onClick={onOpenFocusTimer}>Open Focus Timer</button>
        </p>
      )}

      <div className="sb-gt-lobby-grid">
        <HeroPane />

        <section className="sb-card sb-gt-side" aria-label="Choose a group">
          {/* The segmented pill spans the pane's full width on purpose --
              a short pill floating in a wide card looked off. */}
          <div className="sb-gt-seg" role="tablist" aria-label="Group type">
            <button type="button" role="tab" aria-selected={tab === "public"} className={tab === "public" ? "on" : ""} onClick={() => setTab("public")}>
              <Globe2 size={15} /> Public
            </button>
            <button type="button" role="tab" aria-selected={tab === "private"} className={tab === "private" ? "on" : ""} onClick={() => setTab("private")}>
              <Lock size={15} /> Private
            </button>
          </div>

          {(groups.error || actionError) && (
            <p className="sb-gt-error" role="alert">
              <AlertTriangle size={14} /> {actionError || groups.error}
              {groups.error && !actionError && (
                <button type="button" className="sb-gt-banner-link" onClick={groups.refresh}><RefreshCw size={12} /> Retry</button>
              )}
            </p>
          )}

          <div className="sb-gt-side-body" role="tabpanel">
            {tab === "public" ? (
              <PublicList
                groups={groups.publicGroups}
                loading={groups.loading}
                busyId={busyId}
                onJoin={openPublic}
                isLive={isLive}
              />
            ) : (
              <PrivatePanel
                myGroups={groups.myGroups}
                loading={groups.loading}
                busyId={busyId}
                onJoinOpen={() => setDialog("join")}
                onCreateOpen={() => setDialog("create")}
                onOpenGroup={openMine}
                isLive={isLive}
              />
            )}
          </div>
        </section>
      </div>

      {dialog === "join" && <JoinCodeDialog onJoin={join} onClose={() => setDialog(null)} />}
      {dialog === "create" && (
        <CreateGroupDialog
          canMakePublic={canMakePublic}
          onCreate={groups.createGroup}
          onEnter={(g) => { setDialog(null); onEnter(g); }}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
