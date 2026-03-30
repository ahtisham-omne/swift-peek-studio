/**
 * Notion-style Filter Bar
 *
 * Shows active column filters as pill chips at the top of the table.
 * Each chip shows "Column Name ∨ ×" and can be clicked to edit or removed.
 * A "+ Filter" button lets users add more column filters.
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import type { ColumnDef } from "./items-types";

export interface ColumnFilterMap {
  [columnKey: string]: Set<string>;
}

interface NotionFilterBarProps {
  columns: ColumnDef[];
  columnFilters: ColumnFilterMap;
  /** All unique values per column key */
  uniqueValuesMap: Record<string, string[]>;
  onRemoveFilter: (columnKey: string) => void;
  onOpenColumnFilter: (columnKey: string) => void;
  onAddFilter: (columnKey: string) => void;
}

export function NotionFilterBar({
  columns,
  columnFilters,
  uniqueValuesMap,
  onRemoveFilter,
  onOpenColumnFilter,
  onAddFilter,
}: NotionFilterBarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeFilterKeys = Object.keys(columnFilters).filter(
    (k) => columnFilters[k] && columnFilters[k].size > 0
  );

  // Close add menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        addBtnRef.current &&
        !addBtnRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAddMenu]);

  if (activeFilterKeys.length === 0) return null;

  // Columns that already have active filters
  const filteredColumnLabels = new Map(
    columns.map((c) => [c.key, c.label])
  );

  // Columns available for adding a new filter
  const availableForAdd = columns.filter(
    (c) => c.visible && !activeFilterKeys.includes(c.key)
  );

  return (
    <div
      className="flex items-center gap-[6px] px-4 py-[8px] overflow-x-auto no-scrollbar"
      style={{
        borderColor: "var(--border-subtle)",
        borderBottomWidth: 1,
        borderBottomStyle: "solid" as const,
        backgroundColor: "var(--card)",
      }}
    >
      {/* Active filter chips */}
      {activeFilterKeys.map((key) => {
        const label = filteredColumnLabels.get(key) || key;
        const count = columnFilters[key].size;
        const values = [...columnFilters[key]];
        const preview =
          values.length <= 2
            ? values.join(", ")
            : `${values.slice(0, 2).join(", ")} +${values.length - 2}`;

        return (
          <div
            key={key}
            className="flex items-center shrink-0"
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-strong)",
              backgroundColor: "var(--card)",
              overflow: "hidden",
            }}
          >
            {/* Chip label — clickable to open filter */}
            <button
              onClick={() => onOpenColumnFilter(key)}
              className="flex items-center gap-[4px] px-[8px] py-[4px] transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-hover)";
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
              {count > 0 && (
                <span
                  className="text-[10px] leading-none px-[4px] py-[1px]"
                  style={{
                    borderRadius: 3,
                    backgroundColor: "var(--primary-surface-strong)",
                    color: "var(--primary-text-strong)",
                    fontWeight: "var(--font-weight-medium)" as any,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {count}
                </span>
              )}
              <ChevronDown size={12} style={{ color: "var(--text-subtle)" }} />
            </button>

            {/* Remove button */}
            <button
              onClick={() => onRemoveFilter(key)}
              className="flex items-center justify-center px-[6px] py-[4px] transition-colors"
              style={{
                borderLeft: "1px solid var(--border)",
                color: "var(--text-subtle)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--destructive-surface)";
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
        );
      })}

      {/* + Filter button */}
      {availableForAdd.length > 0 && (
        <div className="relative shrink-0">
          <button
            ref={addBtnRef}
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-[4px] px-[8px] py-[4px] text-[12px] leading-[1.3] transition-colors"
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
              ref={menuRef}
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
                  className="flex items-center gap-[8px] w-full px-3 py-[7px] text-left transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
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