/**
 * UOM Module — Column Manager
 *
 * Unified panel managing column visibility and ordering
 * with smooth pointer-based drag-and-drop via window listeners.
 * Design matches the Partners ColumnSelector exactly.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Columns3,
  X,
  Lock,
  Search,
} from "lucide-react";
import { Input } from "../ui/input";

/* ═══════════════════════════════════════════════
   Highlight helper
   ═══════════════════════════════════════════════ */

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.trim().length === 0) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-transparent px-0.5 rounded-sm" style={{ backgroundColor: "#FEFCE8", color: "#854D0E", fontWeight: 500 }}>{part}</mark>
    ) : (
      part
    )
  );
}

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
      <button
        type="button"
        onClick={toggleOpen}
        className={`inline-flex items-center justify-center h-9 gap-2 px-3 rounded-lg border shadow-sm transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
          open
            ? "border-primary/30 bg-primary/[0.04] text-foreground"
            : "border-border bg-white text-foreground hover:bg-muted/40"
        }`}
        title="Manage columns"
      >
        <Columns3 className="w-[18px] h-[18px] text-muted-foreground/80" />
        <span className="text-sm hidden md:inline" style={{ fontWeight: 500 }}>
          Columns
        </span>
        <span
          className="inline-flex items-center justify-center h-5 px-1.5 rounded-full text-[11px]"
          style={{ backgroundColor: "#EDF4FF", color: "#0A77FF", fontWeight: 600 }}
        >
          {visibleCount}
        </span>
      </button>
    </div>
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

/* ─── Auto-scroll constants ─── */
const AUTO_SCROLL_ZONE = 40;
const AUTO_SCROLL_MAX_SPEED = 12;
const DRAG_DEADZONE = 5;

