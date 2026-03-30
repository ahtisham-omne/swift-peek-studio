/**
 * UOM Module — Active Filter Chip
 *
 * Removable tag showing an active filter selection.
 * Uses design-system CSS custom properties for all colors.
 */

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { CategoryBadge, type UomCategory } from "./CategoryBadge";

/* ── Public props ── */

interface BaseProps {
  onRemove: () => void;
  className?: string;
}

interface TextChipProps extends BaseProps {
  label: ReactNode;
  category?: never;
  count?: never;
}

interface CategoryChipProps extends BaseProps {
  label?: never;
  category: UomCategory;
  count?: number;
}

export type ActiveFilterChipProps = TextChipProps | CategoryChipProps;

/* ── Component ── */

export function ActiveFilterChip({
  label,
  category,
  count,
  onRemove,
  className = "",
}: ActiveFilterChipProps) {
  const [closeHovered, setCloseHovered] = useState(false);

  return (
    <span
      className={`
        inline-flex items-center gap-[5px] rounded-full
        ${className}
      `}
      style={{
        padding: "3px 4px 3px 10px",
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-weight-normal)" as any,
        lineHeight: 1,
        backgroundColor: "var(--primary-surface)",
        border: "1px solid var(--primary-border)",
        color: "var(--primary-text-strong)",
      }}
    >
      {/* Label — text or nested CategoryBadge */}
      {category ? <CategoryBadge category={category} /> : <span>{label}</span>}

      {/* Category count badge */}
      {category && count !== undefined && count > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full"
          style={{
            fontSize: 10,
            lineHeight: 1,
            padding: "1px 5px",
            fontWeight: "var(--font-weight-normal)" as any,
            minWidth: 18,
            backgroundColor: "var(--primary-surface-strong)",
            color: "var(--primary-text-strong)",
          }}
        >
          {count}
        </span>
      )}

      {/* Close button */}
      <button
        type="button"
        onClick={onRemove}
        onMouseEnter={() => setCloseHovered(true)}
        onMouseLeave={() => setCloseHovered(false)}
        className="inline-flex items-center justify-center cursor-pointer transition-colors rounded-full"
        style={{
          width: 18,
          height: 18,
          padding: 0,
          border: "none",
          backgroundColor: closeHovered
            ? "var(--destructive-surface)"
            : "transparent",
          color: closeHovered
            ? "var(--destructive)"
            : "var(--primary-icon)",
        }}
        aria-label="Remove filter"
      >
        <X size={12} strokeWidth={2} />
      </button>
    </span>
  );
}