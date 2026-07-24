import React, { useEffect, useState } from "react";

/* Shared face parts, reused by every species so expressions stay consistent. */
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

const OUTLINE = { stroke: "var(--outline)", strokeWidth: 2.2, strokeLinejoin: "round" };

function EarsBunny({ accent2, soft }) {
  return (
    <>
      <ellipse cx="-14" cy="-30" rx="7" ry="21" fill={accent2} transform="rotate(-12 -14 -30)" {...OUTLINE} />
      <ellipse cx="14" cy="-30" rx="7" ry="21" fill={accent2} transform="rotate(12 14 -30)" {...OUTLINE} />
      <ellipse cx="-14" cy="-28" rx="3.2" ry="13" fill={soft} transform="rotate(-12 -14 -28)" />
      <ellipse cx="14" cy="-28" rx="3.2" ry="13" fill={soft} transform="rotate(12 14 -28)" />
    </>
  );
}
function EarsCat({ accent2 }) {
  return (
    <>
      <path d="M -22 -18 L -12 -34 L -4 -16 Z" fill={accent2} {...OUTLINE} />
      <path d="M 22 -18 L 12 -34 L 4 -16 Z" fill={accent2} {...OUTLINE} />
      <path d="M 2 8 L 10 6" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M 2 11 L 11 11" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M -2 8 L -10 6" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M -2 11 L -11 11" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
    </>
  );
}
function EarsFox({ accent2, soft }) {
  return (
    <>
      <path d="M -24 -14 L -13 -36 L -3 -14 Z" fill={accent2} {...OUTLINE} />
      <path d="M 24 -14 L 13 -36 L 3 -14 Z" fill={accent2} {...OUTLINE} />
      <path d="M -18 -18 L -13 -30 L -8 -18 Z" fill={soft} />
      <path d="M 18 -18 L 13 -30 L 8 -18 Z" fill={soft} />
      <path d="M -6 10 L 0 15 L 6 10 Z" fill={soft} />
    </>
  );
}
function EarsBear({ accent2 }) {
  return (
    <>
      <circle cx="-19" cy="-22" r="9" fill={accent2} {...OUTLINE} />
      <circle cx="19" cy="-22" r="9" fill={accent2} {...OUTLINE} />
      <ellipse cx="0" cy="10" rx="9" ry="7" fill={accent2} opacity="0.5" />
    </>
  );
}
function EarsHamster({ accent2, soft }) {
  return (
    <>
      <circle cx="-21" cy="-16" r="9" fill={accent2} {...OUTLINE} />
      <circle cx="21" cy="-16" r="9" fill={accent2} {...OUTLINE} />
      <ellipse cx="-17" cy="9" rx="9" ry="7" fill={soft} />
      <ellipse cx="17" cy="9" rx="9" ry="7" fill={soft} />
    </>
  );
}
function EarsPenguin({ accent, soft }) {
  return (
    <>
      <ellipse cx="0" cy="2" rx="22" ry="24" fill={accent} opacity="0.16" />
      <ellipse cx="0" cy="6" rx="15" ry="17" fill={soft} />
    </>
  );
}

const EAR_RENDERERS = { bunny: EarsBunny, cat: EarsCat, fox: EarsFox, bear: EarsBear, hamster: EarsHamster, penguin: EarsPenguin };

const CLOSED_EYE = "M -4 0 Q 0 2.4 4 0";

export default function Mascot({ species = "bunny", mood = "idle", size = 72, hop = false, peek = false }) {
  const face = FACES[mood] || FACES.idle;
  const EarRenderer = EAR_RENDERERS[species] || EarsBunny;
  const isPenguin = species === "penguin";

  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let t;
    const cycle = () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        setTimeout(() => { if (!cancelled) setBlink(false); }, 140);
        cycle();
      }, 4000 + Math.random() * 2000);
    };
    cycle();
    return () => { cancelled = true; clearTimeout(t); };
  }, []);
  const eyePath = blink && mood !== "sleepy" ? CLOSED_EYE : face.eye;

  return (
    <svg width={size} height={size} viewBox="-42 -50 84 92" style={{ overflow: "visible", flexShrink: 0 }}
      className={`sb-bunny ${hop ? "sb-bunny-hop" : ""} ${peek ? "sb-bunny-peek" : ""}`}>
      <EarRenderer accent2="var(--accent2)" soft="var(--soft)" accent="var(--accent)" />

      <circle cx="0" cy="0" r="26" fill={isPenguin ? "var(--ink)" : "var(--card)"} stroke="var(--outline)" strokeWidth="2.4" opacity={isPenguin ? 0.08 : 1} />
      <circle cx="0" cy="0" r="26" fill={isPenguin ? "var(--card)" : "none"} stroke="var(--outline)" strokeWidth="2.4" style={isPenguin ? { clipPath: "inset(0 0 40% 0)" } : {}} />
      {isPenguin && <ellipse cx="0" cy="10" rx="18" ry="14" fill="var(--card)" />}

      {/* blush */}
      <circle cx="-9" cy="8" r="4.2" fill="var(--accent)" opacity="0.4" />
      <circle cx="9" cy="8" r="4.2" fill="var(--accent)" opacity="0.4" />

      {/* fox/hamster/cat snout accents */}
      {species === "fox" && <ellipse cx="0" cy="10" rx="8" ry="6" fill="var(--soft)" />}
      {species === "penguin" && <path d="M -5 12 L 5 12 L 0 20 Z" fill="#FFC65C" />}
      {species === "hamster" && (
        <>
          <line x1="-3" y1="9" x2="-13" y2="7" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
          <line x1="-3" y1="12" x2="-13" y2="13" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
          <line x1="3" y1="9" x2="13" y2="7" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
          <line x1="3" y1="12" x2="13" y2="13" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        </>
      )}

      {/* eyes */}
      <g transform="translate(-8,-3)"><path d={eyePath} stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" /></g>
      <g transform="translate(8,-3)"><path d={eyePath} stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" /></g>
      {face.brow && (
        <>
          <path d={face.brow} stroke="var(--ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" transform="translate(-8,-3)" />
          <path d={face.brow} stroke="var(--ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" transform="translate(8,-3) scale(-1,1)" />
        </>
      )}

      {/* mouth */}
      <path d={face.mouth} stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" transform="translate(0,4)" />

      {/* accessories per mood */}
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
