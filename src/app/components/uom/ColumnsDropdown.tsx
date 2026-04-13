/**
 * UOM Module — Column Manager
 *
 * Unified panel managing column visibility and ordering
 * with smooth pointer-based drag-and-drop via window listeners.
 * All colors use CSS custom properties from theme.css.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Columns3,
  X,
  Pin,
  Search,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Column definition
   ═══════════════════════════════════════════════ */

export interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
  width?: number;
  minWidth?: number;
}

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: "name", label: "Unit Name", visible: true, required: true, width: 200, minWidth: 80 },
  { key: "symbol", label: "Symbol", visible: true, width: 120, minWidth: 80 },
  { key: "category", label: "Category", visible: true, width: 140, minWidth: 80 },
  { key: "description", label: "Description", visible: true, width: 320, minWidth: 80 },
  { key: "type", label: "Type", visible: true, width: 120, minWidth: 80 },
  { key: "inUse", label: "In Use", visible: true, width: 120, minWidth: 80 },
  { key: "actions", label: "Actions", visible: true, required: true, width: 64 },
];

const STORAGE_KEY = "uom-columns-v4";

/* ═══════════════════════════════════════════════
   Persistence helpers
   ═══════════════════════════════════════════════ */

export function loadColumns(): ColumnDef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMNS.map((c) => ({ ...c }));
    const parsed: ColumnDef[] = JSON.parse(raw);
    const keyMap = new Map(parsed.map((c) => [c.key, c]));
    return DEFAULT_COLUMNS.map((def) => {
      const saved = keyMap.get(def.key);
      if (!saved) return { ...def };
      const savedWidth = saved.width ?? def.width;
      const minW = def.minWidth ?? 80;
      return {
        ...def,
        visible: def.required ? true : saved.visible,
        width: Math.max(savedWidth ?? minW, minW),
      };
    });
  } catch {
    return DEFAULT_COLUMNS.map((c) => ({ ...c }));
  }
}

export function saveColumns(cols: ColumnDef[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
  } catch {}
}

const ORDER_STORAGE_KEY = "uom-column-order-v2";

