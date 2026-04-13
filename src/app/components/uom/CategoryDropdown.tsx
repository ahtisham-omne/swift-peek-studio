/**
 * UOM Module — Category Dropdown
 *
 * Multi-select dropdown for filtering by UOM category.
 * All colors use CSS custom properties from theme.css.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  UOM_CATEGORIES,
  CategoryBadge,
  type UomCategory,
} from "./CategoryBadge";
import { UOM_ICONS } from "./design-tokens";
import { ChevronDown } from "lucide-react";
import { Input } from "../ui/input";

/* ═══════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════ */

export interface CategoryDropdownProps {
  selected: Set<UomCategory>;
  categoryCounts: Record<UomCategory, number>;
  onToggle: (cat: UomCategory) => void;
  onClear: () => void;
  defaultOpen?: boolean;
  className?: string;
}

const SORTED_CATEGORIES: UomCategory[] = [...UOM_CATEGORIES].sort((a, b) =>
  a.localeCompare(b)
);

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export function CategoryDropdown({
  selected,
  categoryCounts,
  onToggle,
  onClear,
  defaultOpen = false,
  className = "",
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const count = selected.size;
  const hasSelection = count > 0;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const label = useMemo(() => {
    if (count === 0) return "All Categories";
    if (count === 1) {
      const [first] = selected;
      return first;
    }
    return `${count} Categories`;
  }, [count, selected]);

  const visibleCategories = useMemo(() => {
    if (!search.trim()) return SORTED_CATEGORIES;
    const q = search.toLowerCase();
    return SORTED_CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── TRIGGER BUTTON ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          hasSelection
            ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
            : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-muted-foreground/30 active:bg-muted"
        }`}
      >
        <span>{label}</span>

        {hasSelection && (
          <span
            className="text-[10px] rounded-full px-1.5 py-px min-w-[18px] text-center bg-primary/10 text-primary"
            style={{ fontWeight: 600 }}
          >
            {count}
          </span>
        )}

        <ChevronDown size={14} className={hasSelection ? "text-primary" : "text-muted-foreground/70"} />
      </button>

      {/* ── DROPDOWN PANEL ── */}
      {open && (
        <div
          className="absolute left-0 z-30 mt-1 min-w-[280px] max-w-[calc(100vw-32px)] rounded-lg border border-border bg-popover shadow-md overflow-hidden"
        >
          {/* Search section */}
          <div className="p-2.5 border-b border-border">
            <div className="relative">
              <span
                className="absolute left-[8px] top-1/2 -translate-y-1/2 text-[12px]"
                style={{ color: "var(--text-subtle)" }}
              >
                {UOM_ICONS.search}
              </span>
              <Input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full border-border/80 bg-white pl-7 text-[13px] shadow-none placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>
          </div>

          {/* Clear section */}
          {hasSelection && (
            <div className="border-b border-border">
              <button
                type="button"
                onClick={() => onClear()}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Clear all selections
              </button>
            </div>
          )}

          {/* Category list */}
          <div style={{ maxHeight: 280, overflowY: "auto" }} className="scrollbar-overlay">
            {visibleCategories.length === 0 ? (
              <div
                className="text-[13px] text-center"
                style={{
                  padding: "16px 14px",
                  color: "var(--text-subtle)",
                }}
              >
                No matching categories
              </div>
            ) : (
              visibleCategories.map((cat) => {
                const isChecked = selected.has(cat);
                const unitCount = categoryCounts[cat] ?? 0;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onToggle(cat)}
                    className="flex w-full items-center cursor-pointer transition-colors hover:bg-secondary"
                    style={{
                      padding: "7px 14px",
                      gap: 10,
                      border: "none",
                      backgroundColor: "transparent",
                    }}
                  >
                    {/* Checkbox */}
                    <span
                      className="inline-flex items-center justify-center shrink-0"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: isChecked
                          ? "1.5px solid var(--primary)"
                          : "1.5px solid var(--border-strong)",
                        backgroundColor: isChecked
                          ? "var(--primary-surface-strong)"
                          : "var(--surface-raised)",
                        color: isChecked
                          ? "var(--primary-text-strong)"
                          : "var(--text-muted)",
                      }}
                    >
                      {isChecked && UOM_ICONS.check}
                    </span>

                    <CategoryBadge category={cat} />

                    <span className="flex-1" />

                    <span
                      className="shrink-0 inline-flex items-center justify-center rounded-full text-[11px] leading-none"
                      style={{
                        padding: "2px 7px",
                        fontWeight: "var(--font-weight-semibold)" as any,
                        backgroundColor: isChecked
                          ? "var(--primary-surface-strong)"
                          : "var(--surface-raised)",
                        color: isChecked
                          ? "var(--primary-text-strong)"
                          : "var(--text-muted)",
                      }}
                    >
                      {unitCount}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}