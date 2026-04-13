/**
 * UOM Module — KPI Insights Panel (Customize Drawer)
 *
 * Matches the vendor module KpiInsightsPanel design exactly.
 * UOM-specific KPI definitions with computed values from sample data.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import {
  Search,
  ChartColumn,
  Package,
  Ruler,
  CheckCircle2,
  Layers,
  ArrowLeftRight,
  Tags,
  BarChart3,
  Archive,
  X,
  Check,
  Plus,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Gauge,
  Scale,
  Boxes,
  Zap,
} from "lucide-react";
import type { UomUnit } from "./sample-data";

/* ─── KPI definition type ─── */
export interface UomKpiDefinition {
  key: string;
  label: string;
  category: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  subtitle: string;
}

/* ─── All available UOM KPI definitions ─── */
export const ALL_UOM_KPI_DEFINITIONS: UomKpiDefinition[] = [
  // Overview
  {
    key: "total_units",
    label: "Total Units",
    category: "Overview",
    iconName: "Package",
    iconBg: "#EDF4FF",
    iconColor: "#0A77FF",
    subtitle: "All units in system",
  },
  {
    key: "standard_units",
    label: "Standard Units",
    category: "Overview",
    iconName: "Ruler",
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
    subtitle: "Pre-defined units",
  },
  {
    key: "custom_units",
    label: "Custom Units",
    category: "Overview",
    iconName: "Layers",
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
    subtitle: "User-created units",
  },
  // Usage
  {
    key: "units_in_use",
    label: "Units In Use",
    category: "Usage",
    iconName: "CheckCircle2",
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
    subtitle: "Currently referenced",
  },
  {
    key: "unused_units",
    label: "Unused Units",
    category: "Usage",
    iconName: "Archive",
    iconBg: "#F8FAFC",
    iconColor: "#64748B",
    subtitle: "Not referenced anywhere",
  },
  {
    key: "avg_usage_count",
    label: "Avg Usage Count",
    category: "Usage",
    iconName: "BarChart3",
    iconBg: "#FFF7ED",
    iconColor: "#EA580C",
    subtitle: "Average references per unit",
  },
  // Categories
  {
    key: "cat_length",
    label: "Length Units",
    category: "Categories",
    iconName: "Ruler",
    iconBg: "#EDF4FF",
    iconColor: "#0A77FF",
    subtitle: "Length & distance",
  },
  {
    key: "cat_weight",
    label: "Weight Units",
    category: "Categories",
    iconName: "Scale",
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    subtitle: "Mass & weight",
  },
  {
    key: "cat_volume",
    label: "Volume Units",
    category: "Categories",
    iconName: "Boxes",
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
    subtitle: "Volume & capacity",
  },
  {
    key: "cat_quantity",
    label: "Quantity Units",
    category: "Categories",
    iconName: "Tags",
    iconBg: "#FFFBEB",
    iconColor: "#D97706",
    subtitle: "Count & quantity",
  },
  {
    key: "cat_area",
    label: "Area Units",
    category: "Categories",
    iconName: "Layers",
    iconBg: "#FEF2F2",
    iconColor: "#DC2626",
    subtitle: "Area & surface",
  },
  {
    key: "cat_energy",
    label: "Energy Units",
    category: "Categories",
    iconName: "Zap",
    iconBg: "#FFF7ED",
    iconColor: "#EA580C",
    subtitle: "Energy & power",
  },
  // Conversions
  {
    key: "total_conversions",
    label: "Total Conversions",
    category: "Conversions",
    iconName: "ArrowLeftRight",
    iconBg: "#EDF4FF",
    iconColor: "#0A77FF",
    subtitle: "Defined conversion rules",
  },
  {
    key: "avg_conversions",
    label: "Avg Conversions/Unit",
    category: "Conversions",
    iconName: "Gauge",
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
    subtitle: "Average rules per unit",
  },
];

/* Default active KPIs */
export const DEFAULT_UOM_ACTIVE_KPIS = [
  "total_units",
  "standard_units",
  "units_in_use",
];

