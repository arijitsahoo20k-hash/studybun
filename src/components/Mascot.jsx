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

/*
 * Every species gets its own HEAD SILHOUETTE (not just different ears bolted onto
 * the same circle), plus three drawing layers:
 *   back  -> drawn BEFORE the head shape (ears, background body bits)
 *   front -> drawn AFTER the head shape but BEFORE the eyes (snout/muzzle/markings)
 *   over  -> drawn LAST, on top of the whole face (whiskers, teeth, flippers)
 * `head` is the actual outline/fill replacing the old shared circle.
 * `scale` (sx, sy) resizes the shared eyes/mouth/blush group to fit that silhouette.
 */

function Bunny() {
  return {
    head: <circle cx="0" cy="0" r="26" fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" />,
    scale: [1, 1],
    back: (
      <>
        <ellipse cx="-14" cy="-30" rx="7" ry="21" fill="var(--accent2)" transform="rotate(-12 -14 -30)" {...OUTLINE} />
        <ellipse cx="14" cy="-30" rx="7" ry="21" fill="var(--accent2)" transform="rotate(12 14 -30)" {...OUTLINE} />
        <ellipse cx="-14" cy="-28" rx="3.2" ry="13" fill="var(--soft)" transform="rotate(-12 -14 -28)" />
        <ellipse cx="14" cy="-28" rx="3.2" ry="13" fill="var(--soft)" transform="rotate(12 14 -28)" />
      </>
    ),
    front: null,
    over: null,
  };
}

