import React from "react";

/*
 * Hand-drawn-style background motifs, one small library shared by every
 * theme's DecorLayer. Every shape below deliberately pulls its color only
 * from the four CSS custom properties every theme already tunes for its
 * own palette -- --accent, --accent2, --soft, --outline -- so a motif never
 * needs a per-theme color prop and always reads correctly no matter which
 * theme is active. This is what actually makes the background "theme-
 * driven": switching themes swaps both the artwork silhouette (a strawberry
 * vs. a pixel tree) *and* its coloring, not just a font-color change on a
 * single repeated emoji glyph.
 *
 * Every motif shares the same tiny contract: a 0 0 48 48 viewBox, no
 * hard-coded width/height (the wrapping <span> in DecorLayer controls
 * size), and a soft double-stroke outline so the line weight matches the
 * mascot illustrations elsewhere in the app.
 */

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

/* ---------- florals ---------- */

export function Blossom() {
  const angles = [0, 72, 144, 216, 288];
  return (
    <Svg>
      {angles.map((a) => (
        <path
          key={a}
          d="M24 24 C21 17 21 9 24 4 C27 9 27 17 24 24 Z"
          fill={ACCENT}
          stroke={OUTLINE}
          strokeWidth="1.3"
          {...strokeCap}
          transform={`rotate(${a} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="3.4" fill={SOFT} stroke={OUTLINE} strokeWidth="1.1" />
    </Svg>
  );
}

export function BlossomSprig() {
  return (
    <Svg>
      <path d="M6 42 Q20 32 30 12" fill="none" stroke={OUTLINE} strokeWidth="2" {...strokeCap} />
      <path d="M16 30 q-6 -1 -9 -7" fill="none" stroke={OUTLINE} strokeWidth="1.5" {...strokeCap} />
      <path d="M17 30 q1 -6 7 -8" fill={SOFT} stroke={OUTLINE} strokeWidth="1.2" {...strokeCap} />
      <g transform="translate(30 12) scale(0.34) translate(-24 -24)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={a}
            d="M24 24 C21 17 21 9 24 4 C27 9 27 17 24 24 Z"
            fill={ACCENT}
            stroke={OUTLINE}
            strokeWidth="2.6"
            {...strokeCap}
            transform={`rotate(${a} 24 24)`}
          />
        ))}
        <circle cx="24" cy="24" r="4" fill={SOFT} stroke={OUTLINE} strokeWidth="2" />
      </g>
    </Svg>
  );
}

export function Tulip() {
  return (
    <Svg>
      <path d="M24 44 L24 24" stroke={OUTLINE} strokeWidth="2" {...strokeCap} />
      <path d="M24 32 q-8 2 -10 -6" fill="none" stroke={OUTLINE} strokeWidth="1.4" {...strokeCap} />
      <path d="M24 36 q8 2 10 -8" fill="none" stroke={OUTLINE} strokeWidth="1.4" {...strokeCap} />
      <path
        d="M14 22 C14 12 19 6 24 6 C29 6 34 12 34 22 C34 22 29 18 24 22 C19 18 14 22 14 22 Z"
        fill={ACCENT}
        stroke={OUTLINE}
        strokeWidth="1.4"
        {...strokeCap}
      />
      <path d="M24 6 C24 12 24 17 24 22" fill="none" stroke={ACCENT2} strokeWidth="1.2" opacity="0.8" />
    </Svg>
  );
}

/* ---------- fruit / cafe ---------- */

export function Strawberry() {
  return (
    <Svg>
      <path
        d="M24 44 C13 44 8 30 8 22 C8 13 15 8 24 8 C33 8 40 13 40 22 C40 30 35 44 24 44 Z"
        fill={ACCENT}
        stroke={OUTLINE}
        strokeWidth="1.5"
        {...strokeCap}
      />
      <path
        d="M24 8 L18 2 L24 5 L30 2 L26 8 Z"
        fill={SOFT}
        stroke={OUTLINE}
        strokeWidth="1.2"
        {...strokeCap}
      />
      {[[17, 18], [31, 18], [24, 24], [15, 27], [33, 27], [20, 33], [28, 33], [24, 38]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.3" ry="2" fill={SOFT} transform={`rotate(20 ${x} ${y})`} />
      ))}
    </Svg>
  );
}

export function BerryCluster() {
  const berries = [
    { x: 18, y: 26, r: 9 },
    { x: 32, y: 24, r: 8 },
    { x: 25, y: 14, r: 8.5 },
  ];
  return (
    <Svg>
      <path d="M25 6 q-2 4 0 8" fill="none" stroke={OUTLINE} strokeWidth="1.3" {...strokeCap} />
      {berries.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={i === 1 ? ACCENT2 : ACCENT} stroke={OUTLINE} strokeWidth="1.4" />
          <path
            d={`M${b.x - 2} ${b.y - 2} l1.4 1.4 M${b.x + 2} ${b.y - 2} l-1.4 1.4 M${b.x} ${b.y - 3} l0 3`}
            stroke={OUTLINE}
            strokeWidth="1"
            {...strokeCap}
          />
        </g>
      ))}
    </Svg>
  );
}

export function MilkDrop() {
  return (
    <Svg>
      <path
        d="M24 4 C32 18 38 26 38 32 C38 40 32 45 24 45 C16 45 10 40 10 32 C10 26 16 18 24 4 Z"
        fill={SOFT}
        stroke={OUTLINE}
        strokeWidth="1.5"
        {...strokeCap}
      />
      <path d="M17 33 q0 6 6 8" fill="none" stroke={ACCENT} strokeWidth="2" {...strokeCap} opacity="0.85" />
    </Svg>
  );
}

export function Lollipop() {
  return (
    <Svg>
      <path d="M24 30 L24 45" stroke={OUTLINE} strokeWidth="2" {...strokeCap} />
      <circle cx="24" cy="18" r="14" fill={ACCENT2} stroke={OUTLINE} strokeWidth="1.5" />
      <path
        d="M24 6 A12 12 0 0 1 36 18 A9 9 0 0 1 27 27 A6 6 0 0 1 21 21 A3 3 0 0 1 24 18"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.6"
        {...strokeCap}
      />
    </Svg>
  );
}

export function Teacup() {
  return (
    <Svg>
      <path d="M17 8 q2 -6 -1 -8" fill="none" stroke={OUTLINE} strokeWidth="1.3" {...strokeCap} opacity="0.7" />
      <path d="M24 6 q2 -6 -1 -8" fill="none" stroke={OUTLINE} strokeWidth="1.3" {...strokeCap} opacity="0.5" />
      <path
        d="M10 20 L38 20 L35 34 C34 39 29 42 24 42 C19 42 14 39 13 34 Z"
        fill={ACCENT}
        stroke={OUTLINE}
        strokeWidth="1.5"
        {...strokeCap}
      />
      <path d="M38 22 q8 -1 8 6 q0 7 -8 6" fill="none" stroke={OUTLINE} strokeWidth="1.4" />
      <ellipse cx="24" cy="20" rx="14" ry="3" fill={SOFT} stroke={OUTLINE} strokeWidth="1.3" />
    </Svg>
  );
}

export function CoffeeCup() {
  return (
    <Svg>
      <path d="M14 10 q1 -5 -2 -7" fill="none" stroke={OUTLINE} strokeWidth="1.2" opacity="0.6" {...strokeCap} />
      <path d="M22 9 q1 -5 -2 -7" fill="none" stroke={OUTLINE} strokeWidth="1.2" opacity="0.45" {...strokeCap} />
      <path
        d="M9 18 L34 18 L31 36 C30 41 25 44 21 44 C17 44 12 41 11 36 Z"
        fill={ACCENT2}
        stroke={OUTLINE}
        strokeWidth="1.5"
        {...strokeCap}
      />
      <path d="M34 20 q7 0 7 6 q0 6 -7 6" fill="none" stroke={OUTLINE} strokeWidth="1.4" />
      <ellipse cx="21.5" cy="18" rx="12.5" ry="2.6" fill={SOFT} stroke={OUTLINE} strokeWidth="1.2" />
    </Svg>
  );
}

/* ---------- sky / whimsy ---------- */

export function Cloud() {
  return (
    <Svg>
      <path
        d="M11 32 C5 32 5 23 11 22 C11 14 22 12 26 18 C33 15 40 20 38 27 C43 27 43 34 37 34 L13 34 Z"
        fill={SOFT}
        stroke={OUTLINE}
        strokeWidth="1.5"
        {...strokeCap}
      />
    </Svg>
  );
}

export function SparkleStar() {
  return (
    <Svg>
      <path
        d="M24 4 C24 14 26 22 24 24 C22 22 24 14 24 4 Z M24 44 C24 34 22 26 24 24 C26 26 24 34 24 44 Z M4 24 C14 24 22 26 24 24 C22 22 14 24 4 24 Z M44 24 C34 24 26 22 24 24 C26 26 34 24 44 24 Z"
        fill={ACCENT}
        stroke={OUTLINE}
        strokeWidth="1.2"
        {...strokeCap}
      />
      <circle cx="24" cy="24" r="2.4" fill={SOFT} />
    </Svg>
  );
}

export function BubbleCluster() {
  return (
    <Svg>
      <circle cx="18" cy="26" r="13" fill={SOFT} stroke={OUTLINE} strokeWidth="1.4" opacity="0.9" />
      <circle cx="34" cy="16" r="7.5" fill={ACCENT2} stroke={OUTLINE} strokeWidth="1.3" opacity="0.9" />
      <path d="M13 20 q-2 4 1 7" fill="none" stroke="#fff" strokeWidth="1.6" {...strokeCap} opacity="0.7" />
      <path d="M32 13 q-1 2 1 3.5" fill="none" stroke="#fff" strokeWidth="1.2" {...strokeCap} opacity="0.7" />
    </Svg>
  );
}

/* ---------- matcha ---------- */

export function MatchaLeaf() {
  return (
    <Svg>
      <path d="M24 44 L24 24" stroke={OUTLINE} strokeWidth="1.6" {...strokeCap} />
      <path
        d="M24 24 C10 22 6 8 8 4 C24 4 32 14 24 24 Z"
        fill={ACCENT}
        stroke={OUTLINE}
        strokeWidth="1.4"
        {...strokeCap}
      />
      <path d="M10 7 C16 10 20 15 23 21" fill="none" stroke={SOFT} strokeWidth="1.1" opacity="0.8" />
      <path
        d="M24 24 C34 26 40 36 39 42 C24 42 17 33 24 24 Z"
        fill={ACCENT2}
        stroke={OUTLINE}
        strokeWidth="1.4"
        {...strokeCap}
      />
    </Svg>
  );
}

/* ---------- teddy / panda ---------- */

export function PawPrint() {
  return (
    <Svg>
      <ellipse cx="24" cy="30" rx="12" ry="10" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.5" />
      <ellipse cx="11" cy="14" rx="4.6" ry="5.6" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.3" transform="rotate(-18 11 14)" />
      <ellipse cx="22" cy="8" rx="4.8" ry="5.8" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.3" />
      <ellipse cx="34" cy="9" rx="4.6" ry="5.6" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.3" transform="rotate(12 34 9)" />
      <ellipse cx="42" cy="18" rx="4.2" ry="5.2" fill={ACCENT} stroke={OUTLINE} strokeWidth="1.3" transform="rotate(28 42 18)" />
    </Svg>
  );
}

export function BambooStalk() {
  return (
    <Svg>
      <path d="M20 44 L20 4" stroke={ACCENT} strokeWidth="7" strokeLinecap="round" />
      {[12, 22, 32].map((y) => (
        <path key={y} d={`M15 ${y} L25 ${y}`} stroke={OUTLINE} strokeWidth="1.6" {...strokeCap} />
      ))}
      <path
        d="M20 12 C30 8 36 2 38 4 C36 10 28 14 20 16 Z"
        fill={ACCENT2}
        stroke={OUTLINE}
        strokeWidth="1.3"
        {...strokeCap}
      />
      <path
        d="M20 22 C10 19 5 13 6 11 C10 16 16 20 20 22 Z"
        fill={ACCENT2}
        stroke={OUTLINE}
        strokeWidth="1.3"
        {...strokeCap}
      />
    </Svg>
  );
}

/* ---------- pixel / blockland ---------- */

const PX = 6; // one "pixel" unit for the blocky theme's chunky, un-antialiased look

export function PixelTree() {
  return (
    <Svg>
      <g shapeRendering="crispEdges">
        <rect x={4 * PX} y={5 * PX} width={PX * 3} height={PX * 3} fill={ACCENT} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x={2 * PX} y={2 * PX} width={PX * 7} height={PX * 3} fill={ACCENT} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x={3 * PX} y={0} width={PX * 5} height={PX * 2} fill={ACCENT2} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x={5 * PX} y={7 * PX} width={PX * 1} height={PX * 1} fill={OUTLINE} />
      </g>
    </Svg>
  );
}

export function PixelBlock() {
  return (
    <Svg>
      <g shapeRendering="crispEdges">
        <rect x={4} y={4} width={40} height={40} fill={ACCENT2} stroke={OUTLINE} strokeWidth="1.8" />
        <rect x={4} y={4} width={40} height={13} fill={ACCENT} stroke={OUTLINE} strokeWidth="1.8" />
        <rect x={9} y={22} width={7} height={7} fill={SOFT} opacity="0.7" />
        <rect x={22} y={30} width={6} height={6} fill={SOFT} opacity="0.6" />
        <rect x={32} y={16} width={6} height={6} fill={SOFT} opacity="0.6" />
      </g>
    </Svg>
  );
}

export const MOTIFS = {
  blossom: Blossom,
  blossomSprig: BlossomSprig,
  tulip: Tulip,
  strawberry: Strawberry,
  berryCluster: BerryCluster,
  milkDrop: MilkDrop,
  lollipop: Lollipop,
  teacup: Teacup,
  coffeeCup: CoffeeCup,
  cloud: Cloud,
  sparkleStar: SparkleStar,
  bubbleCluster: BubbleCluster,
  matchaLeaf: MatchaLeaf,
  pawPrint: PawPrint,
  bambooStalk: BambooStalk,
  pixelTree: PixelTree,
  pixelBlock: PixelBlock,
};
