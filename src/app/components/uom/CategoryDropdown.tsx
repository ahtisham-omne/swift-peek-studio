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
        className="inline-flex items-center gap-[6px] cursor-pointer select-none transition-all rounded-full"
        style={{
          height: 30,
          padding: hasSelection ? "6px 6px 6px 12px" : "6px 12px",
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-normal)" as any,
          lineHeight: "normal",
          border: hasSelection
            ? "1px solid var(--primary)"
            : "1px solid var(--border)",
          backgroundColor: hasSelection
            ? "var(--primary-surface)"
            : "var(--card)",
          boxShadow: "var(--elevation-pill)",
          color: hasSelection
            ? "var(--primary)"
            : "var(--text-muted)",
        }}
      >
        <span>{label}</span>

        {hasSelection && (
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              height: 18,
              minWidth: 18,
              padding: "0 8px",
              fontSize: 13,
              lineHeight: "normal",
              fontWeight: "var(--font-weight-semibold)" as any,
              backgroundColor: "var(--primary-surface-strong)",
              color: "var(--primary-text-strong)",
            }}
          >
            {count}
          </span>
        )}

        <ChevronDown
          size={14}
          style={{
            color: hasSelection
              ? "var(--primary)"
              : "var(--text-subtle)",
          }}
        />
      </button>

      {/* ── DROPDOWN PANEL ── */}
      {open && (
        <div
          className="absolute left-0 z-30"
          style={{
            marginTop: 4,
            minWidth: 280,
            maxWidth: "calc(100vw - 32px)",
            backgroundColor: "var(--card)",
            border: hasSelection
              ? "1px solid var(--primary)"
              : "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow:
              "var(--elevation-md)",
          }}
        >
          {/* Search section */}
          <div
            style={{
              padding: 10,
              borderColor: "var(--border-subtle)",
              borderBottomWidth: 1,
              borderBottomStyle: "solid" as const,
            }}
          >
            <div className="relative">
              <span
                className="absolute left-[8px] top-1/2 -translate-y-1/2 text-[12px]"
                style={{ color: "var(--text-subtle)" }}
              >
                {UOM_ICONS.search}
              </span>
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-[13px] outline-none"
                style={{
                  padding: "6px 10px 6px 28px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--foreground)",
                  backgroundColor: "var(--input-background)",
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Clear section */}
          {hasSelection && (
            <div
              style={{
                borderColor: "var(--border-subtle)",
                borderBottomWidth: 1,
                borderBottomStyle: "solid" as const,
              }}
            >
              <button
                type="button"
                onClick={() => onClear()}
                className="w-full text-left cursor-pointer transition-colors hover:bg-red-50"
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: "var(--font-weight-medium)" as any,
                  lineHeight: "1",
                  color: "var(--destructive)",
                  backgroundColor: "transparent",
                  border: "none",
                }}
              >
                Clear all selections
              </button>
            </div>
          )}

          {/* Category list */}
          <div
            style={{
              maxHeight: 280,
              overflowY: "auto",
            }}
            className="scrollbar-overlay"
          >
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