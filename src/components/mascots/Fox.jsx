import React from "react";
import useBlink from "./useBlink";

const OUTLINE = { stroke: "var(--outline)", strokeWidth: 2.2, strokeLinejoin: "round" };

/**
 * Fox reads as sly and quick: narrow angled eye-lines with no visible pupil
 * most of the time (pupils only appear when startled/alert), a huge tail
 * that changes shape with mood, and a quill instead of a book for studying.
 */
const MOOD = {
  idle: { eye: "M -6.4 0.4 Q -1.4 -3 4 -0.6", mouth: "M -4.5 12 Q 0 15 4.5 12", tail: "curl" },
  happy: { eye: "M -6.6 2 Q 0 -6.4 6.6 2", mouth: "M -6 11 Q 0 20 6 11", tail: "wag" },
  sleepy: { eye: "M -5.4 0.8 Q 0 1.8 5.4 0.8", mouth: "M -3.5 13 Q 0 14 3.5 13", zzz: true, tail: "wrap" },
  thinking: { eye: "M -6.4 0.4 Q -1.4 -3 4 -0.6", mouth: "M -3 13 Q 0 11.6 3 13", brow: true, tail: "tap" },
  celebrate: { eye: "M -6.8 2.6 Q 0 -7.2 6.8 2.6", mouth: "M -7 11 Q 0 22 7 11", sparkle: true, tail: "poof" },
  concerned: { eye: "M -4.6 1.4 Q 0 -2 4.6 1.4", pupil: true, mouth: "M -5 15.5 Q 0 12 5 15.5", earsBack: true, tail: "droop" },
  studying: { eye: "M -6.4 0.4 Q -1.4 -3 4 -0.6", mouth: "M -3.5 12.5 Q 0 14 3.5 12.5", quill: true, tail: "curl" },
  reminder: { eye: "M -4.8 0 Q 0 -2.6 4.8 0", pupil: true, mouth: "M -4 13 Q 0 11 4 13", earPerk: true, bell: true, tail: "up" },
};

const TAILS = {
  curl: "M 18 26 Q 36 24 36 8 Q 36 -4 24 -2",
  wag: "M 18 26 Q 40 20 38 4 Q 37 -6 26 -2",
  wrap: "M 12 30 Q 34 34 34 18 Q 34 6 18 8 Q 8 10 10 20",
  tap: "M 18 26 Q 34 22 30 6 Q 28 -2 18 -8",
  poof: "M 16 24 Q 42 22 40 2 Q 38 -12 20 -8",
  droop: "M 18 28 Q 32 32 28 20 Q 26 12 16 12",
  up: "M 16 26 Q 26 6 20 -20",
};

export default function Fox({ mood = "idle", size = 72, hop = false, peek = false }) {
  const m = MOOD[mood] || MOOD.idle;
  const blink = useBlink(mood);
  const eyePath = blink ? "M -5.4 1 Q 0 2 5.4 1" : m.eye;

  return (
    <svg width={size} height={size} viewBox="-42 -50 84 92" style={{ overflow: "visible", flexShrink: 0 }}
      className={`sb-species-fox ${hop ? "sb-bunny-hop" : ""} ${peek ? "sb-fox-peek" : ""}`}>

      {/* big bushy tail, its silhouette changes with mood */}
      <path className="sb-fox-tail" d={TAILS[m.tail] || TAILS.curl} fill="none" stroke="var(--accent2)" strokeWidth="10" strokeLinecap="round" />
      {/* white tail tip */}
      <circle cx={m.tail === "up" ? 20 : m.tail === "wrap" ? 10 : 26} cy={m.tail === "up" ? -20 : m.tail === "wrap" ? 20 : (m.tail === "droop" ? 12 : m.tail === "poof" ? -8 : -2)} r="6" fill="var(--soft)" />

      {/* tall pointed ears, one folds flat for "concerned", one stretches for "reminder" */}
      <g className="sb-ear sb-ear-l" style={{ transform: m.earsBack ? "rotate(-24deg) translate(2px,5px)" : "none" }}>
        <path d="M -21 -15 L -11 -37 L -2 -15 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M -16 -19 L -11 -31 L -6 -19 Z" fill="var(--soft)" />
      </g>
      <g className="sb-ear sb-ear-r" style={{ transform: m.earPerk ? "translateY(-4px) scaleY(1.12)" : "none" }}>
        <path d="M 21 -15 L 11 -37 L 2 -15 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M 16 -19 L 11 -31 L 6 -19 Z" fill="var(--soft)" />
      </g>

      {/* narrow head stretching into a long pointed muzzle */}
      <path
        d="M -21 -6 Q -23 -25 0 -27 Q 23 -25 21 -6 Q 21 7 10 16 Q 3 31 0 36 Q -3 31 -10 16 Q -21 7 -21 -6 Z"
        fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" strokeLinejoin="round"
      />
      {/* mask-like marking across the eyes, unique to fox */}
      <path d="M -9 -21 Q 0 -27 9 -21 Q 5 -15 0 -14 Q -5 -15 -9 -21 Z" fill="var(--accent2)" opacity="0.55" />
      {/* long white muzzle patch hugging the pointed chin */}
      <path d="M -9 11 Q 0 34 9 11 Q 5 23 0 24 Q -5 23 -9 11 Z" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" strokeLinejoin="round" />
      <ellipse cx="0" cy="23" rx="2.4" ry="1.8" fill="var(--ink)" />

      <circle cx="-8" cy="4" r="3.4" fill="var(--accent)" opacity="0.3" />
      <circle cx="8" cy="4" r="3.4" fill="var(--accent)" opacity="0.3" />

      <g transform="translate(-7,-6)">
        <path d={eyePath} stroke="var(--ink)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        {m.pupil && !blink && <ellipse cx="-1" cy="0.6" rx="1.5" ry="2.1" fill="var(--ink)" />}
        {m.brow && <path d="M -3 -7 Q 3 -9 6 -6" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      </g>
      <g transform="translate(7,-6) scale(-1,1)">
        <path d={eyePath} stroke="var(--ink)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        {m.pupil && !blink && <ellipse cx="-1" cy="0.6" rx="1.5" ry="2.1" fill="var(--ink)" />}
      </g>

      <path d={m.mouth} stroke="var(--ink)" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {m.quill && (
        <g transform="translate(11,20) rotate(35)">
          <rect x="0" y="0" width="2" height="16" fill="var(--outline)" rx="1" />
          <path d="M 1 0 L -2.5 -5 L 4.5 -5 Z" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1" />
        </g>
      )}
      {m.zzz && <text x="18" y="-24" fontSize="11" fill="var(--muted)" fontFamily="var(--font-display)">z</text>}
      {m.sparkle && (
        <>
          <text x="-30" y="-22" fontSize="11">✨</text>
          <text x="24" y="-28" fontSize="11">✨</text>
        </>
      )}
      {m.bell && <text x="16" y="-24" fontSize="13">🔔</text>}
    </svg>
  );
}
