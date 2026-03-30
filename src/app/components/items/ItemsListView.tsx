/**
 * Items Library — List View
 *
 * Full-page Items Library listing with:
 * - Sticky toolbar (ownership toggle, status tabs, search, column picker, view toggle)
 * - Comfort/Compact table with frozen first/last columns
 * - Grid view with image cards
 * - Pagination footer
 * - Image lightbox dialog
 * - Empty state
 * - Pattern C2 layout (pl-[88px] on xl)
 */

import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Columns3,
  Filter,
  LayoutGrid,
  List,
  AlignJustify,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Package,
  MoreHorizontal,
} from "lucide-react";
import {
  SAMPLE_ITEMS,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  STATUS_COLORS,
  type Item,
  type ItemStatus,
  type ItemCategory,
} from "./items-data";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ColumnHeaderMenu } from "./ColumnHeaderMenu";
import { NotionFilterBar, type ColumnFilterMap } from "./NotionFilterBar";
import type { ColumnDef } from "./items-types";
export type { ColumnDef };

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: "name", label: "Description", visible: true, required: true, width: 240, minWidth: 160 },
  { key: "sku", label: "Part Number", visible: true, width: 140, minWidth: 100 },
  { key: "category", label: "Category", visible: true, width: 150, minWidth: 100 },
  { key: "status", label: "Status", visible: true, width: 110, minWidth: 80 },
  { key: "uom", label: "UoM", visible: true, width: 80, minWidth: 60 },
  { key: "unitPrice", label: "Unit Price", visible: true, width: 110, minWidth: 80 },
  { key: "stockQty", label: "Stock Qty", visible: true, width: 100, minWidth: 70 },
  { key: "supplier", label: "Supplier", visible: true, width: 160, minWidth: 120 },
  { key: "updatedAt", label: "Updated", visible: true, width: 110, minWidth: 90 },
];

type ViewMode = "comfort" | "compact" | "grid";
type SortField = keyof Item;
type SortDir = "asc" | "desc";

/* ═══════════════════════════════════════════════
   Helper: Search highlight
   ═══════════════════════════════════════════════ */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ backgroundColor: "var(--highlight-bg)", borderRadius: 2, padding: "0 1px" }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   DnD Column Item for Column Picker
   ═══════════════════════════════════════════════ */

const COLUMN_DND_TYPE = "COLUMN_ITEM";

