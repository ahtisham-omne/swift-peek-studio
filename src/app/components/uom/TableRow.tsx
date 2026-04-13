/**
 * UOM Module — Table Header Row & Table Data Row
 *
 * Renders <thead>/<tr>/<th> and <tr>/<td> for a standard HTML <table>.
 * All drag-to-reorder logic lives in DraggableColumnSystem.tsx — this file
 * only handles rendering, sort, resize, and cell content.
 *
 * All colors use CSS custom properties from theme.css.
 * Typography uses var(--font-family) defined in theme.css (inherited globally).
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CategoryBadge, type UomCategory } from "./CategoryBadge";
import { TypeLabel, type UomType } from "./TypeLabel";
import { InUseBadge } from "./InUseBadge";
import { UOM_ICONS } from "./design-tokens";
import { Files, FilePenLine, Archive, GripVertical, MoreHorizontal, Eye } from "lucide-react";
import type { ColumnDef } from "./ColumnsDropdown";
import { type DensityMode } from "./DensityDropdown";

/* ══════════════════════════════════════════════
   Search highlight helper
   ═══════════════════════════════════════════════ */

function highlightText(text: string, query: string): ReactNode {
  if (!query || !text) return text;
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark
        style={{
          backgroundColor: "var(--highlight-bg)",
          color: "inherit",
          padding: "0 1px",
          borderRadius: 2,
        }}
      >
        {match}
      </mark>
      {after}
    </>
  );
}

/* ═══════════════════════════════════════════════
   Tooltip wrapper for action icons
   ═══════════════════════════════════════════════ */

