/**
 * UOM Module — Notion-style Filter Bar
 *
 * Shows active column filters as pill chips above the table.
 * Each chip has "Column Name ∨ ×".
 * Clicking a chip opens a dropdown with "Column Name is" + search + checkboxes.
 * A "+ Filter" button lets users add more column filters.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Plus, X, Search, Check } from "lucide-react";
import type { ColumnDef } from "./ColumnsDropdown";

export interface ColumnFilterMap {
  [columnKey: string]: Set<string>;
}

interface UomNotionFilterBarProps {
  columns: ColumnDef[];
  /** Which columns have an active filter chip (even if no values selected yet) */
  activeFilterKeys: string[];
  /** The actual selected values per column */
  columnFilters: ColumnFilterMap;
  /** All unique values per column key */
  uniqueValuesMap: Record<string, string[]>;
  onFilterChange: (columnKey: string, values: Set<string>) => void;
  onRemoveFilter: (columnKey: string) => void;
  onAddFilter: (columnKey: string) => void;
}

export function UomNotionFilterBar({
  columns,
  activeFilterKeys,
  columnFilters,
  uniqueValuesMap,
  onFilterChange,
  onRemoveFilter,
  onAddFilter,
}: UomNotionFilterBarProps) {
  const [openChip, setOpenChip] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const chipDropdownRef = useRef<HTMLDivElement>(null);

  // Close add menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    function handleClick(e: MouseEvent) {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node) &&
        addBtnRef.current &&
        !addBtnRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAddMenu]);

  // Close chip dropdown on outside click
  useEffect(() => {
    if (!openChip) return;
    function handleClick(e: MouseEvent) {
      if (
        chipDropdownRef.current &&
        !chipDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenChip(null);
        setFilterSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openChip]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenChip(null);
        setShowAddMenu(false);
        setFilterSearch("");
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const columnLabelMap = new Map(columns.map((c) => [c.key, c.label]));

  // Columns available for adding a new filter
  const availableForAdd = columns.filter(
    (c) =>
      c.visible &&
      !activeFilterKeys.includes(c.key) &&
      c.key !== "actions"
  );

  if (activeFilterKeys.length === 0) return null;

  return (
    <div
      className="flex items-center gap-[6px] overflow-x-auto no-scrollbar px-4 py-2 border-b border-border bg-card"
    >
      {/* Active filter chips */}
      {activeFilterKeys.map((key) => {
        const label = columnLabelMap.get(key) || key;
        const isOpen = openChip === key;

        return (
          <div key={key} className="relative shrink-0">
            <div
              className="flex items-center"
              style={{
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--card)",
                overflow: "hidden",
              }}
            >
              {/* Chip label — clickable to open filter dropdown */}
              <button
                onClick={() => {
                  setOpenChip(isOpen ? null : key);
                  setFilterSearch("");
                }}
                className="flex items-center gap-[4px] px-[8px] py-[4px] transition-colors cursor-pointer"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  border: "none",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--surface-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  className="text-[12px] leading-[1.3]"
                  style={{
                    color: "var(--text-strong)",
                    fontWeight: "var(--font-weight-medium)" as any,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {label}
                </span>
                <ChevronDown
                  size={12}
                  style={{ color: "var(--text-subtle)" }}
                />
              </button>

              {/* Remove button */}
              <button
                onClick={() => onRemoveFilter(key)}
                className="flex items-center justify-center px-[6px] py-[4px] transition-colors cursor-pointer"
                style={{
                  borderLeft: "1px solid var(--border)",
                  color: "var(--text-subtle)",
                  border: "none",
                  borderLeftWidth: 1,
                  borderLeftStyle: "solid",
                  borderLeftColor: "var(--border)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--destructive-surface)";
                  e.currentTarget.style.color = "var(--destructive)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-subtle)";
                }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Filter dropdown */}
            {isOpen && (
              <FilterDropdown
                ref={chipDropdownRef}
                columnKey={key}
                columnLabel={label}
                uniqueValues={uniqueValuesMap[key] ?? []}
                selectedValues={columnFilters[key] ?? new Set()}
                filterSearch={filterSearch}
                onFilterSearchChange={setFilterSearch}
                onToggleValue={(val) => {
                  const current = columnFilters[key] ?? new Set();
                  const next = new Set(current);
                  if (next.has(val)) {
                    next.delete(val);
                  } else {
                    next.add(val);
                  }
                  onFilterChange(key, next);
                }}
                onClearAll={() => onFilterChange(key, new Set())}
              />
            )}
          </div>
        );
      })}

      {/* + Filter button */}
      {availableForAdd.length > 0 && (
        <div className="relative shrink-0">
          <button
            ref={addBtnRef}
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-[4px] px-[8px] py-[4px] text-[12px] leading-[1.3] transition-colors cursor-pointer"
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontWeight: "var(--font-weight-medium)" as any,
              fontFamily: "'Inter', sans-serif",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--surface-hover)";
              e.currentTarget.style.color = "var(--primary)";
              e.currentTarget.style.borderColor = "var(--primary-border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <Plus size={13} />
            <span>Filter</span>
          </button>

          {showAddMenu && (
            <div
              ref={addMenuRef}
              className="absolute left-0 top-full mt-1 z-50 w-[200px] overflow-hidden py-[4px]"
              style={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow:
                  "var(--elevation-md)",
              }}
            >
              <div
                className="px-3 py-[6px] text-[11px] uppercase tracking-[0.05em]"
                style={{
                  color: "var(--text-subtle)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  fontFamily: "'Inter', sans-serif",
                  borderColor: "var(--border-subtle)",
                  borderBottomWidth: 1,
                  borderBottomStyle: "solid" as const,
                }}
              >
                Add Filter
              </div>
              {availableForAdd.map((col) => (
                <button
                  key={col.key}
                  onClick={() => {
                    onAddFilter(col.key);
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-[8px] w-full px-3 py-[7px] text-left transition-colors cursor-pointer"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    border: "none",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    className="text-[13px] leading-[1.4]"
                    style={{
                      color: "var(--text-strong)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {col.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Filter Dropdown — checkbox list with search
   ═══════════════════════════════════════════════ */

interface FilterDropdownProps {
  columnKey: string;
  columnLabel: string;
  uniqueValues: string[];
  selectedValues: Set<string>;
  filterSearch: string;
  onFilterSearchChange: (s: string) => void;
  onToggleValue: (val: string) => void;
  onClearAll: () => void;
}

const FilterDropdown = React.forwardRef<HTMLDivElement, FilterDropdownProps>(
  (
    {
      columnKey,
      columnLabel,
      uniqueValues,
      selectedValues,
      filterSearch,
      onFilterSearchChange,
      onToggleValue,
      onClearAll,
    },
    ref
  ) => {
    const filteredValues = useMemo(() => {
      if (!filterSearch) return uniqueValues;
      const q = filterSearch.toLowerCase();
      return uniqueValues.filter((v) => v.toLowerCase().includes(q));
    }, [uniqueValues, filterSearch]);

    return (
      <div
        ref={ref}
        className="absolute left-0 top-full mt-1 z-[9999]"
        style={{
          width: 260,
          backgroundColor: "var(--popover)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow:
            "var(--elevation-md)",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header: "Column Name is" */}
        <div
          className="px-3 py-[10px]"
          style={{
            borderColor: "var(--border-subtle)",
            borderBottomWidth: 1,
            borderBottomStyle: "solid" as const,
          }}
        >
          <span
            className="text-[13px] leading-[1.4]"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span
              style={{
                color: "var(--text-strong)",
                fontWeight: "var(--font-weight-medium)" as any,
              }}
            >
              {columnLabel}
            </span>{" "}
            <span
              style={{
                color: "var(--text-muted)",
                fontWeight: "var(--font-weight-normal)" as any,
              }}
            >
              is
            </span>
          </span>
        </div>

        {/* Search input */}
        <div
          className="px-3 py-[8px]"
          style={{
            borderColor: "var(--border-subtle)",
            borderBottomWidth: 1,
            borderBottomStyle: "solid" as const,
          }}
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute left-[8px] top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-subtle)" }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={filterSearch}
              onChange={(e) => onFilterSearchChange(e.target.value)}
              autoFocus
              className="w-full text-[13px] outline-none"
              style={{
                height: "var(--input-height)",
                padding: "0 10px 0 28px",
                boxSizing: "border-box",
                backgroundColor: "var(--input-background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: "var(--font-weight-normal)" as any,
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>

        {/* Value list */}
        <div className="max-h-[240px] overflow-y-auto py-[2px] scrollbar-overlay">
          {filteredValues.length === 0 ? (
            <div
              className="px-3 py-4 text-center text-[12px]"
              style={{
                color: "var(--text-muted)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: "var(--font-weight-normal)" as any,
              }}
            >
              No matching values
            </div>
          ) : (
            filteredValues.map((val) => {
              const isSelected = selectedValues.has(val);
              return (
                <button
                  key={val}
                  onClick={() => onToggleValue(val)}
                  className="flex items-center gap-[8px] w-full px-3 py-[7px] text-left transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                    fontFamily: "'Inter', sans-serif",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Checkbox */}
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      border: isSelected
                        ? "1px solid var(--primary)"
                        : "1px solid var(--border-strong)",
                      backgroundColor: isSelected
                        ? "var(--primary)"
                        : "var(--card)",
                      transition: "all 0.1s ease",
                    }}
                  >
                    {isSelected && (
                      <Check
                        size={11}
                        style={{ color: "var(--primary-foreground)" }}
                      />
                    )}
                  </span>
                  <span
                    className="text-[13px] leading-[1.4] truncate"
                    style={{
                      color: isSelected
                        ? "var(--primary-text-strong)"
                        : "var(--text-default)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {val}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }
);