function DraggableColumnItem({
  col,
  index,
  moveColumn,
  toggleVisible,
}: {
  col: ColumnDef;
  index: number;
  moveColumn: (from: number, to: number) => void;
  toggleVisible: (key: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: COLUMN_DND_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: COLUMN_DND_TYPE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIdx = item.index;
      const hoverIdx = index;
      if (dragIdx === hoverIdx) return;
      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;
      if (dragIdx < hoverIdx && hoverClientY < hoverMiddleY) return;
      if (dragIdx > hoverIdx && hoverClientY > hoverMiddleY) return;
      moveColumn(dragIdx, hoverIdx);
      item.index = hoverIdx;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="flex items-center gap-2 px-3 py-[6px] cursor-grab select-none"
      style={{
        opacity: isDragging ? 0.4 : 1,
        borderColor: "var(--border-subtle)",
        borderBottomWidth: 1,
        borderBottomStyle: "solid" as const,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <GripVertical size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
      <span
        className="flex-1 text-[13px] leading-[1.4]"
        style={{
          color: col.visible ? "var(--text-strong)" : "var(--text-subtle)",
          fontWeight: "var(--font-weight-normal)" as any,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {col.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!col.required) toggleVisible(col.key);
        }}
        className="p-[2px]"
        style={{ color: col.visible ? "var(--primary)" : "var(--text-disabled)" }}
        disabled={col.required}
      >
        {col.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Status Badge
   ═══════════════════════════════════════════════ */

function StatusBadge({ status }: { status: ItemStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[8px] py-[2px] text-[12px] leading-[1.4]"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderRadius: "var(--radius-sm)",
        fontWeight: "var(--font-weight-medium)" as any,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   Image Lightbox
   ═══════════════════════════════════════════════ */

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--overlay-heavy)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-[600px] w-full overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "var(--overlay-backdrop)",
            color: "var(--primary-foreground)",
          }}
        >
          <X size={14} />
        </button>
        <ImageWithFallback src={src} alt={alt} className="w-full h-auto max-h-[70vh] object-contain" />
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <span
            className="text-[13px] leading-[1.4]"
            style={{ color: "var(--text-strong)", fontWeight: "var(--font-weight-medium)" as any, fontFamily: "'Inter', sans-serif" }}
          >
            {alt}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

export function ItemsListView() {
  /* State */
  const [ownership, setOwnership] = useState<"All Items" | "My Items">("All Items");
  const [statusFilter, setStatusFilter] = useState<ItemStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<Set<ItemCategory>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("comfort");
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_COLUMNS.map((c) => c.key));
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [colPickerOpen, setColPickerOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<Item | null>(null);
  const [columnFilterMap, setColumnFilterMap] = useState<ColumnFilterMap>({});
  const [frozenColumns, setFrozenColumns] = useState<Set<string>>(new Set(["name"]));
  const [openHeaderMenu, setOpenHeaderMenu] = useState<string | null>(null);
  const [headerMenuAnchor, setHeaderMenuAnchor] = useState<DOMRect | null>(null);

  /* Derived: counts */
  const allItems = SAMPLE_ITEMS;
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { All: allItems.length };
    for (const s of ITEM_STATUSES) c[s] = 0;
    for (const item of allItems) {
      if (ownership !== "All Items" && item.owner !== ownership) continue;
      c[item.status]++;
    }
    // Recount "All" based on ownership
    c["All"] = ownership === "All Items" ? allItems.length : allItems.filter((i) => i.owner === ownership).length;
    return c;
  }, [allItems, ownership]);

  /* Filtering */
  const filteredItems = useMemo(() => {
    let result = allItems;

    if (ownership !== "All Items") result = result.filter((i) => i.owner === ownership);
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    if (categoryFilters.size > 0) result = result.filter((i) => categoryFilters.has(i.category));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q)
      );
    }
    // Apply column-level filters
    for (const [colKey, selectedValues] of Object.entries(columnFilterMap)) {
      if (selectedValues.size > 0) {
        result = result.filter((item) => {
          const val = String((item as any)[colKey] ?? "");
          return selectedValues.has(val);
        });
      }
    }
    return result;
  }, [allItems, ownership, statusFilter, categoryFilters, searchQuery, columnFilterMap]);

  /* Sorting */
  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const av = a[sort.field];
      const bv = b[sort.field];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
    return arr;
  }, [filteredItems, sort]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = sortedItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const rangeStart = sortedItems.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, sortedItems.length);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, safePage - Math.floor(max / 2));
    let end = start + max - 1;
    if (end > totalPages) { end = totalPages; start = Math.max(1, end - max + 1); }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  /* Handlers */
  const handleSort = useCallback((field: SortField) => {
    setSort((prev) => (prev.field === field ? { field, dir: prev.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" }));
  }, []);

  const toggleColumnVisible = useCallback((key: string) => {
    setColumns((prev) => prev.map((c) => (c.key === key && !c.required ? { ...c, visible: !c.visible } : c)));
  }, []);

  const moveColumn = useCallback((from: number, to: number) => {
    setColumnOrder((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }, []);

  const toggleCategory = useCallback((cat: ItemCategory) => {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter(null);
    setCategoryFilters(new Set());
    setPage(1);
  }, []);

  const hasFilters = searchQuery || statusFilter || categoryFilters.size > 0;

  /* Visible columns in order */
  const visibleColumns = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.key, c]));
    return columnOrder.map((k) => colMap.get(k)).filter((c): c is ColumnDef => !!c && c.visible);
  }, [columns, columnOrder]);

  const orderedColumnsForPicker = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.key, c]));
    return columnOrder.map((k) => colMap.get(k)!).filter(Boolean);
  }, [columns, columnOrder]);

  /* Unique values per column for the filter dropdowns */
  const uniqueValuesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of columns) {
      const vals = new Set<string>();
      for (const item of allItems) {
        const v = String((item as any)[col.key] ?? "");
        if (v) vals.add(v);
      }
      map[col.key] = [...vals].sort();
    }
    return map;
  }, [allItems, columns]);

  /* Header menu handler */
  const handleHeaderClick = useCallback((colKey: string, e: React.MouseEvent<HTMLTableCellElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenHeaderMenu(colKey);
    setHeaderMenuAnchor(rect);
  }, []);

  const handleColumnFilterChange = useCallback((colKey: string, values: Set<string>) => {
    setColumnFilterMap((prev) => {
      const next = { ...prev };
      if (values.size === 0) {
        delete next[colKey];
      } else {
        next[colKey] = values;
      }
      return next;
    });
    setPage(1);
  }, []);

  const handleRemoveColumnFilter = useCallback((colKey: string) => {
    setColumnFilterMap((prev) => {
      const next = { ...prev };
      delete next[colKey];
      return next;
    });
    setPage(1);
  }, []);

  const handleAddFilter = useCallback((colKey: string) => {
    // Open the header menu for this column — we need to find its position
    // For simplicity, we just open the menu at a default position
    setOpenHeaderMenu(colKey);
    // Set a rough anchor position from the filter bar
    setHeaderMenuAnchor(new DOMRect(200, 200, 100, 30));
  }, []);

  const toggleFreezeColumn = useCallback((colKey: string) => {
    setFrozenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colKey)) {
        next.delete(colKey);
      } else {
        next.add(colKey);
      }
      return next;
    });
  }, []);

  const hasColumnFilters = Object.keys(columnFilterMap).some((k) => columnFilterMap[k]?.size > 0);

  /* ═══════════════════════════════════════════════
     Render
     ═════��═════════════════════════════════════════ */

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ backgroundColor: "var(--secondary)" }}>
        {/* Pattern C2: full-width with sidebar offset */}
        <div className="w-full">
          {/* ── MODULE HEADER ── */}
          <div style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
            <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between xl:p-6">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--primary-surface)",
                    border: "1px solid var(--primary-border)",
                  }}
                >
                  <Package size={18} style={{ color: "var(--primary-soft)" }} />
                </div>
                <div className="min-w-0">
                  <h4 className="leading-[1.4]" style={{ color: "var(--foreground)", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    Items Library
                  </h4>
                  <p className="mt-[2px] text-[13px] leading-[1.4]" style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: "var(--font-weight-normal)" as any }}>
                      Manage inventory items and materials.{" "}
                    </span>
                    <span style={{ color: "var(--text-strong)", fontWeight: "var(--font-weight-medium)" as any }}>
                      {filteredItems.length} of {allItems.length} items
                    </span>
                  </p>
                </div>
              </div>
              {/* Ownership toggle */}
              <div
                className="flex items-center shrink-0 p-[3px]"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                {(["All Items", "My Items"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => { setOwnership(o); setPage(1); }}
                    className="px-3 py-[5px] text-[13px] leading-[1.3] transition-colors"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      fontFamily: "'Inter', sans-serif",
                      backgroundColor: ownership === o ? "var(--card)" : "transparent",
                      color: ownership === o ? "var(--text-strong)" : "var(--text-muted)",
                      boxShadow: "none",
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── STICKY TOOLBAR ── */}
          <div
            className="sticky top-0 z-30"
            style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex flex-col gap-3 p-3 xl:p-4">
              {/* Row 1: Status tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <TabButton
                  label="All"
                  count={statusCounts["All"]}
                  active={statusFilter === null}
                  onClick={() => { setStatusFilter(null); setPage(1); }}
                />
                {ITEM_STATUSES.map((s) => (
                  <TabButton
                    key={s}
                    label={s}
                    count={statusCounts[s]}
                    active={statusFilter === s}
                    color={STATUS_COLORS[s].dot}
                    onClick={() => { setStatusFilter(statusFilter === s ? null : s); setPage(1); }}
                  />
                ))}
              </div>

              {/* Row 2: Search + tools */}
              <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-[360px]">
                  <Search
                    size={15}
                    className="absolute left-[10px] top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-subtle)" }}
                  />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    className="w-full text-[13px] outline-none"
                    style={{
                      padding: "7px 12px 7px 32px",
                      backgroundColor: "var(--input-background)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--foreground)",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: "var(--font-weight-normal)" as any,
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); setPage(1); }}
                      className="absolute right-[8px] top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Tool buttons */}
                <div className="flex items-center gap-[6px]">
                  {/* Filter button */}
                  <ToolButton
                    icon={<Filter size={15} />}
                    label="Filter"
                    active={filterPanelOpen || categoryFilters.size > 0}
                    badge={categoryFilters.size > 0 ? categoryFilters.size : undefined}
                    onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                  />
                  {/* Column picker */}
                  <div className="relative">
                    <ToolButton
                      icon={<Columns3 size={15} />}
                      label="Columns"
                      active={colPickerOpen}
                      onClick={() => setColPickerOpen(!colPickerOpen)}
                    />
                    {colPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setColPickerOpen(false)} />
                        <div
                          className="absolute right-0 top-full mt-1 z-50 w-[220px] overflow-hidden"
                          style={{
                            backgroundColor: "var(--popover)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                          }}
                        >
                          <div
                            className="px-3 py-[8px] text-[11px] uppercase tracking-[0.05em]"
                            style={{
                              color: "var(--text-subtle)",
                              fontWeight: "var(--font-weight-medium)" as any,
                              fontFamily: "'Inter', sans-serif",
                              borderColor: "var(--border-subtle)",
                              borderBottomWidth: 1,
                              borderBottomStyle: "solid" as const,
                            }}
                          >
                            Manage Columns
                          </div>
                          <div className="max-h-[280px] overflow-y-auto scrollbar-overlay">
                            {orderedColumnsForPicker.map((col, i) => (
                              <DraggableColumnItem
                                key={col.key}
                                col={col}
                                index={i}
                                moveColumn={moveColumn}
                                toggleVisible={toggleColumnVisible}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Divider */}
                  <div style={{ width: 1, height: 24, backgroundColor: "var(--border)" }} />
                  {/* View mode toggle */}
                  <div
                    className="flex items-center p-[2px]"
                    style={{
                      backgroundColor: "var(--surface-raised)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {([
                      { mode: "comfort" as ViewMode, icon: <AlignJustify size={14} />, tip: "Comfort" },
                      { mode: "compact" as ViewMode, icon: <List size={14} />, tip: "Compact" },
                      { mode: "grid" as ViewMode, icon: <LayoutGrid size={14} />, tip: "Grid" },
                    ]).map(({ mode, icon, tip }) => (
                      <button
                        key={mode}
                        title={tip}
                        onClick={() => setViewMode(mode)}
                        className="flex items-center justify-center p-[5px] transition-colors"
                        style={{
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: viewMode === mode ? "var(--card)" : "transparent",
                          color: viewMode === mode ? "var(--primary)" : "var(--text-muted)",
                          boxShadow: "none",
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[12px] leading-[1.3] px-2 py-1"
                      style={{
                        color: "var(--primary)",
                        fontWeight: "var(--font-weight-medium)" as any,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Filter panel (faceted) */}
              {filterPanelOpen && (
                <div
                  className="flex flex-wrap gap-2 p-3"
                  style={{
                    backgroundColor: "var(--surface-raised)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    className="text-[11px] uppercase tracking-[0.05em] self-center mr-1"
                    style={{
                      color: "var(--text-subtle)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Category:
                  </span>
                  {ITEM_CATEGORIES.map((cat) => {
                    const active = categoryFilters.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="px-[10px] py-[4px] text-[12px] leading-[1.3] transition-colors"
                        style={{
                          borderRadius: "var(--radius-sm)",
                          fontWeight: "var(--font-weight-medium)" as any,
                          fontFamily: "'Inter', sans-serif",
                          backgroundColor: active ? "var(--primary-surface)" : "var(--card)",
                          color: active ? "var(--primary-text-strong)" : "var(--text-default)",
                          border: `1px solid ${active ? "var(--primary-border)" : "var(--border)"}`,
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active filter chips */}
              {hasFilters && (
                <div className="flex flex-wrap items-center gap-[6px]">
                  {statusFilter && (
                    <FilterChip label={statusFilter} onRemove={() => { setStatusFilter(null); setPage(1); }} />
                  )}
                  {[...categoryFilters].map((c) => (
                    <FilterChip key={c} label={c} onRemove={() => toggleCategory(c)} />
                  ))}
                  {searchQuery && (
                    <FilterChip label={`"${searchQuery}"`} onRemove={() => { setSearchQuery(""); setPage(1); }} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div className="p-3 xl:p-4">
            <div
              className="overflow-hidden"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}
            >
              {/* Table toolbar */}
              <div
                className="flex items-center justify-between px-4 py-[8px]"
                style={{
                  backgroundColor: "var(--secondary)",
                  borderColor: "var(--border-subtle)",
                  borderBottomWidth: 1,
                  borderBottomStyle: "solid" as const,
                }}
              >
                <span
                  className="text-[12px] leading-none"
                  style={{
                    fontWeight: "var(--font-weight-normal)" as any,
                    color: "var(--text-subtle)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                  {hasFilters || hasColumnFilters ? " filtered" : ""}
                </span>
              </div>

              {/* Notion-style Filter Bar */}
              {hasColumnFilters && (
                <NotionFilterBar
                  columns={columns}
                  columnFilters={columnFilterMap}
                  uniqueValuesMap={uniqueValuesMap}
                  onRemoveFilter={handleRemoveColumnFilter}
                  onOpenColumnFilter={(colKey) => {
                    setOpenHeaderMenu(colKey);
                    setHeaderMenuAnchor(new DOMRect(300, 200, 100, 30));
                  }}
                  onAddFilter={handleAddFilter}
                />
              )}

              {/* Table or Grid */}
              {viewMode === "grid" ? (
                <GridView
                  items={pagedItems}
                  searchQuery={searchQuery}
                  onImageClick={(item) => item.imageUrl && setLightboxItem(item)}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {visibleColumns.map((col) => {
                          const isFrozen = frozenColumns.has(col.key);
                          const hasActiveFilter = columnFilterMap[col.key]?.size > 0;
                          return (
                            <th
                              key={col.key}
                              onClick={(e) => handleHeaderClick(col.key, e)}
                              className="text-left cursor-pointer select-none"
                              style={{
                                padding: viewMode === "compact" ? "6px 12px" : "10px 16px",
                                width: col.width,
                                minWidth: col.minWidth,
                                fontFamily: "'Inter', sans-serif",
                                ...(isFrozen
                                  ? {
                                      position: "sticky" as const,
                                      left: 0,
                                      zIndex: 2,
                                      backgroundColor: "var(--secondary)",
                                    }
                                  : { backgroundColor: "var(--secondary)" }),
                              }}
                            >
                              <div className="flex items-center gap-[4px]">
                                <span
                                  className="text-[11px] uppercase tracking-[0.05em]"
                                  style={{
                                    color: hasActiveFilter ? "var(--primary)" : "var(--text-subtle)",
                                    fontWeight: "var(--font-weight-medium)" as any,
                                    fontFamily: "'Inter', sans-serif",
                                  }}
                                >
                                  {col.label}
                                </span>
                                {hasActiveFilter && (
                                  <span
                                    className="text-[9px] leading-none px-[3px] py-[1px]"
                                    style={{
                                      borderRadius: 3,
                                      backgroundColor: "var(--primary-surface-strong)",
                                      color: "var(--primary-text-strong)",
                                      fontWeight: "var(--font-weight-medium)" as any,
                                      fontFamily: "'Inter', sans-serif",
                                    }}
                                  >
                                    {columnFilterMap[col.key].size}
                                  </span>
                                )}
                                {sort.field === col.key ? (
                                  sort.dir === "asc" ? (
                                    <ChevronUp size={12} style={{ color: "var(--primary)" }} />
                                  ) : (
                                    <ChevronDown size={12} style={{ color: "var(--primary)" }} />
                                  )
                                ) : (
                                  <ChevronDown size={11} style={{ color: "var(--text-disabled)" }} />
                                )}
                              </div>
                            </th>
                          );
                        })}
                        {/* Actions column — frozen right */}
                        <th
                          style={{
                            position: "sticky",
                            right: 0,
                            zIndex: 2,
                            backgroundColor: "var(--secondary)",
                            width: 50,
                            padding: viewMode === "compact" ? "6px 12px" : "10px 16px",
                          }}
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {pagedItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={visibleColumns.length + 1}
                            className="text-center"
                            style={{
                              padding: "48px 20px",
                              color: "var(--text-muted)",
                              fontWeight: "var(--font-weight-normal)" as any,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Package size={32} style={{ color: "var(--text-disabled)" }} />
                              <span className="text-[14px]">No items match your filters.</span>
                              {hasFilters && (
                                <button
                                  onClick={clearFilters}
                                  className="text-[13px] mt-1"
                                  style={{
                                    color: "var(--primary)",
                                    fontWeight: "var(--font-weight-medium)" as any,
                                    fontFamily: "'Inter', sans-serif",
                                  }}
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pagedItems.map((item) => (
                          <tr
                            key={item.id}
                            className="group cursor-pointer transition-colors"
                            style={{ borderColor: "var(--border-subtle)", borderBottomWidth: 1, borderBottomStyle: "solid" as const }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                          >
                            {visibleColumns.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  padding: viewMode === "compact" ? "5px 12px" : "10px 16px",
                                  fontFamily: "'Inter', sans-serif",
                                  ...(frozenColumns.has(col.key)
                                    ? {
                                        position: "sticky" as const,
                                        left: 0,
                                        zIndex: 1,
                                        backgroundColor: "inherit",
                                      }
                                    : {}),
                                }}
                              >
                                <CellContent
                                  item={item}
                                  colKey={col.key}
                                  searchQuery={searchQuery}
                                  compact={viewMode === "compact"}
                                  onImageClick={() => item.imageUrl && setLightboxItem(item)}
                                />
                              </td>
                            ))}
                            {/* Actions */}
                            <td
                              style={{
                                position: "sticky",
                                right: 0,
                                zIndex: 1,
                                backgroundColor: "inherit",
                                padding: viewMode === "compact" ? "5px 12px" : "10px 16px",
                              }}
                            >
                              <button
                                className="p-1"
                                style={{ color: "var(--text-subtle)" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── PAGINATION ── */}
              <div
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  backgroundColor: "var(--secondary)",
                  borderTop: "1px solid var(--border)",
                  padding: "10px 16px",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[12px] leading-none"
                    style={{
                      fontWeight: "var(--font-weight-normal)" as any,
                      color: "var(--text-muted)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Page Size:
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="text-[12px] cursor-pointer outline-none"
                    style={{
                      fontWeight: "var(--font-weight-medium)" as any,
                      color: "var(--text-strong)",
                      padding: "3px 6px",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--card)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[12px] leading-none hidden sm:inline"
                    style={{
                      fontWeight: "var(--font-weight-normal)" as any,
                      color: "var(--text-muted)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {rangeStart}–{rangeEnd} of {sortedItems.length}
                  </span>
                  <div className="flex items-center gap-[2px]">
                    <PageBtn disabled={safePage <= 1} onClick={() => setPage(1)}>
                      <ChevronsLeft size={13} />
                    </PageBtn>
                    <PageBtn disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft size={13} />
                    </PageBtn>
                    {pageNumbers.map((n) => (
                      <PageBtn key={n} active={n === safePage} onClick={() => setPage(n)}>
                        {n}
                      </PageBtn>
                    ))}
                    <PageBtn disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      <ChevronRight size={13} />
                    </PageBtn>
                    <PageBtn disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>
                      <ChevronsRight size={13} />
                    </PageBtn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notion-style Column Header Menu */}
      {openHeaderMenu && (() => {
        const col = columns.find((c) => c.key === openHeaderMenu);
        if (!col) return null;
        return (
          <ColumnHeaderMenu
            columnKey={col.key}
            columnLabel={col.label}
            uniqueValues={uniqueValuesMap[col.key] || []}
            activeFilter={columnFilterMap[col.key] || new Set()}
            sortField={sort.field}
            sortDir={sort.dir}
            isFrozen={frozenColumns.has(col.key)}
            canHide={!col.required}
            onSort={(dir) => {
              setSort({ field: col.key as SortField, dir });
            }}
            onFilterChange={(values) => handleColumnFilterChange(col.key, values)}
            onHide={() => toggleColumnVisible(col.key)}
            onToggleFreeze={() => toggleFreezeColumn(col.key)}
            onClose={() => {
              setOpenHeaderMenu(null);
              setHeaderMenuAnchor(null);
            }}
            anchorRect={headerMenuAnchor}
          />
        );
      })()}

      {/* Lightbox */}
      {lightboxItem?.imageUrl && (
        <ImageLightbox src={lightboxItem.imageUrl} alt={lightboxItem.name} onClose={() => setLightboxItem(null)} />
      )}
    </DndProvider>
  );
}

/* ═══════════════════════════════════════════════
   Cell Content renderer
   ═══════════════════════════════════════════════ */

function CellContent({
  item,
  colKey,
  searchQuery,
  compact,
  onImageClick,
}: {
  item: Item;
  colKey: string;
  searchQuery: string;
  compact: boolean;
  onImageClick: () => void;
}) {
  const textStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: compact ? 12 : 13,
    lineHeight: "1.4",
  };

  switch (colKey) {
    case "name":
      return (
        <div className="flex items-center gap-[8px]">
          {item.imageUrl && !compact && (
            <div
              className="shrink-0 overflow-hidden cursor-pointer"
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
              onClick={(e) => { e.stopPropagation(); onImageClick(); }}
            >
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <span style={{ ...textStyle, color: "var(--text-strong)", fontWeight: "var(--font-weight-medium)" as any }}>
              <HighlightText text={item.name} query={searchQuery} />
            </span>
            {!compact && (
              <div className="text-[11px] leading-[1.3] mt-[1px] truncate" style={{ color: "var(--text-base-second)", fontFamily: "'Inter', sans-serif" }}>
                <HighlightText text={item.description} query={searchQuery} />
              </div>
            )}
          </div>
        </div>
      );
    case "sku":
      return (
        <span
          className="font-mono"
          style={{ ...textStyle, color: "var(--text-base-second)", fontWeight: "var(--font-weight-normal)" as any }}
        >
          <HighlightText text={item.sku} query={searchQuery} />
        </span>
      );
    case "category":
      return (
        <span
          className="px-[6px] py-[1px] text-[11px] leading-[1.4]"
          style={{
            backgroundColor: "var(--surface-raised)",
            color: "var(--text-default)",
            borderRadius: "var(--radius-sm)",
            fontWeight: "var(--font-weight-medium)" as any,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {item.category}
        </span>
      );
    case "status":
      return <StatusBadge status={item.status} />;
    case "uom":
      return <span style={{ ...textStyle, color: "var(--text-default)" }}>{item.uom}</span>;
    case "unitPrice":
      return (
        <span style={{ ...textStyle, color: "var(--text-strong)", fontWeight: "var(--font-weight-medium)" as any }}>
          ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    case "stockQty": {
      const isLow = item.stockQty > 0 && item.stockQty <= item.reorderLevel;
      return (
        <span
          style={{
            ...textStyle,
            color: item.stockQty === 0 ? "var(--destructive)" : isLow ? "var(--chart-3)" : "var(--text-strong)",
            fontWeight: "var(--font-weight-medium)" as any,
          }}
        >
          {item.stockQty.toLocaleString()}
        </span>
      );
    }
    case "supplier":
      return (
        <span style={{ ...textStyle, color: "var(--text-default)", fontWeight: "var(--font-weight-normal)" as any }}>
          <HighlightText text={item.supplier} query={searchQuery} />
        </span>
      );
    case "updatedAt":
      return <span style={{ ...textStyle, color: "var(--text-muted)", fontWeight: "var(--font-weight-normal)" as any }}>{item.updatedAt}</span>;
    default:
      return <span style={textStyle}>{String((item as any)[colKey] ?? "")}</span>;
  }
}

/* ═══════════════════════════════════════════════
   Grid View
   ═══════════════════════════════════════════════ */

function GridView({
  items,
  searchQuery,
  onImageClick,
}: {
  items: Item[];
  searchQuery: string;
  onImageClick: (item: Item) => void;
}) {
  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2"
        style={{ padding: "48px 20px", color: "var(--text-muted)" }}
      >
        <Package size={32} style={{ color: "var(--text-disabled)" }} />
        <span className="text-[14px]" style={{ fontFamily: "'Inter', sans-serif" }}>
          No items match your filters.
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden group cursor-pointer transition-shadow"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          {/* Image */}
          <div
            className="relative overflow-hidden"
            style={{
              height: 140,
              backgroundColor: "var(--surface-raised)",
            }}
            onClick={() => onImageClick(item)}
          >
            {item.imageUrl ? (
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={36} style={{ color: "var(--text-disabled)" }} />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* Info */}
          <div className="p-3" style={{ borderColor: "var(--border-subtle)", borderTopWidth: 1, borderTopStyle: "solid" as const }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span
                  className="text-[13px] leading-[1.4] block truncate"
                  style={{
                    color: "var(--text-strong)",
                    fontWeight: "var(--font-weight-medium)" as any,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <HighlightText text={item.name} query={searchQuery} />
                </span>
                <span
                  className="text-[11px] leading-[1.3] block mt-[2px] font-mono"
                  style={{ color: "var(--text-base-second)", fontFamily: "'Inter', sans-serif" }}
                >
                  {item.sku}
                </span>
              </div>
              <span
                className="text-[13px] leading-[1.3] shrink-0"
                style={{
                  color: "var(--text-strong)",
                  fontWeight: "var(--font-weight-semibold)" as any,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span
                className="px-[6px] py-[1px] text-[10px] leading-[1.4]"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  color: "var(--text-default)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {item.category}
              </span>
              <span
                className="text-[11px] leading-[1.3]"
                style={{
                  color: item.stockQty === 0 ? "var(--destructive)" : "var(--text-muted)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {item.stockQty.toLocaleString()} {item.uom}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Subcomponents
   ═══════════════════════════════════════════════ */

function TabButton({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[5px] px-[10px] py-[5px] text-[12px] leading-[1.3] whitespace-nowrap transition-colors shrink-0"
      style={{
        borderRadius: "var(--radius-sm)",
        fontWeight: "var(--font-weight-medium)" as any,
        fontFamily: "'Inter', sans-serif",
        backgroundColor: active ? "var(--primary-surface)" : "transparent",
        color: active ? "var(--primary-text-strong)" : "var(--text-muted)",
        border: active ? "1px solid var(--primary-border)" : "1px solid transparent",
      }}
    >
      {color && <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />}
      {label}
      <span
        className="text-[10px] leading-none px-[4px] py-[1px]"
        style={{
          borderRadius: 3,
          backgroundColor: active ? "var(--primary-surface-strong)" : "var(--surface-raised)",
          color: active ? "var(--primary-text-strong)" : "var(--text-subtle)",
          fontWeight: "var(--font-weight-medium)" as any,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function ToolButton({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[4px] px-[8px] py-[5px] text-[12px] leading-[1.3] transition-colors"
      style={{
        borderRadius: "var(--radius-sm)",
        fontWeight: "var(--font-weight-medium)" as any,
        fontFamily: "'Inter', sans-serif",
        backgroundColor: active ? "var(--primary-surface)" : "var(--card)",
        color: active ? "var(--primary-text-strong)" : "var(--text-default)",
        border: `1px solid ${active ? "var(--primary-border)" : "var(--border)"}`,
      }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
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
          {badge}
        </span>
      )}
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-[4px] pl-[8px] pr-[5px] py-[3px] text-[11px] leading-[1.3]"
      style={{
        backgroundColor: "var(--primary-surface)",
        color: "var(--primary-text-strong)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--primary-border)",
        fontWeight: "var(--font-weight-medium)" as any,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {label}
      <button onClick={onRemove} className="p-[1px]" style={{ color: "var(--primary-icon)" }}>
        <X size={11} />
      </button>
    </span>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center text-[12px] leading-none transition-colors"
      style={{
        minWidth: 28,
        height: 28,
        borderRadius: "var(--radius-sm)",
        fontWeight: "var(--font-weight-medium)" as any,
        fontFamily: "'Inter', sans-serif",
        backgroundColor: active ? "var(--primary)" : "transparent",
        color: active ? "var(--primary-foreground)" : disabled ? "var(--text-disabled)" : "var(--text-default)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}