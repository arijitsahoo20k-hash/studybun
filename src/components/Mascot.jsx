import React from "react";
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

export default function Mascot({ species = "bunny", mood = "idle", size = 72, hop = false, peek = false, hopLoop = false }) {
  const Species = SPECIES[species] || Bunny;
  return <Species mood={mood} size={size} hop={hop} peek={peek} hopLoop={hopLoop} />;
}
