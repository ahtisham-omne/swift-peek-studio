/**
 * UOM Module — Unit Conversions Table (List View)
 *
 * Full-page view composing all atomic components.
 * All colors use CSS custom properties from theme.css.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableRow as ShadcnTR, TableCell as ShadcnTD } from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { UOM_CATEGORIES, type UomCategory } from "./CategoryBadge";
import { FilterPill } from "./FilterPill";
import { User } from "lucide-react";
import {
  ColumnsDropdown,
  ColumnsSidePanel,
  DEFAULT_COLUMNS,
  loadColumns,
  saveColumns,
  loadColumnOrder,
  saveColumnOrder,
  type ColumnDef,
} from "./ColumnsDropdown";
import {
  TableHeaderRow,
  TableRow,
  getOrderedVisibleKeys,
  type ActiveSort,
  type SortField,
} from "./TableRow";
import { SAMPLE_UNITS, type UomUnit } from "./sample-data";
import { CreateUomModal } from "./CreateUomModal";
import { ImportUomModal } from "./ImportUomModal";
import { useToast } from "./Toast";
import { DensityDropdown, type DensityMode } from "./DensityDropdown";
import { UomColumnHeaderMenu } from "./UomColumnHeaderMenu";
import { UomNotionFilterBar, type ColumnFilterMap } from "./UomNotionFilterBar";
import {
  Plus,
  SlidersHorizontal,
  AlertTriangle,
  Archive,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Package,
  Ruler,
  BarChart3,
  GripVertical,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BulkActionsBar } from "./BulkActionsBar";
import {
  useColumnReorder,
  ColumnDragPreview,
  type DragColumnDef,
} from "./DraggableColumnSystem";
import { UomCardGrid } from "./UomCardGrid";
import {
  UomFiltersModal,
  type UomAdvancedFilters,
  DEFAULT_UOM_FILTERS,
  countActiveUomFilters,
  applyAdvancedFilters,
} from "./UomFiltersModal";
import {
  UomKpiInsightsPanel,
  ALL_UOM_KPI_DEFINITIONS,
  DEFAULT_UOM_ACTIVE_KPIS,
  computeUomKpiValue,
} from "./UomKpiInsightsPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Check } from "lucide-react";

const ARCHIVE_BLOCKING_REFERENCES = [
  {
    label: "Items",
    entries: ["STL-FLAT-48", "CAB-REEL-12", "BALE-500"],
  },
  {
    label: "Purchase orders",
    entries: ["PO-10428", "PO-10431", "PO-10444", "PO-10452"],
  },
  {
    label: "BOMs",
    entries: ["BOM-882", "BOM-901", "BOM-944"],
  },
];

/* ═══════════════════════════════════════════════
   Filter state types
   ═══════════════════════════════════════════════ */

export interface Filters {
  search: string;
  type: "Standard" | "Custom" | null;
  inUse: boolean | null;
  categories: Set<UomCategory>;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  type: null,
  inUse: null,
  categories: new Set(),
};

const INITIAL_FILTERS: Filters = {
  search: "",
  type: null,
  inUse: null,
  categories: new Set<UomCategory>(),
};

function hasActiveFilters(f: Filters): boolean {
  return (
    f.search.length > 0 ||
    f.type !== null ||
    f.inUse !== null ||
    f.categories.size > 0
  );
}

/* ══════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════ */

export interface UomListViewProps {
  initialFilters?: Filters;
  dropdownsClosed?: boolean;
}

