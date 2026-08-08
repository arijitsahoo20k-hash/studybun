import React from "react";
import Mascot from "./Mascot";
import { THEMES } from "../data/themes";
import { MOTIFS } from "./decor/Motifs";

export const Card = ({ children, className = "", style, onClick, washi = false, paper = false, glass = false }) => (
  <div className={`sb-card ${glass ? "sb-card-glass" : ""} ${paper ? "sb-paper" : ""} ${className}`} style={style} onClick={onClick}>
    {washi && <span className="sb-washi" aria-hidden="true" />}
    {children}
  </div>
);

export const Btn = ({ children, variant = "primary", onClick, style, type = "button", disabled }) => (
  <button type={type} disabled={disabled} className={`sb-btn sb-btn-${variant}`} onClick={onClick} style={style}>{children}</button>
);

export const ProgressBar = ({ pct, color, paw = true }) => {
  const clamped = Math.min(100, Math.max(0, pct || 0));
  return (
    <div className="sb-progress-track">
      <div className="sb-progress-fill" style={{ width: `${clamped}%`, background: color || "var(--accent)" }} />
      {paw && clamped > 2 && (
        <span className="sb-progress-paw" style={{ left: `${clamped}%` }} aria-hidden="true">🐾</span>
      )}
    </div>
  );
};

export function ProgressRing({ pct, size = 84, stroke = 10, color, paw = true }) {
  const clamped = Math.min(100, Math.max(0, pct || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const angle = (clamped / 100) * 2 * Math.PI - Math.PI / 2;
  const px = size / 2 + r * Math.cos(angle);
  const py = size / 2 + r * Math.sin(angle);
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--soft)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || "var(--accent)"} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .6s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontFamily="var(--font-display)" fontSize={size * 0.22} fill="var(--ink)">{Math.round(clamped)}%</text>
      {paw && clamped > 3 && (
        <text x={px} y={py} textAnchor="middle" dy="0.35em" fontSize={size * 0.16} style={{ transition: "all .6s ease" }}>🐾</text>
      )}
    </svg>
  );
}

export const EmptyState = ({ mascot = "bunny", mood = "idle", text, sub }) => (
  <div className="sb-empty">
    <Mascot species={mascot} mood={mood} size={64} />
    <p className="sb-empty-text">{text}</p>
    {sub && <p className="sb-empty-sub">{sub}</p>}
  </div>
);

export const SectionTitle = ({ icon: Icon, children, right }) => (
  <div className="sb-section-title">
    <span>{Icon && <span className="sb-icon-badge"><Icon size={16} /></span>} {children}</span>
    {right}
  </div>
);

/* Small illustrated layer that drifts behind every page. Each theme supplies
   its own `decor` list (see src/data/themes.js) of 2-4 motif keys resolved
   against the MOTIFS library in ./decor/Motifs — actual different artwork
   per theme (a strawberry, a paw print, a pixel tree...), not one repeated
   emoji recolored. Position, rotation and depth below are fixed per slot
   (no Math.random) so the backdrop never reshuffles on an unrelated
   re-render, only when the theme itself changes. */
const DECOR_POS = [
  { top: "6%", left: "3%", size: 40, rot: -12, depth: "far" },
  { top: "28%", left: "1.5%", size: 26, rot: 8, depth: "near" },
  { top: "62%", left: "3.5%", size: 32, rot: -6, depth: "far" },
  { bottom: "6%", left: "9%", size: 24, rot: 14, depth: "near" },
  { top: "12%", right: "3%", size: 30, rot: 10, depth: "near" },
  { top: "42%", right: "1.5%", size: 38, rot: -9, depth: "far" },
  { top: "72%", right: "4.5%", size: 26, rot: 6, depth: "near" },
  { bottom: "10%", right: "11%", size: 34, rot: -14, depth: "far" },
];

export function DecorLayer({ theme }) {
  if (!theme) return null;
  const motifKeys = theme.decor && theme.decor.length ? theme.decor : ["sparkleStar"];
  return (
    <div className="sb-decor-layer">
      {DECOR_POS.map((pos, i) => {
        const Motif = MOTIFS[motifKeys[i % motifKeys.length]] || MOTIFS.sparkleStar;
        const { size, rot, depth, ...place } = pos;
        return (
          <span
            key={i}
            className={`sb-decor sb-decor-${depth}`}
            style={{
              ...place,
              width: size,
              height: size,
              animationDelay: `${i * 0.6}s`,
              "--sb-decor-rot": `${rot}deg`,
            }}
          >
            <Motif />
          </span>
        );
      })}
    </div>
  );
}

export function ThemePicker({ value, onChange, compact = false }) {
  return (
    <div className={`sb-theme-picker ${compact ? "compact" : ""}`}>
      {Object.entries(THEMES).map(([name, t]) => (
        <button key={name} type="button" className={`sb-theme-chip ${value === name ? "active" : ""}`}
          style={{ background: value === name ? t.soft : "var(--card)", borderColor: t.outline }}
          onClick={() => onChange(name)} title={name}>
          <span className="sb-theme-chip-swatch" style={{ background: t.accent, borderColor: t.outline }} />
          {!compact && name}
        </button>
      ))}
    </div>
  );
}

export function Confetti({ type = "confetti", theme }) {
  if (type === "petals") {
    const pieces = Array.from({ length: 28 });
    return (
      <div className="sb-confetti sb-confetti-petals">
        {pieces.map((_, i) => (
          <span
            key={i}
            className="sb-confetti-emoji"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1.6 + Math.random() * 0.8}s`,
              fontSize: `${14 + Math.random() * 16}px`,
            }}
          >
            {theme?.emoji || "✨"}
          </span>
        ))}
      </div>
    );
  }
  const pieces = Array.from({ length: 24 });
  return (
    <div className="sb-confetti">
      {pieces.map((_, i) => (
        <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.3}s`, background: ["var(--accent)", "var(--accent2)", "#FFD98E", "#B8E6C1"][i % 4] }} />
      ))}
    </div>
  );
}

export function LoadingScreen({ mascot = "bunny", message = "Preparing your study desk..." }) {
  return (
    <div className="sb-loading">
      <Mascot species={mascot} mood="studying" size={90} />
      <p>{message}</p>
    </div>
  );
}
