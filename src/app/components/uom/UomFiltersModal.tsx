/**
 * UOM Module -- Advanced Filters Modal
 *
 * Styled to match the Partner Management vendor filters modal exactly.
 * Sections: Type, Status, Category, In-Use Count range, Name search, Symbol search.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { X, Search, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "../ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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

  // Update draft
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

  const activeCount = countActiveUomFilters(draft);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-[50%] left-[50%] z-[200] translate-x-[-50%] translate-y-[-50%] w-full max-w-[680px] max-h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            Filters
          </DialogPrimitive.Title>

          {/* ─── Header ─── */}
          <div className="flex items-center justify-center relative px-6 h-12 border-b border-border/60 shrink-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[14px]" style={{ fontWeight: 600 }}>
              Filters
            </span>
            {activeCount > 0 && (
              <span
                className="ml-2 min-w-[20px] h-5 rounded-full text-[11px] flex items-center justify-center px-1.5 text-white"
                style={{ backgroundColor: "var(--primary)", fontWeight: 600 }}
              >
                {activeCount}
              </span>
            )}
          </div>

          {/* ─── Scrollable body ─── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Section: Unit Type — segmented control */}
            <Section title="Unit type" subtitle="Select the type of unit to show.">
              <SegmentedControl
                options={[
                  { value: "Standard", label: "Standard" },
                  { value: "Custom", label: "Custom" },
                ]}
                selected={draft.types}
                onChange={(val) => update({ types: val })}
              />
            </Section>

            <Divider />

            {/* Section: Status — chip row */}
            <Section title="Status">
              <div className="flex flex-wrap gap-1.5">
                <Pill
                  label="Any"
                  selected={draft.statuses.length === 0}
                  onClick={() => update({ statuses: [] })}
                />
                <Pill
                  label="In Use"
                  selected={draft.statuses.includes("In Use")}
                  onClick={() => toggleArrayValue("statuses", "In Use")}
                  count={statusCounts["In Use"]}
                />
                <Pill
                  label="Unused"
                  selected={draft.statuses.includes("Unused")}
                  onClick={() => toggleArrayValue("statuses", "Unused")}
                  count={statusCounts["Unused"]}
                />
              </div>
            </Section>

            <Divider />

            {/* Section: Category — pill chips with show more */}
            <Section title="Category" subtitle="Filter by measurement category.">
              <PillSection
                options={UOM_CATEGORIES.map((cat) => ({
                  value: cat,
                  label: cat,
                }))}
                selected={draft.categories}
                onToggle={(val) => toggleArrayValue("categories", val)}
                getCount={(val) => categoryCounts[val] ?? 0}
              />
            </Section>

            <Divider />

            {/* Section: Usage Count — min/max range */}
            <Section title="Usage count range" subtitle="Filter by number of references using this unit.">
              <RangeInputs
                min={draft.inUseCountMin}
                max={draft.inUseCountMax}
                onMinChange={(v) => update({ inUseCountMin: v })}
                onMaxChange={(v) => update({ inUseCountMax: v })}
                minPlaceholder={String(inUseCountBounds.min)}
                maxPlaceholder={String(inUseCountBounds.max)}
                prefix=""
              />
            </Section>

            <Divider />

            {/* Section: Text Search */}
            <Section title="Text search" subtitle="Filter by unit name or symbol.">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block" style={{ fontWeight: 500 }}>
                    Unit name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kilogram, Meter..."
                    value={draft.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="w-full h-9 px-3 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block" style={{ fontWeight: 500 }}>
                    Symbol
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kg, m, L..."
                    value={draft.symbol}
                    onChange={(e) => update({ symbol: e.target.value })}
                    className="w-full h-9 px-3 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            </Section>
          </div>

          {/* ─── Sticky footer ─── */}
          <div className="flex items-center justify-between px-6 h-14 border-t border-border/60 shrink-0">
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground/50 transition-colors cursor-pointer"
              style={{ fontWeight: 500 }}
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={applyAndClose}
              className="inline-flex items-center justify-center h-9 px-5 rounded-lg text-white text-[13px] cursor-pointer transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", fontWeight: 600 }}
            >
              Show {draftFilteredCount.toLocaleString()} unit{draftFilteredCount !== 1 ? "s" : ""}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Sub-components — matching vendor module exactly
   ═══════════════════════════════════════════════ */

