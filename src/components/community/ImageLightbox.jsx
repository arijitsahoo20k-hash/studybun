import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ImageLightbox — in-app full-screen image viewer.
 *
 * Follows the exact sb-pt-overlay/sb-pt-dialog pattern from FocusTimer.jsx
 * and PeriodicTable.jsx: role="dialog", aria-modal, Escape-to-close,
 * focus-on-open, click-backdrop-to-close.
 *
 * Props:
 *   images     — string[]  — array of image URLs
 *   startIndex — number    — which image to open on
 *   onClose    — () => void
 */
export default function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const dialogRef = useRef(null);
  const touchStartX = useRef(null);
  // Track the grid-tile index so we can return focus to the right tile on close
  const returnFocusRef = useRef(null);

  // Body scroll lock (consistent with sb-pt-overlay's fixed-inset approach)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Focus the dialog on mount; restore focus on unmount
  useEffect(() => {
    const prevFocus = document.activeElement;
    dialogRef.current?.focus();
    return () => { prevFocus?.focus(); };
  }, []);

  // Escape key + arrow-key navigation. Escape closes "from any position"
  // (explicit in the redesign plan), so it stays unscoped. Arrow keys are
  // scoped to only act while focus is actually inside this dialog —
  // without that check, a background element that still has focus (e.g.
  // a reply text input, since there was no focus trap) would have its
  // own arrow-key cursor movement hijacked into flipping the lightbox
  // image instead. The Tab-trap effect below is the primary fix (it
  // stops focus leaving the dialog at all); this check is defense in
  // depth in case focus ends up outside some other way.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (images.length > 1 && dialogRef.current?.contains(document.activeElement)) {
        if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
        if (e.key === "ArrowRight") setIdx((i) => Math.min(images.length - 1, i + 1));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, images.length]);

  // Focus trap: while the dialog is open, Tab/Shift+Tab cycle only
  // through its own focusable elements (close button, arrows if
  // present, dots if present) instead of escaping into the page behind
  // the overlay — a real modal shouldn't let keyboard focus leave it.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx((i) => Math.min(images.length - 1, i + 1)), [images.length]);

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next(); else prev();
  };

  const currentUrl = images[idx];
  const multi = images.length > 1;

  return (
    <div
      className="sb-pt-overlay sb-lightbox-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* .sb-lightbox-dialog is deliberately full-bleed (width/height:100%,
          overlay has padding:0) so the viewer reads as edge-to-edge, which
          means the overlay itself never has an exposed pixel to click —
          the same close-on-backdrop-click handler is duplicated on the
          dialog below so clicking the empty flex space around the image
          (anywhere that isn't the image/arrows/dots/close button) still
          closes it. */}
      <div
        ref={dialogRef}
        className="sb-lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        tabIndex={-1}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Close button */}
        <button
          className="sb-pt-dialog-close sb-lightbox-close"
          onClick={onClose}
          aria-label="Close photo viewer"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Previous */}
        {multi && idx > 0 && (
          <button className="sb-lightbox-arrow sb-lightbox-arrow-prev" onClick={prev} aria-label="Previous photo">
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Image */}
        <div className="sb-lightbox-img-wrap">
          <img
            src={currentUrl}
            alt={`Photo ${idx + 1} of ${images.length}`}
            className="sb-lightbox-img"
            onError={(e) => { e.currentTarget.style.opacity = "0.3"; }}
            draggable={false}
          />
        </div>

        {/* Next */}
        {multi && idx < images.length - 1 && (
          <button className="sb-lightbox-arrow sb-lightbox-arrow-next" onClick={next} aria-label="Next photo">
            <ChevronRight size={24} />
          </button>
        )}

        {/* Dot indicator */}
        {multi && (
          <div className="sb-lightbox-dots" aria-label={`Image ${idx + 1} of ${images.length}`}>
            {images.map((_, i) => (
              <button
                key={i}
                className={`sb-lightbox-dot ${i === idx ? "active" : ""}`}
                onClick={() => setIdx(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
