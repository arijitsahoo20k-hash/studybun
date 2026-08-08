import React from "react";
import { motion } from "framer-motion";
import { STUDIO_SPRINGS } from "../styles/studioTokens";

/**
 * Studio Mode's mobile chrome (brief section 18): a compact, touch-friendly
 * bottom bar rather than a shrunken sidebar. Shows a curated primary set —
 * mirroring TOP_NAV's "most-used" philosophy — with the rest reachable via
 * the "More" item, which reuses the existing mobile dropdown pattern.
 */
export default function StudioBottomNav({ nav, page, setPage, onMore, reducedMotion }) {
  return (
    <nav className="sb-studio-bottom-nav" aria-label="Primary">
      {nav.map((n) => {
        const active = page === n.id;
        return (
          <button
            key={n.id}
            type="button"
            className={`sb-studio-bottom-item ${active ? "is-active" : ""}`}
            onClick={() => setPage(n.id)}
            aria-current={active ? "page" : undefined}
          >
            {active && (
              <motion.span
                layoutId="sb-studio-bottom-active"
                className="sb-studio-bottom-active"
                transition={reducedMotion ? { duration: 0.001 } : STUDIO_SPRINGS.standard}
              />
            )}
            <n.icon size={19} strokeWidth={1.8} />
            <span>{n.label}</span>
          </button>
        );
      })}
      <button type="button" className="sb-studio-bottom-item" onClick={onMore}>
        <span className="sb-studio-bottom-more-dot" aria-hidden="true">•••</span>
        <span>More</span>
      </button>
    </nav>
  );
}
