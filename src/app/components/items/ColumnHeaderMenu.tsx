/**
 * Notion-style Column Header Menu
 *
 * Clicking a column header opens a floating dropdown with:
 * - Column name label
 * - Sort Ascending / Descending
 * - Filter (opens an inline filter for that column's values)
 * - Hide column
 * - Freeze column (pin left)
 *
 * When "Filter" is selected, it expands an inline sub-panel
 * showing unique values for the column with checkboxes + search.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowUp,
  ArrowDown,
  Filter,
  EyeOff,
  Snowflake,
  Search,
  Check,
  X,
} from "lucide-react";

export interface ColumnFilterState {
  columnKey: string;
  columnLabel: string;
  selectedValues: Set<string>;
}

interface ColumnHeaderMenuProps {
  columnKey: string;
  columnLabel: string;
  /** All unique string values for this column (for the filter list) */
  uniqueValues: string[];
  /** Currently selected filter values (empty = no filter) */
  activeFilter: Set<string>;
  /** Current sort state */
  sortField: string;
  sortDir: "asc" | "desc";
  /** Whether this column is frozen */
  isFrozen: boolean;
  /** Whether this column can be hidden */
  canHide: boolean;
  /** Callbacks */
  onSort: (dir: "asc" | "desc") => void;
  onFilterChange: (values: Set<string>) => void;
  onHide: () => void;
  onToggleFreeze: () => void;
  /** Close callback */
  onClose: () => void;
  /** Position anchor */
  anchorRect: DOMRect | null;
}

