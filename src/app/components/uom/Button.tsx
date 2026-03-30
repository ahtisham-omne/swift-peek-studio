/**
 * UOM Module — Button Component Set
 *
 * Five visual variants using CSS custom properties:
 *   primary        – solid CTA
 *   secondary      – outlined neutral
 *   destructive    – outlined red / danger
 *   textLink       – bare text link
 *   icon           – compact icon-only action
 *
 * Usage:
 *   <UomButton variant="primary">Save</UomButton>
 *   <UomButton variant="primary" disabled>Save</UomButton>
 *   <UomButton variant="secondary">Cancel</UomButton>
 *   <UomButton variant="destructive">Delete</UomButton>
 *   <UomButton variant="textLink">View all</UomButton>
 *   <UomButton variant="icon" aria-label="More">⋯</UomButton>
 */

import { type ButtonHTMLAttributes, forwardRef } from "react";

export type UomButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "textLink"
  | "icon";

export interface UomButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UomButtonVariant;
}

/* ── Variant style maps ── */

interface VariantStyles {
  base: string;
  hover: string;
  disabled?: string;
  style: React.CSSProperties;
}

const variants: Record<UomButtonVariant, VariantStyles> = {
  primary: {
    base: "px-[16px] py-[8px] text-[13px] leading-none cursor-pointer",
    hover: "hover:opacity-90",
    disabled: "opacity-50 cursor-not-allowed",
    style: {
      fontWeight: "var(--font-weight-normal)" as any,
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--elevation-btn)",
    },
  },
  secondary: {
    base: "px-[12px] py-[8px] text-[13px] leading-none bg-card cursor-pointer",
    hover: "hover:bg-secondary",
    style: {
      fontWeight: "var(--font-weight-normal)" as any,
      color: "var(--text-strong)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--elevation-btn-light)",
    },
  },
  destructive: {
    base: "px-[14px] py-[6px] text-[13px] leading-none bg-card cursor-pointer",
    hover: "hover:bg-destructive-surface",
    style: {
      fontWeight: "var(--font-weight-normal)" as any,
      color: "var(--destructive)",
      border: "1px solid var(--destructive-border)",
      borderRadius: "var(--radius-md)",
    },
  },
  textLink: {
    base: "text-[14px] leading-none bg-transparent border-none p-0 cursor-pointer",
    hover: "hover:opacity-80",
    style: {
      fontWeight: "var(--font-weight-normal)" as any,
      color: "var(--primary)",
    },
  },
  icon: {
    base: "px-[6px] py-[4px] text-[12px] leading-none bg-transparent border-none cursor-pointer",
    hover: "hover:bg-secondary",
    style: {
      color: "var(--text-subtle)",
      borderRadius: "var(--radius-sm)",
    },
  },
};

/* ── Component ── */

export const UomButton = forwardRef<HTMLButtonElement, UomButtonProps>(
  ({ variant = "primary", disabled, className = "", style, ...rest }, ref) => {
    const v = variants[variant];

    const isDisabled = disabled && variant === "primary";

    const classes = [
      "inline-flex items-center justify-center transition-colors",
      v.base,
      isDisabled ? v.disabled : v.hover,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={classes}
        style={{ ...v.style, ...style }}
        {...rest}
      />
    );
  },
);

UomButton.displayName = "UomButton";