/** Section divider */
function Divider() {
  return <div className="border-t border-border/50 mx-6" />;
}

/** Section wrapper */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4">
      <h4 className="text-[14px] mb-0.5" style={{ fontWeight: 600 }}>
        {title}
      </h4>
      {subtitle && (
        <p className="text-[12px] text-muted-foreground mb-3">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}

/** Segmented control — matches vendor exactly */
function SegmentedControl({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const allSelected = selected.length === 0;
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => onChange([])}
        className={`flex-1 py-2.5 text-[13px] cursor-pointer transition-colors border-r border-border ${
          allSelected
            ? "text-primary"
            : "bg-white text-foreground hover:bg-muted/30"
        }`}
        style={{
          fontWeight: 500,
          backgroundColor: allSelected ? "var(--accent)" : undefined,
        }}
      >
        Any
      </button>
      {options.map((opt, i) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (isSelected) {
                onChange(selected.filter((v) => v !== opt.value));
              } else {
                onChange([...selected, opt.value]);
              }
            }}
            className={`flex-1 py-2.5 text-[13px] cursor-pointer transition-colors ${
              i < options.length - 1 ? "border-r border-border" : ""
            } ${
              isSelected
                ? "text-primary"
                : "bg-white text-foreground hover:bg-muted/30"
            }`}
            style={{
              fontWeight: 500,
              backgroundColor: isSelected ? "var(--accent)" : undefined,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Pill chip — matches vendor exactly */
function Pill({
  label,
  selected,
  onClick,
  count,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full border text-[13px] cursor-pointer transition-all select-none shrink-0 ${
        selected
          ? "border-primary/30 text-primary"
          : "bg-white text-foreground border-border hover:border-muted-foreground/40 hover:bg-muted/30"
      }`}
      style={{
        fontWeight: selected ? 500 : 400,
        backgroundColor: selected ? "var(--accent)" : undefined,
      }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[11px] tabular-nums ${
            selected ? "text-primary/60" : "text-muted-foreground/50"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** Pill section with "Show more" — matches vendor exactly */
function PillSection({
  options,
  selected,
  onToggle,
  getCount,
  threshold = 8,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  getCount: (value: string) => number;
  threshold?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, threshold);
  const hasMore = options.length > threshold;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((opt) => (
          <Pill
            key={opt.value}
            label={opt.label}
            selected={selected.includes(opt.value)}
            onClick={() => onToggle(opt.value)}
            count={getCount(opt.value)}
          />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1 mt-2.5 text-[13px] cursor-pointer transition-colors hover:text-primary"
          style={{ fontWeight: 500, color: "var(--primary)" }}
        >
          {showAll ? "Show less" : `Show all ${options.length}`}
          {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

/** Min / Max range inputs — matches vendor exactly */
function RangeInputs({
  min,
  max,
  onMinChange,
  onMaxChange,
  minPlaceholder,
  maxPlaceholder,
  prefix = "$",
}: {
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  prefix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <label className="text-[11px] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
          Minimum
        </label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
              {prefix}
            </span>
          )}
          <input
            type="number"
            placeholder={minPlaceholder ?? "0"}
            value={min}
            onChange={(e) => onMinChange(e.target.value)}
            className={`w-full h-9 pr-3 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#D6E8FF] focus:border-[#ADD1FF] tabular-nums ${
              prefix ? "pl-7" : "pl-3"
            }`}
          />
        </div>
      </div>
      <span className="text-muted-foreground/30 mt-5">–</span>
      <div className="flex-1">
        <label className="text-[11px] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
          Maximum
        </label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
              {prefix}
            </span>
          )}
          <input
            type="number"
            placeholder={maxPlaceholder ?? "100"}
            value={max}
            onChange={(e) => onMaxChange(e.target.value)}
            className={`w-full h-9 pr-3 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#D6E8FF] focus:border-[#ADD1FF] tabular-nums ${
              prefix ? "pl-7" : "pl-3"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
