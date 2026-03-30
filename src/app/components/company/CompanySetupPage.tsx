/**
 * Omne ERP — Company Setup Homepage
 *
 * The main entry point / homepage for the ERP application.
 * Grouped module cards organized by section, following the
 * Figma Partners Management card styling reference.
 *
 * All colors use CSS custom properties from theme.css.
 * Typography uses 'Inter' font family defined in fonts.css.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Factory,
  Clock,
  Timer,
  Users,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Data Types & Content
   ═══════════════════════════════════════════════ */

interface ModuleCard {
  title: string;
  description: string;
  icon: LucideIcon | null;
  /** Custom SVG icon override (for UoM) */
  customIcon?: boolean;
  iconColor: string;
  iconBg: string;
  count: number;
  path: string;
}

interface Section {
  title: string;
  cards: ModuleCard[];
}

const SECTIONS: Section[] = [
  {
    title: "Building & Facilities",
    cards: [
      {
        title: "Buildings",
        description: "Manage buildings, floors, and infrastructure",
        icon: Building2,
        iconColor: "#0A77FF",
        iconBg: "#EDF4FF",
        count: 2,
        path: "/company/buildings",
      },
      {
        title: "Work Centers",
        description: "Configure production work centers and stations",
        icon: Factory,
        iconColor: "#EA580C",
        iconBg: "#FFF7ED",
        count: 109,
        path: "/company/work-centers",
      },
    ],
  },
  {
    title: "People & Availabilities",
    cards: [
      {
        title: "Shift Policies",
        description: "Define shift schedules and rotation rules",
        icon: Clock,
        iconColor: "#7C3AED",
        iconBg: "#F5F3FF",
        count: 9,
        path: "/company/shift-policies",
      },
      {
        title: "Clock In / Clock Out Policies",
        description: "Configure attendance tracking and time rules",
        icon: Timer,
        iconColor: "#059669",
        iconBg: "#ECFDF5",
        count: 8,
        path: "/company/clock-policies",
      },
      {
        title: "Overtime Policies",
        description: "Set overtime thresholds and compensation rules",
        icon: Users,
        iconColor: "#0891B2",
        iconBg: "#ECFEFF",
        count: 1200,
        path: "/company/overtime-policies",
      },
      {
        title: "Authentication Policies",
        description: "Manage login methods and security settings",
        icon: ShieldCheck,
        iconColor: "#E11D48",
        iconBg: "#FFF1F2",
        count: 109,
        path: "/company/auth-policies",
      },
    ],
  },
  {
    title: "Item & Inventory",
    cards: [
      {
        title: "Units of Measures",
        description: "Customize & manage units and their conversions",
        icon: null,
        customIcon: true,
        iconColor: "#0A77FF",
        iconBg: "#EDF4FF",
        count: 20,
        path: "/uom",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════
   UoM Icon (arrows ⇄)
   ═══════════════════════════════════════════════ */

function UomIcon({ color }: { color: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth={1.33}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.33 2L2.67 4.67l2.66 2.66" />
      <path d="M2.67 4.67h10.66" />
      <path d="M10.67 14l2.66-2.67-2.66-2.66" />
      <path d="M13.33 11.33H2.67" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   Module Card Component — matches Figma reference
   ═══════════════════════════════════════════════ */

function ModuleCardItem({
  card,
  onNavigate,
}: {
  card: ModuleCard;
  onNavigate: (path: string) => void;
}) {
  const Icon = card.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(card.path)}
      className="group/card relative text-left border-0 outline-none cursor-pointer"
      style={{
        padding: "13px 15px 14px",
        borderRadius: 12,
        backgroundColor: "var(--card)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--border)",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
        fontFamily: "var(--font-family)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--primary-border)";
        e.currentTarget.style.boxShadow =
          "0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(10,119,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Hover action — top right: "Open →" */}
      <div
        className="absolute flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100"
        style={{
          top: 10,
          right: 10,
          transition: "opacity 150ms ease",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--primary)",
            fontWeight: "var(--font-weight-medium)" as any,
            fontFamily: "var(--font-family)",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          Open
          <ArrowRight size={12} strokeWidth={2} />
        </span>
      </div>

      {/* Icon badge — 32×32, rounded-[8px] */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: card.iconBg,
          marginBottom: 8,
        }}
      >
        {card.customIcon ? (
          <UomIcon color={card.iconColor} />
        ) : Icon ? (
          <Icon
            size={16}
            strokeWidth={1.33}
            style={{ color: card.iconColor }}
          />
        ) : null}
      </div>

      {/* Title + Count badge */}
      <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--foreground)",
            lineHeight: "19.5px",
            fontFamily: "var(--font-family)",
          }}
        >
          {card.title}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: "var(--font-weight-medium)" as any,
            color: card.iconColor,
            backgroundColor: card.iconBg,
            padding: "1px 7px",
            borderRadius: 6,
            lineHeight: "16.5px",
            fontFamily: "var(--font-family)",
            whiteSpace: "nowrap",
          }}
        >
          {card.count < 10
            ? `0${card.count}`
            : card.count.toLocaleString()}
        </span>
      </div>

      {/* Description */}
      <span
        style={{
          fontSize: 11,
          fontWeight: "var(--font-weight-normal)" as any,
          color: "var(--text-muted)",
          lineHeight: "17.875px",
          fontFamily: "var(--font-family)",
        }}
      >
        {card.description}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════ */

export function CompanySetupPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "100%" }}>
      {/* ── CONTENT AREA ── */}
      <div
        className="mx-auto"
        style={{
          maxWidth: "var(--container-max-width)",
          padding: "16px 24px 40px",
        }}
      >
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 16 }}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 2 }}
          >
            <h1
              style={{
                fontSize: 24,
                fontWeight: "var(--font-weight-semibold)" as any,
                color: "var(--foreground)",
                margin: 0,
                lineHeight: "32px",
                letterSpacing: "-0.6px",
                fontFamily: "var(--font-family)",
              }}
            >
              Company Setup
            </h1>

            {/* Reset button */}
            <button
              type="button"
              className="inline-flex items-center cursor-pointer bg-transparent"
              style={{
                gap: 6,
                padding: "5px 11px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--text-muted)",
                fontFamily: "var(--font-family)",
                fontSize: 12,
                fontWeight: "var(--font-weight-medium)" as any,
                lineHeight: "16px",
              }}
            >
              <RotateCcw size={12} strokeWidth={1.5} />
              Reset
            </button>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: "var(--font-weight-normal)" as any,
              color: "var(--text-muted)",
              lineHeight: "20px",
              fontFamily: "var(--font-family)",
            }}
          >
            Company setup involves establishing the essential framework for
            efficient resource allocation and production planning.{" "}
            <button
              type="button"
              className="inline-flex items-center gap-1 cursor-pointer border-none bg-transparent"
              style={{
                color: "var(--primary)",
                fontWeight: "var(--font-weight-medium)" as any,
                fontSize: 14,
                padding: 0,
                fontFamily: "var(--font-family)",
                lineHeight: "20px",
              }}
            >
              Learn more
              <ArrowUpRight size={12} strokeWidth={1.5} />
            </button>
          </p>
        </div>

        {/* ── Sections ── */}
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            {/* Section title — matches Figma "Modules" label */}
            <h4
              style={{
                fontSize: 14,
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--text-muted)",
                margin: 0,
                marginBottom: 10,
                lineHeight: "20px",
                letterSpacing: "-0.14px",
                fontFamily: "var(--font-family)",
              }}
            >
              {section.title}
            </h4>

            {/* Cards grid — 3 col, 10px gap */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {section.cards.map((card) => (
                <ModuleCardItem
                  key={card.title}
                  card={card}
                  onNavigate={navigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanySetupPage;
