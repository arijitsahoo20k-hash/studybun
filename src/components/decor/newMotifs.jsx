import React from "react";

/* ============================================================================
 * NEW MOTIFS — decor icons for Pop Static / Midnight Chrome / Neon Alley /
 * Fractured Sky. 100% additive: does NOT edit Motifs.jsx.
 *
 * Same trick as newThemes.js — MOTIFS (imported from ./Motifs) is a plain
 * object and ES module imports are live references, so
 * Object.assign(MOTIFS, NEW_MOTIFS) mutates the one shared object that
 * ui.jsx's DecorLayer already reads via MOTIFS[key]. No edit needed there.
 *
 * Same visual contract as every existing motif: 0 0 48 48 viewBox, colors
 * pulled only from the theme's own CSS custom properties (var(--accent)
 * etc.), so each motif automatically reads correctly in whichever of the
 * 4 new themes uses it.
 * ========================================================================= */

const OUTLINE = "var(--outline)";
const ACCENT = "var(--accent)";
const ACCENT2 = "var(--accent2)";
const SOFT = "var(--soft)";

const strokeCap = { strokeLinecap: "round", strokeLinejoin: "round" };

function Svg({ children }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/* ---------- Pop Static: comic / street-art ---------- */

export function BurstStar() {
  const pts = 8;
  const path = Array.from({ length: pts * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 20 : 8;
    const a = (Math.PI / pts) * i - Math.PI / 2;
    return `${24 + r * Math.cos(a)},${24 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <Svg>
      <polygon points={path} fill={ACCENT} stroke={OUTLINE} strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function SpeedLine() {
  return (
    <Svg>
      <path d="M6 14 H30" stroke={OUTLINE} strokeWidth="4" {...strokeCap} />
      <path d="M6 24 H38" stroke={ACCENT} strokeWidth="4" {...strokeCap} />
      <path d="M6 34 H22" stroke={OUTLINE} strokeWidth="4" {...strokeCap} />
    </Svg>
  );
}

export function PunchBubble() {
  return (
    <Svg>
      <path
        d="M24 5 L28 15 L39 11 L32 20 L43 24 L32 28 L39 37 L28 33 L24 43 L20 33 L9 37 L16 28 L5 24 L16 20 L9 11 L20 15 Z"
        fill={ACCENT2}
        stroke={OUTLINE}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function InkSplat() {
  return (
    <Svg>
      <path
        d="M24 8 C30 8 34 12 33 17 C39 17 41 23 37 27 C41 31 38 37 32 36 C31 41 24 42 22 38 C17 42 10 39 11 33 C6 32 5 26 10 23 C6 19 9 13 15 14 C15 9 20 6 24 8 Z"
        fill={ACCENT}
        stroke={OUTLINE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="2.4" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.1" />
    </Svg>
  );
}

/* ---------- Midnight Chrome: dark automotive / racing ---------- */

export function ChromeRim() {
  return (
    <Svg>
      <circle cx="24" cy="24" r="17" fill="none" stroke={OUTLINE} strokeWidth="2.2" />
      <circle cx="24" cy="24" r="6" fill={SOFT} stroke={OUTLINE} strokeWidth="1.6" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <line
          key={a}
          x1="24" y1="24"
          x2={24 + 15 * Math.cos((a * Math.PI) / 180)}
          y2={24 + 15 * Math.sin((a * Math.PI) / 180)}
          stroke={ACCENT2}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}

export function RacingStripe() {
  return (
    <Svg>
      <path d="M10 44 L22 4" stroke={ACCENT} strokeWidth="5" strokeLinecap="round" />
      <path d="M20 44 L32 4" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

export function ExhaustPuff() {
  return (
    <Svg>
      <circle cx="16" cy="30" r="6" fill={SOFT} stroke={OUTLINE} strokeWidth="1.4" opacity="0.9" />
      <circle cx="27" cy="22" r="8" fill={SOFT} stroke={OUTLINE} strokeWidth="1.4" opacity="0.85" />
      <circle cx="35" cy="12" r="5" fill={SOFT} stroke={OUTLINE} strokeWidth="1.4" opacity="0.7" />
    </Svg>
  );
}

export function HeadlightRing() {
  return (
    <Svg>
      <circle cx="24" cy="24" r="15" fill="none" stroke={ACCENT} strokeWidth="3" />
      <circle cx="24" cy="24" r="15" fill="none" stroke={OUTLINE} strokeWidth="1.2" opacity="0.6" />
      <circle cx="24" cy="24" r="4" fill={ACCENT2} stroke={OUTLINE} strokeWidth="1.2" />
    </Svg>
  );
}

/* ---------- Neon Alley: vaporwave pixel-art night city ---------- */

const PX = 4; // pixel unit, keeps these blocky like PixelTree/PixelBlock

export function PixelHelmet() {
  return (
    <Svg>
      <rect x="14" y="8" width="20" height="8" fill={OUTLINE} />
      <rect x="10" y="16" width="28" height="14" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.2" />
      <rect x="14" y="20" width="20" height="6" fill={ACCENT2} opacity="0.85" />
      <rect x="10" y="30" width="28" height="4" fill={OUTLINE} />
    </Svg>
  );
}

export function SignGlow() {
  return (
    <Svg>
      <rect x="8" y="14" width="32" height="16" rx="2" fill="none" stroke={ACCENT} strokeWidth="2.4" />
      <rect x="14" y="20" width="8" height="4" fill={ACCENT} />
      <rect x="26" y="20" width="8" height="4" fill={ACCENT2} />
      <line x1="24" y1="30" x2="24" y2="40" stroke={OUTLINE} strokeWidth="2" />
    </Svg>
  );
}

export function Antenna() {
  return (
    <Svg>
      <line x1="24" y1="6" x2="24" y2="34" stroke={OUTLINE} strokeWidth="2" />
      <line x1="14" y1="14" x2="34" y2="14" stroke={OUTLINE} strokeWidth="1.6" opacity="0.7" />
      <line x1="17" y1="20" x2="31" y2="20" stroke={OUTLINE} strokeWidth="1.4" opacity="0.5" />
      <circle cx="24" cy="6" r="3.4" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.2" />
      <rect x="16" y="34" width="16" height="6" fill={SOFT} stroke={OUTLINE} strokeWidth="1" />
    </Svg>
  );
}

export function PixelMoth() {
  return (
    <Svg>
      {[0, 1].map((side) => (
        <g key={side} transform={side ? "scale(-1,1) translate(-48,0)" : undefined}>
          <rect x="24" y="14" width={PX * 2} height={PX} fill={ACCENT2} />
          <rect x="26" y="18" width={PX * 3} height={PX * 2} fill={ACCENT2} opacity="0.85" />
          <rect x="25" y="24" width={PX * 2} height={PX} fill={ACCENT2} opacity="0.6" />
        </g>
      ))}
      <rect x="22" y="12" width="4" height="24" fill={OUTLINE} />
    </Svg>
  );
}

/* ---------- Fractured Sky: glitch / cosmic marble ---------- */

export function StarTrail() {
  return (
    <Svg>
      <path d="M6 38 L38 8" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="1 4" strokeLinecap="round" />
      <circle cx="38" cy="8" r="3.2" fill={ACCENT2} stroke={OUTLINE} strokeWidth="1" />
      <circle cx="6" cy="38" r="1.6" fill={ACCENT} opacity="0.7" />
    </Svg>
  );
}

export function FractureLine() {
  return (
    <Svg>
      <path
        d="M8 6 L20 18 L14 22 L28 30 L22 34 L40 42"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function GoldCrack() {
  return (
    <Svg>
      <circle cx="24" cy="24" r="18" fill="none" stroke={OUTLINE} strokeWidth="1.4" opacity="0.4" />
      <path
        d="M12 14 L22 22 L18 26 L30 34 L36 36"
        fill="none"
        stroke={ACCENT2}
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="12" cy="14" r="1.8" fill={ACCENT2} />
      <circle cx="36" cy="36" r="1.8" fill={ACCENT2} />
    </Svg>
  );
}

export function CosmicDust() {
  const pts = [[8, 10, 2], [18, 6, 1.2], [30, 12, 1.6], [40, 20, 1], [12, 28, 1.4], [26, 34, 2], [38, 38, 1.2]];
  return (
    <Svg>
      {pts.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? ACCENT2 : ACCENT} opacity={0.55 + (i % 3) * 0.15} />
      ))}
    </Svg>
  );
}

export const NEW_MOTIFS = {
  burstStar: BurstStar,
  speedLine: SpeedLine,
  punchBubble: PunchBubble,
  inkSplat: InkSplat,
  chromeRim: ChromeRim,
  racingStripe: RacingStripe,
  exhaustPuff: ExhaustPuff,
  headlightRing: HeadlightRing,
  pixelHelmet: PixelHelmet,
  signGlow: SignGlow,
  antenna: Antenna,
  pixelMoth: PixelMoth,
  starTrail: StarTrail,
  fractureLine: FractureLine,
  goldCrack: GoldCrack,
  cosmicDust: CosmicDust,
};

import { MOTIFS } from "./Motifs";
Object.assign(MOTIFS, NEW_MOTIFS);
