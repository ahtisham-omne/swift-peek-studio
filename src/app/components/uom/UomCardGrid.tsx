/**
 * UOM Module — Card Grid View
 *
 * Compact card layout for unit-of-measure records.
 * Cards follow the Figma reference: rounded-[12px] borders,
 * icon badges with rounded-[8px], hover effects.
 * All colors use CSS custom properties from theme.css.
 */

import React, { useState } from "react";
import type { UomUnit } from "./sample-data";
import { CategoryBadge } from "./CategoryBadge";
import { TypeLabel } from "./TypeLabel";
import { InUseBadge } from "./InUseBadge";
import { ArrowRight, Ruler, Square, Cylinder, Weight, Hash, Clock, Thermometer, MoveVertical, Gauge, Zap, Activity, Plug, Waves, Atom } from "lucide-react";

/* ── Category icon mapping (Lucide icons) ── */
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
    <div
      style={{ padding: "16px 16px 24px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
        {units.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "48px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-weight-normal)" as any,
            }}
          >
            No units match your filters.
          </div>
        ) : (
          units.map((unit) => (
            <UomCard
              key={unit.id}
              unit={unit}
              searchQuery={searchQuery}
              onClick={() => onCardClick?.(unit)}
            />
          ))
        )}
      </div>
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
  const [hovered, setHovered] = useState(false);
  const icon = CATEGORY_ICON_MAP[unit.category] || <Atom size={16} />;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer text-left w-full"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        borderRadius: 12,
        border: hovered
          ? "1px solid var(--primary-border)"
          : "1px solid var(--border)",
        backgroundColor: hovered
          ? "var(--surface-hover)"
          : "var(--card)",
        boxShadow: hovered
          ? "var(--elevation-pill)"
          : "none",
        transition: "all 150ms ease",
      }}
    >
      {/* Top row: icon badge + symbol tag */}
      <div className="flex items-center justify-between">
        {/* Icon badge */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: "var(--primary-surface)",
            color: "var(--primary-soft)",
          }}
        >
          {icon}
        </div>

        {/* Symbol badge */}
        <span
          style={{
            fontSize: "var(--text-label)",
            fontWeight: "var(--font-weight-normal)" as any,
            color: "var(--text-muted)",
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border-subtle)",
            padding: "2px 8px",
            borderRadius: 6,
            lineHeight: 1.4,
          }}
        >
          {unit.symbol}
        </span>
      </div>

      {/* Name — prominent */}
      <div className="min-w-0">
        <span
          className="block truncate"
          style={{
            fontSize: "var(--text-base)",
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--foreground)",
            lineHeight: 1.3,
          }}
        >
          <HighlightText text={unit.name} query={searchQuery} />
        </span>
        <p
          className="truncate"
          style={{
            margin: 0,
            marginTop: 4,
            fontSize: "var(--text-label)",
            fontWeight: "var(--font-weight-normal)" as any,
            color: "var(--text-muted)",
            lineHeight: 1.4,
          }}
        >
          {unit.description}
        </p>
      </div>

      {/* Bottom row: badges + hover arrow */}
      <div className="flex items-center gap-1.5" style={{ flexWrap: "nowrap", overflow: "hidden" }}>
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <CategoryBadge category={unit.category} />
          <TypeLabel type={unit.type} />
        </div>
        <div className="flex-1 shrink" style={{ minWidth: 0 }} />
        <div className="shrink-0">
          {hovered ? (
            <span
              className="flex items-center gap-1 whitespace-nowrap"
              style={{
                fontSize: "var(--text-label)",
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--primary)",
                lineHeight: 1,
              }}
            >
              Open <ArrowRight size={13} />
            </span>
          ) : (
            <InUseBadge
              inUse={unit.inUse}
              count={unit.inUseCount}
            />
          )}
        </div>
      </div>
    </button>
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
      <span
        style={{
          backgroundColor: "var(--highlight-bg)",
          borderRadius: 2,
        }}
      >
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </>
  );
}