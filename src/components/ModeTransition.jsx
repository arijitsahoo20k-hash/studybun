import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * The signature Cozy <-> Studio transition (brief section 11).
 *
 * This is NOT a slideshow/fade between two screenshots — it's a single
 * translucent "material" layer that briefly sweeps over the interface: it
 * softens/blurs what's underneath, tints toward whichever mode is being
 * entered, then dissolves as the real UI (already switched underneath,
 * see useThemeMode's mid-transition flip) settles into place. The
 * underlying page never unmounts and never stops being interactive-ready —
 * the overlay is purely a material event sitting on top of it.
 *
 * targetMode = the mode being switched TO, so the tint reads as "arriving".
 */
export default function ModeTransition({ active, targetMode, reducedMotion }) {
  if (reducedMotion) {
    // Reduced motion: no material sweep, no blur pulse — just let the
    // instant CSS-variable swap underneath read as a plain, short cut.
    return null;
  }

  const isStudio = targetMode === "studio";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="sb-mode-transition"
          aria-hidden="true"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{
            opacity: [0, 1, 1, 0],
            backdropFilter: ["blur(0px)", "blur(22px)", "blur(22px)", "blur(0px)"],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.62, times: [0, 0.35, 0.62, 1], ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            background: isStudio
              ? "linear-gradient(135deg, rgba(246,244,241,0.55), rgba(91,85,72,0.10))"
              : "linear-gradient(135deg, rgba(255,248,239,0.55), rgba(255,154,174,0.14))",
          }}
        >
          {/* A soft radial bloom that expands from the switch control's
              general vicinity (top-right chrome, where the toggle lives in
              both layouts) rather than the screen center — an anchored,
              physical origin instead of a generic full-screen wash. */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.4, 1.8], opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.62, times: [0, 0.4, 1], ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "absolute",
              top: "-10%",
              right: "-6%",
              width: "60vmax",
              height: "60vmax",
              borderRadius: "50%",
              background: isStudio
                ? "radial-gradient(circle, rgba(91,85,72,0.16), transparent 70%)"
                : "radial-gradient(circle, rgba(255,154,174,0.22), transparent 70%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
