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

/* Each species gets three layers so silhouettes actually differ, not just the ears:
   back  -> drawn BEFORE the head circle (ears, background body bits)
   front -> drawn AFTER the head circle but BEFORE the eyes (snout/muzzle/markings)
   over  -> drawn LAST, on top of the whole face (whiskers, teeth, flippers) */

function Bunny() {
  return {
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
    back: (
      <>
        <path d="M -22 -18 L -12 -34 L -4 -16 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M 22 -18 L 12 -34 L 4 -16 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M -19 -19 L -13 -29 L -8 -18 Z" fill="var(--soft)" />
        <path d="M 19 -19 L 13 -29 L 8 -18 Z" fill="var(--soft)" />
        {/* fluffy cheek tufts give the head a wider, furrier silhouette than the bunny's */}
        <path d="M -26 4 Q -33 6 -27 12 Q -25 8 -22 8 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M 26 4 Q 33 6 27 12 Q 25 8 22 8 Z" fill="var(--accent2)" {...OUTLINE} />
      </>
    ),
    front: (
      /* small pink triangle nose sits above the mouth, distinct from the bunny's plain blush */
      <path d="M -2.6 1 L 2.6 1 L 0 4.5 Z" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1" strokeLinejoin="round" />
    ),
    over: (
      <>
        <path d="M -6 6 L -17 3" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M -6 9 L -17 10" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 6 6 L 17 3" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 6 9 L 17 10" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
  };
}

function Fox() {
  return {
    back: (
      <>
        <path d="M -24 -14 L -13 -36 L -3 -14 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M 24 -14 L 13 -36 L 3 -14 Z" fill="var(--accent2)" {...OUTLINE} />
        <path d="M -18 -18 L -13 -30 L -8 -18 Z" fill="var(--soft)" />
        <path d="M 18 -18 L 13 -30 L 8 -18 Z" fill="var(--soft)" />
        {/* darker forehead marking, unlike any other species */}
        <path d="M -10 -22 Q 0 -28 10 -22 Q 6 -16 0 -15 Q -6 -16 -10 -22 Z" fill="var(--accent2)" opacity="0.55" />
      </>
    ),
    front: (
      <>
        {/* pointed white muzzle makes the fox's face silhouette read as a triangle, not a circle */}
        <path d="M -11 10 Q 0 28 11 10 Q 6 20 0 21 Q -6 20 -11 10 Z" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" strokeLinejoin="round" />
        <ellipse cx="0" cy="19" rx="2.6" ry="2" fill="var(--ink)" />
      </>
    ),
    over: null,
  };
}

function Bear() {
  return {
    back: (
      <>
        <circle cx="-19" cy="-22" r="10" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="19" cy="-22" r="10" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="-19" cy="-22" r="4.5" fill="var(--soft)" />
        <circle cx="19" cy="-22" r="4.5" fill="var(--soft)" />
      </>
    ),
    front: (
      /* big rounded muzzle patch, wider and lower than the fox's pointed one */
      <>
        <ellipse cx="0" cy="14" rx="15" ry="11" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" />
        <ellipse cx="0" cy="9" rx="4" ry="2.6" fill="var(--ink)" />
      </>
    ),
    over: null,
  };
}

function Hamster() {
  return {
    back: (
      <>
        <circle cx="-21" cy="-15" r="8" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="21" cy="-15" r="8" fill="var(--accent2)" {...OUTLINE} />
        <circle cx="-21" cy="-15" r="3.6" fill="var(--soft)" />
        <circle cx="21" cy="-15" r="3.6" fill="var(--soft)" />
      </>
    ),
    front: (
      /* stuffed cheek pouches puff outward past the head outline, unlike the flat-cheeked bunny/cat */
      <>
        <ellipse cx="-24" cy="10" rx="10" ry="8" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" />
        <ellipse cx="24" cy="10" rx="10" ry="8" fill="var(--soft)" stroke="var(--outline)" strokeWidth="1.4" />
      </>
    ),
    over: (
      <>
        <line x1="-3" y1="9" x2="-13" y2="7" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        <line x1="-3" y1="12" x2="-13" y2="13" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        <line x1="3" y1="9" x2="13" y2="7" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        <line x1="3" y1="12" x2="13" y2="13" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
        {/* little buck teeth, unique to the hamster */}
        <rect x="-3" y="9" width="2.6" height="4" rx="0.6" fill="var(--card)" stroke="var(--outline)" strokeWidth="1" />
        <rect x="0.4" y="9" width="2.6" height="4" rx="0.6" fill="var(--card)" stroke="var(--outline)" strokeWidth="1" />
      </>
    ),
  };
}

function Penguin() {
  return {
    back: (
      <>
        <ellipse cx="0" cy="2" rx="22" ry="24" fill="var(--accent)" opacity="0.16" />
        <ellipse cx="0" cy="6" rx="15" ry="17" fill="var(--soft)" />
      </>
    ),
    front: (
      <>
        <path d="M -5 12 L 5 12 L 0 20 Z" fill="#FFC65C" />
        {/* small flippers at the sides read very differently from any of the mammals' ears */}
        <ellipse cx="-29" cy="8" rx="7" ry="15" fill="var(--ink)" opacity="0.85" transform="rotate(18 -29 8)" />
        <ellipse cx="29" cy="8" rx="7" ry="15" fill="var(--ink)" opacity="0.85" transform="rotate(-18 29 8)" />
        <ellipse cx="-8" cy="30" rx="5" ry="3" fill="#FFC65C" />
        <ellipse cx="8" cy="30" rx="5" ry="3" fill="#FFC65C" />
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
  const { back, front, over } = build();
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
      {back}

      <circle cx="0" cy="0" r="26" fill={isPenguin ? "var(--ink)" : "var(--card)"} stroke="var(--outline)" strokeWidth="2.4" opacity={isPenguin ? 0.08 : 1} />
      <circle cx="0" cy="0" r="26" fill={isPenguin ? "var(--card)" : "none"} stroke="var(--outline)" strokeWidth="2.4" style={isPenguin ? { clipPath: "inset(0 0 40% 0)" } : {}} />
      {isPenguin && <ellipse cx="0" cy="10" rx="18" ry="14" fill="var(--card)" />}

      {/* species-specific muzzle/snout/marking, unique per species */}
      {front}

      {/* blush */}
      <circle cx="-9" cy="8" r="4.2" fill="var(--accent)" opacity="0.4" />
      <circle cx="9" cy="8" r="4.2" fill="var(--accent)" opacity="0.4" />

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

      {/* whiskers/teeth/flippers sit above everything so they're never hidden behind the head fill */}
      {over}
    </svg>
  );
}
