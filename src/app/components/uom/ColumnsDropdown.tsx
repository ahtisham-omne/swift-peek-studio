/**
 * UOM Module — Column Manager
 *
 * Unified panel managing column visibility and ordering
 * with smooth pointer-based drag-and-drop via window listeners.
 * Design matches the Partners ColumnSelector exactly.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
          style={{ backgroundColor: "var(--accent)", color: "var(--primary)", fontWeight: 600 }}
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  open,
  onOpenChange,
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
    <div
      className="h-full border-l border-border bg-white flex flex-col shrink-0 overflow-hidden transition-all duration-200 ease-in-out"
      style={{
        width: open ? 280 : 0,
        minWidth: open ? 280 : 0,
        opacity: open ? 1 : 0,
        borderLeftWidth: open ? 1 : 0,
      }}
    >
      <div style={{ width: 280 }} className="flex flex-col h-full">
        {/* ── Header ── */}
        <div className="px-3.5 pt-3 pb-3 border-b border-border/50 shrink-0 bg-[#fafbfc]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Columns3 className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
              </div>
              <span className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>
                Columns
              </span>
              <span
                className="inline-flex items-center text-[11px] tabular-nums px-2 py-[2px] rounded-full"
                style={{ fontWeight: 600, color: "var(--primary)", backgroundColor: "var(--accent)" }}
              >
                {visibleCount}/{totalCount}
              </span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
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
              className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-md hover:bg-accent transition-colors cursor-pointer"
              style={{ fontWeight: 500, color: "var(--primary)" }}
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
                    className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-accent"
                  >
                    <Eye className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
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
                      ? "bg-primary/[0.04] border border-dashed border-primary/25 opacity-40 scale-[0.97]"
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
                        ? "bg-accent hover:bg-blue-100"
                        : "bg-muted/40 hover:bg-muted/60"
                    }`}
                  >
                    {isVisible ? (
                      <Eye className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
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
    </div>
  );
}