function Cat() {
  return {
    /* rounded cheeks tapering to a single pointed chin -- a "heart" silhouette, not a circle */
    head: (
      <path
        d="M -25 -3 Q -27 -22 0 -24 Q 27 -22 25 -3 Q 25 13 14 21 Q 0 29 -14 21 Q -25 13 -25 -3 Z"
        fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" strokeLinejoin="round"
      />
    ),
    scale: [1, 1],
    back: (
      <>
        <path d="M -22 -18 L -12 -34 L -4 -16 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M 22 -18 L 12 -34 L 4 -16 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M -19 -19 L -13 -29 L -8 -18 Z" fill="var(--soft)" />
        <path d="M 19 -19 L 13 -29 L 8 -18 Z" fill="var(--soft)" />
        {/* fluffy cheek tufts, echoing the pointed-chin silhouette from the side */}
        <path d="M -25 2 Q -34 5 -27 12 Q -24 8 -20 8 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M 25 2 Q 34 5 27 12 Q 24 8 20 8 Z" fill="var(--accent2)" {...OUTLINE} />
      </>
    ),
    front: (
      <path d="M -2.6 1 L 2.6 1 L 0 4.5 Z" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1" strokeLinejoin="round" />
    ),
    over: (
      <>
        <path d="M -6 6 L -18 3" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M -6 9 L -18 10" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 6 6 L 18 3" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 6 9 L 18 10" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
  };
}

function Fox() {
  return {
    /* narrow head that stretches into a long pointed muzzle -- reads as a triangle in silhouette */
    head: (
      <path
        d="M -21 -6 Q -23 -25 0 -27 Q 23 -25 21 -6 Q 21 7 10 16 Q 3 31 0 36 Q -3 31 -10 16 Q -21 7 -21 -6 Z"
        fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" strokeLinejoin="round"
      />
    ),
    scale: [0.82, 1],
    back: (
      <>
        <path d="M -21 -15 L -11 -37 L -2 -15 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M 21 -15 L 11 -37 L 2 -15 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M -16 -19 L -11 -31 L -6 -19 Z" fill="var(--soft)" />
        <path d="M 16 -19 L 11 -31 L 6 -19 Z" fill="var(--soft)" />
        {/* darker forehead marking, unlike any other species */}
        <path d="M -9 -21 Q 0 -27 9 -21 Q 5 -15 0 -14 Q -5 -15 -9 -21 Z" fill="var(--accent2)" opacity="0.55" />
      </>
    ),
    front: (
      <>
        {/* long white muzzle that hugs the pointed chin, unlike the round bear/hamster snouts */}
        <path d="M -9 11 Q 0 34 9 11 Q 5 23 0 24 Q -5 23 -9 11 Z" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" strokeLinejoin="round" />
        <ellipse cx="0" cy="23" rx="2.4" ry="1.8" fill="var(--ink)" />
      </>
    ),
    over: null,
  };
}

function Bear() {
  return {
    /* big, wide, chubby head -- noticeably larger than every other species */
    head: <ellipse cx="0" cy="0" rx="29" ry="27" fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" />,
    scale: [1.1, 1.06],
    back: (
      <>
        <circle cx="-22" cy="-23" r="11" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="22" cy="-23" r="11" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="-22" cy="-23" r="5" fill="var(--soft)" />
        <circle cx="22" cy="-23" r="5" fill="var(--soft)" />
      </>
    ),
    front: (
      /* big rounded muzzle patch -- wider and lower than the fox's pointed one */
      <>
        <ellipse cx="0" cy="15" rx="17" ry="12" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" />
        <ellipse cx="0" cy="9" rx="4.4" ry="3" fill="var(--ink)" />
      </>
    ),
    over: null,
  };
}

function Hamster() {
  return {
    /* short, wide, squashed head -- the opposite proportions of the fox's long one */
    head: <ellipse cx="0" cy="0" rx="30" ry="21" fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" />,
    scale: [1.05, 0.8],
    back: (
      <>
        <circle cx="-19" cy="-13" r="7.5" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="19" cy="-13" r="7.5" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="-19" cy="-13" r="3.2" fill="var(--soft)" />
        <circle cx="19" cy="-13" r="3.2" fill="var(--soft)" />
      </>
    ),
    front: (
      /* stuffed cheek pouches puff outward past the wide head, unlike the flat-cheeked bunny/cat */
      <>
        <ellipse cx="-28" cy="8" rx="11" ry="9" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" />
        <ellipse cx="28" cy="8" rx="11" ry="9" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" />
      </>
    ),
    over: (
      <>
        <line x1="-3" y1="8" x2="-15" y2="6" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        <line x1="-3" y1="11" x2="-15" y2="12" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        <line x1="3" y1="8" x2="15" y2="6" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        <line x1="3" y1="11" x2="15" y2="12" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        {/* little buck teeth, unique to the hamster */}
        <rect x="-3" y="8" width="2.6" height="4" rx="0.6" fill="var(--card)" stroke="var(--outline)" strokeWidth="1" />
        <rect x="0.4" y="8" width="2.6" height="4" rx="0.6" fill="var(--card)" stroke="var(--outline)" strokeWidth="1" />
      </>
    ),
  };
}

function Penguin() {
  return {
    head: null, // penguin keeps its own two-tone body treatment, drawn specially below
    scale: [1, 1],
    back: (
      <>
        <ellipse cx="0" cy="0" rx="23" ry="27" fill="var(--accent)" opacity="0.16" />
        <ellipse cx="0" cy="5" rx="16" ry="18" fill="var(--soft)" />
      </>
    ),
    front: (
      <>
        <path d="M -5 12 L 5 12 L 0 20 Z" fill="#FFC65C" />
        {/* flippers at the sides read very differently from any of the mammals' ears */}
        <ellipse cx="-30" cy="8" rx="7" ry="16" fill="var(--ink)" opacity="0.85" transform="rotate(20 -30 8)" />
        <ellipse cx="30" cy="8" rx="7" ry="16" fill="var(--ink)" opacity="0.85" transform="rotate(-20 30 8)" />
        <ellipse cx="-8" cy="31" rx="5" ry="3" fill="#FFC65C" />
        <ellipse cx="8" cy="31" rx="5" ry="3" fill="#FFC65C" />
      </>
    ),
    over: null,
  };
}

const SPECIES = { bunny: Bunny, cat: Cat, fox: Fox, bear: Bear, hamster: Hamster, penguin: Penguin };

const CLOSED_EYE = "M -4 0 Q 0 2.4 4 0";

export default function Mascot({ species = "bunny", mood = "idle", size = 72, hop = false, peek = false }) {
  const face = FACES[mood] || FACES.idle;
  const build = SPECIES[species] || Bunny;
  const { head, scale, back, front, over } = build();
  const isPenguin = species === "penguin";
  const [sx, sy] = scale;

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
      {back}

      {isPenguin ? (
        <>
          <circle cx="0" cy="0" r="26" fill="var(--ink)" stroke="var(--outline)" strokeWidth="2.4" opacity="0.08" />
          <circle cx="0" cy="0" r="26" fill="var(--card)" stroke="var(--outline)" strokeWidth="2.4" style={{ clipPath: "inset(0 0 40% 0)" }} />
          <ellipse cx="0" cy="10" rx="18" ry="14" fill="var(--card)" />
        </>
      ) : head}

      {/* species-specific muzzle/snout/marking, unique per species */}
      {front}

      {/* shared blush + eyes + mouth, scaled per species to fit that head's proportions */}
      <g transform={`scale(${sx} ${sy})`}>
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

      {/* accessories per mood (kept unscaled so text/icons don't distort) */}
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

      {/* whiskers/teeth/flippers sit above everything so they're never hidden behind the head fill */}
      {over}
    </svg>
  );
}
