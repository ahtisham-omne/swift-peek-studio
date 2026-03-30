/**
 * UOM Module — Filter Pill
 *
 * Rounded pill toggle matching Figma reference:
 *   Default:  white bg, border token, subtle shadow, text-muted text
 *   Hover:    surface-raised bg
 *   Active:   primary-surface bg, primary border, primary text
 */

import { useState, type ReactNode } from "react";

export interface FilterPillProps {
  label: ReactNode;
  count?: number;
  dot?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FilterPill({
  label,
  count,
  dot,
  active = false,
  onClick,
  className = "",
}: FilterPillProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        inline-flex items-center gap-[6px] rounded-full
        cursor-pointer select-none transition-all
        ${className}
      `}
      style={{
        height: 30,
        padding: count !== undefined ? "6px 6px 6px 12px" : "6px 12px",
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-weight-normal)" as any,
        lineHeight: "normal",
        backgroundColor: active
          ? "var(--primary-surface-strong)"
          : hovered
            ? "var(--surface-raised)"
            : "var(--card)",
        border: active
          ? "1px solid var(--primary)"
          : "1px solid var(--border)",
        boxShadow: "var(--elevation-pill)",
        color: active
          ? "var(--primary)"
          : "var(--text-muted)",
      }}
    >
      {/* Optional leading status dot */}
      {dot && (
        <span
          className="inline-block shrink-0 rounded-full transition-colors"
          style={{
            width: 7,
            height: 7,
            backgroundColor: active ? "var(--primary)" : dot,
          }}
        />
      )}

      {/* Label */}
      <span>{label}</span>

      {/* Nested count badge */}
      {count !== undefined && (
        <span
          className="inline-flex items-center justify-center rounded-full"
          style={{
            height: 18,
            minWidth: 18,
            padding: "0 6px",
            fontSize: 11,
            lineHeight: "normal",
            fontWeight: "var(--font-weight-normal)" as any,
            backgroundColor: active
              ? "var(--primary-surface-strong)"
              : "var(--surface-raised)",
            color: active
              ? "var(--primary-text-strong)"
              : "var(--text-muted)",
            border: active
              ? "none"
              : "1px solid var(--border-subtle)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}