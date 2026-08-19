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

      /* ---- settings-style side toggle: one card at a time ---- */
      .sb-community-shell { margin-top: 16px; }
      .sb-community-content { gap: 0; }

      /* Each tab now shows exactly one card standalone, so it should read
         like a proper full section, not a cramped little box: more padding,
         a real min-height so short content doesn't float tiny in empty
         space, and slightly bigger type throughout. */
      .sb-community-content > .sb-card { padding: 26px 24px; min-height: 460px; display: flex; flex-direction: column; }
      .sb-community-content .sb-section-title { font-size: 18px; margin-bottom: 18px; }
      .sb-community-content .sb-icon-badge { width: 34px; height: 34px; }
      .sb-community-content .sb-icon-badge svg { width: 18px; height: 18px; }

      /* Chat is now its own tab instead of sharing space with check-ins and
         the feed, so it gets a noticeably bigger, roomier list. The card
         itself is given a real, fixed height and turned into a flex
         column — the message list is the only part that stretches/scrolls,
         the composer stays pinned full-width at the bottom instead of
         floating as a small leftover box under a tall, mostly-empty card. */
      .sb-community-content > .sb-card.sb-community-chat {
        height: min(74vh, 700px);
        min-height: 460px;
        padding-bottom: 20px;
      }
      .sb-community-content .sb-chat-list { flex: 1; min-height: 0; max-height: none; gap: 14px; }
      .sb-community-content .sb-chat-msg-content { font-size: 14.5px; padding: 10px 14px; }
      .sb-community-content .sb-post-list { gap: 18px; }
      .sb-community-content .sb-post { padding: 16px 18px; }
      .sb-community-content .sb-post-content { font-size: 14.5px; }
      .sb-community-content .sb-post-name { font-size: 14px; }
      .sb-community-content .sb-checkins-row { padding: 12px 14px; }
      .sb-community-content .sb-checkins-name { font-size: 14px; }
      .sb-community-content .sb-checkins-goal { font-size: 13px; }
      .sb-community-content .sb-checkin-goal-text { font-size: 15px; }
      .sb-community-content .sb-goal-item-text { font-size: 15px; }
      .sb-community-content .sb-checkin-form label,
      .sb-community-content .sb-checkin-report label { font-size: 12px; }

      @media (min-width: 641px) and (max-width: 1023px) {
        .sb-community-stats { gap: 18px; }
        .sb-community-content > .sb-card { min-height: 500px; }
        .sb-community-content > .sb-card.sb-community-chat { height: min(76vh, 740px); }
      }

      @media (min-width: 1024px) {
        .sb-community-content > .sb-card { padding: 32px 30px; min-height: 560px; }
        .sb-community-content > .sb-card.sb-community-chat { height: min(78vh, 800px); padding-bottom: 26px; }
      }

      @media (max-width: 640px) {
        .sb-community-content > .sb-card { min-height: 380px; }
        .sb-community-content > .sb-card.sb-community-chat { height: min(72vh, 620px); min-height: 420px; }
      }

      /* ---------- check-ins list ---------- */
      .sb-checkins-list { display: flex; flex-direction: column; gap: 8px; }
      .sb-checkins-row {
        display: flex; align-items: flex-start; gap: 10px; padding: 9px 10px;
        border: 2px solid var(--mascot-outline); border-radius: 14px; background: var(--mascot-body);
      }
      .sb-checkins-row > span:first-child { margin-top: 2px; }
      .sb-checkins-body { flex: 1; min-width: 0; }
      .sb-checkins-name { font-weight: 800; font-size: 12.5px; color: var(--mascot-ink); margin-bottom: 3px; }
      .sb-checkins-goals { display: flex; flex-direction: column; gap: 4px; }
      .sb-checkins-goal-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .sb-checkins-goal { font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
      .sb-checkins-status {
        font-size: 10.5px; font-weight: 800; padding: 4px 9px; border-radius: 999px; white-space: nowrap; flex-shrink: 0;
        background: var(--mascot-inner); color: var(--mascot-ink); border: 1.5px solid var(--mascot-outline);
      }
      .sb-checkins-status.status-completed { background: #B8E6C1; }
      .sb-checkins-status.status-missed { opacity: .65; }

      /* ---------- chat ---------- */
      .sb-community-chat { display: flex; flex-direction: column; }
      .sb-channel-selector { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; flex-shrink: 0; }
      .sb-channel-selector .sb-chip {
        padding: 9px 18px; font-size: 13px; border-radius: 999px; font-weight: 800;
      }
      .sb-chat-list {
        display: flex; flex-direction: column; gap: 10px; overflow-y: auto;
        padding: 6px 8px; margin-bottom: 12px; border-radius: 18px;
        background: var(--mascot-inner); border: 2px solid var(--mascot-outline);
      }
      .sb-chat-load-older {
        align-self: center; font-size: 11.5px; font-weight: 800; color: var(--muted); background: none;
        border: none; cursor: pointer; text-decoration: underline; padding: 6px;
      }
      .sb-chat-msg { display: flex; gap: 8px; align-items: flex-start; position: relative; }
      .sb-chat-msg.own { flex-direction: row-reverse; }
      .sb-chat-msg-body { max-width: 78%; min-width: 0; }
      .sb-chat-msg.own .sb-chat-msg-body { text-align: right; }
      .sb-chat-msg-meta { display: flex; gap: 6px; align-items: baseline; font-size: 10.5px; color: var(--muted); }
      .sb-chat-msg.own .sb-chat-msg-meta { justify-content: flex-end; }
      .sb-chat-msg-name { font-weight: 800; color: var(--mascot-ink); display: inline-flex; align-items: center; gap: 4px; }
      .sb-chat-msg-content {
        display: inline-block; margin-top: 3px; padding: 8px 12px; border-radius: 14px;
        background: var(--card); border: 2px solid var(--mascot-outline); font-size: 13px;
        white-space: pre-wrap; word-break: break-word; box-shadow: 2px 2px 0 var(--mascot-outline);
      }
      .sb-chat-msg.own .sb-chat-msg-content { background: var(--accent); color: #fff; border-color: var(--mascot-outline); }

      /* ---------- chat: reply ---------- */
      .sb-chat-msg.own .sb-chat-msg-meta .sb-cm-actions { order: -1; }

      .sb-chat-reply-quote {
        display: flex; flex-direction: column; gap: 1px; text-align: left;
        max-width: 100%; margin-top: 4px; padding: 5px 9px;
        border-left: 3px solid var(--accent); border-radius: 8px;
        background: var(--mascot-inner); cursor: pointer; font: inherit;
      }
      .sb-chat-msg.own .sb-chat-reply-quote { text-align: right; border-left: none; border-right: 3px solid var(--accent); }
      .sb-chat-reply-quote-name { font-size: 10.5px; font-weight: 800; color: var(--mascot-ink); }
      .sb-chat-reply-quote-text {
        font-size: 11.5px; color: var(--muted);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;
      }
      .sb-chat-msg.own .sb-chat-reply-quote-text { margin-left: auto; }

      @keyframes sbChatHighlight {
        0% { background: var(--mascot-inner); }
        30% { background: var(--accent2); }
        100% { background: var(--mascot-inner); }
      }
      @keyframes sbChatHighlightOwn {
        0% { background: var(--accent); }
        30% { background: var(--accent2); }
        100% { background: var(--accent); }
      }
      /* own bubbles sit on --accent normally, not --mascot-inner — a
         dedicated keyframe keeps the flash starting/ending on the right
         base color instead of visibly jumping to the wrong one */
      .sb-chat-msg.highlight:not(.own) .sb-chat-msg-content { animation: sbChatHighlight 1.2s ease; }
      .sb-chat-msg.own.highlight .sb-chat-msg-content { animation: sbChatHighlightOwn 1.2s ease; }

      .sb-chat-reply-bar {
        display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        margin-bottom: 8px; padding: 8px 12px;
        border: 2px solid var(--mascot-outline); border-left: 4px solid var(--accent); border-radius: 12px;
        background: var(--mascot-body);
      }
      .sb-chat-reply-bar-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      .sb-chat-reply-bar-name { font-size: 11px; font-weight: 800; color: var(--mascot-ink); }
      .sb-chat-reply-bar-text {
        font-size: 12px; color: var(--muted);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .sb-chat-reply-bar-cancel {
        flex-shrink: 0; background: none; border: none; cursor: pointer; color: var(--muted);
        padding: 6px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;
      }
      .sb-chat-reply-bar-cancel:hover { background: var(--mascot-inner); color: #C24444; }

      @media (max-width: 640px) {
        .sb-chat-reply-quote-text { max-width: 150px; }
      }

      /* Composer: the actual thing that was left half-finished before —
         a real full-width input bar with an auto-growing textarea (up to
         5 lines), a proper counter, and a send button that matches the
         rest of the app's sticker-button language instead of a bare
         circle. Pinned to the bottom of the flex column via flex-shrink:0
         on the card, so it always spans the full card width. */
      .sb-chat-composer {
        display: flex; gap: 10px; align-items: flex-end; flex-shrink: 0;
        background: var(--card); border: 2.5px solid var(--mascot-outline); border-radius: 20px;
        padding: 8px 8px 8px 16px; box-shadow: 3px 3px 0 var(--mascot-outline);
        transition: box-shadow .15s ease, transform .15s ease;
      }
      .sb-chat-composer:focus-within { box-shadow: 4px 4px 0 var(--mascot-outline); transform: translate(-1px, -1px); }
      .sb-chat-composer textarea {
        flex: 1; resize: none; border: none; outline: none; background: transparent;
        padding: 10px 0; font-family: var(--font-body); font-size: 14.5px; line-height: 1.4;
        color: var(--ink); max-height: 140px; overflow-y: auto;
      }
      .sb-chat-composer textarea::placeholder { color: var(--muted); opacity: .8; }
      .sb-chat-composer button {
        width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--mascot-outline);
        background: var(--mascot-outline); color: var(--bg); display: inline-flex; align-items: center;
        justify-content: center; cursor: pointer; box-shadow: 2px 2px 0 var(--accent2); flex-shrink: 0;
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .sb-chat-composer button:hover:not(:disabled) { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--accent2); }
      .sb-chat-composer button:active:not(:disabled) { transform: translate(0, 0); box-shadow: 1px 1px 0 var(--accent2); }
      .sb-chat-composer button:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
      .sb-chat-composer-foot {
        display: flex; justify-content: space-between; align-items: center;
        margin-top: 8px; flex-shrink: 0; gap: 10px;
      }
      .sb-chat-hint { font-size: 11px; color: var(--muted); font-weight: 600; }
      .sb-chat-hint kbd {
        font-family: inherit; font-size: 10px; font-weight: 800; padding: 1.5px 5px;
        border: 1.5px solid var(--mascot-outline); border-radius: 5px; background: var(--mascot-inner);
      }
      .sb-chat-counter { font-size: 10.5px; color: var(--muted); font-weight: 700; white-space: nowrap; }
      .sb-chat-counter.warn { color: #C24444; }
      .sb-chat-expiry-note { margin-top: 6px; text-align: center; }

      /* ---------- accountability card ---------- */
      .sb-checkin-form, .sb-checkin-report { display: flex; flex-direction: column; gap: 13px; }
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
      .sb-checkin-form > .sb-checkin-btn-row { margin-top: 2px; }
      .sb-checkin-btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .sb-checkin-error { font-size: 12px; font-weight: 700; color: #C24444; }

      /* today's goal checklist */
      .sb-goal-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
      .sb-goal-item {
        border: 2px solid var(--mascot-outline); border-radius: 12px; padding: 11px 13px;
        background: var(--card); display: flex; flex-direction: column; gap: 9px;
      }
      .sb-goal-item.status-completed { background: var(--mascot-inner); }
      .sb-goal-item.status-missed { opacity: .7; }
      .sb-goal-item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
      .sb-goal-item-body { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
      .sb-goal-item-tag { font-size: 11px; font-weight: 800; color: var(--muted); letter-spacing: .01em; }
      .sb-goal-item-text { font-weight: 700; font-size: 13.5px; color: var(--mascot-ink); line-height: 1.35; }
      .sb-goal-item-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .sb-goal-status-pill {
        font-size: 10.5px; font-weight: 800; padding: 4px 9px; border-radius: 999px;
        border: 1.5px solid var(--mascot-outline); background: var(--mascot-body); color: var(--mascot-ink);
        white-space: nowrap;
      }
      .sb-goal-status-pill.status-completed { background: #B8E6C1; }
      .sb-goal-status-pill.status-partial { background: #FCE3A5; }
      .sb-goal-status-pill.status-missed { background: transparent; opacity: .75; }
      .sb-goal-icon-btn {
        border: none; background: transparent; color: var(--muted); cursor: pointer;
        padding: 4px; display: flex; align-items: center; border-radius: 6px;
      }
      .sb-goal-icon-btn:hover { color: #C24444; }
      .sb-goal-add-btn {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        width: 100%; padding: 10px; border-radius: 12px; border: 2px dashed var(--mascot-outline);
        background: transparent; color: var(--mascot-ink); font-weight: 800; font-size: 13px; cursor: pointer;
      }
      .sb-goal-add-btn:hover { background: var(--mascot-inner); }
      .sb-goal-cap-note { text-align: center; padding: 8px 0; }

      .sb-checkin-weekly {
        margin-top: 16px; padding-top: 13px; border-top: 1.5px dashed var(--mascot-outline);
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }
      .sb-checkin-weekly-count { font-size: 13px; font-weight: 800; color: var(--mascot-ink); }

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
      .sb-composer-attach {
        align-self: flex-start; display: inline-flex; align-items: center; gap: 6px;
        border: 2px dashed var(--mascot-outline); background: var(--mascot-body); color: var(--mascot-ink);
        border-radius: 12px; padding: 7px 12px; font-size: 12px; font-weight: 800; cursor: pointer;
      }
      .sb-composer-attach:hover { background: var(--mascot-inner); }
      .sb-composer-image-preview { position: relative; width: 100%; max-width: 260px; border-radius: 14px; overflow: hidden;
        border: 2px solid var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-composer-image-preview img { display: block; width: 100%; max-height: 220px; object-fit: cover; }
      .sb-composer-image-remove {
        position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%;
        border: 2px solid var(--mascot-outline); background: var(--card); color: var(--ink);
        display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
      }
      .sb-post-image-wrap { display: block; margin-top: 10px; border-radius: 14px; overflow: hidden;
        border: 2px solid var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-post-image { display: block; width: 100%; max-height: 360px; object-fit: cover; }

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
      .sb-post-reply { font-size: 12px; display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
      .sb-post-reply-text { flex: 1; min-width: 0; }
      .sb-post-reply-name { font-weight: 800; margin-right: 4px; display: inline-flex; align-items: center; gap: 4px; }
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
