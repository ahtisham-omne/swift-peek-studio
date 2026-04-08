/**
 * UOM Module -- Advanced Filters Modal
 *
 * Live-filtering Radix-style modal following the partner filters reference pattern.
 * Sections: Type, Status, Category, In-Use Count range, Name search, Symbol search.
 * All colors reference CSS custom properties from theme.css.
 * Typography uses only font faces from fonts.css (Inter 400).
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { UOM_CATEGORIES, type UomCategory } from "./CategoryBadge";
import type { UomUnit } from "./sample-data";

/* ═══════════════════════════════════════════════
   Advanced Filters Type & Defaults
   ═══════════════════════════════════════════════ */

export interface UomAdvancedFilters {
  types: string[];
  statuses: string[];
  categories: string[];
  inUseCountMin: string;
  inUseCountMax: string;
  name: string;
  symbol: string;
}

export const DEFAULT_UOM_FILTERS: UomAdvancedFilters = {
  types: [],
  statuses: [],
  categories: [],
  inUseCountMin: "",
  inUseCountMax: "",
  name: "",
  symbol: "",
};

/* ═══════════════════════════════════════════════
   Count active filter groups (each group = 1)
   ═══════════════════════════════════════════════ */

export function countActiveUomFilters(f: UomAdvancedFilters): number {
  let count = 0;
  if (f.types.length > 0) count++;
  if (f.statuses.length > 0) count++;
  if (f.categories.length > 0) count++;
  if (f.inUseCountMin.trim() || f.inUseCountMax.trim()) count++;
  if (f.name.trim()) count++;
  if (f.symbol.trim()) count++;
  return count;
}

/* ═══════════════════════════════════════════════
   Apply advanced filters to units
   ═══════════════════════════════════════════════ */

export function applyAdvancedFilters(
  units: UomUnit[],
  f: UomAdvancedFilters
): UomUnit[] {
  let result = units;

  const isUnitInUse = (unit: UomUnit) => Boolean(unit.inUse || (unit.inUseCount ?? 0) > 0);

  if (f.types.length > 0) {
    result = result.filter((u) => f.types.includes(u.type));
  }
  if (f.statuses.length > 0) {
    result = result.filter((u) => {
      const status = isUnitInUse(u) ? "In Use" : "Unused";
      return f.statuses.includes(status);
    });
  }
  if (f.categories.length > 0) {
    result = result.filter((u) => f.categories.includes(u.category));
  }
  if (f.inUseCountMin.trim()) {
    const min = Number(f.inUseCountMin);
    if (!isNaN(min)) {
      result = result.filter((u) => (u.inUseCount ?? 0) >= min);
    }
  }
  if (f.inUseCountMax.trim()) {
    const max = Number(f.inUseCountMax);
    if (!isNaN(max)) {
      result = result.filter((u) => (u.inUseCount ?? 0) <= max);
    }
  }
  if (f.name.trim()) {
    const q = f.name.toLowerCase();
    result = result.filter((u) => u.name.toLowerCase().includes(q));
  }
  if (f.symbol.trim()) {
    const q = f.symbol.toLowerCase();
    result = result.filter((u) => u.symbol.toLowerCase().includes(q));
  }

  return result;
}

/* ═══════════════════════════════════════════════
   Modal Props
   ═══════════════════════════════════════════════ */

interface UomFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: UomAdvancedFilters;
  onFiltersChange: (f: UomAdvancedFilters) => void;
  units: UomUnit[];
  filteredCount: number;
}

/* ═══════════════════════════════════════════════
   Main Modal Component
   ═══════════════════════════════════════════════ */