export function ColumnHeaderMenu({
  columnKey,
  columnLabel,
  uniqueValues,
  activeFilter,
  sortField,
  sortDir,
  isFrozen,
  canHide,
  onSort,
  onFilterChange,
  onHide,
  onToggleFreeze,
  onClose,
  anchorRect,
}: ColumnHeaderMenuProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const filteredValues = useMemo(() => {
    if (!filterSearch) return uniqueValues;
    const q = filterSearch.toLowerCase();
    return uniqueValues.filter((v) => v.toLowerCase().includes(q));
  }, [uniqueValues, filterSearch]);

  const allSelected = activeFilter.size === 0;
  const selectedCount = activeFilter.size;

  const toggleValue = (val: string) => {
    const next = new Set(activeFilter);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    onFilterChange(next);
  };

  const selectAll = () => {
    onFilterChange(new Set());
  };

  const clearAll = () => {
    // Select none = filter to empty (show nothing) — actually in Notion, clearing means "no filter"
    onFilterChange(new Set());
  };

  // Calculate position
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
  };

  if (anchorRect) {
    menuStyle.top = anchorRect.bottom + 4;
    menuStyle.left = anchorRect.left;

    // Don't go off screen right
    if (anchorRect.left + 240 > window.innerWidth) {
      menuStyle.left = window.innerWidth - 250;
    }
    // Don't go off screen bottom
    if (anchorRect.bottom + 360 > window.innerHeight) {
      menuStyle.top = anchorRect.top - 360;
      if ((menuStyle.top as number) < 8) menuStyle.top = 8;
    }
  }

  const isSortedAsc = sortField === columnKey && sortDir === "asc";
  const isSortedDesc = sortField === columnKey && sortDir === "desc";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        style={{
          ...menuStyle,
          width: showFilter ? 280 : 220,
          backgroundColor: "var(--popover)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--elevation-md)",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
          transition: "width 0.15s ease",
        }}
      >
        {/* Column name header */}
        <div
          className="px-3 py-[10px] flex items-center gap-2"
          style={{
            borderColor: "var(--border-subtle)",
            borderBottomWidth: 1,
            borderBottomStyle: "solid" as const,
          }}
        >
          <span
            className="text-[13px] leading-[1.4] flex-1 truncate"
            style={{
              color: "var(--text-strong)",
              fontWeight: "var(--font-weight-medium)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {columnLabel}
          </span>
        </div>

        {!showFilter ? (
          /* ── Main Menu ── */
          <div className="py-[4px]">
            {/* Sort Ascending */}
            <MenuRow
              icon={<ArrowUp size={15} />}
              label="Sort Ascending"
              active={isSortedAsc}
              onClick={() => {
                onSort("asc");
                onClose();
              }}
            />
            {/* Sort Descending */}
            <MenuRow
              icon={<ArrowDown size={15} />}
              label="Sort Descending"
              active={isSortedDesc}
              onClick={() => {
                onSort("desc");
                onClose();
              }}
            />

            {/* Divider */}
            <div className="mx-2 my-[4px]" style={{ height: 1, backgroundColor: "var(--border-subtle)" }} />

            {/* Filter */}
            <MenuRow
              icon={<Filter size={15} />}
              label="Filter"
              badge={selectedCount > 0 ? selectedCount : undefined}
              onClick={() => setShowFilter(true)}
            />

            {/* Divider */}
            <div className="mx-2 my-[4px]" style={{ height: 1, backgroundColor: "var(--border-subtle)" }} />

            {/* Hide */}
            <MenuRow
              icon={<EyeOff size={15} />}
              label="Hide"
              disabled={!canHide}
              onClick={() => {
                if (canHide) {
                  onHide();
                  onClose();
                }
              }}
            />

            {/* Freeze */}
            <MenuRow
              icon={<Snowflake size={15} />}
              label={isFrozen ? "Unfreeze" : "Freeze"}
              active={isFrozen}
              onClick={() => {
                onToggleFreeze();
                onClose();
              }}
            />
          </div>
        ) : (
          /* ── Filter Sub-panel ── */
          <div>
            {/* Back + Search */}
            <div
              className="px-3 py-[8px] flex items-center gap-2"
              style={{ borderColor: "var(--border-subtle)", borderBottomWidth: 1, borderBottomStyle: "solid" as const }}
            >
              <button
                onClick={() => {
                  setShowFilter(false);
                  setFilterSearch("");
                }}
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-muted)",
                }}
              >
                <X size={14} />
              </button>
              <div className="relative flex-1">
                <Search
                  size={13}
                  className="absolute left-[6px] top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-subtle)" }}
                />
                <input
                  type="text"
                  placeholder="Search values..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  autoFocus
                  className="w-full text-[12px] outline-none"
                  style={{
                    padding: "5px 8px 5px 24px",
                    backgroundColor: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--foreground)",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: "var(--font-weight-normal)" as any,
                  }}
                />
              </div>
            </div>

            {/* Select All / Clear */}
            <div
              className="flex items-center justify-between px-3 py-[6px]"
              style={{ borderColor: "var(--border-subtle)", borderBottomWidth: 1, borderBottomStyle: "solid" as const }}
            >
              <button
                onClick={selectAll}
                className="text-[11px] leading-[1.3]"
                style={{
                  color: "var(--primary)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Select All
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] leading-[1.3]"
                  style={{
                    color: "var(--text-muted)",
                    fontWeight: "var(--font-weight-medium)" as any,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Clear ({selectedCount})
                </button>
              )}
            </div>

            {/* Value list */}
            <div className="max-h-[220px] overflow-y-auto py-[2px] scrollbar-overlay">
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
                  const isSelected = activeFilter.has(val);
                  return (
                    <button
                      key={val}
                      onClick={() => toggleValue(val)}
                      className="flex items-center gap-[8px] w-full px-3 py-[6px] text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? "var(--primary-surface)" : "transparent",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected ? "var(--primary-surface)" : "transparent";
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
                          backgroundColor: isSelected ? "var(--primary)" : "var(--card)",
                          transition: "all 0.1s ease",
                        }}
                      >
                        {isSelected && <Check size={11} style={{ color: "var(--primary-foreground)" }} />}
                      </span>
                      <span
                        className="text-[12px] leading-[1.4] truncate"
                        style={{
                          color: isSelected ? "var(--primary-text-strong)" : "var(--text-default)",
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
        )}
      </div>
    </>
  );
}

/* ── Menu Row ── */

function MenuRow({
  icon,
  label,
  active,
  disabled,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-[8px] w-full px-3 py-[7px] text-left transition-colors"
      style={{
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <span
        style={{
          color: active ? "var(--primary)" : "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        className="flex-1 text-[13px] leading-[1.4]"
        style={{
          color: active ? "var(--primary-text-strong)" : "var(--text-strong)",
          fontWeight: "var(--font-weight-normal)" as any,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="text-[10px] leading-none px-[5px] py-[2px]"
          style={{
            borderRadius: 4,
            backgroundColor: "var(--primary-surface-strong)",
            color: "var(--primary-text-strong)",
            fontWeight: "var(--font-weight-medium)" as any,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {badge}
        </span>
      )}
      {active && !badge && (
        <Check size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
      )}
    </button>
  );
}