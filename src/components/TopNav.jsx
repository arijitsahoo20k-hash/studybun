import React, { startTransition } from "react";

/**
 * Persistent StudyBun workspace sidebar.
 *
 * This intentionally has no outer card/pill container: the sidebar owns the
 * navigation surface and each item owns its own active/hover state. This
 * avoids the large rectangle that previously surrounded the whole nav.
 */
export default function TopNav({ nav, page, setPage, onHoverItem, collapsed }) {
  const go = (id) => {
    onHoverItem?.(id);
    startTransition(() => setPage(id));
  };

  return (
    <nav
      className={`sb-sidebar-nav ${collapsed ? "sb-sidebar-nav-collapsed" : ""}`}
      aria-label="Primary navigation"
    >
      <div className="sb-sidebar-nav-list">
        {nav.map((n) => {
          const active = page === n.id;
          return (
            <button
              key={n.id}
              type="button"
              className={`sb-sidebar-item ${active ? "active" : ""}`}
              onClick={() => go(n.id)}
              onMouseEnter={() => onHoverItem?.(n.id)}
              onFocus={() => onHoverItem?.(n.id)}
              onTouchStart={() => onHoverItem?.(n.id)}
              aria-current={active ? "page" : undefined}
              title={collapsed ? n.label : undefined}
            >
              <span className="sb-sidebar-item-icon"><n.icon size={18} strokeWidth={2.2} /></span>
              <span className="sb-sidebar-item-label">{n.label}</span>
              {collapsed && <span className="sb-sidebar-tooltip" role="tooltip">{n.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
