/**
 * UOM Module — Filter Pill
 *
 * Matches Partner Management FilterPills exactly:
 *   Default:  border-border, text-muted-foreground
 *   Hover:    bg-muted/60, text-foreground
 *   Active:   border-primary, bg-accent, text-primary (#0A77FF)
 */

import type { ReactNode } from "react";

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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs
        transition-colors whitespace-nowrap shrink-0 cursor-pointer
        ${
          active
            ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20"
            : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-muted-foreground/30 active:bg-muted"
        }
        ${className}
      `}
      style={{
        fontWeight: active ? 500 : 400,
      }}
    >
      {/* Optional leading status dot */}
      {dot && (
        <span
          className="inline-block shrink-0 rounded-full"
          style={{
            width: 6,
            height: 6,
            backgroundColor: active ? "var(--primary)" : dot,
          }}
        />
      )}

      {/* Label */}
      <span>{label}</span>

      {/* Nested count badge */}
      {count !== undefined && (
        <span
          className={`text-[10px] rounded-full px-1.5 py-px min-w-[18px] text-center ${
            active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
          style={{
            fontWeight: 600,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
