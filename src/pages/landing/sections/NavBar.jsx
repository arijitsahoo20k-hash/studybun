import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Mascot from "../../../components/Mascot";

gsap.registerPlugin(ScrollTrigger);

/*
 * Landing nav, rebuilt from zero on GSAP -- nothing here reuses the old
 * markup, class names, or timing. Every moving part is choreographed by
 * gsap instead of leaning on CSS transitions:
 *
 *   - mount:      a timeline drops the rail in and staggers brand/links/CTA
 *   - scroll:     a ScrollTrigger crosses a threshold once and tweens the
 *                 rail from a loose floating pill into a tight compact bar
 *   - active link: an IntersectionObserver-free ScrollTrigger per section
 *                 drives a pill that *morphs* (x + width) to sit under
 *                 whichever link is current, with an elastic settle
 *   - hover:      quickTo-based magnetic pull on every link + the CTA
 *   - mobile:     a hand-built 3-bar burger morphs into an X, and a
 *                 full-bleed overlay staggers its links in on open
 *
 * Section ids it targets (unchanged, defined by the sections themselves):
 * sb-land-features, sb-land-themes, sb-land-faq.
 */

const LINKS = [
  { id: "sb-land-features", label: "Features" },
  { id: "sb-land-themes", label: "Themes" },
  { id: "sb-land-faq", label: "FAQ" },
];

const NAV_OFFSET = 88; // keeps scrolled-to sections clear of the floating rail

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
}

