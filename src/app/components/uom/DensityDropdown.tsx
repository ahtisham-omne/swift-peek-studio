/**
 * UOM Module — Density Dropdown
 *
 * Matches Partner Management: 3 modes (condensed, comfort, card).
 * Uses shadcn DropdownMenu for consistency.
 */

import React, { useState, useRef, useEffect } from "react";
import { AlignJustify, List, LayoutGrid, Check, ChevronDown } from "lucide-react";

export type DensityMode = "condensed" | "comfort" | "card";

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
    description: "Compact rows, more data visible",
    icon: <AlignJustify size={18} />,
  },
  {
    mode: "comfort",
    label: "Comfort",
    description: "Default balanced spacing",
    icon: <List size={18} />,
  },
  {
    mode: "card",
    label: "Card View",
    description: "Visual grid cards layout",
    icon: <LayoutGrid size={18} />,
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
      <button
        onClick={() => setOpen((v) => !v)}
        type="button"
        className="inline-flex items-center justify-center h-9 gap-2 px-3 rounded-lg border border-border bg-white text-foreground shadow-sm hover:bg-muted/40 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {density === "condensed" && <AlignJustify className="w-[18px] h-[18px] text-muted-foreground/80" />}
        {density === "comfort" && <List className="w-[18px] h-[18px] text-muted-foreground/80" />}
        {density === "card" && <LayoutGrid className="w-[18px] h-[18px] text-muted-foreground/80" />}
        <span className="text-sm hidden md:inline" style={{ fontWeight: 500 }}>
          {currentOption.label}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60" />
      </button>

      {open && (
        <div
          className="absolute z-50 w-[230px] p-1.5 bg-popover border border-border rounded-lg shadow-md"
          style={{ top: "calc(100% + 4px)", right: 0 }}
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
                className="flex items-center gap-3 py-2.5 px-3 w-full cursor-pointer rounded-md hover:bg-muted/60 transition-colors border-none bg-transparent text-left"
              >
                <span className="text-muted-foreground shrink-0">
                  {option.icon}
                </span>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm text-foreground" style={{ fontWeight: 400 }}>
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 shrink-0" style={{ color: "#0A77FF" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