export function ColumnsSidePanel({
  columns,
  setColumns,
  columnOrder,
  setColumnOrder,
  onClose,
}: ColumnsSidePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [liveOrder, setLiveOrder] = useState<string[] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const liveOrderRef = useRef<string[] | null>(null);
  const draggingKeyRef = useRef<string | null>(null);
  const autoScrollRaf = useRef<number | null>(null);
  const pointerYRef = useRef<number>(0);

  liveOrderRef.current = liveOrder;
  draggingKeyRef.current = draggingKey;

  const lockedColumns = useMemo(() => columns.filter((c) => c.required).map((c) => c.key), [columns]);

  const visibleCount = columns.filter((c) => c.visible).length;
  const totalCount = columns.filter((c) => c.key !== "actions").length;

  const currentOrder = liveOrder ?? columnOrder;

  const colMap = new Map(columns.map((c) => [c.key, c]));
  const orderedColumns = currentOrder
    .map((key) => colMap.get(key))
    .filter((c): c is ColumnDef => !!c && c.key !== "actions");

  const pinnedColumns = useMemo(() => {
    return orderedColumns.filter((c) => lockedColumns.includes(c.key));
  }, [orderedColumns, lockedColumns]);

  const reorderableColumns = useMemo(() => {
    const base = orderedColumns.filter((c) => !lockedColumns.includes(c.key));
    if (searchQuery) {
      return base.filter((c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return base;
  }, [orderedColumns, searchQuery, lockedColumns]);

  /* ── Toggle visibility ── */
  const toggleVisibility = useCallback((key: string) => {
    if (lockedColumns.includes(key)) return;
    setColumns((prev) => {
      const next = prev.map((c) =>
        c.key === key && !c.required ? { ...c, visible: !c.visible } : c
      );
      saveColumns(next);
      return next;
    });
  }, [lockedColumns, setColumns]);

  const selectAll = () => {
    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, visible: true }));
      saveColumns(next);
      return next;
    });
  };

  const deselectAll = () => {
    setColumns((prev) => {
      const next = prev.map((c) =>
        lockedColumns.includes(c.key) ? c : { ...c, visible: false }
      );
      saveColumns(next);
      return next;
    });
  };

  const resetColumns = () => {
    const fresh = DEFAULT_COLUMNS.map((c) => ({ ...c }));
    setColumns(fresh);
    const defaultOrder = DEFAULT_COLUMNS.map((c) => c.key);
    setColumnOrder(defaultOrder);
    saveColumns(fresh);
    saveColumnOrder(defaultOrder);
    setLiveOrder(null);
    setSearchQuery("");
  };

  /* ── Stable refs ── */
  const lockedColumnsRef = useRef(lockedColumns);
  lockedColumnsRef.current = lockedColumns;
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const onColumnOrderChangeRef = useRef(setColumnOrder);
  onColumnOrderChangeRef.current = setColumnOrder;

  /* ── Auto-scroll loop ── */
  const startAutoScroll = useCallback(() => {
    const tick = () => {
      const listEl = listRef.current;
      if (!listEl || !draggingKeyRef.current) {
        autoScrollRaf.current = null;
        return;
      }
      const listRect = listEl.getBoundingClientRect();
      const y = pointerYRef.current;
      const distFromTop = y - listRect.top;
      const distFromBottom = listRect.bottom - y;
      if (distFromTop < AUTO_SCROLL_ZONE && distFromTop > 0) {
        const intensity = 1 - distFromTop / AUTO_SCROLL_ZONE;
        listEl.scrollTop -= Math.round(AUTO_SCROLL_MAX_SPEED * intensity);
      } else if (distFromBottom < AUTO_SCROLL_ZONE && distFromBottom > 0) {
        const intensity = 1 - distFromBottom / AUTO_SCROLL_ZONE;
        listEl.scrollTop += Math.round(AUTO_SCROLL_MAX_SPEED * intensity);
      }
      autoScrollRaf.current = requestAnimationFrame(tick);
    };
    if (autoScrollRaf.current) cancelAnimationFrame(autoScrollRaf.current);
    autoScrollRaf.current = requestAnimationFrame(tick);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRaf.current) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }
  }, []);

  /* ── Reorder helper ── */
  const performReorder = useCallback((clientY: number) => {
    const listEl = listRef.current;
    if (!listEl) return;
    const rows = Array.from(listEl.querySelectorAll<HTMLElement>("[data-col-key]"));
    const currentKey = draggingKeyRef.current;
    if (!currentKey) return;

    let targetIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (clientY < midY) { targetIdx = i; break; }
    }
    if (targetIdx === -1) targetIdx = rows.length - 1;

    const currentIdx = rows.findIndex((r) => r.getAttribute("data-col-key") === currentKey);
    if (currentIdx === -1 || currentIdx === targetIdx) return;

    setLiveOrder((prevOrder) => {
      if (!prevOrder) return prevOrder;
      const locked = lockedColumnsRef.current;
      const reorderableKeys = prevOrder.filter((k) => !locked.includes(k));
      const lockedKeys = prevOrder.filter((k) => locked.includes(k));
      const sq = searchQueryRef.current;
      let filteredKeys = reorderableKeys;
      if (sq) {
        filteredKeys = reorderableKeys.filter((k) => {
          const col = columnsRef.current.find((c) => c.key === k);
          return col && col.label.toLowerCase().includes(sq.toLowerCase());
        });
      }
      const fromIdx = filteredKeys.indexOf(currentKey);
      if (fromIdx === -1) return prevOrder;
      const clampedTarget = Math.max(0, Math.min(targetIdx, filteredKeys.length - 1));
      if (fromIdx === clampedTarget) return prevOrder;
      if (sq) {
        const targetKey = filteredKeys[clampedTarget];
        const realFrom = reorderableKeys.indexOf(currentKey);
        const realTo = reorderableKeys.indexOf(targetKey);
        if (realFrom === -1 || realTo === -1) return prevOrder;
        const newReorderable = [...reorderableKeys];
        newReorderable.splice(realFrom, 1);
        newReorderable.splice(realTo, 0, currentKey);
        return [...lockedKeys, ...newReorderable];
      }
      const newReorderable = [...reorderableKeys];
      newReorderable.splice(fromIdx, 1);
      newReorderable.splice(clampedTarget, 0, currentKey);
      return [...lockedKeys, ...newReorderable];
    });
  }, []);

  /* ── Pointer-based drag logic ── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, key: string) => {
      if (searchQueryRef.current) return;
      if (lockedColumnsRef.current.includes(key)) return;
      e.preventDefault();
      e.stopPropagation();
      const row = rowRefs.current.get(key);
      if (!row) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDraggingKey(key);
      setLiveOrder(columnOrder);
      pointerYRef.current = e.clientY;
      startAutoScroll();

      const handleMove = (ev: PointerEvent) => {
        pointerYRef.current = ev.clientY;
        performReorder(ev.clientY);
      };
      const handleUp = () => {
        const finalOrder = liveOrderRef.current;
        if (finalOrder) {
          onColumnOrderChangeRef.current(finalOrder);
          saveColumnOrder(finalOrder);
        }
        setDraggingKey(null);
        setLiveOrder(null);
        stopAutoScroll();
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [columnOrder, startAutoScroll, stopAutoScroll, performReorder]
  );

  /* ── Disable text selection during drag ── */
  useEffect(() => {
    if (draggingKey) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
      return () => {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [draggingKey]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full border-l border-border bg-white flex flex-col shrink-0 overflow-hidden"
    >
      <div style={{ width: 280 }} className="flex flex-col h-full">
        {/* ── Header ── */}
        <div className="px-3.5 pt-3 pb-3 border-b border-border/50 shrink-0 bg-[#fafbfc]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: "#EDF4FF" }}
              >
                <Columns3 className="w-3.5 h-3.5" style={{ color: "#0A77FF" }} />
              </div>
              <span className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>
                Columns
              </span>
              <span
                className="inline-flex items-center text-[11px] tabular-nums px-2 py-[2px] rounded-full"
                style={{ fontWeight: 600, color: "#0A77FF", backgroundColor: "#EDF4FF" }}
              >
                {visibleCount}/{totalCount}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="Search columns…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-[30px] text-xs bg-white border-border/60 shadow-xs placeholder:text-muted-foreground/40 rounded-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/60 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={selectAll}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-md hover:bg-[#EDF4FF] transition-colors cursor-pointer"
              style={{ fontWeight: 500, color: "#0A77FF" }}
            >
              <Eye className="w-3 h-3" />
              Show All
            </button>
            <button
              onClick={deselectAll}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-md hover:bg-muted/60 text-muted-foreground transition-colors cursor-pointer"
              style={{ fontWeight: 500 }}
            >
              <EyeOff className="w-3 h-3" />
              Hide All
            </button>
            <div className="flex-1" />
            <button
              onClick={resetColumns}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-md hover:bg-muted/60 text-muted-foreground transition-colors cursor-pointer"
              style={{ fontWeight: 500 }}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* ── Column list ── */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide" ref={listRef}>
          {/* Pinned columns section */}
          {pinnedColumns.length > 0 && !searchQuery && (
            <>
              <div className="px-3.5 pt-2.5 pb-1">
                <span
                  className="text-[10px] uppercase tracking-widest text-muted-foreground/50"
                  style={{ fontWeight: 600 }}
                >
                  Pinned
                </span>
              </div>
              {pinnedColumns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center gap-2 px-2 py-[7px] mx-1.5 rounded-md select-none"
                >
                  <div
                    title="Pinned column — always visible"
                    className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-[#EDF4FF]"
                  >
                    <Eye className="w-3.5 h-3.5" style={{ color: "#0A77FF" }} />
                  </div>
                  <span
                    className="flex-1 text-[12.5px] text-foreground truncate"
                    style={{ fontWeight: 450 }}
                  >
                    {col.label}
                  </span>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                </div>
              ))}
              <div className="my-1 border-t border-border/30 mx-3.5" />
            </>
          )}

          {/* Reorderable columns section header */}
          {!searchQuery && (
            <div className="px-3.5 pt-2 pb-1">
              <span
                className="text-[10px] uppercase tracking-widest text-muted-foreground/50"
                style={{ fontWeight: 600 }}
              >
                Columns
              </span>
            </div>
          )}

          {searchQuery && reorderableColumns.length > 0 && (
            <div className="px-3.5 pt-2 pb-1">
              <span className="text-[11px] text-muted-foreground/50" style={{ fontWeight: 500 }}>
                {reorderableColumns.length} result{reorderableColumns.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {reorderableColumns.map((col, idx) => {
            const isVisible = col.visible;
            const isDragging = draggingKey === col.key;

            return (
              <div
                key={col.key}
                data-col-key={col.key}
                ref={(el) => {
                  if (el) rowRefs.current.set(col.key, el);
                  else rowRefs.current.delete(col.key);
                }}
                className="mx-1.5 select-none"
              >
                <div
                  className={`group/item flex items-center gap-2 px-2 py-[7px] rounded-md transition-all duration-150 ${
                    isDragging
                      ? "bg-[#0A77FF]/[0.04] border border-dashed border-[#0A77FF]/25 opacity-40 scale-[0.97]"
                      : "hover:bg-muted/30 border border-transparent"
                  }`}
                >
                  {/* Drag handle */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, col.key)}
                    className={`shrink-0 transition-all duration-150 touch-none ${
                      searchQuery
                        ? "opacity-0 w-0 overflow-hidden"
                        : isDragging
                          ? "opacity-100 cursor-grabbing"
                          : "opacity-0 group-hover/item:opacity-100 cursor-grab active:cursor-grabbing"
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </div>

                  {/* Visibility toggle — eye icon in a light blue rounded square */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(col.key)}
                    title={isVisible ? "Hide column" : "Show column"}
                    className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                      isVisible
                        ? "bg-[#EDF4FF] hover:bg-[#DBEAFE]"
                        : "bg-muted/40 hover:bg-muted/60"
                    }`}
                  >
                    {isVisible ? (
                      <Eye className="w-3.5 h-3.5" style={{ color: "#0A77FF" }} />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground/50" />
                    )}
                  </button>

                  {/* Label */}
                  <span
                    className={`flex-1 text-[12.5px] truncate transition-colors duration-100 ${
                      isVisible ? "text-foreground" : "text-muted-foreground/40"
                    }`}
                    style={{ fontWeight: isVisible ? 450 : 400 }}
                  >
                    {highlightMatch(col.label, searchQuery)}
                  </span>
                </div>
              </div>
            );
          })}

          {reorderableColumns.length === 0 && searchQuery && (
            <div className="px-4 py-8 text-center">
              <Search className="w-5 h-5 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground/50" style={{ fontWeight: 500 }}>
                No columns match "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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