export default function NavBar({ onGetStarted }) {
  const rootRef = useRef(null);
  const railRef = useRef(null);
  const brandRef = useRef(null);
  const linksWrapRef = useRef(null);
  const linkRefs = useRef([]);
  const pillRef = useRef(null);
  const ctaRef = useRef(null);
  const burgerRef = useRef(null);
  const burgerBarRefs = useRef([]);
  const overlayRef = useRef(null);
  const overlayItemRefs = useRef([]);

  const [activeId, setActiveId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ---- mount entrance + scroll-compress + active-section tracking ----
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(rootRef.current, { autoAlpha: 1 });

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(railRef.current, { y: -76, duration: 0.75 })
        .from(brandRef.current, { autoAlpha: 0, x: -16, duration: 0.5, ease: "power2.out" }, "-=0.4")
        .from(
          linkRefs.current.filter(Boolean),
          { autoAlpha: 0, y: -12, stagger: 0.08, duration: 0.45, ease: "power2.out" },
          "-=0.3"
        )
        .from(ctaRef.current, { autoAlpha: 0, scale: 0.6, duration: 0.5, ease: "back.out(2.2)" }, "-=0.35")
        .from(burgerRef.current, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: "back.out(2.2)" }, "-=0.4");

      const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
      let compact = false;
      let lastActive;

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate(self) {
          // compact the rail past a small threshold
          const shouldCompact = self.scroll() > 30;
          if (shouldCompact !== compact) {
            compact = shouldCompact;
            gsap.to(railRef.current, {
              marginTop: compact ? 4 : 14,
              paddingTop: compact ? 7 : 12,
              paddingBottom: compact ? 7 : 12,
              borderRadius: compact ? 14 : 22,
              boxShadow: compact ? "0px 8px 20px var(--outline)" : "5px 5px 0px var(--outline)",
              duration: 0.45,
              ease: "power3.out",
            });
          }

          // single source of truth for which section is "active" --
          // whichever section's midpoint the viewport center has passed
          const viewportMid = self.scroll() + window.innerHeight / 2;
          let current = null;
          for (const section of sections) {
            if (viewportMid >= section.offsetTop) current = section.id;
          }
          if (current !== lastActive) {
            lastActive = current;
            setActiveId(current);
          }
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ---- morph the pill under whichever link is active ----
  useEffect(() => {
    const idx = LINKS.findIndex((l) => l.id === activeId);
    const target = linkRefs.current[idx];
    if (!target || !pillRef.current || !linksWrapRef.current) {
      gsap.to(pillRef.current, { autoAlpha: 0, duration: 0.25, ease: "power2.out" });
      return;
    }
    const targetBox = target.getBoundingClientRect();
    const wrapBox = linksWrapRef.current.getBoundingClientRect();
    gsap.to(pillRef.current, {
      autoAlpha: 1,
      x: targetBox.left - wrapBox.left,
      width: targetBox.width,
      duration: 0.55,
      ease: "elastic.out(1, 0.75)",
    });
  }, [activeId]);

  // ---- magnetic hover pull on links + CTA ----
  useEffect(() => {
    const targets = [...linkRefs.current, ctaRef.current].filter(Boolean);
    const teardowns = targets.map((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
      function onMove(e) {
        const box = el.getBoundingClientRect();
        xTo((e.clientX - box.left - box.width / 2) * 0.28);
        yTo((e.clientY - box.top - box.height / 2) * 0.4);
      }
      function onLeave() {
        xTo(0);
        yTo(0);
      }
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });
    return () => teardowns.forEach((fn) => fn());
  }, []);

  // ---- burger morph + full-bleed mobile overlay ----
  useEffect(() => {
    const bars = burgerBarRefs.current;
    if (!bars.length) return;

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      gsap.to(bars[0], { rotate: 45, y: 6, duration: 0.35, ease: "power3.inOut" });
      gsap.to(bars[1], { autoAlpha: 0, duration: 0.2, ease: "power2.out" });
      gsap.to(bars[2], { rotate: -45, y: -6, duration: 0.35, ease: "power3.inOut" });

      gsap.set(overlayRef.current, { display: "flex" });
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        overlayItemRefs.current.filter(Boolean),
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "back.out(1.8)", delay: 0.08 }
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(bars[0], { rotate: 0, y: 0, duration: 0.3, ease: "power3.inOut" });
      gsap.to(bars[1], { autoAlpha: 1, duration: 0.25, delay: 0.1, ease: "power2.out" });
      gsap.to(bars[2], { rotate: 0, y: 0, duration: 0.3, ease: "power3.inOut" });
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in",
        onComplete() {
          gsap.set(overlayRef.current, { display: "none" });
        },
      });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ---- escape key + resize safety net for the overlay ----
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onResize() {
      if (window.innerWidth > 640) setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  function go(id) {
    setMenuOpen(false);
    scrollToId(id);
  }

  return (
    <>
      <div className="sb-nav" ref={rootRef}>
        <div className="sb-nav-rail" ref={railRef}>
          <button
            type="button"
            className="sb-nav-brand"
            ref={brandRef}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="StudyBun home"
          >
            <Mascot species="bunny" mood="happy" size={30} />
            <span className="sb-nav-brand-title">StudyBun</span>
          </button>

          <div className="sb-nav-links" ref={linksWrapRef}>
            <span className="sb-nav-pill" ref={pillRef} aria-hidden="true" />
            {LINKS.map((link, i) => (
              <button
                key={link.id}
                type="button"
                ref={(el) => (linkRefs.current[i] = el)}
                className={`sb-nav-link${activeId === link.id ? " is-active" : ""}`}
                onClick={() => go(link.id)}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="sb-nav-actions">
            <button type="button" className="sb-nav-cta" ref={ctaRef} onClick={onGetStarted}>
              Sign in <ArrowRight size={14} />
            </button>

            <button
              type="button"
              className="sb-nav-burger"
              ref={burgerRef}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span ref={(el) => (burgerBarRefs.current[0] = el)} />
              <span ref={(el) => (burgerBarRefs.current[1] = el)} />
              <span ref={(el) => (burgerBarRefs.current[2] = el)} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="sb-nav-overlay"
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) setMenuOpen(false);
        }}
      >
        {LINKS.map((link, i) => (
          <button
            key={link.id}
            type="button"
            ref={(el) => (overlayItemRefs.current[i] = el)}
            className="sb-nav-overlay-link"
            onClick={() => go(link.id)}
          >
            {link.label}
          </button>
        ))}
        <button
          type="button"
          ref={(el) => (overlayItemRefs.current[LINKS.length] = el)}
          className="sb-nav-overlay-cta"
          onClick={() => {
            setMenuOpen(false);
            onGetStarted?.();
          }}
        >
          Sign in <ArrowRight size={16} />
        </button>
      </div>

      <style>{`
        .sb-nav { position: sticky; top: 0; z-index: 50; visibility: hidden; padding: 0 clamp(14px, 4vw, 32px); }
        .sb-nav-rail {
          margin-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 12px 16px; border-radius: 22px; border: 2.5px solid var(--outline);
          background: var(--card);
          box-shadow: 5px 5px 0px var(--outline);
        }

        .sb-nav-brand { display: flex; align-items: center; gap: 9px; background: none; border: none; padding: 0; cursor: pointer; }
        .sb-nav-brand-title { font-family: var(--font-display); font-weight: 800; font-size: 17px; color: var(--ink); }

        .sb-nav-links { position: relative; display: flex; align-items: center; gap: 2px; }
        .sb-nav-pill { position: absolute; left: 0; top: 4px; bottom: 4px; width: 0; border-radius: 999px; background: var(--soft); opacity: 0; z-index: 0; }
        .sb-nav-link {
          position: relative; z-index: 1; background: none; border: none; font-family: var(--font-body); font-weight: 800;
          font-size: 13px; color: var(--muted); padding: 8px 14px; border-radius: 999px; cursor: pointer;
        }
        .sb-nav-link:hover { color: var(--ink); }
        .sb-nav-link.is-active { color: var(--ink); }
        @media (max-width: 640px) { .sb-nav-links { display: none; } }

        .sb-nav-actions { display: flex; align-items: center; gap: 10px; }
        .sb-nav-cta {
          display: inline-flex; align-items: center; gap: 7px; background: var(--accent); color: #fff;
          border: 2.5px solid var(--outline); border-radius: 999px; padding: 9px 16px; font-family: var(--font-body);
          font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 3px 3px 0 var(--outline);
        }
        @media (max-width: 640px) { .sb-nav-cta { display: none; } }

        .sb-nav-burger {
          display: none; position: relative; width: 38px; height: 38px; border-radius: 12px; border: 2.5px solid var(--outline);
          background: var(--card); cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
        }
        .sb-nav-burger span { display: block; width: 18px; height: 2.5px; border-radius: 2px; background: var(--ink); transform-origin: center; }
        @media (max-width: 640px) { .sb-nav-burger { display: flex; } }

        .sb-nav-overlay {
          display: none; position: fixed; inset: 0; z-index: 70; flex-direction: column; align-items: center; justify-content: center;
          gap: 22px; background: var(--bg); opacity: 0;
        }
        .sb-nav-overlay-link {
          background: none; border: none; font-family: var(--font-display); font-weight: 800; font-size: 30px; color: var(--ink); cursor: pointer;
        }
        .sb-nav-overlay-cta {
          margin-top: 10px; display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: #fff;
          border: 2.5px solid var(--outline); border-radius: 999px; padding: 13px 26px; font-family: var(--font-body);
          font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 4px 4px 0 var(--outline);
        }
      `}</style>
    </>
  );
}
