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
        background: var(--card); border: 2px solid var(--mascot-outline);
        border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: 12px;
        color: var(--mascot-ink); box-shadow: 2px 2px 0 var(--mascot-outline);
      }

      .sb-community-page { max-width: 1180px; margin: 0 auto; }

      /* ---- settings-style side toggle: one card at a time ---- */
      .sb-community-shell { margin-top: 16px; }
      .sb-community-content { gap: 0; }

      .sb-community-content > .sb-card { padding: 26px 24px; min-height: 460px; display: flex; flex-direction: column; }
      .sb-community-content .sb-section-title { font-size: 18px; margin-bottom: 18px; }
      .sb-community-content .sb-icon-badge { width: 34px; height: 34px; }
      .sb-community-content .sb-icon-badge svg { width: 18px; height: 18px; }

      .sb-community-content > .sb-card.sb-community-chat {
        height: min(74vh, 700px);
        height: min(74dvh, 700px);
        min-height: 460px;
        padding-bottom: 20px;
      }
      .sb-community-content .sb-chat-list { flex: 1; min-height: 0; max-height: none; gap: 6px; }
      .sb-community-content .sb-chat-msg-content { font-size: 15px; padding: 10px 14px; }
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
        .sb-community-content > .sb-card.sb-community-chat { height: min(76vh, 740px); height: min(76dvh, 740px); }
      }

      @media (min-width: 1024px) {
        .sb-community-content > .sb-card { padding: 32px 30px; min-height: 560px; }
        .sb-community-content > .sb-card.sb-community-chat { height: min(78vh, 800px); height: min(78dvh, 800px); padding-bottom: 26px; }
      }

      @media (max-width: 640px) {
        .sb-community-content > .sb-card { min-height: 380px; }
        .sb-community-content > .sb-card.sb-community-chat { height: min(84vh, 680px); height: min(84dvh, 680px); min-height: 480px; }
      }

      /* ---------- check-ins list ---------- */
      .sb-checkins-list { display: flex; flex-direction: column; gap: 8px; }
      .sb-checkins-row {
        display: flex; align-items: flex-start; gap: 10px; padding: 9px 10px;
        border: 2px solid var(--mascot-outline); border-radius: 14px; background: var(--card);
      }
      .sb-checkins-row > span:first-child { margin-top: 2px; }
      .sb-checkins-body { flex: 1; min-width: 0; }
      .sb-checkins-name { font-weight: 800; font-size: 12.5px; color: var(--mascot-ink); margin-bottom: 3px; }
      .sb-checkins-goals { display: flex; flex-direction: column; gap: 4px; }
      .sb-checkins-goal-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .sb-checkins-goal { font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
      .sb-checkins-status {
        font-size: 10.5px; font-weight: 800; padding: 4px 9px; border-radius: 999px; white-space: nowrap; flex-shrink: 0;
        background: var(--soft); color: var(--mascot-ink); border: 1.5px solid var(--mascot-outline);
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
        background: var(--card); border: 2px solid var(--mascot-outline);
      }
      .sb-chat-load-older {
        align-self: center; font-size: 11.5px; font-weight: 800; color: var(--muted); background: none;
        border: none; cursor: pointer; text-decoration: underline; padding: 6px;
      }
      .sb-chat-msg { display: flex; gap: 8px; align-items: flex-start; position: relative; margin-bottom: 10px; }
      .sb-chat-msg.own { flex-direction: row-reverse; }
      .sb-chat-msg-avatar { width: 26px; flex-shrink: 0; }
      .sb-chat-msg.grouped { margin-bottom: 3px; }
      .sb-chat-msg.grouped .sb-chat-msg-avatar { visibility: hidden; }
      .sb-chat-msg-body { max-width: 82%; min-width: 0; }
      .sb-chat-msg.own .sb-chat-msg-body { text-align: right; }
      .sb-chat-msg-meta { display: flex; gap: 6px; align-items: baseline; font-size: 11px; color: var(--muted); margin-bottom: 2px; }
      .sb-chat-msg.own .sb-chat-msg-meta { justify-content: flex-end; }
      .sb-chat-msg-name { font-weight: 800; color: var(--mascot-ink); display: inline-flex; align-items: center; gap: 4px; }

      /* ---------- chat: date separators ---------- */
      .sb-chat-date-sep { display: flex; justify-content: center; margin: 10px 0 14px; }
      .sb-chat-date-sep span {
        font-size: 11px; font-weight: 800; color: var(--muted); background: var(--soft);
        padding: 4px 13px; border-radius: 999px; border: 1.5px solid var(--mascot-outline);
      }

      /* ---------- chat: bubble + actions ---------- */
      .sb-chat-bubble-wrap { position: relative; display: inline-block; max-width: 100%; }
      .sb-chat-msg-content {
        display: inline-block; margin-top: 3px; padding: 9px 13px; border-radius: 14px;
        background: var(--card); border: 2px solid var(--mascot-outline); font-size: 14.5px; line-height: 1.42;
        white-space: pre-wrap; word-break: break-word; box-shadow: 2px 2px 0 var(--mascot-outline);
      }
      .sb-chat-msg.own .sb-chat-msg-content { background: var(--accent); color: #fff; border-color: var(--mascot-outline); }
      .sb-chat-msg .sb-cm-actions {
        position: absolute; top: -8px; right: -8px; background: var(--card);
        border: 1.5px solid var(--mascot-outline); border-radius: 999px; box-shadow: 1px 1px 0 var(--mascot-outline);
      }
      .sb-chat-msg.own .sb-cm-actions { right: auto; left: -8px; }
      .sb-chat-msg .sb-cm-actions-trigger { min-width: 26px; min-height: 26px; padding: 2px; }

      /* ---------- chat: reply ---------- */
      .sb-chat-reply-quote {
        display: flex; flex-direction: column; gap: 1px; text-align: left;
        max-width: 100%; margin-top: 4px; padding: 5px 9px;
        border-left: 3px solid var(--accent); border-radius: 8px;
        background: var(--soft); cursor: pointer; font: inherit;
      }
      .sb-chat-msg.own .sb-chat-reply-quote { text-align: right; border-left: none; border-right: 3px solid var(--accent); }
      .sb-chat-reply-quote-name { font-size: 10.5px; font-weight: 800; color: var(--mascot-ink); }
      .sb-chat-reply-quote-text {
        font-size: 11.5px; color: var(--muted);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;
      }
      .sb-chat-msg.own .sb-chat-reply-quote-text { margin-left: auto; }

      @keyframes sbChatHighlight {
        0% { background: var(--soft); }
        30% { background: var(--accent2); }
        100% { background: var(--soft); }
      }
      @keyframes sbChatHighlightOwn {
        0% { background: var(--accent); }
        30% { background: var(--accent2); }
        100% { background: var(--accent); }
      }
      .sb-chat-msg.highlight:not(.own) .sb-chat-msg-content { animation: sbChatHighlight 1.2s ease; }
      .sb-chat-msg.own.highlight .sb-chat-msg-content { animation: sbChatHighlightOwn 1.2s ease; }

      .sb-chat-reply-bar {
        display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        margin-bottom: 8px; padding: 8px 12px;
        border: 2px solid var(--mascot-outline); border-left: 4px solid var(--accent); border-radius: 12px;
        background: var(--card);
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
      .sb-chat-reply-bar-cancel:hover { background: var(--soft); color: #C24444; }

      @media (max-width: 640px) {
        .sb-chat-reply-quote-text { max-width: 150px; }
      }

      .sb-chat-composer-zone { flex-shrink: 0; }
      .sb-chat-composer {
        display: flex; gap: 10px; align-items: flex-end; flex-shrink: 0;
        background: var(--card); border: 2.5px solid var(--mascot-outline); border-radius: 20px;
        padding: 8px 8px 8px 16px; box-shadow: 3px 3px 0 var(--mascot-outline);
        transition: box-shadow .15s ease, transform .15s ease;
      }
      .sb-chat-composer:focus-within { box-shadow: 4px 4px 0 var(--mascot-outline); transform: translate(-1px, -1px); }
      .sb-chat-composer textarea {
        flex: 1; resize: none; border: none; outline: none; background: transparent;
        padding: 10px 0; font-family: var(--font-body); font-size: 15px; line-height: 1.4;
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
        border: 1.5px solid var(--mascot-outline); border-radius: 5px; background: var(--soft);
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
      .sb-goal-item.status-completed { background: var(--soft); }
      .sb-goal-item.status-missed { opacity: .7; }
      .sb-goal-item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
      .sb-goal-item-body { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
      .sb-goal-item-tag { font-size: 11px; font-weight: 800; color: var(--muted); letter-spacing: .01em; }
      .sb-goal-item-text { font-weight: 700; font-size: 13.5px; color: var(--mascot-ink); line-height: 1.35; }
      .sb-goal-item-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .sb-goal-status-pill {
        font-size: 10.5px; font-weight: 800; padding: 4px 9px; border-radius: 999px;
        border: 1.5px solid var(--mascot-outline); background: var(--card); color: var(--mascot-ink);
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
      .sb-goal-add-btn:hover { background: var(--soft); }
      .sb-goal-cap-note { text-align: center; padding: 8px 0; }

      .sb-checkin-weekly {
        margin-top: 16px; padding-top: 13px; border-top: 1.5px dashed var(--mascot-outline);
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }
      .sb-checkin-weekly-count { font-size: 13px; font-weight: 800; color: var(--mascot-ink); }

      .sb-goal-history {
        display: flex; flex-direction: column; gap: 18px;
        max-height: 58vh; overflow-y: auto; padding-right: 2px; margin-bottom: 4px;
      }
      .sb-goal-history-loading { text-align: center; padding: 18px 0; }
      .sb-goal-history-day-head {
        display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
        margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1.5px dashed var(--mascot-outline);
      }
      .sb-goal-history-date {
        font-size: 12px; font-weight: 800; color: var(--mascot-ink); text-transform: uppercase; letter-spacing: .02em;
      }
      .sb-goal-history-ratio { font-size: 11.5px; font-weight: 800; color: var(--muted); white-space: nowrap; }
      .sb-goal-history-list { margin-bottom: 0; }
      .sb-goal-item-readonly { cursor: default; }

      /* ---------- feed / composer ---------- */
      .sb-composer-trigger {
        width: 100%; text-align: left; padding: 10px 14px; border-radius: 14px;
        border: 2px dashed var(--mascot-outline); background: var(--card); color: var(--muted);
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
        border: 2px dashed var(--mascot-outline); background: var(--card); color: var(--mascot-ink);
        border-radius: 12px; padding: 7px 12px; font-size: 12px; font-weight: 800; cursor: pointer;
      }
      .sb-composer-attach:hover { background: var(--soft); }

      /* Multi-image thumbnail row in the composer */
      .sb-composer-images-row {
        display: flex; gap: 8px; flex-wrap: wrap;
      }
      .sb-composer-image-thumb {
        position: relative; width: 80px; height: 80px; border-radius: 10px; overflow: hidden;
        border: 2px solid var(--mascot-outline); box-shadow: 2px 2px 0 var(--mascot-outline); flex-shrink: 0;
      }
      .sb-composer-image-thumb img {
        display: block; width: 100%; height: 100%; object-fit: cover;
      }
      .sb-composer-image-remove {
        position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 50%;
        border: 2px solid var(--mascot-outline); background: var(--card); color: var(--ink);
        display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
        min-width: 22px; min-height: 22px;
      }

      /* Legacy single-image preview (kept for future non-grid uses) */
      .sb-composer-image-preview { position: relative; width: 100%; max-width: 260px; border-radius: 14px; overflow: hidden;
        border: 2px solid var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-composer-image-preview img { display: block; width: 100%; max-height: 220px; object-fit: cover; }

      /* ---------- post image grid ---------- */
      .sb-post-img-grid {
        margin-top: 10px; border-radius: 14px; overflow: hidden;
        border: 2px solid var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline);
      }

      /* 1 image — full width */
      .sb-post-img-grid-1 { display: block; }
      .sb-post-img-grid-1 .sb-post-img-tile { display: block; width: 100%; }
      .sb-post-img-grid-1 .sb-post-img { display: block; width: 100%; max-height: 360px; object-fit: cover; }
      /* A broken image has no intrinsic size, so unlike the 2/3-image
         grids (sized by aspect-ratio/grid tracks regardless of the
         <img>), this tile would otherwise collapse to ~0 height when its
         image 404s — give the error state a visible floor. */
      .sb-post-img-grid-1 .sb-post-img-tile--error { min-height: 200px; }

      /* 2 images — equal columns */
      .sb-post-img-grid-2 {
        display: grid; grid-template-columns: 1fr 1fr; gap: 3px;
      }
      .sb-post-img-grid-2 .sb-post-img-tile { display: block; aspect-ratio: 1/1; overflow: hidden; }
      .sb-post-img-grid-2 .sb-post-img { width: 100%; height: 100%; object-fit: cover; display: block; }
      /* Tiles themselves stay square-cornered — the outer .sb-post-img-grid
         already clips to its own border-radius via overflow: hidden, so
         individual tiles don't need (and shouldn't add) their own radius. */
      .sb-post-img-grid-2 .sb-post-img-tile:first-child,
      .sb-post-img-grid-2 .sb-post-img-tile:last-child { border-radius: 0; }

      /* 3 images — 1 large left, 2 stacked right */
      .sb-post-img-grid-3 {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 3px;
        /* Fixed height so the grid doesn't blow up on tall portrait images */
        max-height: 360px;
      }
      .sb-post-img-grid-3 .sb-post-img-tile { display: block; overflow: hidden; min-height: 0; }
      .sb-post-img-grid-3 .sb-post-img-tile:first-child {
        grid-row: 1 / 3; /* spans both rows */
      }
      .sb-post-img-grid-3 .sb-post-img { width: 100%; height: 100%; object-fit: cover; display: block; }

      /* On screens ≤480px, drop to a 3-column equal grid — CSS-only */
      @media (max-width: 480px) {
        .sb-post-img-grid-3 {
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto;
          max-height: none;
        }
        .sb-post-img-grid-3 .sb-post-img-tile:first-child { grid-row: auto; }
        .sb-post-img-grid-3 .sb-post-img-tile { aspect-ratio: 1/1; }
      }

      /* Image tile button resets */
      .sb-post-img-tile {
        background: none; border: none; padding: 0; cursor: pointer;
        display: block; position: relative;
      }
      /* Negative offset (inset ring) instead of the usual +2px outward
         offset — .sb-post-img-grid clips overflow for its rounded corners,
         which would otherwise cut off an outward-offset focus ring on the
         2nd/3rd tile. An inset ring stays fully visible either way. */
      .sb-post-img-tile:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px; }

      /* Broken/missing image fallback — the <img> itself gets
         visibility:hidden on error (not display:none, which would
         collapse the tile's box in the 1-image grid where height comes
         from the <img>'s own rendered size) so the browser's native
         broken-image icon/alt-text never shows, while the tile keeps its
         layout size and shows its own background as the placeholder. */
      .sb-post-img-tile--error { background: var(--soft); }

      /* ---------- lightbox ---------- */
      /* The overlay itself reuses .sb-pt-overlay from GlobalStyle.
         We only add the lightbox-specific overrides here. */
      .sb-lightbox-overlay { padding: 0; }

      .sb-lightbox-dialog {
        position: relative;
        width: 100%; height: 100%;
        max-width: 100vw; max-height: 100vh;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: transparent;
        outline: none;
      }

      .sb-lightbox-close {
        position: fixed; top: 14px; right: 14px; z-index: 100;
        /* Inherits sb-pt-dialog-close sizing (30x30px circle) from GlobalStyle */
        min-width: 44px; min-height: 44px; width: 44px; height: 44px;
        background: rgba(20,16,14,.7); border-color: rgba(255,255,255,.2); color: #fff;
      }
      .sb-lightbox-close:hover { transform: rotate(90deg); background: rgba(20,16,14,.9); }

      .sb-lightbox-img-wrap {
        max-width: min(92vw, 1200px); max-height: min(82vh, 900px);
        display: flex; align-items: center; justify-content: center;
      }
      .sb-lightbox-img {
        max-width: 100%; max-height: min(82vh, 900px);
        object-fit: contain; border-radius: 8px;
        /* Prevent dragging the image from fighting with swipe */
        user-select: none; -webkit-user-drag: none;
      }

      .sb-lightbox-arrow {
        position: fixed; top: 50%; transform: translateY(-50%);
        width: 48px; height: 48px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,.25); background: rgba(20,16,14,.6); color: #fff;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 100;
        transition: background .12s ease, transform .12s ease;
        min-width: 44px; min-height: 44px;
      }
      .sb-lightbox-arrow:hover { background: rgba(20,16,14,.9); }
      .sb-lightbox-arrow-prev { left: 14px; }
      .sb-lightbox-arrow-next { right: 14px; }

      /* Dot indicator — reuses visual language of existing dot trackers */
      .sb-lightbox-dots {
        display: flex; gap: 8px; align-items: center; justify-content: center;
        margin-top: 16px; position: relative; z-index: 10;
      }
      .sb-lightbox-dot {
        width: 10px; height: 10px; border-radius: 50%;
        background: rgba(255,255,255,.35); border: none; padding: 0; cursor: pointer;
        transition: background .15s ease, transform .15s ease;
        /* Visual dot stays 10px (via ::after below); the button itself
           expands to a real 44px touch target, matching every other
           tappable control in this component (arrows, close, attach). */
        min-width: 44px; min-height: 44px;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .sb-lightbox-dot::after {
        content: ""; display: block; width: 10px; height: 10px; border-radius: 50%;
        background: rgba(255,255,255,.35);
        transition: background .15s ease;
      }
      .sb-lightbox-dot.active::after { background: #fff; transform: scale(1.1); }
      .sb-lightbox-dot:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

      @media (max-width: 640px) {
        .sb-lightbox-arrow-prev { left: 6px; }
        .sb-lightbox-arrow-next { right: 6px; }
        .sb-lightbox-close { top: 8px; right: 8px; }
      }

      /* ---------- feed post ---------- */
      .sb-post-list { display: flex; flex-direction: column; gap: 14px; }
      .sb-post {
        border: 2px solid var(--mascot-outline); border-radius: 16px; padding: 12px 14px;
        background: var(--card); box-shadow: 3px 3px 0 var(--mascot-outline); position: relative;
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
        color: var(--mascot-ink); cursor: pointer; min-height: 32px;
      }
      .sb-post-reaction.active { background: var(--soft); }

      /* ---------- replies redesign ---------- */
      .sb-post-replies {
        margin-top: 10px; padding-top: 10px;
        border-top: 1.5px dashed var(--mascot-outline);
        display: flex; flex-direction: column; gap: 0;
      }
      .sb-post-reply {
        display: flex; align-items: flex-start; gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid var(--soft);
      }
      .sb-post-reply:last-of-type { border-bottom: none; }
      .sb-post-reply-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
      .sb-post-reply-head {
        display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;
      }
      .sb-post-reply-name {
        font-weight: 800; font-size: 12px; color: var(--mascot-ink);
        display: inline-flex; align-items: center; gap: 4px;
      }
      .sb-post-reply-time { font-size: 10.5px; color: var(--muted); }
      .sb-post-reply-text { font-size: 12.5px; color: var(--ink); white-space: pre-wrap; word-break: break-word; }

      /* Reply image — small tap-to-open tile */
      .sb-post-reply-img-tile {
        display: block; margin-top: 6px; width: 120px; height: 90px;
        border-radius: 10px; overflow: hidden; cursor: pointer;
        border: 2px solid var(--mascot-outline); box-shadow: 2px 2px 0 var(--mascot-outline);
        background: none; padding: 0;
        min-width: 44px; min-height: 44px;
        position: relative;
      }
      /* Inset ring — the tile itself clips overflow for its rounded
         corners, so an outward-offset outline would get cut off. */
      .sb-post-reply-img-tile:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px; }
      .sb-post-reply-img { display: block; width: 100%; height: 100%; object-fit: cover; }

      /* Broken/missing reply image fallback (mirrors .sb-post-img-tile--error) */
      .sb-post-reply-img-tile--error { background: var(--soft); }

      /* "Show N more replies" pagination button */
      .sb-post-replies-show-more {
        align-self: flex-start; font-size: 11.5px; font-weight: 800; color: var(--muted);
        background: none; border: none; cursor: pointer; text-decoration: underline;
        padding: 6px 0; margin: 4px 0 2px;
      }

      /* Reply composer form */
      .sb-post-reply-form { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
      .sb-post-reply-input-row { display: flex; gap: 6px; align-items: center; }
      .sb-post-reply-input-row input {
        flex: 1; border: 2px solid var(--mascot-outline); border-radius: 999px; padding: 8px 12px;
        font-size: 12px; background: var(--card); color: var(--ink); min-height: 40px;
      }
      /* Plan's own QA checklist (§8) calls for reply image-attach and
         send touch targets at ≥40-44px, same bar as the lightbox's
         arrows/dots/close — these were left at 36px, below that bar. */
      .sb-post-reply-attach {
        width: 44px; height: 44px; border-radius: 50%;
        border: 2px solid var(--mascot-outline); background: var(--card); color: var(--mascot-ink);
        display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
        flex-shrink: 0; min-width: 44px; min-height: 44px;
      }
      .sb-post-reply-attach:hover { background: var(--soft); }
      .sb-post-reply-attach:disabled { opacity: .45; cursor: not-allowed; }
      .sb-post-reply-input-row button[type="submit"] {
        border: 2px solid var(--mascot-outline); background: var(--mascot-outline); color: var(--bg);
        border-radius: 999px; padding: 6px 16px; font-weight: 800; font-size: 11.5px; cursor: pointer;
        min-height: 44px; white-space: nowrap;
      }
      .sb-post-reply-input-row button[type="submit"]:disabled { opacity: .45; cursor: not-allowed; }

      /* Reply image preview */
      .sb-post-reply-img-preview {
        position: relative; width: 80px; height: 60px; border-radius: 8px; overflow: hidden;
        border: 2px solid var(--mascot-outline); box-shadow: 2px 2px 0 var(--mascot-outline);
      }
      .sb-post-reply-img-preview img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .sb-post-reply-img-preview .sb-composer-image-remove {
        width: 20px; height: 20px; min-width: 20px; min-height: 20px; top: 3px; right: 3px;
      }

      /* ---------- shared content actions ---------- */
      .sb-cm-actions { position: relative; }
      .sb-cm-actions-trigger {
        background: none; border: none; cursor: pointer; color: var(--muted); padding: 4px;
        display: inline-flex; align-items: center; justify-content: center; border-radius: 8px;
        min-width: 32px; min-height: 32px;
      }
      .sb-cm-actions-trigger:hover { background: var(--soft); }

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
        min-height: 40px;
      }
      .sb-cm-actions-menu button:hover { background: var(--soft); }
      .sb-cm-actions-menu button.danger { color: #C24444; }
      .sb-cm-actions-panel { min-width: 220px; padding: 10px; gap: 8px; }
      .sb-cm-panel-label { font-size: 11px; font-weight: 800; color: var(--muted); }
      .sb-cm-actions-panel select, .sb-cm-actions-panel textarea {
        width: 100%; border: 2px solid var(--mascot-outline); border-radius: 8px; padding: 6px 8px;
        font-family: var(--font-body); font-size: 12px; background: var(--card); color: var(--ink); resize: vertical;
      }
      .sb-cm-panel-btns { display: flex; justify-content: flex-end; gap: 6px; }
      .sb-cm-panel-btns button {
        border: 2px solid var(--mascot-outline); background: var(--card); border-radius: 999px;
        padding: 6px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; color: var(--ink);
        min-height: 40px;
      }
      .sb-cm-panel-btns button.primary { background: var(--mascot-outline); color: var(--bg); }
      .sb-cm-panel-btns button.primary.danger { background: #C24444; border-color: #C24444; color: #fff; }
      .sb-cm-error { color: #C24444; font-size: 11.5px; font-weight: 700; margin-top: 6px; }

      @media (max-width: 640px) {
        .sb-checkin-row { grid-template-columns: 1fr; }
        .sb-chat-msg-body { max-width: 88%; }
        .sb-composer-image-thumb { width: 70px; height: 70px; }
      }
    `}</style>
  );
}