export function UomFiltersModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  units,
  filteredCount,
}: UomFiltersModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isUnitInUse = useCallback(
    (unit: UomUnit) => Boolean(unit.inUse || (unit.inUseCount ?? 0) > 0),
    []
  );

  // Draft state — only applied when user clicks "Show units"
  const [draft, setDraft] = useState<UomAdvancedFilters>({ ...filters });

  // Sync draft when modal opens
  useEffect(() => {
    if (open) setDraft({ ...filters });
  }, [open]);

  // Preview count based on draft filters
  const draftFilteredCount = useMemo(
    () => applyAdvancedFilters(units, draft).length,
    [units, draft]
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onOpenChange(false);
  };

  // Compute bounds for range hints
  const inUseCountBounds = useMemo(() => {
    const counts = units.map((u) => u.inUseCount ?? 0);
    if (counts.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...counts), max: Math.max(...counts) };
  }, [units]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of UOM_CATEGORIES) map[cat] = 0;
    for (const u of units) map[u.category]++;
    return map;
  }, [units]);

  // Type counts
  const typeCounts = useMemo(() => {
    const map: Record<string, number> = { Standard: 0, Custom: 0 };
    for (const u of units) map[u.type]++;
    return map;
  }, [units]);

  // Status counts
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = { "In Use": 0, Unused: 0 };
    for (const u of units) {
      if (isUnitInUse(u)) map["In Use"]++;
      else map["Unused"]++;
    }
    return map;
  }, [isUnitInUse, units]);

  // Update draft (not parent) on every interaction
  const update = useCallback(
    (patch: Partial<UomAdvancedFilters>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const toggleArrayValue = useCallback(
    (key: keyof UomAdvancedFilters, value: string) => {
      setDraft((prev) => {
        const arr = prev[key] as string[];
        const next = arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value];
        return { ...prev, [key]: next };
      });
    },
    []
  );

  const clearAll = () => setDraft({ ...DEFAULT_UOM_FILTERS });

  // Apply draft to parent and close
  const applyAndClose = () => {
    onFiltersChange({ ...draft });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--overlay-backdrop)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--card)",
          borderRadius: 12,
          boxShadow: "var(--elevation-xl)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              style={{
                fontSize: "var(--text-h4)",
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--foreground)",
                lineHeight: 1.3,
              }}
            >
              Filters
            </span>
            {countActiveUomFilters(filters) > 0 && (
              <span
                className="inline-flex items-center justify-center"
                style={{
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: 10,
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: 11,
                  fontWeight: "var(--font-weight-medium)" as any,
                  lineHeight: 1,
                }}
              >
                {countActiveUomFilters(filters)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--text-muted)",
              transition: "background-color 150ms, color 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--surface-raised)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div
          className="flex-1 overflow-y-auto scrollbar-overlay"
          style={{ overflowY: "auto" }}
        >
          {/* Section: Unit Type */}
          <FilterSection title="Unit Type" subtitle="Filter by standard or custom units">
            <SegmentedControl
              options={["Standard", "Custom"]}
              selected={filters.types}
              counts={typeCounts}
              onToggle={(val) => {
                if (val === "__clear__") {
                  update({ types: [] });
                } else {
                  toggleArrayValue("types", val);
                }
              }}
            />
          </FilterSection>

          <Divider />

          {/* Section: Status */}
          <FilterSection title="Status" subtitle="In use means linked to items, BOMs, purchase orders, or vendors">
            <div className="flex flex-wrap gap-2">
              <Pill
                label="In Use"
                count={statusCounts["In Use"]}
                selected={filters.statuses.includes("In Use")}
                dotColor="var(--accent)"
                onClick={() => toggleArrayValue("statuses", "In Use")}
              />
              <Pill
                label="Unused"
                count={statusCounts["Unused"]}
                selected={filters.statuses.includes("Unused")}
                dotColor="var(--text-disabled)"
                onClick={() => toggleArrayValue("statuses", "Unused")}
              />
            </div>
          </FilterSection>

          <Divider />

          {/* Section: Category */}
          <FilterSection title="Category" subtitle="Filter by measurement category">
            <CategorySelectMenu
              items={UOM_CATEGORIES.map((cat) => ({
                value: cat,
                label: cat,
                count: categoryCounts[cat] ?? 0,
              }))}
              selected={filters.categories}
              onToggle={(val) => toggleArrayValue("categories", val)}
              onClear={() => update({ categories: [] })}
            />
          </FilterSection>

          <Divider />

          {/* Section: In-Use Count Range */}
          <FilterSection title="Usage Count" subtitle="Filter by number of items, BOMs, purchase orders, or vendor records using this unit">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label
                  style={{
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-normal)" as any,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Min
                </label>
                <input
                  type="number"
                  placeholder={String(inUseCountBounds.min)}
                  value={filters.inUseCountMin}
                  onChange={(e) => update({ inUseCountMin: e.target.value })}
                  className="outline-none w-full"
                  style={{
                    height: "var(--input-height)",
                    padding: "0 12px",
                    boxSizing: "border-box",
                    backgroundColor: "var(--input-background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--foreground)",
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-normal)" as any,
                    lineHeight: "normal",
                  }}
                />
              </div>
              <span
                style={{
                  color: "var(--text-subtle)",
                  fontSize: "var(--text-label)",
                  marginTop: 20,
                }}
              >
                --
              </span>
              <div className="flex-1">
                <label
                  style={{
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-normal)" as any,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Max
                </label>
                <input
                  type="number"
                  placeholder={String(inUseCountBounds.max)}
                  value={filters.inUseCountMax}
                  onChange={(e) => update({ inUseCountMax: e.target.value })}
                  className="outline-none w-full"
                  style={{
                    height: "var(--input-height)",
                    padding: "0 12px",
                    boxSizing: "border-box",
                    backgroundColor: "var(--input-background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--foreground)",
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-normal)" as any,
                    lineHeight: "normal",
                  }}
                />
              </div>
            </div>
          </FilterSection>

          <Divider />

          {/* Section: Text Filters */}
          <FilterSection title="Text Search" subtitle="Filter by name or symbol text">
            <div className="flex flex-col gap-3">
              <div>
                <label
                  style={{
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-normal)" as any,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Unit Name
                </label>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-[10px] top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-subtle)" }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. Kilogram, Meter..."
                    value={filters.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="outline-none w-full"
                    style={{
                      height: "var(--input-height)",
                      padding: "0 12px 0 30px",
                      boxSizing: "border-box",
                      backgroundColor: "var(--input-background)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      lineHeight: "normal",
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-normal)" as any,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Symbol
                </label>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-[10px] top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-subtle)" }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. kg, m, L..."
                    value={filters.symbol}
                    onChange={(e) => update({ symbol: e.target.value })}
                    className="outline-none w-full"
                    style={{
                      height: "var(--input-height)",
                      padding: "0 12px 0 30px",
                      boxSizing: "border-box",
                      backgroundColor: "var(--input-background)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      lineHeight: "normal",
                    }}
                  />
                </div>
              </div>
            </div>
          </FilterSection>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--text-muted)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-weight-medium)" as any,
              lineHeight: "normal",
              transition: "border-color 150ms, color 150ms, background-color 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--destructive-border)";
              e.currentTarget.style.color = "var(--destructive)";
              e.currentTarget.style.backgroundColor = "var(--destructive-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            style={{
              padding: "8px 20px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-weight-medium)" as any,
              lineHeight: "normal",
              transition: "opacity 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Show {filteredCount} unit{filteredCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategorySelectMenu({
  items,
  selected,
  onToggle,
  onClear,
}: {
  items: { value: string; label: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    selected.length === 0
      ? "All categories"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} categories selected`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full cursor-pointer"
        style={{
          height: "var(--input-height)",
          padding: "0 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)",
          backgroundColor: "var(--input-background)",
          color: "var(--foreground)",
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-normal)" as any,
        }}
      >
        <span className="flex items-center justify-between gap-3">
          <span style={{ color: selected.length === 0 ? "var(--text-muted)" : "var(--foreground)" }}>
            {selectedLabel}
          </span>
          <ChevronDown
            size={16}
            style={{
              color: "var(--text-subtle)",
              transition: "transform 150ms",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 10,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--elevation-lg)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            className="w-full cursor-pointer text-left"
            style={{
              border: "none",
              borderBottom: "1px solid var(--border-subtle)",
              backgroundColor: "transparent",
              padding: "10px 12px",
              color: "var(--primary)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-weight-medium)" as any,
            }}
          >
            Clear category filter
          </button>

          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {items.map((item) => {
              const isSelected = selected.includes(item.value);

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onToggle(item.value)}
                  className="w-full cursor-pointer text-left"
                  style={{
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: isSelected ? "var(--primary-surface)" : "transparent",
                    padding: "10px 12px",
                    color: isSelected ? "var(--primary-text-strong)" : "var(--foreground)",
                    fontSize: "var(--text-label)",
                    fontWeight: isSelected
                      ? ("var(--font-weight-medium)" as any)
                      : ("var(--font-weight-normal)" as any),
                  }}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    <span style={{ color: isSelected ? "var(--primary)" : "var(--text-muted)" }}>
                      {item.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

/** Section wrapper with title + subtitle */
function FilterSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: "var(--text-base)",
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--foreground)",
            lineHeight: 1.3,
            display: "block",
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-weight-normal)" as any,
              color: "var(--text-muted)",
              lineHeight: 1.4,
              marginTop: 2,
              display: "block",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Horizontal divider */
function Divider() {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: "var(--border-subtle)",
        margin: "0 20px",
      }}
    />
  );
}

/** Segmented control -- multi-select with "Any" implicit */
function SegmentedControl({
  options,
  selected,
  counts,
  onToggle,
}: {
  options: string[];
  selected: string[];
  counts: Record<string, number>;
  onToggle: (value: string) => void;
}) {
  const isAny = selected.length === 0;

  return (
    <div
      className="inline-flex"
      style={{
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        backgroundColor: "var(--surface-raised)",
      }}
    >
      {/* Any button */}
      <button
        type="button"
        onClick={() => {
          // If any is currently active (selected empty), do nothing
          // If filters are active, clear to return to any
          if (!isAny) onToggle("__clear__");
        }}
        className="cursor-pointer"
        style={{
          padding: "6px 14px",
          border: "none",
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-normal)" as any,
          lineHeight: "normal",
          backgroundColor: isAny ? "var(--card)" : "transparent",
          color: isAny ? "var(--foreground)" : "var(--text-muted)",
          boxShadow: isAny ? "var(--elevation-pill)" : "none",
          transition: "all 150ms",
        }}
      >
        Any
      </button>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="cursor-pointer"
            style={{
              padding: "6px 14px",
              border: "none",
              borderLeft: "1px solid var(--border)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-weight-normal)" as any,
              lineHeight: "normal",
              backgroundColor: isSelected
                ? "var(--primary-surface)"
                : "transparent",
              color: isSelected
                ? "var(--primary)"
                : "var(--text-muted)",
              transition: "all 150ms",
            }}
          >
            <span className="flex items-center gap-1.5">
              {opt}
              <span
                style={{
                  fontSize: 11,
                  color: isSelected
                    ? "var(--primary-text-strong)"
                    : "var(--text-subtle)",
                }}
              >
                {counts[opt] ?? 0}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Toggle pill chip with optional dot and count */
function Pill({
  label,
  count,
  selected,
  dotColor,
  onClick,
}: {
  label: string;
  count?: number;
  selected: boolean;
  dotColor?: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer inline-flex items-center gap-[6px]"
      style={{
        height: 30,
        padding: count !== undefined ? "6px 6px 6px 12px" : "6px 12px",
        borderRadius: 100,
        border: selected
          ? "1px solid var(--primary)"
          : "1px solid var(--border)",
        backgroundColor: selected
          ? "var(--primary-surface-strong)"
          : hovered
            ? "var(--surface-raised)"
            : "var(--card)",
        color: selected ? "var(--primary)" : "var(--text-muted)",
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-weight-normal)" as any,
        lineHeight: "normal",
        boxShadow: "var(--elevation-pill)",
        transition: "all 150ms",
      }}
    >
      {dotColor && (
        <span
          className="inline-block shrink-0 rounded-full"
          style={{
            width: 7,
            height: 7,
            backgroundColor: selected ? "var(--primary)" : dotColor,
          }}
        />
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className="inline-flex items-center justify-center rounded-full"
          style={{
            height: 18,
            minWidth: 18,
            padding: "0 6px",
            fontSize: 11,
            lineHeight: "normal",
            fontWeight: "var(--font-weight-normal)" as any,
            backgroundColor: selected
              ? "var(--primary-surface-strong)"
              : "var(--surface-raised)",
            color: selected
              ? "var(--primary-text-strong)"
              : "var(--text-muted)",
            border: selected ? "none" : "1px solid var(--border-subtle)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** Pill section with "Show all N / Show less" toggle */
function PillSection({
  items,
  selected,
  onToggle,
  threshold = 8,
}: {
  items: { value: string; label: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
  threshold?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, threshold);
  const hasMore = items.length > threshold;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visibleItems.map((item) => (
          <Pill
            key={item.value}
            label={item.label}
            count={item.count}
            selected={selected.includes(item.value)}
            onClick={() => onToggle(item.value)}
          />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer flex items-center gap-1 mt-2"
          style={{
            border: "none",
            backgroundColor: "transparent",
            color: "var(--primary)",
            fontSize: "var(--text-label)",
            fontWeight: "var(--font-weight-normal)" as any,
            padding: "4px 0",
            lineHeight: "normal",
          }}
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Show all {items.length} <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}