export function loadColumnOrder(): string[] | null {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveColumnOrder(order: string[]) {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {}
}

/* ═══════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════ */

export interface ColumnsDropdownProps {
  columns: ColumnDef[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnDef[]>>;
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  defaultOpen?: boolean;
  className?: string;
  /** Controlled open state — panel renders externally via ColumnsSidePanel */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* ═══════════════════════════════════════════════
   Main Component — trigger button only
   ═══════════════════════════════════════════════ */

export function ColumnsDropdown({
  columns,
  setColumns,
  columnOrder,
  setColumnOrder,
  defaultOpen = false,
  className = "",
  open: controlledOpen,
  onOpenChange,
}: ColumnsDropdownProps) {
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : false;

  const visibleCount = columns.filter((c) => c.visible).length;

  const toggleOpen = () => {
    if (onOpenChange) onOpenChange(!open);
  };

  return (
    <div className={className}>
      {/* Trigger button — aligned with vendor listing controls */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`inline-flex items-center justify-center h-9 gap-2 px-3 rounded-lg border bg-white shadow-sm transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
          open
            ? "border-primary/30 text-primary bg-primary/10"
            : "border-border text-foreground hover:bg-muted/40"
        }`}
      >
        <Columns3 size={18} style={{ color: open ? "var(--primary)" : "var(--text-muted)" }} />
        <span className="text-sm hidden md:inline" style={{ fontWeight: 500 }}>
          Columns
        </span>
        <span className="inline-flex min-w-[22px] h-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] text-primary" style={{ fontWeight: 600 }}>
          {visibleCount}
        </span>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Drag Ghost — portal-based floating label
   ═══════════════════════════════════════════════ */

function SidePanelDragGhost({ label, y }: { label: string; y: number }) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        right: 56,
        top: y - 14,
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <div
        className="flex items-center gap-[6px]"
        style={{
          padding: "6px 12px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--card)",
          border: "1.5px solid var(--primary-border)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
          fontFamily: "'Inter', sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        <GripVertical
          size={12}
          style={{ color: "var(--primary-icon)", flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: 12,
            lineHeight: "1",
            fontWeight: "var(--font-weight-semibold)" as any,
            color: "var(--primary)",
          }}
        >
          {label}
        </span>
      </div>
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════
   Side Panel — renders inline to push the table
   ═══════════════════════════════════════════════ */

export interface ColumnsSidePanelProps {
  columns: ColumnDef[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnDef[]>>;
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

interface DragSession {
  key: string;
  startY: number;
  mouseY: number;
  isDragging: boolean;
}

const DRAG_DEADZONE = 5;

export function ColumnsSidePanel({
  columns,
  setColumns,
  columnOrder,
  setColumnOrder,
  onClose,
}: ColumnsSidePanelProps) {
  const [drag, setDrag] = useState<DragSession | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragRef = useRef<DragSession | null>(null);
  const overKeyRef = useRef<string | null>(null);

  const visibleCount = columns.filter((c) => c.visible).length;
  const toggleableCount = columns.filter((c) => !c.required).length;
  const visibleToggleable = columns.filter((c) => !c.required && c.visible).length;
  const allToggleableVisible = visibleToggleable === toggleableCount;

  const colMap = new Map(columns.map((c) => [c.key, c]));
  const orderedCols = columnOrder
    .map((k) => colMap.get(k))
    .filter(Boolean) as ColumnDef[];

  // Separate pinned from draggable columns
  const pinnedTopCols = orderedCols.filter((c) => c.key === "name");
  // Actions column is permanently locked right — not shown in this panel
  const draggableCols = orderedCols.filter(
    (c) => c.key !== "name" && c.key !== "actions"
  );

  // Apply search filter for display
  const filteredDraggable = searchQuery
    ? draggableCols.filter((c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : draggableCols;

  /* ── Toggle visibility ── */
  const toggleVis = useCallback(
    (key: string) => {
      setColumns((prev) => {
        const next = prev.map((c) =>
          c.key === key && !c.required ? { ...c, visible: !c.visible } : c
        );
        saveColumns(next);
        return next;
      });
    },
    [setColumns],
  );

  /* ── Toggle all visibility ── */
  const toggleAll = useCallback(() => {
    setColumns((prev) => {
      const targetState = !allToggleableVisible;
      const next = prev.map((c) =>
        c.required ? c : { ...c, visible: targetState }
      );
      saveColumns(next);
      return next;
    });
  }, [setColumns, allToggleableVisible]);

  /* ── Reset to defaults ── */
  const handleReset = useCallback(() => {
    const fresh = DEFAULT_COLUMNS.map((c) => ({ ...c }));
    setColumns(fresh);
    const defaultOrder = DEFAULT_COLUMNS.map((c) => c.key);
    setColumnOrder(defaultOrder);
    saveColumns(fresh);
    saveColumnOrder(defaultOrder);
    setSearchQuery("");
  }, [setColumns, setColumnOrder]);

  /* ── Register item refs ── */
  const setItemRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(key, el);
    else itemRefs.current.delete(key);
  }, []);

  /* ══════════════════════════════════════════════
     Pointer-based drag — uses window listeners
     ══════════════════════════════════════════════ */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, key: string) => {
      const col = colMap.get(key);
      if (!col || col.required) return;
      if (e.button !== 0) return;

      e.preventDefault();

      const session: DragSession = {
        key,
        startY: e.clientY,
        mouseY: e.clientY,
        isDragging: false,
      };
      dragRef.current = session;
      setDrag(session);
    },
    [colMap],
  );

  useEffect(() => {
    if (!dragRef.current) return;

    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;

      const dy = Math.abs(e.clientY - d.startY);
      if (!d.isDragging && dy < DRAG_DEADZONE) return;

      const updated: DragSession = {
        ...d,
        mouseY: e.clientY,
        isDragging: true,
      };
      dragRef.current = updated;
      setDrag({ ...updated });

      // Find closest item by y position
      let closestKey: string | null = null;
      let closestDist = Infinity;

      draggableCols.forEach((col) => {
        if (col.required || col.key === d.key) return;
        const el = itemRefs.current.get(col.key);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const dist = Math.abs(e.clientY - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closestKey = col.key;
        }
      });

      overKeyRef.current = closestKey;
      setOverKey(closestKey);
    };

    const onUp = () => {
      const d = dragRef.current;
      const target = overKeyRef.current;

      if (d && d.isDragging && target && target !== d.key) {
        setColumnOrder((prev) => {
          const newOrder = [...prev];
          const fromIdx = newOrder.indexOf(d.key);
          const toIdx = newOrder.indexOf(target);
          if (fromIdx === -1 || toIdx === -1) return prev;
          newOrder.splice(fromIdx, 1);
          newOrder.splice(toIdx, 0, d.key);
          saveColumnOrder(newOrder);
          return newOrder;
        });
      }

      dragRef.current = null;
      overKeyRef.current = null;
      setDrag(null);
      setOverKey(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null, draggableCols, setColumnOrder]);

  /* ── Disable text selection during drag ── */
  useEffect(() => {
    if (drag?.isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
      return () => {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [drag?.isDragging]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="shrink-0 overflow-hidden"
      style={{
        borderColor: "var(--border)",
        borderLeftWidth: 1,
        borderLeftStyle: "solid",
        backgroundColor: "var(--card)",
      }}
    >
      <div style={{ width: 280, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--secondary)",
          }}
        >
          <div className="flex items-center gap-[6px]">
            <Columns3 size={14} style={{ color: "var(--text-muted)" }} />
            <span
              style={{
                fontSize: 13,
                fontWeight: "var(--font-weight-semibold)" as any,
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
                lineHeight: "1",
              }}
            >
              Manage Columns
            </span>
          </div>
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer bg-transparent border-none transition-colors hover:opacity-80"
              style={{
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--primary)",
                padding: 0,
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                lineHeight: "1",
              }}
            >
              <span className="flex items-center gap-[3px]">
                <RotateCcw size={11} /> Reset
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer bg-transparent border-none transition-colors hover:opacity-80 flex items-center justify-center"
              style={{
                padding: 2,
                color: "var(--text-muted)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--secondary)",
          }}
        >
          <div className="relative">
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-subtle)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none w-full"
              style={{
                height: 30,
                padding: "0 8px 0 28px",
                boxSizing: "border-box",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: "var(--font-weight-normal)" as any,
                lineHeight: "1",
              }}
            />
          </div>
        </div>

        {/* ── Show/Hide All toggle ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "6px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--secondary)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--text-subtle)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "var(--font-weight-normal)" as any,
              lineHeight: "1",
            }}
          >
            Drag to reorder · Toggle to show/hide
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="cursor-pointer bg-transparent border-none transition-colors hover:opacity-80"
            style={{
              fontSize: 11,
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--primary)",
              padding: 0,
              fontFamily: "'Inter', sans-serif",
              lineHeight: "1",
            }}
          >
            {allToggleableVisible ? "Hide All" : "Show All"}
          </button>
        </div>

        {/* ── Column list ── */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}
          className="scrollbar-overlay"
        >
          {/* Pinned top columns */}
          {!searchQuery &&
            pinnedTopCols.map((col) => (
              <div
                key={col.key}
                className="flex items-center"
                style={{
                  padding: "8px 16px",
                  gap: 10,
                  cursor: "default",
                  position: "relative",
                  backgroundColor: "var(--secondary)",
                }}
              >
                {/* Lock icon */}
                <span style={{ color: "var(--text-disabled)", flexShrink: 0 }}>
                  <Pin size={14} style={{ transform: "rotate(45deg)" }} />
                </span>

                {/* Column name */}
                <span
                  className="flex-1"
                  style={{
                    fontSize: 13,
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--text-muted)",
                    userSelect: "none",
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: "1",
                  }}
                >
                  {col.label}
                  <span
                    style={{
                      fontSize: 10,
                      marginLeft: 6,
                      color: "var(--text-disabled)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Freeze column
                  </span>
                </span>

                {/* Always visible indicator */}
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    padding: 3,
                    borderRadius: 4,
                    color: "var(--text-disabled)",
                  }}
                >
                  <Eye size={15} />
                </span>
              </div>
            ))}

          {/* Separator */}
          {!searchQuery && (
            <div
              style={{
                padding: "6px 16px 4px",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-disabled)",
                fontWeight: "var(--font-weight-semibold)" as any,
                fontFamily: "'Inter', sans-serif",
                borderColor: "var(--border-subtle)",
                borderTopWidth: 1,
                borderTopStyle: "solid",
                lineHeight: "1",
              }}
            >
              Reorderable
            </div>
          )}

          {/* Draggable columns */}
          {filteredDraggable.length === 0 && searchQuery && (
            <div
              style={{
                padding: "20px 16px",
                textAlign: "center",
                fontSize: 12,
                color: "var(--text-subtle)",
                fontFamily: "'Inter', sans-serif",
                lineHeight: "1.4",
              }}
            >
              No columns match "{searchQuery}"
            </div>
          )}

          {filteredDraggable.map((col) => {
            const isDragSource = drag?.isDragging && drag.key === col.key;
            const isDropTarget =
              overKey === col.key &&
              drag !== null &&
              drag.key !== col.key &&
              drag.isDragging;
            const dragIdx = drag?.key ? columnOrder.indexOf(drag.key) : -1;
            const targetIdx = columnOrder.indexOf(col.key);
            const isDropAbove = isDropTarget && dragIdx > targetIdx;
            const isDropBelow = isDropTarget && dragIdx < targetIdx;

            return (
              <div
                key={col.key}
                ref={(el: HTMLDivElement | null) => setItemRef(col.key, el)}
                className="flex items-center"
                style={{
                  padding: "8px 16px",
                  gap: 10,
                  cursor: isDragSource ? "grabbing" : "grab",
                  position: "relative",
                  // Picked-up styling
                  ...(isDragSource
                    ? {
                        opacity: 0.4,
                        backgroundColor: "var(--primary-surface)",
                        borderRadius: 6,
                        outline: "1.5px dashed var(--primary-border)",
                        outlineOffset: -1,
                      }
                    : {
                        opacity: 1,
                        backgroundColor: "rgba(0,0,0,0)",
                        borderRadius: 0,
                      }),
                  transition:
                    "opacity 150ms ease, background-color 150ms ease",
                }}
                onPointerDown={(e: React.PointerEvent) =>
                  handlePointerDown(e, col.key)
                }
              >
                {/* Drop zone indicator — top */}
                <AnimatePresence>
                  {isDropAbove && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        top: -1,
                        left: 16,
                        right: 16,
                        height: 2,
                        backgroundColor: "var(--primary)",
                        borderRadius: 1,
                        boxShadow: "var(--ring-primary-soft)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: -3,
                          top: -2.5,
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: -3,
                          top: -2.5,
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Drop zone indicator — bottom */}
                <AnimatePresence>
                  {isDropBelow && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        bottom: -1,
                        left: 16,
                        right: 16,
                        height: 2,
                        backgroundColor: "var(--primary)",
                        borderRadius: 1,
                        boxShadow: "var(--ring-primary-soft)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: -3,
                          top: -2.5,
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: -3,
                          top: -2.5,
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Drag handle */}
                <span
                  style={{
                    color: isDragSource
                      ? "var(--primary-icon)"
                      : "var(--text-subtle)",
                    flexShrink: 0,
                    cursor: isDragSource ? "grabbing" : "grab",
                    transition: "color 150ms ease",
                  }}
                >
                  <GripVertical size={14} />
                </span>

                {/* Column name */}
                <span
                  className="flex-1"
                  style={{
                    fontSize: 13,
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: isDragSource
                      ? "var(--primary)"
                      : col.visible
                        ? "var(--text-strong)"
                        : "var(--text-subtle)",
                    userSelect: "none",
                    fontFamily: "'Inter', sans-serif",
                    transition: "color 150ms ease",
                    lineHeight: "1",
                    textDecoration: col.visible ? "none" : "line-through",
                  }}
                >
                  {col.label}
                </span>

                {/* Visibility toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVis(col.key);
                  }}
                  className="inline-flex items-center justify-center cursor-pointer bg-transparent border-none transition-colors hover:opacity-70"
                  style={{
                    padding: 3,
                    borderRadius: 4,
                    color: col.visible
                      ? "var(--primary)"
                      : "var(--text-disabled)",
                    cursor: "pointer",
                  }}
                >
                  {col.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "8px 16px",
            borderColor: "var(--border-subtle)",
            borderTopWidth: 1,
            borderTopStyle: "solid",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--text-subtle)",
              lineHeight: "1",
            }}
          >
            {visibleCount} of {columns.length} columns visible
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-disabled)",
              lineHeight: "1",
            }}
          >
            {draggableCols.filter((c) => c.visible).length} sortable
          </span>
        </div>
      </div>

      {/* ── Drag ghost (floating near cursor via portal) ── */}
      {drag?.isDragging && (
        <SidePanelDragGhost
          label={colMap.get(drag.key)?.label ?? drag.key}
          y={drag.mouseY}
        />
      )}
    </motion.div>
  );
}