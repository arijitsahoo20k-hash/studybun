import React from "react";
import { Lock } from "lucide-react";

export default function ChannelSelector({ channels, activeId, onSelect }) {
  return (
    <div className="sb-channel-selector">
      {channels.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`sb-chip small ${activeId === c.id ? "active" : ""} ${c.is_locked ? "locked" : ""}`}
          onClick={() => onSelect(c.id)}
        >
          {c.is_locked && <Lock size={11} className="sb-chip-lock-icon" aria-hidden="true" />}
          {c.name}
        </button>
      ))}
    </div>
  );
}
