import React from "react";
import useBlink from "./useBlink";

const OUTLINE = { stroke: "var(--outline)", strokeWidth: 2.2, strokeLinejoin: "round" };

/**
 * Dragon — the second founder-only mascot, and the counterweight to Lion:
 * where Lion is warm and regal, Dragon is the tiny-and-mythic one. Chibi
 * proportions on purpose (big round head, stubby horns, wings far too small
 * to actually fly) so it lands cute rather than fearsome, which is the whole
 * StudyBun vibe.
 *
 * Its signature parts are the wings (they flap, and their spread changes with
 * mood) and a puff of fire it only breathes when things are going well —
 * celebrate gets a real flame, thinking gets two little nose-smoke curls.
 */
const MOOD = {
  idle: { eye: "round", eyeR: 3.2, mouth: "M -4.5 8 Q 0 11 4.5 8", wing: "rest", tail: "curl" },
  happy: { eye: "curve", eyePath: "M -3.8 -1 Q 0 -5.6 3.8 -1", mouth: "M -6 6.5 Q 0 14.5 6 6.5", wing: "open", tail: "wag", fang: true },
  sad: { eye: "curve", eyePath: "M -3.8 0.6 Q 0 3 3.8 0.6", mouth: "M -5.5 12 Q 0 8 5.5 12", wing: "fold", tail: "droop", tear: true },
  sleepy: { eye: "curve", eyePath: "M -4 0 Q 0 2.6 4 0", mouth: "M -3.5 9 Q 0 10.4 3.5 9", wing: "fold", tail: "wrap", zzz: true },
  thinking: { eye: "round", eyeR: 3, mouth: "M -4 8.6 Q -1 6.6 3.4 8.6", wing: "rest", tail: "tap", brow: true, smoke: true },
  celebrate: { eye: "curve", eyePath: "M -4 -1.8 Q 0 -7 4 -1.8", mouth: "M -7 6 Q 0 16.5 7 6", wing: "flare", tail: "wag", flame: true, sparkle: true },
  concerned: { eye: "round", eyeR: 2.8, mouth: "M -5.5 10.5 Q 0 7 5.5 10.5", wing: "fold", tail: "droop", brow: true },
  studying: { eye: "round", eyeR: 3, mouth: "M -4 8.4 Q 0 10.4 4 8.4", wing: "rest", tail: "curl", scroll: true },
  reminder: { eye: "round", eyeR: 3.3, mouth: "M -4.5 8.6 Q 0 6.6 4.5 8.6", wing: "open", tail: "up", bell: true },
};

// Wing silhouettes (left side; the right is the same path mirrored). Three
// scalloped points along the bottom edge is what makes it read "dragon"
// instead of "bird" at small sizes.
const WINGS = {
  rest: "M -13 -16 Q -30 -26 -34 -13 Q -29 -12 -30 -6 Q -25 -8 -25 -2 Q -19 -6 -13 -4 Z",
  open: "M -13 -18 Q -34 -32 -40 -17 Q -34 -15 -35 -7 Q -29 -9 -29 -1 Q -21 -6 -13 -5 Z",
  flare: "M -13 -19 Q -38 -38 -45 -19 Q -38 -17 -39 -7 Q -32 -9 -31 0 Q -22 -6 -13 -5 Z",
  fold: "M -13 -13 Q -25 -19 -27 -10 Q -23 -9 -24 -5 Q -19 -7 -13 -4 Z",
};

const TAILS = {
  curl: "M 10 26 Q 31 25 30 8",
  wag: "M 10 26 Q 35 20 33 2",
  wrap: "M 8 29 Q 30 32 29 19",
  tap: "M 10 26 Q 31 22 27 8",
  droop: "M 9 28 Q 29 31 26 19",
  up: "M 10 26 Q 27 8 22 -11",
};

