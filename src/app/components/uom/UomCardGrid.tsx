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
const ICON_BG = "#EDF4FF";

interface UomCardGridProps {
  units: UomUnit[];
  searchQuery?: string;
  onCardClick?: (unit: UomUnit) => void;
}

export function UomCardGrid({
  units,
  searchQuery = "",
  onCardClick,
}: UomCardGridProps) {
  return (
    <div className="p-4">
      {units.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Atom className="w-8 h-8" />
          <p className="text-sm">No units match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {units.map((unit) => (
            <UomCard
              key={unit.id}
              unit={unit}
              searchQuery={searchQuery}
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
}

function UomCard({ unit, searchQuery = "", onClick }: UomCardProps) {
  const icon = CATEGORY_ICON_MAP[unit.category] || <Atom size={16} />;
  const iconBg = CATEGORY_BG[unit.category] || "#F1F5F9";

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
      onClick={onClick}
    >
      {/* Card header: icon tile + name/symbol + actions menu */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
            style={{ backgroundColor: iconBg, color: "#0A77FF" }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm truncate" style={{ fontWeight: 500 }}>
              <HighlightText text={unit.name} query={searchQuery} />
            </p>
            <p className="text-xs text-muted-foreground">{unit.symbol}</p>
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
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <CategoryBadge category={unit.category} />
        <TypeLabel type={unit.type} />
        <InUseBadge inUse={unit.inUse} count={unit.inUseCount} />
      </div>

      {/* KPI rows: label left, value right */}
      <div className="space-y-1.5 text-xs text-muted-foreground">
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
