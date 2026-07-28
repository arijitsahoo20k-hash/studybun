import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mascotThought } from "../data/mascots";

/**
 * A classic cloud-shaped thought bubble that pops up above the mascot every
 * so often with a short, first-person line about how *it's* feeling about
 * the day -- not advice (that's BuddyGuide's job), just feelings, grounded
 * in the same mood/streak/hours numbers driving the mascot's face. This is
 * what makes the mascot read as something paying attention, rather than a
 * static icon that just happens to change expression.
 *
 * Usage: render as a sibling of <Mascot/> inside a `position: relative`
 * wrapper -- it positions itself absolutely above where it's mounted.
 */
export default function ThoughtBubble({ mood = "idle", streak = 0, todayHours = 0, dailyGoal = 6, minGapMs = 45000, maxGapMs = 90000, firstDelayMs = 4000 }) {
  const [line, setLine] = useState(null);
  const lastLineRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    const ctx = { streak, todayHours, dailyGoal };

    const showOne = () => {
      const next = mascotThought(mood, ctx, lastLineRef.current);
      lastLineRef.current = next;
      setLine(next);
      // Stay up for a few seconds, long enough to read, then fade and queue the next one.
      const hideT = setTimeout(() => setLine(null), 6800);
      const nextT = setTimeout(showOne, minGapMs + Math.random() * (maxGapMs - minGapMs));
      timers.current.push(hideT, nextT);
    };

    const startT = setTimeout(showOne, firstDelayMs);
    timers.current.push(startT);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // Re-roll the whole cycle whenever the mood itself changes (a fresh
    // emotional beat deserves a fresh thought), but not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  return (
    <AnimatePresence>
      {line && (
        <motion.div
          className="sb-thought-wrap"
          initial={{ opacity: 0, y: 8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          onClick={() => setLine(null)}
          role="status"
        >
          <div className="sb-thought-cloud">{line}</div>
          <span className="sb-thought-dot sb-thought-dot-1" />
          <span className="sb-thought-dot sb-thought-dot-2" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
