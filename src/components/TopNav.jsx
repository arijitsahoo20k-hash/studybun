import React, { useEffect, useLayoutEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

/**
 * Crextio-style pill top nav for tablet/desktop (replaces the old sidebar).
 *
 * Only as many nav items are shown as actually fit the available width --
 * measured live off a hidden mirror row rather than guessed from a
 * breakpoint, so a tablet in portrait and a wide desktop both get exactly
 * as many labels as they have room for, no wrapping and no clipped text.
 * Whatever doesn't fit collapses into the trailing "More" pill, which opens
 * a small floating panel instead of forcing everything into a hamburger.
 *
 * The currently active page is always kept visible in the bar itself (never
 * silently swallowed into the overflow panel), even if that means one extra
 * item has to fall back into "More" to make room for it.
 */
export default function TopNav({ nav, page, setPage, reducedMotion, onHoverItem }) {
  const wrapRef = useRef(null);
  const measureRefs = useRef({});
  const moreMeasureRef = useRef(null);
  const moreTriggerRef = useRef(null);
  const panelRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(nav.length);
  const [overflowOpen, setOverflowOpen] = useState(false);

  // Tap devices (tablets) never fire onMouseEnter/onFocus, so without this
  // the lazy chunk for a page only starts loading on tap itself -- and since
  // go() wraps setPage in startTransition, React then holds the OLD active
  // pill in place until that chunk finishes instead of switching right away.
  // That's what reads as "laggy" on tablet specifically. Mirrors the
  // onTouchStart prefetch the phone dropdown nav already has. Also track a
  // synchronously-set pendingId so the highlight itself never waits on the
  // transition, even on a slow/cold connection.
  const [pendingId, setPendingId] = useState(null);
  useEffect(() => { if (pendingId === page) setPendingId(null); }, [page, pendingId]);
  const isActive = (id) => page === id || pendingId === id;

  const recalc = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const available = wrap.clientWidth;
    const gap = 6;
    const moreW = (moreMeasureRef.current?.offsetWidth || 84) + gap;

    let used = 0;
    let count = 0;
    for (let i = 0; i < nav.length; i++) {
      const el = measureRefs.current[nav[i].id];
      const w = (el?.offsetWidth || 0) + (i > 0 ? gap : 0);
      const isLast = i === nav.length - 1;
      const reserve = isLast ? 0 : moreW;
      if (used + w + reserve > available) break;
      used += w;
      count += 1;
    }
    if (count < 1) count = 1;

    // Never let the active page get stranded in the overflow panel.
    const activeIdx = nav.findIndex((n) => n.id === page);
    if (activeIdx !== -1 && activeIdx >= count) count = Math.min(nav.length, activeIdx + 1);

    setVisibleCount(count);
  };

  useLayoutEffect(() => { recalc(); }, [page, nav]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => recalc());
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  useEffect(() => {
    window.addEventListener("resize", recalc);
    document.fonts?.ready?.then(recalc).catch(() => {});
    return () => window.removeEventListener("resize", recalc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  useEffect(() => {
    if (!overflowOpen) return;
    const onDoc = (e) => {
      if (panelRef.current?.contains(e.target) || moreTriggerRef.current?.contains(e.target)) return;
      setOverflowOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOverflowOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [overflowOpen]);

  // Closing on navigation is handled inside go(), but also close if the
  // active page changes from elsewhere (e.g. a push-notification deep link).
  useEffect(() => { setOverflowOpen(false); }, [page]);

  const visible = nav.slice(0, visibleCount);
  const overflow = nav.slice(visibleCount);
  const overflowHasActive = overflow.some((n) => n.id === page);

  const go = (id) => {
    setPendingId(id); // instant visual feedback, independent of the transition below
    startTransition(() => setPage(id));
    setOverflowOpen(false);
  };

  return (
    <nav className="sb-pillnav">
      <div className="sb-pillnav-row" ref={wrapRef}>
        {visible.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`sb-pillnav-item ${isActive(n.id) ? "active" : ""}`}
            onClick={() => go(n.id)}
            onMouseEnter={() => onHoverItem?.(n.id)}
            onFocus={() => onHoverItem?.(n.id)}
            onTouchStart={() => onHoverItem?.(n.id)}
          >
            <n.icon size={16} /><span>{n.label}</span>
          </button>
        ))}

        {overflow.length > 0 && (
          <button
            ref={moreTriggerRef}
            type="button"
            className={`sb-pillnav-more ${overflowHasActive ? "active" : ""}`}
            onClick={() => setOverflowOpen((v) => !v)}
            onMouseEnter={() => overflow.forEach((n) => onHoverItem?.(n.id))}
            onFocus={() => overflow.forEach((n) => onHoverItem?.(n.id))}
            onTouchStart={() => overflow.forEach((n) => onHoverItem?.(n.id))}
            aria-expanded={overflowOpen}
            aria-haspopup="true"
          >
            <MoreHorizontal size={16} /><span>More</span>
          </button>
        )}

        {/* Off-screen mirror of every nav item (same markup/classes) purely so
            we can read real rendered widths -- fonts, icon sizing and padding
            all affect this and shouldn't be duplicated as magic numbers. */}
        <div className="sb-pillnav-measure" aria-hidden="true">
          {nav.map((n) => (
            <button
              key={n.id}
              type="button"
              tabIndex={-1}
              ref={(el) => { measureRefs.current[n.id] = el; }}
              className="sb-pillnav-item"
            >
              <n.icon size={16} /><span>{n.label}</span>
            </button>
          ))}
          <button type="button" tabIndex={-1} ref={moreMeasureRef} className="sb-pillnav-more">
            <MoreHorizontal size={16} /><span>More</span>
          </button>
        </div>
      </div>

      {/* Deliberately OUTSIDE .sb-pillnav-row: that row clips (overflow:
          hidden) so items never visibly spill before JS finishes measuring,
          but that same clipping would hide this floating panel too since it
          extends below the row. Living here, one level up, it's positioned
          off the unclipped outer <nav> instead. */}
      <AnimatePresence>
        {overflowOpen && (
          <motion.div
            ref={panelRef}
            className="sb-pillnav-overflow"
            role="menu"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {overflow.map((n) => (
              <button
                key={n.id}
                type="button"
                role="menuitem"
                className={`sb-pillnav-overflow-item ${isActive(n.id) ? "active" : ""}`}
                onClick={() => go(n.id)}
                onTouchStart={() => onHoverItem?.(n.id)}
              >
                <n.icon size={17} /><span>{n.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
