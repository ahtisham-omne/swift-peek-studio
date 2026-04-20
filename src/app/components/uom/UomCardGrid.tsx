/**
 * UOM Module — Card Grid View
 * Matches Partners card view design exactly.
 */

import React from "react";
import type { UomUnit } from "./sample-data";
import { CategoryBadge } from "./CategoryBadge";
import { TypeLabel } from "./TypeLabel";
import { InUseBadge } from "./InUseBadge";
import {
  MoreHorizontal, Eye, Pencil,
  Ruler, Square, Cylinder, Weight, Hash, Clock,
  Thermometer, MoveVertical, Gauge, Zap, Activity, Plug, Waves, Atom,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

/* ── Category icon mapping ── */
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Length: <Ruler size={16} />,
  Area: <Square size={16} />,
  Volume: <Cylinder size={16} />,
  Mass: <Weight size={16} />,
  Quantity: <Hash size={16} />,
  Time: <Clock size={16} />,
  Temperature: <Thermometer size={16} />,
  Force: <MoveVertical size={16} />,
  Pressure: <Gauge size={16} />,
  Energy: <Zap size={16} />,
  Power: <Activity size={16} />,
  Electrical: <Plug size={16} />,
  Frequency: <Waves size={16} />,
  "Other SI": <Atom size={16} />,
};

/* ── Consistent icon tile background ── */
const ICON_BG = "var(--accent)";

type CardSize = "small" | "medium" | "large";

interface UomCardGridProps {
  units: UomUnit[];
  searchQuery?: string;
  onCardClick?: (unit: UomUnit) => void;
  cardSize?: CardSize;
}

export function UomCardGrid({
  units,
  searchQuery = "",
  onCardClick,
  cardSize = "medium",
}: UomCardGridProps) {
  const gridCols =
    cardSize === "large"
      ? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2"
      : cardSize === "small"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="p-4">
      {units.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Atom className="w-8 h-8" />
          <p className="text-sm">No units match your filters.</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${gridCols}`}>
          {units.map((unit) => (
            <UomCard
              key={unit.id}
              unit={unit}
              searchQuery={searchQuery}
              cardSize={cardSize}
              onClick={() => onCardClick?.(unit)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Individual Card ── */

interface UomCardProps {
  unit: UomUnit;
  searchQuery?: string;
  onClick?: () => void;
  cardSize?: CardSize;
}

function UomCard({ unit, searchQuery = "", onClick, cardSize = "medium" }: UomCardProps) {
  const icon = CATEGORY_ICON_MAP[unit.category] || <Atom size={16} />;

  // Scale paddings, icon tile size, and typography based on cardSize (matches Partners scaling).
  const padding = cardSize === "large" ? "p-5" : cardSize === "small" ? "p-3" : "p-4";
  const tileClasses =
    cardSize === "large"
      ? "w-11 h-11"
      : cardSize === "small"
      ? "w-8 h-8"
      : "w-9 h-9";
  const tileIconSize = cardSize === "large" ? 18 : cardSize === "small" ? 14 : 16;
  const nameTextClass = cardSize === "small" ? "text-xs" : "text-sm";
  const symbolTextClass = cardSize === "small" ? "text-[10px]" : "text-xs";
  const kpiTextClass = cardSize === "small" ? "text-[11px]" : "text-xs";
  const sectionGap = cardSize === "large" ? "mb-4" : cardSize === "small" ? "mb-2" : "mb-3";

  const scaledIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: tileIconSize })
    : icon;

  return (
    <div
      className={`bg-card border border-border rounded-xl ${padding} cursor-pointer hover:shadow-md hover:border-primary/20 transition-all`}
      onClick={onClick}
    >
      {/* Card header: icon tile + name/symbol + actions menu */}
      <div className={`flex items-start justify-between ${sectionGap}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`${tileClasses} rounded-lg flex items-center justify-center text-sm shrink-0`}
            style={{ backgroundColor: ICON_BG, color: "var(--primary)" }}
          >
            {scaledIcon}
          </div>
          <div className="min-w-0">
            <p className={`${nameTextClass} truncate`} style={{ fontWeight: 500 }}>
              <HighlightText text={unit.name} query={searchQuery} />
            </p>
            <p className={`${symbolTextClass} text-muted-foreground`}>{unit.symbol}</p>
          </div>
        </div>
        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors cursor-pointer shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
            <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Badges row */}
      <div className={`flex items-center gap-1.5 ${sectionGap} flex-wrap`}>
        <CategoryBadge category={unit.category} />
        <TypeLabel type={unit.type} />
        <InUseBadge inUse={unit.inUse} count={unit.inUseCount} />
      </div>

      {/* KPI rows: label left, value right — hide details in small mode for cleaner look */}
      {cardSize !== "small" && (
        <div className={`space-y-1.5 ${kpiTextClass} text-muted-foreground`}>
          <div className="flex justify-between">
            <span>Category</span>
            <span className="text-foreground" style={{ fontWeight: 500 }}>
              {unit.category}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Type</span>
            <span className="text-foreground">
              {unit.type}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Description</span>
            <span className="text-foreground truncate max-w-[140px]" title={unit.description}>
              {unit.description || "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Search highlight helper ── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;

  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-accent rounded-sm">
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </>
  );
}