function ActionIconBtn({
  label,
  onClick,
  children,
  color,
  hoverColor,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  color?: string;
  hoverColor?: string;
}) {
  const [hovered, setHovered] = useState(false);

  const defaultColor = "var(--text-subtle)";
  const defaultHoverColor = "var(--text-strong)";

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="inline-flex items-center justify-center cursor-pointer transition-all"
        style={{
          width: 28,
          height: 28,
          padding: 0,
          borderRadius: "var(--radius-sm)",
          border: "none",
          backgroundColor: hovered ? "var(--surface-raised)" : "transparent",
          color: hovered ? (hoverColor ?? defaultHoverColor) : (color ?? defaultColor),
        }}
      >
        {children}
      </button>
      {hovered && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--tooltip-bg)",
            color: "var(--primary-foreground)",
            fontSize: 11,
            fontWeight: "var(--font-weight-normal)" as any,
            lineHeight: 1,
            boxShadow: "var(--elevation-tooltip)",
          }}
        >
          {label}
          <div
            style={{
              position: "absolute",
              bottom: -3,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 6,
              height: 6,
              backgroundColor: "var(--tooltip-bg)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Data types
   ═══════════════════════════════════════════════ */

export interface UomUnit {
  id: string;
  name: string;
  symbol: string;
  category: UomCategory;
  description: string;
  type: UomType;
  inUse: boolean;
  inUseCount?: number;
}

export type SortField =
  | "name"
  | "symbol"
  | "category"
  | "description"
  | "type"
  | "inUse";

export type SortDirection = "asc" | "desc";

export interface ActiveSort {
  field: SortField;
  direction: SortDirection;
}

/** Per-column filter values (column key → search string) */
export type ColumnFilters = Record<string, string>;

/* ═══════════════════════════════════════════════
   Helpers
   ═════════════════════════════════════════════ */

const PINNED_LEFT = "name";
const PINNED_RIGHT = "actions";

/** Kept for backward compat — still exported for auto-size calc */
export function buildGridTemplate(
  columns: ColumnDef[],
  columnOrder: string[]
): string {
  const colMap = new Map(columns.map((c) => [c.key, c]));
  return columnOrder
    .map((key) => {
      const col = colMap.get(key);
      if (!col || !col.visible) return null;
      return `${col.width ?? 120}px`;
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * Build the ordered list of visible column keys with pinned columns
 * forced to their positions: "name" always first, "actions" always last.
 */
export function getOrderedVisibleKeys(
  columns: ColumnDef[],
  columnOrder: string[]
): string[] {
  const colMap = new Map(columns.map((c) => [c.key, c]));
  const middle = columnOrder.filter((k) => {
    if (k === PINNED_LEFT || k === PINNED_RIGHT) return false;
    const col = colMap.get(k);
    return col && col.visible;
  });
  const result: string[] = [];
  const nameCol = colMap.get(PINNED_LEFT);
  if (nameCol && nameCol.visible) result.push(PINNED_LEFT);
  result.push(...middle);
  const actionsCol = colMap.get(PINNED_RIGHT);
  if (actionsCol && actionsCol.visible) result.push(PINNED_RIGHT);
  return result;
}

const CELL_PADDING: React.CSSProperties = {
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 16,
  paddingRight: 16,
};

function getCellPadding(_density?: DensityMode): React.CSSProperties {
  // Density is now handled via Tailwind classes on <tr>, not inline padding
  return CELL_PADDING;
}

/* ═══════════════════════════════════════════════
   Column header metadata
   ═══════════════════════════════════════════════ */

interface HeaderColumn {
  key: string;
  label: string;
  field?: SortField;
  filterable?: boolean;
  align?: "left" | "right";
}

const ALL_HEADER_COLUMNS: Record<string, HeaderColumn> = {
  name: { key: "name", label: "Unit Name", field: "name", filterable: true },
  symbol: { key: "symbol", label: "Symbol", field: "symbol", filterable: true },
  category: { key: "category", label: "Category", field: "category", filterable: true },
  description: { key: "description", label: "Description", field: "description", filterable: true },
  type: { key: "type", label: "Type", field: "type", filterable: true },
  inUse: { key: "inUse", label: "In Use", field: "inUse", filterable: true },
  actions: { key: "actions", label: "Actions", align: "right", filterable: false },
};

/* ═══════════════════════════════════════════════
   Table Header Row — renders <thead> with <tr><th>…</th></tr>
   ═══════════════════════════════════════════════ */

export interface TableHeaderRowProps {
  activeSort?: ActiveSort;
  onSort?: (field: SortField) => void;
  columns: ColumnDef[];
  columnOrder: string[];
  visibleKeys: string[];
  onResize?: (key: string, newWidth: number) => void;
  onAutoSize?: (key: string) => void;
  density?: DensityMode;
  className?: string;
  /** Selection: are all visible rows selected? */
  allSelected?: boolean;
  /** Selection: are some (but not all) selected? */
  someSelected?: boolean;
  /** Selection: toggle select-all */
  onSelectAll?: () => void;
  /** Index of column currently being dragged (from useColumnReorder) */
  draggedIndex?: number | null;
  /** Pointer down handler from useColumnReorder — bind to draggable <th>s */
  onDragPointerDown?: (e: React.PointerEvent, colIndex: number) => void;
}

export function TableHeaderRow({
  activeSort,
  onSort,
  columns,
  columnOrder,
  visibleKeys,
  onResize,
  onAutoSize,
  density,
  className = "",
  allSelected,
  someSelected,
  onSelectAll,
  draggedIndex,
  onDragPointerDown,
}: TableHeaderRowProps) {
  const colMap = new Map(columns.map((c) => [c.key, c]));

  /* Density classes matching Partner Management */
  const headerDensityClass = density === "condensed" ? "[&>th]:h-8" : "";

  /* ── Resize handler ── */
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, colKey: string) => {
      e.preventDefault();
      e.stopPropagation();
      const col = colMap.get(colKey);
      if (!col) return;
      const startX = e.clientX;
      const startW = col.width ?? 120;
      const minW = col.minWidth ?? 60;

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newW = Math.max(minW, startW + delta);
        onResize?.(colKey, newW);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [colMap, onResize]
  );

  /* ── Double-click auto-size ── */
  const handleResizeDblClick = useCallback(
    (e: React.MouseEvent, colKey: string) => {
      e.preventDefault();
      e.stopPropagation();
      onAutoSize?.(colKey);
    },
    [onAutoSize]
  );

  return (
    <thead>
      <tr
        className={`bg-muted/30 hover:bg-muted/30 ${headerDensityClass} ${className}`}
      >
        {/* ── Checkbox cell (select-all) ── */}
        {onSelectAll && (
          <th
            style={{
              width: 40,
              minWidth: 40,
              maxWidth: 40,
              padding: 0,
              textAlign: "center",
            }}
            className="border-b border-r border-border bg-muted/30"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAll();
              }}
              className="border-0 inline-flex items-center justify-center cursor-pointer p-0 bg-transparent"
              aria-label="Select all rows"
            >
              <span
                className="inline-flex items-center justify-center border-0"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "var(--radius-sm)",
                  border: allSelected || someSelected
                    ? "none"
                    : "1.5px solid var(--border-strong)",
                  backgroundColor: allSelected || someSelected
                    ? "var(--primary)"
                    : "var(--card)",
                  transition: "background-color 0.15s ease, border-color 0.15s ease",
                }}
              >
                {allSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5.5L4 8L8.5 2" stroke="var(--primary-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {someSelected && !allSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <rect x="2" y="4.5" width="6" height="1.5" rx="0.5" fill="var(--primary-foreground)"/>
                  </svg>
                )}
              </span>
            </button>
          </th>
        )}

        {visibleKeys.map((key, idx) => {
          const hdr = ALL_HEADER_COLUMNS[key];
          if (!hdr) return null;
          const col = colMap.get(key)!;
          const colW = col.width ?? 120;
          const isSortable = !!hdr.field;
          const isActive = activeSort && hdr.field === activeSort.field;
          // draggedIndex is in dragColumns space (which includes checkbox at 0)
          // data columns start at index 1 in dragColumns, so compare with idx + 1
          const isDragged = draggedIndex != null && onSelectAll
            ? draggedIndex === idx + 1
            : draggedIndex === idx;
          const isRequired = !!col.required;
          const canDrag = !isRequired && !!onDragPointerDown;

          return (
            <th
              key={key}
              className={`relative select-none bg-muted/30 border-b border-border ${
                key !== PINNED_RIGHT ? "border-r" : ""
              } ${isSortable ? "cursor-pointer" : ""} ${canDrag ? "group/col" : ""} ${
                isDragged ? "!bg-transparent opacity-35" : ""
              }`}
              style={{
                width: colW,
                minWidth: key === PINNED_RIGHT ? colW : Math.min(colW, 80),
                padding: 0,
                boxSizing: "border-box",
                ...(isDragged
                  ? {
                      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, var(--border) 4px, var(--border) 5px)",
                      borderRadius: "var(--radius-sm)",
                      outline: "2px dashed var(--primary-border)",
                      outlineOffset: -2,
                    }
                  : {}),
                transition: "opacity 200ms ease, outline 200ms ease",
                textAlign: "left",
              }}
              onPointerDown={
                canDrag
                  ? (e) => {
                      // Offset index by 1 when checkbox column exists (maps to dragColumns index)
                      const dragIdx = onSelectAll ? idx + 1 : idx;
                      onDragPointerDown!(e, dragIdx);
                    }
                  : undefined
              }
              onClick={
                isSortable && hdr.field
                  ? () => onSort?.(hdr.field!)
                  : undefined
              }
            >
              <div
                className={`flex items-center gap-[4px] h-full ${
                  hdr.align === "right" ? "justify-center" : ""
                }`}
                style={{
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                {/* Drag grip — visible on hover for draggable columns */}
                {canDrag && (
                  <span
                    className="opacity-0 group-hover/col:opacity-100"
                    style={{
                      color: "var(--text-disabled)",
                      cursor: "grab",
                      flexShrink: 0,
                      transition: "opacity 150ms ease",
                      marginLeft: -4,
                      marginRight: 2,
                    }}
                  >
                    <GripVertical size={12} />
                  </span>
                )}

                <span
                  className="leading-none text-[13px]"
                  style={{
                    fontWeight: 500 as any,
                    color: isActive
                      ? "#0A77FF"
                      : undefined,
                  }}
                >
                  {hdr.label}
                </span>

                {/* Sort arrow */}
                {isSortable && isActive && (
                  <span className="leading-none" style={{ color: "#0A77FF" }}>
                    {activeSort!.direction === "asc"
                      ? UOM_ICONS.sortAsc
                      : UOM_ICONS.sortDesc}
                  </span>
                )}
                {isSortable && !isActive && (
                  <span className="leading-none opacity-0 group-hover/col:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }}>
                    {UOM_ICONS.sortNeutral}
                  </span>
                )}
              </div>

              {/* Resize handle */}
              {key !== "actions" && (
                <div
                  data-no-drag
                  className="absolute top-0 right-0 h-full cursor-col-resize z-10 group/resize"
                  style={{ width: 7 }}
                  onMouseDown={(e) => handleResizeStart(e, key)}
                  onDoubleClick={(e) => handleResizeDblClick(e, key)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="h-full opacity-0 group-hover/resize:opacity-100"
                    style={{
                      width: 2,
                      marginLeft: "auto",
                      marginRight: 1,
                      backgroundColor: "var(--primary-border-hover)",
                      transition: "opacity 100ms, background-color 100ms",
                      borderRadius: 1,
                    }}
                  />
                </div>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

/* ═══════════════════════════════════════════════
   Table Data Row — renders <tr><td>…</td></tr>
   ═══════════════════════════════════════════════ */

export interface TableRowProps {
  unit: UomUnit;
  searchQuery?: string;
  columns: ColumnDef[];
  columnOrder: string[];
  visibleKeys: string[];
  onClick?: (unit: UomUnit) => void;
  onCopy?: (unit: UomUnit) => void;
  onEdit?: (unit: UomUnit) => void;
  onDelete?: (unit: UomUnit) => void;
  density?: DensityMode;
  className?: string;
  /** Whether this row is currently selected */
  selected?: boolean;
  /** Toggle selection for this row */
  onToggleSelect?: (id: string) => void;
  /** Index of column currently being dragged */
  draggedIndex?: number | null;
}

export function TableRow({
  unit,
  searchQuery = "",
  columns,
  columnOrder,
  visibleKeys,
  onClick,
  onCopy,
  onEdit,
  onDelete,
  density,
  className = "",
  selected,
  onToggleSelect,
  draggedIndex,
}: TableRowProps) {
  const [hovered, setHovered] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const actionsBtnRef = useRef<HTMLButtonElement>(null);
  const q = searchQuery.trim();

  const colMap = new Map(columns.map((c) => [c.key, c]));

  /* Density classes matching Partner Management */
  const densityClass = density === "condensed"
    ? "[&>td]:py-1 [&>td]:px-2"
    : "";

  const ROW_BG = hovered
    ? "#F0F7FF"
    : selected
      ? "#EDF4FF"
      : "var(--card)";

  const cellPad = getCellPadding(density);

  // Close dropdown on outside click
  useEffect(() => {
    if (!actionsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(e.target as Node) &&
        actionsBtnRef.current &&
        !actionsBtnRef.current.contains(e.target as Node)
      ) {
        setActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [actionsOpen]);

  const renderCell = (key: string) => {
    switch (key) {
      case "name":
        return (
          <div className="flex items-center" style={cellPad}>
            <span
              className="leading-none truncate"
              style={{
                fontSize: "var(--text-label)",
                fontWeight: "var(--font-weight-normal)" as any,
                color: "var(--text-strong)",
              }}
            >
              {q ? highlightText(unit.name, q) : unit.name}
            </span>
          </div>
        );
      case "symbol":
        return (
          <div className="flex items-center" style={cellPad}>
            <span
              className="leading-none"
              style={{
                fontSize: "var(--text-label)",
                fontWeight: "var(--font-weight-normal)" as any,
                color: "var(--text-base-second)",
              }}
            >
              {q ? highlightText(unit.symbol, q) : unit.symbol}
            </span>
          </div>
        );
      case "category":
        return (
          <div className="flex items-center" style={cellPad}>
            <CategoryBadge category={unit.category} />
          </div>
        );
      case "description":
        return (
          <div className="flex items-center" style={cellPad}>
            {unit.description ? (
              <span
                className="leading-[1.4] truncate"
                style={{
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  color: "var(--text-base-second)",
                }}
                title={unit.description}
              >
                {q ? highlightText(unit.description, q) : unit.description}
              </span>
            ) : (
              <span
                className="leading-none"
                style={{
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  color: "var(--text-subtle)",
                }}
              >
                -
              </span>
            )}
          </div>
        );
      case "type":
        return (
          <div className="flex items-center" style={cellPad}>
            <TypeLabel type={unit.type} />
          </div>
        );
      case "inUse":
        return (
          <div className="flex items-center" style={cellPad}>
            <InUseBadge inUse={unit.inUse} count={unit.inUseCount} />
          </div>
        );
      case "actions":
        return (
          <div
            className="flex items-center justify-center relative"
            style={cellPad}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={actionsBtnRef}
              type="button"
              className="inline-flex items-center justify-center cursor-pointer transition-colors"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                borderRadius: "var(--radius-sm)",
                border: "none",
                backgroundColor: actionsOpen ? "var(--surface-raised)" : "transparent",
                color: actionsOpen ? "var(--text-strong)" : "var(--text-base-second)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-raised)";
                e.currentTarget.style.color = "var(--text-strong)";
              }}
              onMouseLeave={(e) => {
                if (!actionsOpen) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-base-second)";
                }
              }}
              onClick={() => setActionsOpen((prev) => !prev)}
              aria-label="Actions"
            >
              <MoreHorizontal size={16} />
            </button>

            {/* Actions dropdown — rendered via portal */}
            {actionsOpen &&
              createPortal(
                <div
                  ref={actionsRef}
                  style={{
                    position: "fixed",
                    top: actionsBtnRef.current
                      ? actionsBtnRef.current.getBoundingClientRect().bottom + 4
                      : 0,
                    left: actionsBtnRef.current
                      ? actionsBtnRef.current.getBoundingClientRect().right - 176
                      : 0,
                    zIndex: 99999,
                    minWidth: 176,
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    boxShadow:
                      "var(--elevation-menu)",
                    padding: "4px 0",
                  }}
                >
                  {/* View / Open */}
                  <button
                    type="button"
                    className="flex items-center gap-2.5 w-full cursor-pointer border-none bg-transparent transition-colors"
                    style={{
                      padding: "8px 14px",
                      color: "var(--text-base-second)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      lineHeight: "20px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                      e.currentTarget.style.color = "var(--text-strong)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-base-second)";
                    }}
                    onClick={() => {
                      setActionsOpen(false);
                      onClick?.(unit);
                    }}
                  >
                    <Eye size={15} style={{ flexShrink: 0 }} />
                    <span>View Details</span>
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    className="flex items-center gap-2.5 w-full border-none bg-transparent transition-colors"
                    disabled={unit.inUse}
                    aria-disabled={unit.inUse ? "true" : undefined}
                    style={{
                      padding: "8px 14px",
                      color: unit.inUse ? "var(--text-muted)" : "var(--text-base-second)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      lineHeight: "20px",
                      cursor: unit.inUse ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (unit.inUse) return;
                      e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                      e.currentTarget.style.color = "var(--text-strong)";
                    }}
                    onMouseLeave={(e) => {
                      if (unit.inUse) return;
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-base-second)";
                    }}
                    onClick={() => {
                      setActionsOpen(false);
                      if (unit.inUse) return;
                      onEdit?.(unit);
                    }}
                  >
                    <FilePenLine size={15} style={{ flexShrink: 0 }} />
                    <span>{unit.inUse ? "Editing Locked" : "Edit Unit"}</span>
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    className="flex items-center gap-2.5 w-full cursor-pointer border-none bg-transparent transition-colors"
                    style={{
                      padding: "8px 14px",
                      color: "var(--text-base-second)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      lineHeight: "20px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                      e.currentTarget.style.color = "var(--text-strong)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-base-second)";
                    }}
                    onClick={() => {
                      setActionsOpen(false);
                      onCopy?.(unit);
                    }}
                  >
                    <Files size={15} style={{ flexShrink: 0 }} />
                    <span>Duplicate</span>
                  </button>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      backgroundColor: "var(--border-subtle)",
                      margin: "4px 0",
                    }}
                  />

                  {/* Archive */}
                  <button
                    type="button"
                    className="flex items-center gap-2.5 w-full cursor-pointer border-none bg-transparent transition-colors"
                    style={{
                      padding: "8px 14px",
                      color: "var(--destructive)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      lineHeight: "20px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--destructive-surface)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={() => {
                      setActionsOpen(false);
                      onDelete?.(unit);
                    }}
                  >
                    <Archive size={15} style={{ flexShrink: 0 }} />
                    <span>Archive</span>
                  </button>
                </div>,
                document.body
              )}
          </div>
        );
      default:
        return <div style={cellPad} />;
    }
  };

  return (
    <tr
      className={`group transition-colors hover:bg-muted/20 ${densityClass} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      data-row-id={unit.id}
      style={{
        backgroundColor: ROW_BG,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(unit)}
    >
      {/* ── Checkbox cell ── */}
      {onToggleSelect && (
        <td
          className="border-b border-r border-border text-center"
          style={{
            width: 40,
            minWidth: 40,
            maxWidth: 40,
            padding: 0,
            backgroundColor: ROW_BG,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(unit.id);
          }}
        >
          <span
            className="inline-flex items-center justify-center border-0"
            style={{
              width: 16,
              height: 16,
              borderRadius: "var(--radius-sm)",
              border: selected
                ? "none"
                : "1.5px solid var(--border-strong)",
              backgroundColor: selected
                ? "var(--primary)"
                : "var(--card)",
              cursor: "pointer",
              transition: "background-color 0.15s ease, border-color 0.15s ease",
            }}
          >
            {selected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5.5L4 8L8.5 2" stroke="var(--primary-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        </td>
      )}
      {visibleKeys.map((key, idx) => {
        const col = colMap.get(key)!;
        const colW = col.width ?? 120;
        // Offset by 1 for checkbox column when present
        const isDragged = draggedIndex != null && onToggleSelect
          ? draggedIndex === idx + 1
          : draggedIndex === idx;
        return (
          <td
            key={key}
            style={{
              width: colW,
              minWidth: key === PINNED_RIGHT ? colW : Math.min(colW, 80),
              padding: 0,
              boxSizing: "border-box",
              borderColor: "var(--border-subtle)",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderRightWidth: key !== PINNED_RIGHT ? 1 : 0,
              borderRightStyle: "solid",
              borderRightColor: "var(--border-subtle)",
              ...(isDragged ? { opacity: 0.35 } : {}),
              transition: "opacity 200ms ease",
            }}
          >
            {renderCell(key)}
          </td>
        );
      })}
    </tr>
  );
}