export function UomListView({
  initialFilters = INITIAL_FILTERS,
  dropdownsClosed = false,
}: UomListViewProps = {}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sort, setSort] = useState<ActiveSort>({
    field: "name",
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [columns, setColumns] = useState<ColumnDef[]>(() => loadColumns());
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    return loadColumnOrder() ?? DEFAULT_COLUMNS.map((c) => c.key);
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [density, setDensity] = useState<DensityMode>("condensed");
  const [topBarSearch, setTopBarSearch] = useState("");

  /* ── KPI Insights state ── */
  const [activeKpis, setActiveKpis] = useState<string[]>([...DEFAULT_UOM_ACTIVE_KPIS]);
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(false);
  const [insightsDateRange, setInsightsDateRange] = useState("last_30");
  const [showInsights, setShowInsights] = useState(true);

  const handleToggleKpi = useCallback((key: string) => {
    setActiveKpis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const moveKpi = useCallback((fromIndex: number, toIndex: number) => {
    setActiveKpis((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const activeKpiDefs = useMemo(() => {
    return activeKpis
      .map((key) => ALL_UOM_KPI_DEFINITIONS.find((d) => d.key === key))
      .filter(Boolean) as typeof ALL_UOM_KPI_DEFINITIONS;
  }, [activeKpis]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<UomUnit | null>(null);

  /* ── Advanced filters modal state ── */
  const [advFilters, setAdvFilters] = useState<UomAdvancedFilters>({ ...DEFAULT_UOM_FILTERS });
  const [advFiltersOpen, setAdvFiltersOpen] = useState(false);
  const activeAdvFilterCount = useMemo(() => countActiveUomFilters(advFilters), [advFilters]);

  /* ── Column header menu state ── */
  const [headerMenuColumn, setHeaderMenuColumn] = useState<string | null>(null);
  const [headerMenuAnchor, setHeaderMenuAnchor] = useState<DOMRect | null>(null);
  /** Set-based column filters for Notion-style filter bar */
  const [notionColumnFilters, setNotionColumnFilters] = useState<ColumnFilterMap>({});
  /** Which columns have an active filter chip in the filter bar */
  const [activeFilterColumnKeys, setActiveFilterColumnKeys] = useState<string[]>([]);
  /** Frozen columns (not yet visually used but tracked) */
  const [frozenColumns, setFrozenColumns] = useState<Set<string>>(new Set());
  /** Wrapped columns (text wrap per column) */
  const [wrappedColumns, setWrappedColumns] = useState<Set<string>>(new Set());
  /** Grouped-by column key (only one at a time) */
  const [groupedByColumn, setGroupedByColumn] = useState<string | null>(null);

  /** Row selection state */
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  /** Archive modal state */
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<{ mode: "single"; unit: UomUnit } | { mode: "bulk"; ids: Set<string> } | null>(null);

  /** Scroll container ref for DraggableColumnSystem */
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const allUnits = SAMPLE_UNITS;
  const isUnitInUse = useCallback((unit: UomUnit) => Boolean(unit.inUse || (unit.inUseCount ?? 0) > 0), []);
  const totalCount = allUnits.length;

  const standardCount = allUnits.filter((u) => u.type === "Standard").length;
  const customCount = allUnits.filter((u) => u.type === "Custom").length;
  const inUseCount = allUnits.filter((u) => isUnitInUse(u)).length;
  const unusedCount = allUnits.filter((u) => !isUnitInUse(u)).length;
  const insightCards = useMemo(
    () => [
      {
        label: "Total Units",
        value: totalCount,
        icon: <Package className="w-4 h-4" />,
      },
      {
        label: "Standard Units",
        value: standardCount,
        icon: <Ruler className="w-4 h-4" />,
      },
      {
        label: "Units In Use",
        value: inUseCount,
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
    ],
    [inUseCount, standardCount, totalCount],
  );

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<UomCategory, number>;
    for (const cat of UOM_CATEGORIES) counts[cat] = 0;
    for (const u of allUnits) counts[u.category]++;
    return counts;
  }, [allUnits]);

  /* ── Filtering ─ */
  const filteredUnits = useMemo(() => {
    let result = allUnits;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.symbol.toLowerCase().includes(q) ||
          u.description.toLowerCase().includes(q)
      );
    }
    if (filters.type) {
      result = result.filter((u) => u.type === filters.type);
    }
    if (filters.inUse !== null) {
      result = result.filter((u) => isUnitInUse(u) === filters.inUse);
    }
    if (filters.categories.size > 0) {
      result = result.filter((u) => filters.categories.has(u.category));
    }

    // Apply advanced filters from modal
    result = applyAdvancedFilters(result, advFilters);

    // Apply Notion-style Set-based column filters
    for (const [colKey, selectedValues] of Object.entries(notionColumnFilters)) {
      if (!selectedValues || selectedValues.size === 0) continue;
      result = result.filter((u) => {
        if (colKey === "inUse") {
          const displayVal = u.inUse ? "Yes" : "No";
          return selectedValues.has(displayVal);
        }
        const field = (u as any)[colKey];
        if (field == null) return false;
        return selectedValues.has(String(field));
      });
    }

    return result;
  }, [allUnits, filters, advFilters, notionColumnFilters]);

  /* ── Sorting ── */
  const sortedUnits = useMemo(() => {
    const arr = [...filteredUnits];
    const dir = sort.direction === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      let cmp = 0;
      switch (sort.field) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "symbol":
          cmp = a.symbol.localeCompare(b.symbol);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "description":
          cmp = (a.description || "").localeCompare(b.description || "");
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
        case "inUse":
          cmp = Number(b.inUse) - Number(a.inUse);
          break;
      }
      return cmp * dir;
    });
    return arr;
  }, [filteredUnits, sort]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(sortedUnits.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedUnits = sortedUnits.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  /* ── Handlers ── */
  const updateFilter = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const toggleType = (t: "Standard" | "Custom") =>
    updateFilter({ type: filters.type === t ? null : t });

  const toggleInUse = (val: boolean) =>
    updateFilter({ inUse: filters.inUse === val ? null : val });

  const toggleCategory = (cat: UomCategory) => {
    const next = new Set(filters.categories);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    updateFilter({ categories: next });
  };

  const removeCategory = (cat: UomCategory) => {
    const next = new Set(filters.categories);
    next.delete(cat);
    updateFilter({ categories: next });
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  };

  const handleColumnResize = useCallback((key: string, newWidth: number) => {
    setColumns((prev) => {
      const next = prev.map((c) =>
        c.key === key ? { ...c, width: newWidth } : c
      );
      saveColumns(next);
      return next;
    });
  }, []);

  const handleAutoSize = useCallback(
    (key: string) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.font = "500 14px Inter, system-ui, sans-serif";
      let maxW = 60;
      for (const u of filteredUnits) {
        const val = String((u as any)[key] ?? "");
        const w = ctx.measureText(val).width;
        if (w > maxW) maxW = w;
      }
      const newW = Math.ceil(maxW) + 36;
      const col = columns.find((c) => c.key === key);
      const minW = col?.minWidth ?? 60;
      handleColumnResize(key, Math.max(minW, newW));
    },
    [filteredUnits, columns, handleColumnResize]
  );

  const active = hasActiveFilters(filters);

  /* ── Unique values per column (for Notion-style filter checkboxes) ── */
  const uniqueValuesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    const filterable = ["name", "symbol", "category", "description", "type", "inUse"];
    for (const key of filterable) {
      const valuesSet = new Set<string>();
      for (const u of allUnits) {
        if (key === "inUse") {
          valuesSet.add(u.inUse ? "Yes" : "No");
        } else {
          const val = (u as any)[key];
          if (val != null && String(val).trim()) {
            valuesSet.add(String(val));
          }
        }
      }
      map[key] = [...valuesSet].sort((a, b) => a.localeCompare(b));
    }
    return map;
  }, [allUnits]);

  /* ── Active column filter keys set (for highlighting filter icons) ── */
  const activeColumnFilterKeysSet = useMemo(() => {
    return new Set(activeFilterColumnKeys.filter(
      (k) => notionColumnFilters[k] && notionColumnFilters[k].size > 0
    ));
  }, [activeFilterColumnKeys, notionColumnFilters]);

  /* ── Header menu handlers ── */
  const handleOpenHeaderMenu = useCallback((columnKey: string, anchorRect: DOMRect) => {
    // Actions column is permanently locked — no header menu allowed
    if (columnKey === "actions") return;
    setHeaderMenuColumn(columnKey);
    setHeaderMenuAnchor(anchorRect);
  }, []);

  const handleHeaderMenuFilter = useCallback((columnKey: string) => {
    // Add column to active filter keys if not already there
    setActiveFilterColumnKeys((prev) => {
      if (prev.includes(columnKey)) return prev;
      return [...prev, columnKey];
    });
    // Initialize empty set if no filter exists
    setNotionColumnFilters((prev) => {
      if (prev[columnKey]) return prev;
      return { ...prev, [columnKey]: new Set() };
    });
    setPage(1);
  }, []);

  const handleHeaderMenuHide = useCallback((columnKey: string) => {
    setColumns((prev) => {
      const next = prev.map((c) =>
        c.key === columnKey && !c.required ? { ...c, visible: false } : c
      );
      saveColumns(next);
      return next;
    });
  }, []);

  const handleHeaderMenuFreeze = useCallback((columnKey: string) => {
    setFrozenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnKey)) next.delete(columnKey);
      else next.add(columnKey);
      return next;
    });
  }, []);

  const handleNotionFilterChange = useCallback((columnKey: string, values: Set<string>) => {
    setNotionColumnFilters((prev) => ({
      ...prev,
      [columnKey]: values,
    }));
    setPage(1);
  }, []);

  const handleRemoveNotionFilter = useCallback((columnKey: string) => {
    setActiveFilterColumnKeys((prev) => prev.filter((k) => k !== columnKey));
    setNotionColumnFilters((prev) => {
      const next = { ...prev };
      delete next[columnKey];
      return next;
    });
    setPage(1);
  }, []);

  const handleAddNotionFilter = useCallback((columnKey: string) => {
    setActiveFilterColumnKeys((prev) => {
      if (prev.includes(columnKey)) return prev;
      return [...prev, columnKey];
    });
    setNotionColumnFilters((prev) => ({
      ...prev,
      [columnKey]: new Set(),
    }));
  }, []);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

  /* ── Visible columns for table rendering ── */
  const visibleKeys = useMemo(
    () => getOrderedVisibleKeys(columns, columnOrder),
    [columns, columnOrder]
  );

  /* ── Build DragColumnDef[] for the hook (maps visible keys → {key, label, width}) ── */
  const dragColumns: DragColumnDef[] = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.key, c]));
    const dataCols = visibleKeys.map((k) => {
      const col = colMap.get(k)!;
      return { key: col.key, label: col.label, width: col.width ?? 120 };
    });
    // Prepend checkbox pseudo-column so DOM <th> indices match dragColumns indices
    return [{ key: "__select", label: "", width: 40 }, ...dataCols];
  }, [columns, visibleKeys]);

  /* ── moveColumn adapter for the hook → updates columnOrder ── */
  const hookMoveColumn = useCallback(
    (from: number, to: number) => {
      const fromKey = dragColumns[from]?.key;
      const toKey = dragColumns[to]?.key;
      if (!fromKey || !toKey) return;
      // Prevent reordering pinned/special columns
      if (["__select", "name", "actions"].includes(fromKey)) return;
      if (["__select", "name", "actions"].includes(toKey)) return;

      setColumnOrder((prev) => {
        const newOrder = [...prev];
        const fromPos = newOrder.indexOf(fromKey);
        const toPos = newOrder.indexOf(toKey);
        if (fromPos === -1 || toPos === -1) return prev;
        newOrder.splice(fromPos, 1);
        newOrder.splice(toPos, 0, fromKey);
        saveColumnOrder(newOrder);
        return newOrder;
      });
    },
    [dragColumns, setColumnOrder]
  );

  /* ── Hook up DraggableColumnSystem ── */
  const { dragState, draggedIndex, onHeaderPointerDown, previewElRef } =
    useColumnReorder(dragColumns, hookMoveColumn, tableScrollRef);

  /* ── Total table width ── */
  const tableWidth = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.key, c]));
    return visibleKeys.reduce((sum, k) => {
      const col = colMap.get(k);
      return sum + (col?.width ?? 120);
    }, 40); // +40 for checkbox column
  }, [columns, visibleKeys]);

  /* ════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════ */

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ══════════════════════════════════════════════
          TOP NAV BAR — breadcrumb + search + user (matches Partners)
         ══════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-6 lg:px-8 h-12 border-b border-border bg-card shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="hover:text-foreground transition-colors cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Company Setup
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground" style={{ fontWeight: 500 }}>
            Units of Measure
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search units..."
              value={topBarSearch}
              onChange={(e) => setTopBarSearch(e.target.value)}
              className="pl-9 w-[260px] h-8 bg-white border-border/60 text-[13px] placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <span className="text-[11px]" style={{ fontWeight: 600, color: "var(--primary)" }}>AA</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px]" style={{ fontWeight: 500 }}>Ahtisham Ahmad</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Senior Product Designer</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA — card container ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-6 lg:px-8 py-6 flex-1 min-h-0 flex flex-col">
        <ModuleHeader
          onNewUnit={() => setCreateModalOpen(true)}
        />
        {/* KPI Insights -- collapsible section */}
        {showInsights && activeKpiDefs.length > 0 && (
        <div className="mb-4 shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                Performance Insights
              </span>
              {/* Date Range Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer">
                    <Calendar className="w-3 h-3" />
                    <span style={{ fontWeight: 500 }}>
                      {insightsDateRange === "last_7" && "Last 7 days"}
                      {insightsDateRange === "last_30" && "Last 30 days"}
                      {insightsDateRange === "last_90" && "Last 90 days"}
                      {insightsDateRange === "last_365" && "Last 12 months"}
                      {insightsDateRange === "all_time" && "All time"}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[170px]">
                  {[
                    { key: "last_7", label: "Last 7 days" },
                    { key: "last_30", label: "Last 30 days" },
                    { key: "last_90", label: "Last 90 days" },
                    { key: "last_365", label: "Last 12 months" },
                    { key: "all_time", label: "All time" },
                  ].map((opt) => (
                    <DropdownMenuItem
                      key={opt.key}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setInsightsDateRange(opt.key)}
                    >
                      <span className="text-sm">{opt.label}</span>
                      {insightsDateRange === opt.key && (
                        <Check className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              type="button"
              onClick={() => setInsightsPanelOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] hover:bg-muted/50 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              style={{ fontWeight: 500, color: "var(--primary)" }}
            >
              <Plus className="w-3 h-3" />
              Add Insights
            </button>
          </div>

          {/* KPI Cards — draggable responsive grid */}
          <DndProvider backend={HTML5Backend}>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
              {activeKpiDefs.map((kpi, idx) => {
                const value = computeUomKpiValue(kpi.key, allUnits);
                return (
                  <DraggableUomKpiCard
                    key={kpi.key}
                    index={idx}
                    kpiKey={kpi.key}
                    label={kpi.label}
                    value={value}
                    iconName={kpi.iconName}
                    iconBg={kpi.iconBg}
                    iconColor={kpi.iconColor}
                    moveCard={moveKpi}
                    onRemove={() => handleToggleKpi(kpi.key)}
                  />
                );
              })}
            </div>
          </DndProvider>
        </div>
        )}

        {/* KPI Insights Panel (drawer) */}
        <UomKpiInsightsPanel
          open={insightsPanelOpen}
          onOpenChange={setInsightsPanelOpen}
          activeKpis={activeKpis}
          onToggleKpi={handleToggleKpi}
          units={allUnits}
        />

        <div className="border border-border rounded-xl bg-card flex flex-1 min-h-0 overflow-clip">
        <div className="flex-1 min-w-0 flex flex-col overflow-clip">
        {/* ── ROW 1 — Unified toolbar: Search + Filters | Count + Columns + Density ── */}
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2 shrink-0">
          {/* Left — Search + Filters button */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by name, symbol, or category..."
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
                className="pl-9 pr-8 h-9 text-sm bg-white border-border/80 shadow-sm placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter({ search: "" })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters button */}
            <button
              type="button"
              onClick={() => setAdvFiltersOpen(true)}
              className={`inline-flex items-center justify-center h-9 gap-1.5 px-3 rounded-lg border bg-white shadow-sm hover:bg-muted/50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 shrink-0 ${
                activeAdvFilterCount > 0
                  ? "text-primary border-primary/30"
                  : "text-foreground border-border/80"
              }`}
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${activeAdvFilterCount > 0 ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm" style={{ fontWeight: 500 }}>Filters</span>
              {activeAdvFilterCount > 0 && (
                <span
                  className="ml-0.5 min-w-[18px] h-5 rounded-full text-[11px] flex items-center justify-center px-1.5 text-primary-foreground bg-primary"
                  style={{ fontWeight: 600 }}
                >
                  {activeAdvFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Right — Count + Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm tabular-nums mr-1 hidden sm:inline" style={{ fontWeight: 500 }}>
              {filteredUnits.length !== allUnits.length ? (
                <>
                  <span className="text-foreground">{filteredUnits.length}</span>
                  <span className="text-muted-foreground/60"> of </span>
                  <span className="text-muted-foreground">{allUnits.length}</span>
                  <span className="text-muted-foreground/70"> units</span>
                </>
              ) : (
                <>
                  <span className="text-foreground">{allUnits.length}</span>
                  <span className="text-muted-foreground/70"> units</span>
                </>
              )}
            </span>

            <div className="w-px h-5 bg-border/60 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => {
                if (!showInsights) setShowInsights(true);
                setInsightsPanelOpen(true);
              }}
              className="inline-flex items-center justify-center h-9 gap-2 px-3 rounded-lg border border-border bg-white text-foreground shadow-sm hover:bg-muted/40 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <BarChart3 className="w-[18px] h-[18px] text-muted-foreground/80" />
              <span className="text-sm hidden md:inline" style={{ fontWeight: 500 }}>
                Insights
              </span>
                <span
                  className="inline-flex items-center justify-center h-5 px-1.5 rounded-full text-[11px] bg-primary-surface text-primary"
                style={{ fontWeight: 600 }}
              >
                {activeKpis.length}
              </span>
            </button>

            <DensityDropdown
              density={density}
              onDensityChange={setDensity}
            />

            <ColumnsDropdown
              columns={columns}
              setColumns={setColumns}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
              defaultOpen={!dropdownsClosed}
              open={columnsPanelOpen}
              onOpenChange={setColumnsPanelOpen}
            />
          </div>
        </div>

        {/* ── FILTERS — unified row: categories + type + status ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 pb-3 shrink-0">
          {/* Me mode pill */}
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-muted-foreground/30 active:bg-muted transition-colors whitespace-nowrap shrink-0 cursor-pointer">
            <User className="w-3.5 h-3.5" />
            Me mode
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-border shrink-0" />

          {/* Type pills */}
          <FilterPill
            label="Standard"
            count={standardCount}
            active={filters.type === "Standard"}
            onClick={() => toggleType("Standard")}
          />
          <FilterPill
            label="Custom"
            count={customCount}
            active={filters.type === "Custom"}
            onClick={() => toggleType("Custom")}
          />

          {/* Separator */}
          <div className="w-px h-5 bg-border shrink-0" />

          {/* Status pills */}
          <FilterPill
            label="In Use"
            count={inUseCount}
            active={filters.inUse === true}
            onClick={() => toggleInUse(true)}
          />
          <FilterPill
            label="Unused"
            count={unusedCount}
            active={filters.inUse === false}
            onClick={() => toggleInUse(false)}
          />

          {active && (
            <>
              <div className="w-px h-5 bg-border shrink-0" />
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                style={{ fontWeight: 500 }}
              >
                Clear All
              </button>
            </>
          )}
        </div>

        {/* Divider between filters and table content */}
        <div className="border-t border-border shrink-0" />

        {/* ── DATA TABLE or CARD VIEW ── */}
        {density === "card" ? (
          <UomCardGrid
            units={pagedUnits}
            searchQuery={filters.search}
            onCardClick={(u) => navigate(`/unit/${u.id}`)}
          />
        ) : (
        <div className="flex min-h-0 flex-1 overflow-clip">
          {/* Table content */}
          <div className="flex-1 min-w-0 flex flex-col overflow-clip">
            {/* ── Notion-style filter bar ── */}
            <UomNotionFilterBar
              columns={columns}
              activeFilterKeys={activeFilterColumnKeys}
              columnFilters={notionColumnFilters}
              uniqueValuesMap={uniqueValuesMap}
              onFilterChange={handleNotionFilterChange}
              onRemoveFilter={handleRemoveNotionFilter}
              onAddFilter={handleAddNotionFilter}
            />

            {/* ── Scroll container for DraggableColumnSystem ── */}
            <div
              ref={tableScrollRef}
              className="min-h-0 flex-1 overflow-auto scrollbar-overlay"
            >
              <Table
                style={{
                  width: "100%",
                  minWidth: tableWidth,
                  tableLayout: "fixed",
                }}
              >
                {/* Colgroup defines column widths for table-layout: fixed */}
                <colgroup>
                  {/* Checkbox column */}
                  <col style={{ width: 40 }} />
                  {visibleKeys.map((key) => {
                    const colMap = new Map(columns.map((c) => [c.key, c]));
                    const col = colMap.get(key);
                    return (
                      <col
                        key={key}
                        style={{ width: col?.width ?? 120 }}
                      />
                    );
                  })}
                </colgroup>

                <TableHeaderRow
                  activeSort={sort}
                  onSort={handleSort}
                  columns={columns}
                  columnOrder={columnOrder}
                  visibleKeys={visibleKeys}
                  onResize={handleColumnResize}
                  onAutoSize={handleAutoSize}
                  density={density}
                  allSelected={pagedUnits.length > 0 && pagedUnits.every((u) => selectedRows.has(u.id))}
                  someSelected={pagedUnits.some((u) => selectedRows.has(u.id))}
                  onSelectAll={() => {
                    const allOnPage = pagedUnits.map((u) => u.id);
                    const allSelected = allOnPage.every((id) => selectedRows.has(id));
                    setSelectedRows((prev) => {
                      const next = new Set(prev);
                      if (allSelected) {
                        allOnPage.forEach((id) => next.delete(id));
                      } else {
                        allOnPage.forEach((id) => next.add(id));
                      }
                      return next;
                    });
                  }}
                  draggedIndex={draggedIndex}
                  onDragPointerDown={onHeaderPointerDown}
                />

                <TableBody>
                  {pagedUnits.length === 0 ? (
                    <ShadcnTR>
                      <ShadcnTD
                        colSpan={visibleKeys.length + 1}
                        className="h-32 text-center text-sm text-muted-foreground"
                      >
                        No units match your filters.
                      </ShadcnTD>
                    </ShadcnTR>
                  ) : (
                    pagedUnits.map((unit) => (
                      <TableRow
                        key={unit.id}
                        unit={unit}
                        searchQuery={filters.search}
                        columns={columns}
                        columnOrder={columnOrder}
                        visibleKeys={visibleKeys}
                        density={density}
                        selected={selectedRows.has(unit.id)}
                        onToggleSelect={(id) => {
                          setSelectedRows((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        onClick={(u) => navigate(`/unit/${u.id}`)}
                        onCopy={(u) => {
                          showToast("success", `"${u.name}" duplicated`);
                        }}
                        onEdit={(u) => {
                          if (u.inUse) {
                            showToast("info", `"${u.name}" can’t be edited while it is in use. Remove active references to make changes.`);
                            return;
                          }
                          setEditUnit(u);
                          setEditModalOpen(true);
                        }}
                        onDelete={(u) => {
                          setArchiveTarget({ mode: "single", unit: u });
                          setArchiveModalOpen(true);
                        }}
                        draggedIndex={draggedIndex}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Drag preview (floating pill near cursor) ── */}
            <ColumnDragPreview
              dragState={dragState}
              previewElRef={previewElRef}
            />

            {/* ── PAGINATION BAR ── */}
            <div className="flex flex-col sm:flex-row items-center justify-center px-4 py-3 border-t border-border gap-3 shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Records per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 border-border bg-card text-foreground shadow-none [&_svg]:text-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage(1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 gap-1 text-sm text-muted-foreground"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </Button>

                {pageNumbers.map((pg, idx) =>
                  pg === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-sm text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={pg}
                      variant={safePage === pg ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pg as number)}
                      className={`h-8 w-8 p-0 text-sm ${
                        safePage === pg
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {pg}
                    </Button>
                  )
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 gap-1 text-sm text-muted-foreground"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}
        </div>

        {/* ── COLUMNS SIDE PANEL — sibling of full content column, pushes header + table ── */}
        <ColumnsSidePanel
          columns={columns}
          setColumns={setColumns}
          columnOrder={columnOrder}
          setColumnOrder={setColumnOrder}
          open={columnsPanelOpen}
          onOpenChange={setColumnsPanelOpen}
        />
        </div>
        </div>
      </div>

      {/* ── CREATE MODAL ── */}
      <CreateUomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(unitName) => {
          setCreateModalOpen(false);
          showToast("success", `${unitName} created`);
        }}
      />

      {/* ── EDIT MODAL ── */}
      <CreateUomModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditUnit(null);
        }}
        editUnit={editUnit}
        onEdited={(updatedFields) => {
          setEditModalOpen(false);
          setEditUnit(null);
          showToast("success", `"${updatedFields.name}" updated`);
        }}
      />

      {/* ── IMPORT MODAL ── */}
      <ImportUomModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={(count) => {
          setImportModalOpen(false);
          showToast("success", `${count} units imported`);
        }}
      />

      {/* ── COLUMN HEADER MENU ── */}
      {headerMenuColumn && (() => {
        const col = columns.find((c) => c.key === headerMenuColumn);
        const colLabel = col?.label ?? headerMenuColumn;
        const sortableFields = ["name", "symbol", "category", "description", "type", "inUse"];
        const isSortable = sortableFields.includes(headerMenuColumn);
        return (
          <UomColumnHeaderMenu
            columnKey={headerMenuColumn}
            columnLabel={colLabel}
            canHide={!col?.required}
            isFrozen={frozenColumns.has(headerMenuColumn)}
            isSortable={isSortable}
            currentSortField={sort.field}
            currentSortDirection={sort.direction}
            isWrapped={wrappedColumns.has(headerMenuColumn)}
            isGrouped={groupedByColumn === headerMenuColumn}
            onFilter={() => handleHeaderMenuFilter(headerMenuColumn)}
            onSortAsc={() => {
              setSort({ field: headerMenuColumn as SortField, direction: "asc" });
            }}
            onSortDesc={() => {
              setSort({ field: headerMenuColumn as SortField, direction: "desc" });
            }}
            onGroup={() => {
              setGroupedByColumn((prev) =>
                prev === headerMenuColumn ? null : headerMenuColumn
              );
              showToast(
                "info",
                groupedByColumn === headerMenuColumn
                  ? `Ungrouped`
                  : `Grouped by ${colLabel}`
              );
            }}
            onHide={() => handleHeaderMenuHide(headerMenuColumn)}
            onToggleFreeze={() => handleHeaderMenuFreeze(headerMenuColumn)}
            onToggleWrap={() => {
              setWrappedColumns((prev) => {
                const next = new Set(prev);
                if (next.has(headerMenuColumn)) next.delete(headerMenuColumn);
                else next.add(headerMenuColumn);
                return next;
              });
              showToast(
                "info",
                wrappedColumns.has(headerMenuColumn)
                  ? `${colLabel} content unwrapped`
                  : `${colLabel} content wrapped`
              );
            }}
            onClose={() => {
              setHeaderMenuColumn(null);
              setHeaderMenuAnchor(null);
            }}
            anchorRect={headerMenuAnchor}
          />
        );
      })()}

      {/* ── BULK ACTIONS BAR ── */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedRows.size}
            totalCount={pagedUnits.length}
            onDeselectAll={() => setSelectedRows(new Set())}
            onSelectAll={() => {
              const allOnPage = new Set(pagedUnits.map((u) => u.id));
              setSelectedRows((prev) => {
                const next = new Set(prev);
                allOnPage.forEach((id) => next.add(id));
                return next;
              });
            }}
            onDelete={() => {
              setArchiveTarget({ mode: "bulk", ids: new Set(selectedRows) });
              setArchiveModalOpen(true);
            }}
            onDuplicate={() => {
              const count = selectedRows.size;
              showToast(
                "success",
                `${count} unit${count > 1 ? "s" : ""} duplicated`
              );
              setSelectedRows(new Set());
            }}
            onExport={() => {
              const count = selectedRows.size;
              showToast(
                "info",
                `Exporting ${count} unit${count > 1 ? "s" : ""} as CSV…`
              );
            }}
            onMarkInUse={() => {
              const count = selectedRows.size;
              showToast(
                "success",
                `${count} unit${count > 1 ? "s" : ""} marked as In Use`
              );
              setSelectedRows(new Set());
            }}
            onMarkUnused={() => {
              const count = selectedRows.size;
              showToast(
                "success",
                `${count} unit${count > 1 ? "s" : ""} marked as Unused`
              );
              setSelectedRows(new Set());
            }}
          />
        )}
      </AnimatePresence>

      {/* ── ADVANCED FILTERS MODAL ── */}
      <UomFiltersModal
        open={advFiltersOpen}
        onOpenChange={setAdvFiltersOpen}
        filters={advFilters}
        onFiltersChange={(f) => {
          setAdvFilters(f);
          setPage(1);
        }}
        units={allUnits}
        filteredCount={filteredUnits.length}
      />

      {/* ═══ ARCHIVE CONFIRMATION MODAL ═══ */}
      <AnimatePresence>
        {archiveModalOpen && archiveTarget && (() => {
          const isBulk = archiveTarget.mode === "bulk";
          const count = isBulk ? archiveTarget.ids.size : 1;
          const unitName = isBulk
            ? (() => {
                const names = Array.from(archiveTarget.ids)
                  .slice(0, 3)
                  .map((id) => allUnits.find((u) => u.id === id)?.name ?? id);
                return count <= 3
                  ? names.map((n) => `"${n}"`).join(", ")
                  : `${names.map((n) => `"${n}"`).join(", ")} and ${count - 3} more`;
              })()
            : `"${archiveTarget.unit.name}"`;
          const title = isBulk
            ? `Archive ${count} unit${count > 1 ? "s" : ""}?`
            : `Archive ${unitName}?`;
          const usageSummary = isBulk
            ? `Archiving is unavailable until the active references for these ${count} units are removed`
            : "Archiving is unavailable until the active references for this unit are removed";

          return (
            <>
              <motion.div
                key="archive-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setArchiveModalOpen(false);
                  setArchiveTarget(null);
                }}
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  zIndex: 9998,
                }}
              />
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
              <motion.div
                key="archive-modal"
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{
                  width: 560,
                  maxWidth: "calc(100vw - 40px)",
                  backgroundColor: "var(--background)",
                  borderRadius: "var(--radius-lg)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "var(--border)",
                  boxShadow: "0 20px 60px -12px rgba(0,0,0,0.18)",
                  maxHeight: "calc(100vh - 40px)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  pointerEvents: "auto",
                }}
              >
                <div style={{ overflowY: "auto", flex: 1, paddingBottom: 8 }}>
                  {/* Header */}
                  <div
                    className="flex items-start gap-[14px]"
                    style={{ padding: "24px 24px 0 24px" }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius)",
                        backgroundColor: "var(--destructive-surface)",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "var(--destructive-border)",
                      }}
                    >
                      <AlertTriangle
                        size={18}
                        strokeWidth={2}
                        style={{ color: "var(--destructive)" }}
                      />
                    </div>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-medium)" as any,
                          color: "var(--foreground)",
                          lineHeight: "1.3",
                          fontFamily: "var(--font-family)",
                        }}
                      >
                        {title}
                      </h3>
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontSize: "var(--text-label)",
                          fontWeight: "var(--font-weight-normal)" as any,
                          color: "var(--text-muted)",
                          lineHeight: "1.5",
                          fontFamily: "var(--font-family)",
                        }}
                      >
                        {isBulk
                          ? "These units can’t be archived while they are associated with active transactions and records."
                          : "This unit can’t be archived while it is associated with active transactions and records."}
                      </p>
                    </div>
                  </div>

                  {/* Blocking explanation */}
                  <div style={{ padding: "16px 24px 0 78px" }}>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {[
                        "Remove or complete the active references listed below before archiving",
                        "Historical records stay intact after the unit is no longer actively referenced",
                        "Once associations are cleared, archiving will become available again",
                      ].map((text) => (
                        <li
                          key={text}
                          className="flex items-start gap-[8px]"
                          style={{
                            fontSize: "var(--text-label)",
                            fontWeight: "var(--font-weight-normal)" as any,
                            color: "var(--text-subtle)",
                            lineHeight: "1.45",
                            fontFamily: "var(--font-family)",
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              backgroundColor: "var(--text-muted)",
                              marginTop: 5,
                              flexShrink: 0,
                            }}
                          />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Usage summary */}
                  <div
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px 14px",
                      borderRadius: "var(--radius)",
                      backgroundColor: "var(--destructive-surface)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--destructive-border)",
                    }}
                  >
                    <div
                      className="flex items-center gap-[8px]"
                      style={{
                        fontSize: "var(--text-label)",
                        fontWeight: "var(--font-weight-medium)" as any,
                        color: "var(--destructive)",
                        lineHeight: "1.3",
                        fontFamily: "var(--font-family)",
                      }}
                    >
                      <AlertTriangle size={13} strokeWidth={2} />
                      {usageSummary}
                    </div>
                  </div>

                  <div style={{ padding: "16px 24px 0 24px" }}>
                    <div
                      style={{
                        fontSize: "var(--text-label)",
                        fontWeight: "var(--font-weight-medium)" as any,
                        color: "var(--foreground)",
                        lineHeight: "1.4",
                      }}
                    >
                      Active references
                    </div>
                  <div className="mt-3 flex flex-col gap-2">
                      {ARCHIVE_BLOCKING_REFERENCES.map((group) => (
                        <div
                          key={group.label}
                        className="flex flex-wrap items-start gap-x-2 gap-y-1"
                          style={{
                          fontSize: "var(--text-label)",
                          lineHeight: "1.6",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "var(--text-label)",
                              fontWeight: "var(--font-weight-medium)" as any,
                              color: "var(--foreground)",
                              lineHeight: "1.4",
                            }}
                          >
                          {group.label}:
                          </div>
                        <div
                            style={{
                              color: "var(--text-subtle)",
                              fontSize: "var(--text-label)",
                              lineHeight: "1.6",
                            }}
                          >
                          {group.entries.join(", ")}
                        </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-end gap-[10px]"
                  style={{
                    padding: "16px 24px 20px",
                    borderTop: "1px solid var(--border-subtle)",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setArchiveModalOpen(false);
                      setArchiveTarget(null);
                    }}
                    className="cursor-pointer"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      lineHeight: "1",
                      backgroundColor: "rgba(0,0,0,0)",
                      color: "var(--text-subtle)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family)",
                      transition: "all 0.12s",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="border-none"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      lineHeight: "1",
                      backgroundColor: "var(--surface-raised)",
                      color: "var(--text-muted)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family)",
                      transition: "all 0.12s",
                      cursor: "not-allowed",
                    }}
                  >
                    <span className="flex items-center gap-[6px]">
                      <Archive size={13} />
                      {isBulk ? `Cannot Archive ${count} Unit${count > 1 ? "s" : ""}` : "Cannot Archive"}
                    </span>
                  </button>
                </div>
              </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Module Header
   ═══════════════════════════════════════════════ */

function ModuleHeader({
  onNewUnit,
}: {
  onNewUnit: () => void;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 -mx-6 lg:-mx-8 -mt-6 px-6 lg:px-8 pt-3.5 pb-3.5 bg-card border-b border-border shrink-0"
    >
      {/* Left side */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--primary-surface)", color: "var(--primary)" }}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </div>
        <div>
          <h1 className="font-bold text-[20px]">Unit of Measure</h1>
          <p className="text-xs text-muted-foreground">
            Organize standard, custom, and item-linked units — all in one place.
          </p>
        </div>
      </div>

      {/* Right side — action button */}
      <Button className="bg-primary text-primary-foreground shrink-0" onClick={onNewUnit}>
        <Plus className="w-4 h-4 mr-1.5" />
        Create New Unit
      </Button>
    </div>
  );
}

const DND_UOM_KPI = "DND_UOM_KPI";

function DraggableUomKpiCard({
  index,
  kpiKey,
  label,
  value,
  iconName,
  iconBg,
  iconColor,
  moveCard,
  onRemove,
}: {
  index: number;
  kpiKey: string;
  label: string;
  value: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  moveCard: (from: number, to: number) => void;
  onRemove?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_UOM_KPI,
    item: () => ({ index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: DND_UOM_KPI,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverRect.right - hoverRect.left) / 2;
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - hoverRect.left;
      const hoverClientY = clientOffset.y - hoverRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY && hoverClientX > hoverMiddleX) return;
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  preview(drop(ref));
  drag(ref);

  /* Dragging ghost — dashed placeholder */
  if (isDragging) {
    return (
      <div
        ref={ref}
        className="rounded-lg border border-dashed border-primary/20 bg-primary/[0.02] min-h-[52px] pointer-events-none"
      />
    );
  }

  return (
    <div
      ref={ref}
      className={`border rounded-lg bg-white group relative min-w-0 transition-all duration-200 select-none overflow-hidden cursor-grab active:cursor-grabbing ${
        isOver
          ? "border-primary/30 bg-primary/[0.03] shadow-[0_0_0_2px_rgba(10,119,255,0.08)] scale-[1.02]"
          : "border-border hover:-translate-y-[1px] hover:border-[#93B8F7] hover:shadow-[0_2px_8px_-3px_rgba(10,119,255,0.06)]"
      }`}
    >
      {/* Drop zone overlay */}
      {isOver && (
        <div className="absolute inset-0 rounded-lg bg-primary/[0.02] pointer-events-none" />
      )}
      <div className="px-3 py-2">
        {/* Drag handle — top-right pill */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center bg-muted rounded-md p-1 z-10 pointer-events-none">
          <GripVertical className="w-3.5 h-3.5 text-slate-500" />
        </div>
        {/* Label row: label + icon (matches Partners listing — neutral grey icon, no tile) */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-[10.5px] text-slate-500 whitespace-nowrap" style={{ fontWeight: 500 }}>{label}</p>
          </div>
          <UomKpiIconInline name={iconName} />
        </div>
        {/* Value */}
        <div className="flex items-baseline gap-1.5">
          <p className="text-[15px] text-slate-700 tracking-tight whitespace-nowrap" style={{ fontWeight: 600, lineHeight: 1.2 }}>{value}</p>
        </div>
      </div>
      {/* Remove button — bottom-right on hover */}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-150 p-1 rounded cursor-pointer hover:bg-red-50 z-10"
          title={`Remove ${label}`}
        >
          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
        </button>
      )}
    </div>
  );
}

/* Inline KPI icon — matches Partners listing: w-3.5 h-3.5, neutral slate color, no background tile */
function UomKpiIconInline({ name }: { name: string }) {
  const cls = "w-3.5 h-3.5 shrink-0";
  const style = { color: "#94A3B8" } as const;
  switch (name) {
    case "Package": return <Package className={cls} style={style} />;
    case "Ruler": return <Ruler className={cls} style={style} />;
    case "CheckCircle2": return <CheckCircle2 className={cls} style={style} />;
    case "ArrowLeftRight": return <ArrowLeftRight className={cls} style={style} />;
    case "BarChart3": return <BarChart3 className={cls} style={style} />;
    case "Archive": return <Archive className={cls} style={style} />;
    default: return <BarChart3 className={cls} style={style} />;
  }
}

function UomKpiIconSmall({ name }: { name: string }) {
  const s = { width: 12, height: 12 };
  switch (name) {
    case "Package": return <Package style={s} />;
    case "Ruler": return <Ruler style={s} />;
    case "CheckCircle2": return <CheckCircle2 style={s} />;
    case "Layers": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>;
    case "ArrowLeftRight": return <ArrowLeftRight style={s} />;
    case "Tags": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8 18.414a2 2 0 0 0 2.828 0L15 14.243a2 2 0 0 0 0-2.828Z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/></svg>;
    case "BarChart3": return <BarChart3 style={s} />;
    case "Archive": return <Archive style={s} />;
    case "Gauge": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>;
    case "Scale": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
    case "Boxes": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/></svg>;
    case "Zap": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>;
    default: return <BarChart3 style={s} />;
  }
}