/* ─── Compute KPI value from UOM data ─── */
export function computeUomKpiValue(key: string, units: UomUnit[]): string {
  switch (key) {
    case "total_units":
      return String(units.length);
    case "standard_units":
      return String(units.filter((u) => u.type === "Standard").length);
    case "custom_units":
      return String(units.filter((u) => u.type === "Custom").length);
    case "units_in_use":
      return String(units.filter((u) => u.inUse || (u.inUseCount ?? 0) > 0).length);
    case "unused_units":
      return String(units.filter((u) => !u.inUse && (u.inUseCount ?? 0) === 0).length);
    case "avg_usage_count": {
      const inUseUnits = units.filter((u) => (u.inUseCount ?? 0) > 0);
      if (inUseUnits.length === 0) return "0";
      const avg = inUseUnits.reduce((s, u) => s + (u.inUseCount ?? 0), 0) / inUseUnits.length;
      return avg.toFixed(1);
    }
    case "cat_length":
      return String(units.filter((u) => u.category === "Length").length);
    case "cat_weight":
      return String(units.filter((u) => u.category === "Weight").length);
    case "cat_volume":
      return String(units.filter((u) => u.category === "Volume").length);
    case "cat_quantity":
      return String(units.filter((u) => u.category === "Quantity").length);
    case "cat_area":
      return String(units.filter((u) => u.category === "Area").length);
    case "cat_energy":
      return String(units.filter((u) => u.category === "Energy").length);
    case "total_conversions": {
      const total = units.reduce((s, u) => s + (u.conversions?.length ?? 0), 0);
      return String(total);
    }
    case "avg_conversions": {
      if (units.length === 0) return "0";
      const total = units.reduce((s, u) => s + (u.conversions?.length ?? 0), 0);
      return (total / units.length).toFixed(1);
    }
    default:
      return "–";
  }
}

/* ─── Icon mapper ─── */
function UomKpiIcon({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  const props = { className, style };
  switch (name) {
    case "Package": return <Package {...props} />;
    case "Ruler": return <Ruler {...props} />;
    case "CheckCircle2": return <CheckCircle2 {...props} />;
    case "Layers": return <Layers {...props} />;
    case "ArrowLeftRight": return <ArrowLeftRight {...props} />;
    case "Tags": return <Tags {...props} />;
    case "BarChart3": return <BarChart3 {...props} />;
    case "Archive": return <Archive {...props} />;
    case "Gauge": return <Gauge {...props} />;
    case "Scale": return <Scale {...props} />;
    case "Boxes": return <Boxes {...props} />;
    case "Zap": return <Zap {...props} />;
    default: return <ChartColumn {...props} />;
  }
}

/* Category icon mapper */
function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "Overview": return <Package className="w-4 h-4 text-muted-foreground" />;
    case "Usage": return <CheckCircle2 className="w-4 h-4 text-muted-foreground" />;
    case "Categories": return <Tags className="w-4 h-4 text-muted-foreground" />;
    case "Conversions": return <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />;
    default: return <ChartColumn className="w-4 h-4 text-muted-foreground" />;
  }
}

/* ─── UOM KPI Insights Panel Component ─── */
interface UomKpiInsightsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeKpis: string[];
  onToggleKpi: (key: string) => void;
  units: UomUnit[];
}

