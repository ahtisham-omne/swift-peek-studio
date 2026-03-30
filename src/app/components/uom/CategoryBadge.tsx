/**
 * UOM Module — Category Badge
 *
 * Pill-shaped badge for UOM categories using design-system CSS variables.
 *
 * Usage:
 *   <CategoryBadge category="Length" />
 *   <CategoryBadge category="Volume" />
 */

export const UOM_CATEGORIES = [
  "Length",
  "Area",
  "Volume",
  "Mass",
  "Quantity",
  "Time",
  "Temperature",
  "Force",
  "Pressure",
  "Energy",
  "Power",
  "Electrical",
  "Frequency",
  "Other SI",
] as const;

export type UomCategory = (typeof UOM_CATEGORIES)[number];

interface CategoryBadgeProps {
  category: UomCategory;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap ${className}`}
      style={{
        backgroundColor: "var(--surface-raised)",
        color: "var(--text-strong)",
        border: "1px solid var(--border-subtle)",
        padding: "2px 10px",
        borderRadius: 6,
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-weight-normal)" as any,
        lineHeight: "normal",
      }}
    >
      {category}
    </span>
  );
}