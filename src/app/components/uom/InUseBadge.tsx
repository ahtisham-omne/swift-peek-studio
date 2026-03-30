/**
 * UOM Module — In Use Badge (Badge Pill)
 *
 * Color-coded badge matching Figma reference:
 *   In Use:  accent-surface bg, accent border, accent text + circled count
 *   Unused:  surface-raised bg, border, text-muted + circled zero
 *
 * Sized to match TypeLabel proportions — text first, count after.
 */

interface InUseBadgeProps {
  inUse: boolean;
  count?: number;
  className?: string;
}

export function InUseBadge({ inUse, count, className = "" }: InUseBadgeProps) {
  const displayCount = count ?? 0;

  return (
    <span
      className={`inline-flex items-center gap-[5px] whitespace-nowrap ${className}`}
      style={{
        padding: "2px 3px 2px 10px",
        borderRadius: 6,
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-weight-normal)" as any,
        lineHeight: "normal",
        backgroundColor: inUse
          ? "var(--accent-surface)"
          : "var(--surface-raised)",
        border: inUse
          ? "1px solid var(--accent-border)"
          : "1px solid var(--border-subtle)",
        color: inUse
          ? "var(--accent-text-strong)"
          : "var(--text-muted)",
      }}
    >
      {inUse ? "Yes" : "No"}
      {/* Circled count indicator */}
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          fontSize: 10,
          fontWeight: "var(--font-weight-normal)" as any,
          lineHeight: "normal",
          backgroundColor: inUse
            ? "var(--accent)"
            : "var(--border)",
          color: inUse
            ? "var(--accent-foreground)"
            : "var(--text-subtle)",
        }}
      >
        {displayCount}
      </span>
    </span>
  );
}