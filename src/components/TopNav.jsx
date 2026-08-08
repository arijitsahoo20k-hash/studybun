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
 * visibleCount is a pure function of available width -- it does NOT reshuffle
 * when the active page happens to live in the overflow panel. Picking
 * something from "More" just slides the indicator onto the More pill itself;
 * it never yanks that item into the main row (which used to shove every
 * other item sideways and could even collapse "More" away entirely).
 *
 * The active state is a single pill (span.sb-pillnav-indicator, a
 * motion.span) that springs between whichever button is current -- a
 * visible item, or the More trigger when the active page is tucked in the
 * overflow panel. Framer Motion owns the animation: we only ever hand it a
 * target box (x/y/width/height in wrap-relative px) via state, and it
 * interpolates from whatever's currently rendered. A resize-driven reflow
 * or the very first paint sets `instant` so that update snaps with zero
 * duration instead of animating.
 */
export default function TopNav({ nav, page, setPage, reducedMotion, onHoverItem }) {
  const wrapRef = useRef(null);
  const measureRefs = useRef({});
  const moreMeasureRef = useRef(null);
  const moreTriggerRef = useRef(null);
  const panelRef = useRef(null);
  const itemRefs = useRef({});

  const [visibleCount, setVisibleCount] = useState(nav.length);
  const [overflowOpen, setOverflowOpen] = useState(false);

  // The sliding indicator's box, in wrap-relative px -- handed straight to
  // Framer Motion's `animate` prop below instead of being pushed onto the
  // DOM by hand. Motion interpolates x/y/width/height itself (it already
  // knows the currently-rendered value, so a prop change animates FROM
  // there), so a page switch gets one springy, physically-real slide
  // instead of a linear CSS transition. `pillInstantRef` flips a render to
  // a zero-duration snap (first paint, a width-driven visibleCount change,
  // a font swap) without needing its own state -- positionPill sets it
  // synchronously right before the setPillBox that triggers the re-render
  // reading it, so it's always current by the time JSX below runs.
  const [pillBox, setPillBox] = useState({ x: 0, y: 0, width: 0, height: 0, opacity: 0 });
  const pillInstantRef = useRef(true);

  // Tap devices (tablets) never fire onMouseEnter/onFocus, so without this
  // the lazy chunk for a page only starts loading on tap itself -- and since
  // go() wraps setPage in startTransition, React then holds the OLD active
  // pill in place until that chunk finishes instead of switching right away.
  // Mirrors the onTouchStart prefetch the phone dropdown nav already has.
  // Also track a synchronously-set pendingId so the highlight itself never
  // waits on the transition, even on a slow/cold connection.
  const [pendingId, setPendingId] = useState(null);
  useEffect(() => { if (pendingId === page) setPendingId(null); }, [page, pendingId]);
  const activeId = pendingId || page;
  const isActive = (id) => activeId === id;

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
    setVisibleCount(count);
  };

  useLayoutEffect(() => { recalc(); }, [nav]);

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
  const overflowHasActive = overflow.some((n) => n.id === activeId);

  const go = (id) => {
    setPendingId(id); // instant visual feedback, independent of the transition below
    startTransition(() => setPage(id));
    setOverflowOpen(false);
  };

  // Figure out where the indicator pill should sit -- over whichever
  // element is current, a visible item's own button, or the More trigger if
  // the active page is sitting in the overflow panel -- and hand the box
  // straight to Framer Motion via state. `instant` marks this update to
  // render with a zero-duration transition (see pillInstantRef above) so
  // only an actual page switch gets the springy slide; a resize-driven
  // reflow or the very first paint snaps in place instead.
  const positionPill = (instant) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const target = overflowHasActive ? moreTriggerRef.current : itemRefs.current[activeId];
    if (!target) { setPillBox((b) => ({ ...b, opacity: 0 })); return; }

    const wrapRect = wrap.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    pillInstantRef.current = instant;
    setPillBox({
      x: rect.left - wrapRect.left,
      y: rect.top - wrapRect.top,
      width: rect.width,
      height: rect.height,
      opacity: 1,
    });
  };

  const lastAnimKeyRef = useRef(null);
  useLayoutEffect(() => {
    // Only animate when the ACTIVE target actually changed (a real nav
    // switch). A resize/recalc-driven visibleCount change can reposition the
    // same active target for layout reasons and should snap instantly, not
    // slide; same for the very first paint.
    const key = `${activeId}:${overflowHasActive}`;
    const isFirstRun = lastAnimKeyRef.current === null;
    const targetChanged = lastAnimKeyRef.current !== key;
    positionPill(reducedMotion || isFirstRun || !targetChanged);
    lastAnimKeyRef.current = key;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, overflowHasActive, visibleCount]);

  useEffect(() => {
    if (!document.fonts?.ready) return;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled) positionPill(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className="sb-pillnav">
      <div className="sb-pillnav-row" ref={wrapRef}>
        <motion.span
          className="sb-pillnav-indicator"
          aria-hidden="true"
          initial={false}
          animate={{ x: pillBox.x, y: pillBox.y, width: pillBox.width, height: pillBox.height, opacity: pillBox.opacity }}
          transition={pillInstantRef.current ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 42, mass: 0.9 }}
        />
        {visible.map((n) => (
          <button
            key={n.id}
            type="button"
            ref={(el) => { itemRefs.current[n.id] = el; }}
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
