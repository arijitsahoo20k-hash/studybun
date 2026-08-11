import React from "react";

/*
 * Styles just for the Community + Accountability page. Kept separate from
 * GlobalStyle.jsx (same reasoning as AuthOnboardStyle.jsx) and leans on
 * the same CSS custom properties + offset hard-shadow "sticker" language
 * the rest of the app uses (border + box-shadow: Npx Npx 0 var(--mascot-outline)).
 */
export default function CommunityStyle() {
  return (
    <style>{`
      .sb-community-stats { display: flex; gap: 14px; flex-wrap: wrap; align-self: center; }
      .sb-community-stat {
        display: inline-flex; align-items: center; gap: 6px;
        background: var(--mascot-body); border: 2px solid var(--mascot-outline);
        border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: 12px;
        color: var(--mascot-ink); box-shadow: 2px 2px 0 var(--mascot-outline);
      }

      .sb-community-page { max-width: 1180px; margin: 0 auto; }
      .sb-community-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }
      .sb-community-col-main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }

      /* ---- tablet: still stacked, but roomier and side card up top ---- */
      @media (min-width: 641px) and (max-width: 1023px) {
        .sb-community-grid { gap: 22px; }
        .sb-community-col-side { order: -1; }
        .sb-community-stats { gap: 18px; }
        .sb-chat-list { max-height: min(46vh, 460px); }
        .sb-post-list { gap: 16px; }
      }

      /* ---- desktop: two columns, sidebar pinned ---- */
      @media (min-width: 1024px) {
        .sb-community-grid { grid-template-columns: minmax(0, 1fr) 300px; gap: 28px; align-items: start; }
        .sb-community-col-side { position: sticky; top: 18px; }
        .sb-chat-list { max-height: min(50vh, 480px); }
      }

      /* ---------- check-ins list ---------- */
      .sb-checkins-list { display: flex; flex-direction: column; gap: 8px; }
      .sb-checkins-row {
        display: flex; align-items: center; gap: 10px; padding: 8px 10px;
        border: 2px solid var(--mascot-outline); border-radius: 14px; background: var(--mascot-body);
      }
      .sb-checkins-body { flex: 1; min-width: 0; }
      .sb-checkins-name { font-weight: 800; font-size: 12.5px; color: var(--mascot-ink); }
      .sb-checkins-goal { font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sb-checkins-status {
        font-size: 10.5px; font-weight: 800; padding: 4px 9px; border-radius: 999px; white-space: nowrap;
        background: var(--mascot-inner); color: var(--mascot-ink); border: 1.5px solid var(--mascot-outline);
      }
      .sb-checkins-status.status-completed { background: #B8E6C1; }
      .sb-checkins-status.status-missed { opacity: .65; }

      /* ---------- chat ---------- */
      .sb-community-chat { display: flex; flex-direction: column; }
      .sb-channel-selector { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
      .sb-chat-list {
        display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto;
        padding: 4px 2px; margin-bottom: 10px;
      }
      .sb-chat-load-older {
        align-self: center; font-size: 11px; font-weight: 800; color: var(--muted); background: none;
        border: none; cursor: pointer; text-decoration: underline; padding: 4px;
      }
      .sb-chat-msg { display: flex; gap: 8px; align-items: flex-start; position: relative; }
      .sb-chat-msg.own { flex-direction: row-reverse; }
      .sb-chat-msg-body { max-width: 78%; min-width: 0; }
      .sb-chat-msg.own .sb-chat-msg-body { text-align: right; }
      .sb-chat-msg-meta { display: flex; gap: 6px; align-items: baseline; font-size: 10.5px; color: var(--muted); }
      .sb-chat-msg.own .sb-chat-msg-meta { justify-content: flex-end; }
      .sb-chat-msg-name { font-weight: 800; color: var(--mascot-ink); }
      .sb-chat-msg-content {
        display: inline-block; margin-top: 3px; padding: 8px 12px; border-radius: 14px;
        background: var(--mascot-body); border: 2px solid var(--mascot-outline); font-size: 13px;
        white-space: pre-wrap; word-break: break-word; box-shadow: 2px 2px 0 var(--mascot-outline);
      }
      .sb-chat-msg.own .sb-chat-msg-content { background: var(--mascot-inner); }
      .sb-chat-composer { display: flex; gap: 8px; align-items: flex-end; }
      .sb-chat-composer textarea {
        flex: 1; resize: none; border: 2px solid var(--mascot-outline); border-radius: 14px;
        padding: 8px 12px; font-family: var(--font-body); font-size: 13px; background: var(--card);
        color: var(--ink);
      }
      .sb-chat-composer button {
        width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--mascot-outline);
        background: var(--mascot-outline); color: var(--bg); display: inline-flex; align-items: center;
        justify-content: center; cursor: pointer; box-shadow: 2px 2px 0 var(--accent2); flex-shrink: 0;
      }
      .sb-chat-composer button:disabled { opacity: .5; cursor: not-allowed; }
      .sb-chat-expiry-note { margin-top: 8px; text-align: center; }

      /* ---------- accountability card ---------- */
      .sb-checkin-form, .sb-checkin-active, .sb-checkin-report { display: flex; flex-direction: column; gap: 13px; }
      .sb-checkin-form label, .sb-checkin-report label {
        display: flex; flex-direction: column; gap: 5px; font-size: 11px; font-weight: 800;
        color: var(--muted); letter-spacing: .02em; text-transform: uppercase;
      }
      .sb-checkin-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .sb-checkin-form input, .sb-checkin-form select, .sb-checkin-report input {
        border: 2px solid var(--mascot-outline); border-radius: 10px; padding: 8px 11px;
        font-family: var(--font-body); font-size: 13px; font-weight: 600; background: var(--card);
        color: var(--ink); line-height: 1.3; min-width: 0;
      }
      .sb-checkin-form select {
        appearance: none; -webkit-appearance: none;
        background-image: linear-gradient(45deg, transparent 50%, var(--mascot-outline) 50%),
          linear-gradient(135deg, var(--mascot-outline) 50%, transparent 50%);
        background-position: calc(100% - 18px) center, calc(100% - 13px) center;
        background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 30px;
      }
      .sb-checkin-form input::placeholder { font-weight: 500; opacity: .55; }
      .sb-checkin-form > .sb-btn { margin-top: 2px; }
      .sb-checkin-active { padding-top: 2px; gap: 10px; }
      .sb-checkin-active-line strong { color: var(--mascot-ink); }
      .sb-checkin-goal-text { font-weight: 700; font-size: 13.5px; }
      .sb-checkin-btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .sb-checkin-done { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--mascot-ink); padding: 6px 0; }
      .sb-checkin-weekly { margin-top: 16px; padding-top: 13px; border-top: 1.5px dashed var(--mascot-outline); font-size: 13px; font-weight: 700; }

      /* ---------- feed ---------- */
      .sb-composer-trigger {
        width: 100%; text-align: left; padding: 10px 14px; border-radius: 14px;
        border: 2px dashed var(--mascot-outline); background: var(--mascot-body); color: var(--muted);
        font-size: 12.5px; font-weight: 700; cursor: pointer; margin-bottom: 14px;
      }
      .sb-composer-form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
      .sb-composer-types { display: flex; gap: 6px; flex-wrap: wrap; }
      .sb-composer-form input, .sb-composer-form textarea {
        border: 2px solid var(--mascot-outline); border-radius: 10px; padding: 8px 10px;
        font-family: var(--font-body); font-size: 13px; background: var(--card); color: var(--ink); resize: vertical;
      }
      .sb-post-list { display: flex; flex-direction: column; gap: 14px; }
      .sb-post {
        border: 2px solid var(--mascot-outline); border-radius: 16px; padding: 12px 14px;
        background: var(--mascot-body); box-shadow: 3px 3px 0 var(--mascot-outline); position: relative;
      }
      .sb-post-head { display: flex; align-items: center; gap: 9px; }
      .sb-post-who { flex: 1; min-width: 0; }
      .sb-post-name { font-weight: 800; font-size: 13px; color: var(--mascot-ink); }
      .sb-post-meta { font-size: 10.5px; color: var(--muted); }
      .sb-post-type { font-weight: 800; letter-spacing: .04em; }
      .sb-post-tag { font-size: 11.5px; font-weight: 800; color: var(--mascot-ink); margin-top: 6px; }
      .sb-post-content { font-size: 13.5px; margin-top: 6px; white-space: pre-wrap; word-break: break-word; }
      .sb-post-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
      .sb-post-reaction {
        display: inline-flex; align-items: center; gap: 5px; border: 1.5px solid var(--mascot-outline);
        background: var(--card); border-radius: 999px; padding: 5px 10px; font-size: 11px; font-weight: 800;
        color: var(--mascot-ink); cursor: pointer;
      }
      .sb-post-reaction.active { background: var(--mascot-inner); }
      .sb-post-replies { margin-top: 10px; padding-top: 10px; border-top: 1.5px dashed var(--mascot-outline); display: flex; flex-direction: column; gap: 6px; }
      .sb-post-reply { font-size: 12px; }
      .sb-post-reply-name { font-weight: 800; margin-right: 4px; }
      .sb-post-reply-form { display: flex; gap: 6px; margin-top: 4px; }
      .sb-post-reply-form input {
        flex: 1; border: 2px solid var(--mascot-outline); border-radius: 999px; padding: 6px 12px;
        font-size: 12px; background: var(--card); color: var(--ink);
      }
      .sb-post-reply-form button {
        border: 2px solid var(--mascot-outline); background: var(--mascot-outline); color: var(--bg);
        border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: 11.5px; cursor: pointer;
      }

      /* ---------- shared content actions (report/block/delete) ---------- */
      .sb-cm-actions { position: relative; }
      .sb-cm-actions-trigger {
        background: none; border: none; cursor: pointer; color: var(--muted); padding: 4px;
        display: inline-flex; align-items: center; justify-content: center; border-radius: 8px;
      }
      .sb-cm-actions-trigger:hover { background: var(--mascot-inner); }
      .sb-cm-actions-backdrop { position: fixed; inset: 0; z-index: 40; }
      .sb-cm-actions-menu, .sb-cm-actions-panel {
        position: absolute; right: 0; top: 100%; margin-top: 4px; z-index: 41;
        background: var(--card); border: 2px solid var(--mascot-outline); border-radius: 12px;
        box-shadow: 3px 3px 0 var(--mascot-outline); min-width: 170px; padding: 6px;
        display: flex; flex-direction: column; gap: 2px;
      }
      .sb-cm-actions-menu button {
        display: flex; align-items: center; gap: 7px; background: none; border: none; cursor: pointer;
        text-align: left; padding: 7px 9px; border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--ink);
      }
      .sb-cm-actions-menu button:hover { background: var(--mascot-inner); }
      .sb-cm-actions-menu button.danger { color: #C24444; }
      .sb-cm-actions-panel { min-width: 220px; padding: 10px; gap: 8px; }
      .sb-cm-panel-label { font-size: 11px; font-weight: 800; color: var(--muted); }
      .sb-cm-actions-panel select, .sb-cm-actions-panel textarea {
        width: 100%; border: 2px solid var(--mascot-outline); border-radius: 8px; padding: 6px 8px;
        font-family: var(--font-body); font-size: 12px; background: var(--card); color: var(--ink); resize: vertical;
      }
      .sb-cm-panel-btns { display: flex; justify-content: flex-end; gap: 6px; }
      .sb-cm-panel-btns button {
        border: 2px solid var(--mascot-outline); background: var(--mascot-body); border-radius: 999px;
        padding: 6px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; color: var(--ink);
      }
      .sb-cm-panel-btns button.primary { background: var(--mascot-outline); color: var(--bg); }
      .sb-cm-error { color: #C24444; font-size: 11.5px; font-weight: 700; margin-top: 6px; }

      @media (max-width: 640px) {
        .sb-checkin-row { grid-template-columns: 1fr; }
        .sb-chat-msg-body { max-width: 88%; }
      }
    `}</style>
  );
}