export function UomKpiInsightsPanel({
  open,
  onOpenChange,
  activeKpis,
  onToggleKpi,
  units,
}: UomKpiInsightsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const cats: { name: string; kpis: UomKpiDefinition[] }[] = [];
    const catMap = new Map<string, UomKpiDefinition[]>();

    for (const kpi of ALL_UOM_KPI_DEFINITIONS) {
      const matchesSearch =
        !searchQuery ||
        kpi.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kpi.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (matchesSearch) {
        if (!catMap.has(kpi.category)) {
          catMap.set(kpi.category, []);
        }
        catMap.get(kpi.category)!.push(kpi);
      }
    }

    catMap.forEach((kpis, name) => {
      cats.push({ name, kpis });
    });

    return cats;
  }, [searchQuery]);

  const activeCount = activeKpis.length;

  /* ─── Smooth mount / unmount with CSS transitions ─── */
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      timeoutRef.current = setTimeout(() => setMounted(false), 280);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] transition-opacity duration-[250ms] ease-in-out"
        style={{
          backgroundColor: visible ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0)",
          pointerEvents: visible ? "auto" : "none",
        }}
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-[200] w-full max-w-[400px] bg-white flex flex-col shadow-2xl transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          transform: visible ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EDF4FF" }}
              >
                <Sliders className="w-5 h-5" style={{ color: "#0A77FF" }} />
              </div>
              <div>
                <h2 className="text-base text-foreground" style={{ fontWeight: 600 }}>
                  Customize Widgets
                </h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Manage your dashboard KPI widgets.
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer -mt-0.5 -mr-1"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {/* Toggle all widgets */}
          <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
              {activeCount} of {ALL_UOM_KPI_DEFINITIONS.length} widgets active
            </span>
            <button
              onClick={() => {
                const allKeys = ALL_UOM_KPI_DEFINITIONS.map(k => k.key);
                const allActive = allKeys.every(k => activeKpis.includes(k));
                if (allActive) {
                  activeKpis.forEach(k => onToggleKpi(k));
                } else {
                  allKeys.filter(k => !activeKpis.includes(k)).forEach(k => onToggleKpi(k));
                }
              }}
              className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                ALL_UOM_KPI_DEFINITIONS.every(k => activeKpis.includes(k.key))
                  ? "bg-[#EBF3FF] border-[#0A77FF]/25 text-[#0A77FF] hover:bg-[#DCEAFF] hover:border-[#0A77FF]/40 shadow-sm shadow-[#0A77FF]/10"
                  : activeKpis.length === 0
                  ? "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] hover:text-[#64748B]"
                  : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#EBF3FF] hover:border-[#0A77FF]/25 hover:text-[#0A77FF]"
              }`}
              style={{ fontWeight: 600 }}
            >
              {ALL_UOM_KPI_DEFINITIONS.every(k => activeKpis.includes(k.key)) ? (
                <>
                  <ToggleRight className="w-4 h-4 text-[#0A77FF]" />
                  <span>All On</span>
                </>
              ) : activeKpis.length === 0 ? (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>All Off</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Enable All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-3.5 pb-0 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
            <input
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-colors"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="border-b border-[#F1F5F9] mt-3 shrink-0" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          {categories.length === 0 && (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Search className="w-5 h-5 mb-2 opacity-40" />
              <p className="text-xs text-muted-foreground/60">No metrics found</p>
            </div>
          )}

          {categories.map((cat) => (
            <div key={cat.name} className="mt-5 first:mt-4">
              {/* Category Header */}
              <div className="flex items-center gap-1.5 mb-2">
                <CategoryIcon category={cat.name} />
                <span
                  className="text-[12px] text-muted-foreground/70 uppercase tracking-wide"
                  style={{ fontWeight: 600 }}
                >
                  {cat.name}
                </span>
              </div>

              {/* KPI Cards Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                {cat.kpis.map((kpi) => {
                  const isActive = activeKpis.includes(kpi.key);
                  const value = computeUomKpiValue(kpi.key, units);

                  return (
                    <button
                      key={kpi.key}
                      onClick={() => onToggleKpi(kpi.key)}
                      className={`relative text-left rounded-lg border px-3 py-2.5 transition-all duration-150 cursor-pointer group ${
                        isActive
                          ? "border-[#0A77FF]/25 bg-[#0A77FF]/[0.04] shadow-[0_0_0_1px_rgba(10,119,255,0.08)]"
                          : "border-border/60 bg-white hover:border-border hover:bg-muted/20 hover:shadow-sm"
                      }`}
                    >
                      {/* Top row: label + toggle icon */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[11.5px] truncate transition-colors ${
                            isActive ? "text-[#0A77FF]" : "text-muted-foreground/70"
                          }`}
                          style={{ fontWeight: 500 }}
                          title={kpi.label}
                        >
                          {kpi.label}
                        </span>
                        <div className="shrink-0">
                          {isActive ? (
                            <Check className="w-3.5 h-3.5" style={{ color: "#0A77FF" }} />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors" />
                          )}
                        </div>
                      </div>

                      {/* Value */}
                      <p
                        className={`text-[15px] mt-1 transition-colors ${
                          isActive ? "text-foreground" : "text-foreground/80"
                        }`}
                        style={{ fontWeight: 550 }}
                      >
                        {value}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export { UomKpiIcon };
