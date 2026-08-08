import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, ChevronsLeft, Layers } from "lucide-react";
import { STUDIO_SPRINGS } from "../styles/studioTokens";

/**
 * Studio Mode's application chrome (brief section 8) — a persistent
 * left rail rather than the floating pill topbar Cozy Mode uses. The
 * active-item indicator is a single shared element (`layoutId`) that
 * physically slides between items on click instead of appearing/
 * disappearing, per the brief.
 *
 * Reuses the same NAV data + setPage/prefetchPage contract as TopNav so
 * routing logic in App.jsx stays completely untouched.
 */
export default function StudioSidebar({
  nav, page, setPage, onHoverItem, mascotTitle = "StudyBun",
  onOpenSettings, onOpenProfile, settingsActive, profileActive,
  reducedMotion, onToggleMode,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className={`sb-studio-sidebar ${collapsed ? "is-collapsed" : ""}`}
      animate={{ width: collapsed ? "var(--st-sidebar-w-collapsed)" : "var(--st-sidebar-w)" }}
      transition={reducedMotion ? { duration: 0.001 } : STUDIO_SPRINGS.standard}
    >
      <div className="sb-studio-brand">
        <span className="sb-studio-mark" aria-hidden="true"><Layers size={18} /></span>
        {!collapsed && <span className="sb-studio-brand-label">{mascotTitle}</span>}
      </div>

      <nav className="sb-studio-nav" aria-label="Primary">
        {nav.map((n) => {
          const active = page === n.id;
          return (
            <button
              key={n.id}
              type="button"
              className={`sb-studio-nav-item ${active ? "is-active" : ""}`}
              onClick={() => setPage(n.id)}
              onMouseEnter={() => onHoverItem?.(n.id)}
              onFocus={() => onHoverItem?.(n.id)}
              aria-current={active ? "page" : undefined}
              title={collapsed ? n.label : undefined}
            >
              {active && (
                <motion.span
                  layoutId="sb-studio-active-pill"
                  className="sb-studio-active-pill"
                  transition={reducedMotion ? { duration: 0.001 } : STUDIO_SPRINGS.standard}
                />
              )}
              <span className="sb-studio-nav-icon"><n.icon size={17} strokeWidth={1.8} /></span>
              {!collapsed && <span className="sb-studio-nav-label">{n.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sb-studio-sidebar-footer">
        <button type="button" className={`sb-studio-nav-item sb-studio-footer-item ${settingsActive ? "is-active" : ""}`} onClick={onOpenSettings} title="Settings">
          <span className="sb-studio-nav-icon"><Settings size={17} strokeWidth={1.8} /></span>
          {!collapsed && <span className="sb-studio-nav-label">Settings</span>}
        </button>
        <button type="button" className={`sb-studio-nav-item sb-studio-footer-item ${profileActive ? "is-active" : ""}`} onClick={onOpenProfile} title="Profile">
          <span className="sb-studio-nav-icon"><User size={17} strokeWidth={1.8} /></span>
          {!collapsed && <span className="sb-studio-nav-label">Profile</span>}
        </button>
        <button
          type="button"
          className="sb-studio-mode-toggle"
          onClick={onToggleMode}
          aria-label="Switch to Cozy Mode"
          title="Switch to Cozy Mode"
        >
          <span className="sb-studio-mode-dot" />
          {!collapsed && <span>Cozy Mode</span>}
        </button>
        <button
          type="button"
          className="sb-studio-collapse-btn"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronsLeft size={15} />
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