// Endpoint of each tail path, where the arrow-tip spade goes.
const TIP = {
  curl: [30, 8], wag: [33, 2], wrap: [29, 19], tap: [27, 8], droop: [26, 19], up: [22, -11],
};

export default function Dragon({ mood = "idle", size = 72, hop = false, peek = false, hopLoop = false }) {
  const m = MOOD[mood] || MOOD.idle;
  const blink = useBlink(mood);
  const wing = WINGS[m.wing] || WINGS.rest;
  const [tipX, tipY] = TIP[m.tail] || TIP.curl;

  const eye = blink ? (
    <path d="M -4 0 Q 0 2.4 4 0" stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  ) : m.eye === "round" ? (
    <>
      <circle cx="0" cy="0" r={m.eyeR} fill="var(--ink)" />
      <circle cx={-m.eyeR * 0.34} cy={-m.eyeR * 0.34} r={m.eyeR * 0.34} fill="#fff" />
    </>
  ) : (
    <path d={m.eyePath} stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  );

  return (
    <svg width={size} height={size} viewBox="-48 -52 96 94" style={{ overflow: "visible", flexShrink: 0 }}
      className={`sb-species-dragon ${hop ? "sb-bunny-hop" : ""} ${peek ? "sb-dragon-peek" : ""} ${hopLoop ? "sb-bunny-hop-loop" : ""}`}>

      {/* tail with a spade tip */}
      <path className="sb-dragon-tail" d={TAILS[m.tail] || TAILS.curl} fill="none" stroke="var(--accent2)" strokeWidth="5.5" strokeLinecap="round" />
      <path d={`M ${tipX} ${tipY - 7} L ${tipX + 6} ${tipY + 1} L ${tipX} ${tipY + 6} L ${tipX - 6} ${tipY + 1} Z`}
        fill="var(--accent2)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round" />

      {/* wings -- mirrored pair, flap on their own timing in CSS */}
      <g className="sb-dragon-wing sb-dragon-wing-l">
        <path d={wing} fill="var(--accent2)" {...OUTLINE} />
        <path d={wing} fill="var(--soft)" opacity="0.35" transform="scale(0.72) translate(-4,1)" />
      </g>
      {/* Mirroring lives on this OUTER static <g>, not on the animated one.
          A CSS `transform` (from the flap keyframes) replaces an element's
          own `transform` attribute rather than combining with it, so putting
          scale(-1,1) directly on .sb-dragon-wing-r used to wipe out the
          mirror the instant the flap animation started, leaving the right
          wing drawing the exact same un-mirrored path on top of the left
          one -- which is why only one wing ever showed. */}
      <g transform="scale(-1,1)">
        <g className="sb-dragon-wing sb-dragon-wing-r">
          <path d={wing} fill="var(--accent2)" {...OUTLINE} />
          <path d={wing} fill="var(--soft)" opacity="0.35" transform="scale(0.72) translate(-4,1)" />
        </g>
      </g>

      {/* stubby curved horns */}
      <path d="M -11 -22 Q -16 -33 -8 -35 Q -10 -29 -6 -23 Z" fill="var(--soft)" {...OUTLINE} />
      <path d="M 11 -22 Q 16 -33 8 -35 Q 10 -29 6 -23 Z" fill="var(--soft)" {...OUTLINE} />

      {/* head */}
      <path
        d="M -20 -7 Q -21 -24 0 -25 Q 21 -24 20 -7 Q 20 11 10 19 Q 0 26 -10 19 Q -20 11 -20 -7 Z"
        fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" strokeLinejoin="round"
      />

      {/* back-of-head spine frill, the little row of scales */}
      <path d="M -6 -25.5 L -3 -30 L 0 -25.8 L 3 -30 L 6 -25.5" fill="none" stroke="var(--outline)" strokeWidth="2" strokeLinejoin="round" />

      {/* blush */}
      <circle cx="-10.5" cy="5" r="4.2" fill="var(--accent)" opacity="0.32" />
      <circle cx="10.5" cy="5" r="4.2" fill="var(--accent)" opacity="0.32" />

      <g transform="translate(-7,-4)">
        {eye}
        {m.brow && <path d="M -6 -7.5 Q -2 -5 1.5 -7" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      </g>
      <g transform="translate(7,-4) scale(-1,1)">
        {eye}
        {m.brow && <path d="M -6 -7.5 Q -2 -5 1.5 -7" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      </g>

      {/* Snout: a wide, shallow shelf rather than a circle. An earlier version
          used a tall ellipse with the nostrils centred in it, which read as a
          pig rather than a dragon -- the fix is to keep it low and let the
          mouth sit *under* it, with tiny nostrils high up near its top edge. */}
      <path d="M -8.5 4.5 Q 0 2.4 8.5 4.5 Q 9.5 11 5 13 Q 0 14.6 -5 13 Q -9.5 11 -8.5 4.5 Z"
        fill="var(--soft)" opacity="0.75" />
      <ellipse cx="-3.4" cy="6.2" rx="0.9" ry="1.2" fill="var(--ink)" />
      <ellipse cx="3.4" cy="6.2" rx="0.9" ry="1.2" fill="var(--ink)" />
      <g transform="translate(0,2.6)">
        <path d={m.mouth} stroke="var(--ink)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {m.fang && <path d="M -3 8 L -1.8 11 L -0.6 8 Z" fill="#fff" stroke="var(--outline)" strokeWidth="0.9" strokeLinejoin="round" />}
      </g>

      {/* a real puff of fire, only when it's actually happy about something */}
      {m.flame && (
        <g className="sb-dragon-flame" transform="translate(0,20)">
          <path d="M 0 12 Q -7 4 -3.5 -2 Q -3 2 -0.6 3 Q -2.4 -3.6 1.4 -7 Q 0.6 -1.4 3.4 0.4 Q 5 -1.4 4.6 -3.4 Q 8 1.4 6 6 Q 4.4 10 0 12 Z"
            fill="#F7A23B" stroke="var(--outline)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 0 9.5 Q -3 5 -1 1.4 Q -0.4 4 1.2 4.6 Q 0.4 1 2.6 -0.6 Q 2.4 3.6 4 5 Q 3 8 0 9.5 Z" fill="#FFDD73" />
        </g>
      )}
      {m.smoke && (
        <g className="sb-dragon-smoke" opacity="0.6">
          <path d="M -4 14 Q -8 17 -5 20" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 4 14 Q 8 17 5 20" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {m.scroll && (
        <g transform="translate(12,17) rotate(-8)">
          <rect x="-8" y="-3.5" width="16" height="9" rx="4.5" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.5" />
          <path d="M -3.5 -0.6 L 3.5 -0.6 M -3.5 2.2 L 2 2.2" stroke="var(--outline)" strokeWidth="1.1" strokeLinecap="round" />
        </g>
      )}
      {m.zzz && <text x="20" y="-25" fontSize="11" fill="var(--muted)" fontFamily="var(--font-display)">z</text>}
      {m.tear && (
        <g transform="translate(-14,3)">
          <g className="sb-mascot-tear">
            <path d="M 0 0 C 2.2 3 4 5.2 4 7.4 A 4 4 0 1 1 -4 7.4 C -4 5.2 -2.2 3 0 0 Z" fill="#8FCBEA" stroke="var(--outline)" strokeWidth="1" strokeLinejoin="round" />
            <ellipse cx="-1.3" cy="5.4" rx="1" ry="1.4" fill="#fff" opacity="0.85" />
          </g>
        </g>
      )}
      {m.sparkle && (
        <>
          <text x="-36" y="-26" fontSize="11">✨</text>
          <text x="28" y="-30" fontSize="11">✨</text>
        </>
      )}
      {m.bell && <text x="18" y="-26" fontSize="13">🔔</text>}
    </svg>
  );
}
