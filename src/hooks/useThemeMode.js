import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "studybun-mode";

/** Cozy vs Studio — StudyBun's two global visual identities. Persisted
 *  locally (this is a device-level display preference, not study data, so
 *  it deliberately doesn't round-trip through Supabase/profile like the
 *  Cozy palette theme does). `transitioning` stays true for the duration
 *  of the signature morph animation so callers (App shell, ModeTransition)
 *  can suspend other motion/interaction during the switch. */
export function useThemeMode() {
  const [mode, setModeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "studio" ? "studio" : "cozy";
    } catch {
      return "cozy";
    }
  });
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  const toggleMode = useCallback(() => {
    setTransitioning(true);
    // Flip the mode roughly mid-transition so the material morph is
    // already underway when the new surfaces materialize, rather than
    // waiting for the whole overlay animation to finish first.
    window.setTimeout(() => {
      setModeState((m) => (m === "cozy" ? "studio" : "cozy"));
    }, 260);
    window.setTimeout(() => setTransitioning(false), 620);
  }, []);

  return { mode, toggleMode, transitioning };
}
