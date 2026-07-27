import React, { useRef, useState } from "react";
import Bunny from "./mascots/Bunny";
import Cat from "./mascots/Cat";
import Fox from "./mascots/Fox";
import Bear from "./mascots/Bear";
import Hamster from "./mascots/Hamster";
import Penguin from "./mascots/Penguin";

/*
 * Every species below is handcrafted independently in its own file under
 * ./mascots -- its own silhouette, its own eyes/mouth vocabulary, its own
 * signature accessory and body part (tail, paws, cheek pouches, flippers).
 * None of them share a face-parts table; this file only routes to the
 * right one and keeps the same {species, mood, size, hop, peek} API every
 * page in the app already calls.
 */
const SPECIES = { bunny: Bunny, cat: Cat, fox: Fox, bear: Bear, hamster: Hamster, penguin: Penguin };

// A handful of hearts/sparkles per pet, each with its own tiny random drift
// so a burst never looks identical twice.
const PET_BITS = ["💗", "✨", "💕", "⭐"];

/**
 * pettable: when true, tapping the mascot doesn't navigate/toggle anything --
 * it just reacts. A quick squish-bounce plays on the species wrapper (works
 * for every species without touching their individual SVGs) and a small
 * burst of hearts/sparkles floats up and fades. Species stay dumb about this;
 * it's purely a wrapper-level delight moment for ambient/idle placements
 * (Dashboard hero, Focus Timer) -- not for spots where tapping the mascot
 * already does something else (BuddyGuide avatar, onboarding picker, etc).
 */
export default function Mascot({ species = "bunny", mood = "idle", size = 72, hop = false, peek = false, hopLoop = false, pettable = false, onPet }) {
  const Species = SPECIES[species] || Bunny;
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);

  const pet = () => {
    if (!pettable) return;
    const id = idRef.current++;
    const bits = Array.from({ length: 4 }, (_, i) => ({
      key: `${id}-${i}`,
      glyph: PET_BITS[Math.floor(Math.random() * PET_BITS.length)],
      dx: (Math.random() - 0.5) * 46,
      delay: i * 55,
    }));
    setBursts((cur) => [...cur, { id, bits }]);
    setTimeout(() => setBursts((cur) => cur.filter((b) => b.id !== id)), 900);
    onPet?.();
  };

  const body = <Species mood={mood} size={size} hop={hop} peek={peek} hopLoop={hopLoop} />;

  if (!pettable) return body;

  return (
    <span
      className="sb-mascot-pet-wrap"
      role="button"
      tabIndex={0}
      aria-label="Pet your study buddy"
      onClick={pet}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pet(); } }}
      style={{ width: size, height: size }}
    >
      <span className={bursts.length ? "sb-mascot-pet-squish" : ""} key={bursts.length ? bursts[bursts.length - 1].id : "still"}>
        {body}
      </span>
      {bursts.map((b) =>
        b.bits.map((bit) => (
          <span
            key={bit.key}
            className="sb-mascot-pet-bit"
            style={{ "--dx": `${bit.dx}px`, animationDelay: `${bit.delay}ms` }}
          >
            {bit.glyph}
          </span>
        ))
      )}
    </span>
  );
}
