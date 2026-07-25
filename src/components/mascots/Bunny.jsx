import React from "react";
import useBlink from "./useBlink";

const OUTLINE = { stroke: "var(--outline)", strokeWidth: 2.2, strokeLinejoin: "round" };

const FACES = {
  idle: { eye: "M -2.4 0 a2.4,2.4 0 1,0 0.1,0", mouth: "M -6 4 Q 0 8 6 4", brow: null },
  happy: { eye: "M -3.4 -1 Q 0 -4.6 3.4 -1", mouth: "M -7 3 Q 0 12 7 3", brow: null },
  sleepy: { eye: "M -4 0 Q 0 2.4 4 0", mouth: "M -4 5.5 Q 0 6.5 4 5.5", brow: null, zzz: true },
  thinking: { eye: "M -2.4 0 a2.4,2.4 0 1,0 0.1,0", mouth: "M -4 5 Q -1 3 3 5", brow: "M -1 -8 Q 6 -10 10 -6" },
  celebrate: { eye: "M -3.4 -1.4 Q 0 -6 3.4 -1.4", mouth: "M -8 3 Q 0 14 8 3", sparkle: true },
  concerned: { eye: "M -3 1 Q 0 -1.4 3 1", mouth: "M -6 6 Q 0 2 6 6", brow: "M -6 -7 Q -2 -4 2 -7" },
  studying: { eye: "M -2.4 0 a2.4,2.4 0 1,0 0.1,0", mouth: "M -5 4.5 Q 0 6.5 5 4.5", book: true },
  reminder: { eye: "M -3 -0.6 Q 0 -3.2 3 -0.6", mouth: "M -5 5 Q 0 3 5 5", bell: true },
};

const CLOSED_EYE = "M -4 0 Q 0 2.4 4 0";

/** The original StudyBun mascot -- kept exactly as designed, everyone else now stands apart from it. */
export default function Bunny({ mood = "idle", size = 72, hop = false, peek = false, hopLoop = false }) {
  const face = FACES[mood] || FACES.idle;
  const blink = useBlink(mood);
  const eyePath = blink ? CLOSED_EYE : face.eye;

  return (
    <svg width={size} height={size} viewBox="-42 -50 84 92" style={{ overflow: "visible", flexShrink: 0 }}
      className={`sb-bunny sb-species-bunny ${hop ? "sb-bunny-hop" : ""} ${peek ? "sb-bunny-peek" : ""} ${hopLoop ? "sb-bunny-hop-loop" : ""}`}>
      <ellipse className="sb-ear sb-ear-l" cx="-14" cy="-30" rx="7" ry="21" fill="var(--accent2)" transform="rotate(-12 -14 -30)" {...OUTLINE} />
      <ellipse className="sb-ear sb-ear-r" cx="14" cy="-30" rx="7" ry="21" fill="var(--accent2)" transform="rotate(12 14 -30)" {...OUTLINE} />
      <ellipse cx="-14" cy="-28" rx="3.2" ry="13" fill="var(--soft)" transform="rotate(-12 -14 -28)" />
      <ellipse cx="14" cy="-28" rx="3.2" ry="13" fill="var(--soft)" transform="rotate(12 14 -28)" />

      <circle cx="0" cy="0" r="26" fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" />

      <g>
        <circle cx="-9" cy="8" r="4.2" fill="var(--accent)" opacity="0.4" />
        <circle cx="9" cy="8" r="4.2" fill="var(--accent)" opacity="0.4" />

        <g transform="translate(-8,-3)"><path d={eyePath} stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" /></g>
        <g transform="translate(8,-3)"><path d={eyePath} stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" /></g>
        {face.brow && (
          <>
            <path d={face.brow} stroke="var(--ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" transform="translate(-8,-3)" />
            <path d={face.brow} stroke="var(--ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" transform="translate(8,-3) scale(-1,1)" />
          </>
        )}
        <path d={face.mouth} stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" transform="translate(0,4)" />
      </g>

      {face.zzz && <text x="18" y="-22" fontSize="11" fill="var(--muted)" fontFamily="var(--font-display)">z</text>}
      {face.sparkle && (
        <>
          <text x="-32" y="-18" fontSize="11">✨</text>
          <text x="22" y="-24" fontSize="11">✨</text>
        </>
      )}
      {face.book && (
        <g transform="translate(-11,24)">
          <rect x="0" y="0" width="22" height="15" rx="2" fill="var(--accent2)" />
          <line x1="11" y1="0" x2="11" y2="15" stroke="var(--card)" strokeWidth="1.4" />
        </g>
      )}
      {face.bell && <text x="16" y="-20" fontSize="13">🔔</text>}
    </svg>
  );
}
