/**
 * UOM Module — Type Label (Badge Pill)
 *
 * Color-coded badge matching Figma reference:
 *   Standard: primary-surface bg, blue border, primary text
 *   Custom:   surface-raised bg, border, foreground text
 */

export const UOM_TYPES = ["Standard", "Custom"] as const;

export type UomType = (typeof UOM_TYPES)[number];

interface TypeLabelProps {
  type: UomType;
  className?: string;
}

const TYPE_COLORS: Record<
  UomType,
  { bg: string; border: string; text: string }
> = {
  Standard: {
    bg: "var(--primary-surface)",
    border: "var(--primary-border)",
    text: "var(--primary-text-strong)",
  },
  Custom: {
    bg: "var(--surface-raised)",
    border: "var(--border-subtle)",
    text: "var(--text-strong)",
  },
};

export function TypeLabel({ type, className = "" }: TypeLabelProps) {
  const colors = TYPE_COLORS[type];

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap ${className}`}
      style={{
        padding: "2px 10px",
        borderRadius: 6,
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-weight-normal)" as any,
        lineHeight: "normal",
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      {type}
    </span>
  );
}