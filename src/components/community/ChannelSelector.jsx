import React from "react";

export default function ChannelSelector({ channels, activeId, onSelect }) {
  return (
    <div className="sb-channel-selector">
      {channels.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`sb-chip small ${activeId === c.id ? "active" : ""}`}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
