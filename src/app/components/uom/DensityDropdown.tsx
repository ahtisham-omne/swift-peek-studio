/**
 * UOM Module — Density Dropdown
 *
 * Matches the reference image: plain text trigger "Comfort ▾"
 * with a clean popover on click.
 * All colors use CSS custom properties from theme.css.
 */

import React, { useState, useRef, useEffect } from "react";
import { AlignJustify, LayoutGrid, Check, ChevronDown } from "lucide-react";

export type DensityMode = "condensed" | "comfort" | "relaxed" | "card";

/** Cell padding values per density mode */
export const DENSITY_PADDING: Record<
  Exclude<DensityMode, "card">,
  { paddingTop: number; paddingBottom: number; paddingLeft: number; paddingRight: number }
> = {
  condensed: { paddingTop: 4, paddingBottom: 4, paddingLeft: 16, paddingRight: 16 },
  comfort: { paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16 },
  relaxed: { paddingTop: 20, paddingBottom: 20, paddingLeft: 16, paddingRight: 16 },
};

interface DensityOption {
  mode: DensityMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const DENSITY_OPTIONS: DensityOption[] = [
  {
    mode: "condensed",
    label: "Condensed",
    description: "Compact view",
    icon: <AlignJustify size={14} strokeWidth={2.5} />,
  },
  {
    mode: "comfort",
    label: "Comfort",
    description: "Balanced view",
    icon: <AlignJustify size={14} strokeWidth={1.8} />,
  },
  {
    mode: "relaxed",
    label: "Relaxed",
    description: "Spacious view",
    icon: <AlignJustify size={14} strokeWidth={1.2} />,
  },
  {
    mode: "card",
    label: "Card View",
    description: "Grid layout",
    icon: <LayoutGrid size={14} />,
  },
];

export interface DensityDropdownProps {
  density: DensityMode;
  onDensityChange: (mode: DensityMode) => void;
}

export function DensityDropdown({ density, onDensityChange }: DensityDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentOption = DENSITY_OPTIONS.find((o) => o.mode === density)!;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — dropdown button matching Figma reference */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 cursor-pointer"
        style={{
          padding: "5px 10px 5px 8px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          backgroundColor: open ? "var(--surface-hover)" : "var(--card)",
          color: "var(--text-base-second)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-normal)" as any,
          lineHeight: "20px",
          transition: "background-color 150ms, border-color 150ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--surface-hover)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.backgroundColor = "var(--card)";
          }
        }}
      >
        <span
          className="flex items-center justify-center"
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        >
          <AlignJustify size={15} />
        </span>
        <span>{currentOption.label}</span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
            transition: "transform 150ms",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute z-50"
          style={{
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: 200,
            backgroundColor: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--elevation-sm)",
            padding: "4px 0",
          }}
        >
          {DENSITY_OPTIONS.map((option) => {
            const isActive = option.mode === density;
            return (
              <button
                key={option.mode}
                onClick={() => {
                  onDensityChange(option.mode);
                  setOpen(false);
                }}
                className="flex items-center w-full gap-2.5 cursor-pointer"
                style={{
                  padding: "8px 12px",
                  backgroundColor: isActive ? "var(--primary-surface)" : "transparent",
                  color: "var(--foreground)",
                  border: "none",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  lineHeight: 1.5,
                  transition: "background-color 100ms",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = isActive
                    ? "var(--primary-surface)"
                    : "transparent";
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 20,
                    height: 20,
                    color: isActive ? "var(--primary)" : "var(--text-muted)",
                  }}
                >
                  {option.icon}
                </span>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      color: isActive ? "var(--primary)" : "var(--foreground)",
                      lineHeight: 1.4,
                    }}
                  >
                    {option.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: "var(--font-weight-normal)" as any,
                      color: "var(--text-subtle)",
                      lineHeight: 1.3,
                    }}
                  >
                    {option.description}
                  </span>
                </div>
                {isActive && (
                  <Check
                    size={14}
                    style={{ color: "var(--primary)", flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}