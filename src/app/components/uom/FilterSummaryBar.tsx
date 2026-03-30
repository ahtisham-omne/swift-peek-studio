/**
 * UOM Module — Filter Summary Bar
 *
 * Compact inline text showing how many units match the current filters.
 * Uses design-system CSS custom properties for all colors.
 */

export interface FilterSummaryBarProps {
  /** Number of units matching the current filter */
  filtered: number;
  /** Total units in the dataset */
  total: number;
  className?: string;
}

export function FilterSummaryBar({
  filtered,
  total,
  className = "",
}: FilterSummaryBarProps) {
  return (
    <div
      className={`inline-flex items-center gap-[6px] ${className}`}
      style={{
        padding: "6px 12px",
        borderRadius: 100,
        backgroundColor: "var(--surface-raised)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <span
        style={{
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-normal)" as any,
          color: "var(--primary)",
          lineHeight: 1,
        }}
      >
        {filtered}
      </span>
      <span
        style={{
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-normal)" as any,
          color: "var(--primary)",
          lineHeight: 1,
        }}
      >
        of {total} units
      </span>
    </div>
  );
}
