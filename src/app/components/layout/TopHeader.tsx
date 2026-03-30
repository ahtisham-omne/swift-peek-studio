/**
 * Omne ERP — Top Header Bar
 *
 * Displays breadcrumb, action icons, search, and user profile.
 * Matches the reference: "Items & Inventory / Module Name" left,
 * +, chat, search, avatar+name right.
 * All colors use CSS custom properties from theme.css.
 * Typography uses 'Inter' font family defined in fonts.css.
 */

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Plus, MessageSquare } from "lucide-react";

/* ═══════════════════════════════════════════════
   Breadcrumb helpers
   ═══════════════════════════════════════════════ */

interface BreadcrumbSegment {
  label: string;
  path?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (pathname === "/") {
    return [
      { label: "Company Setup" },
      { label: "Overview" },
    ];
  }
  if (
    pathname === "/uom" ||
    pathname.startsWith("/uom/filtered") ||
    pathname.startsWith("/uom/empty")
  ) {
    return [
      { label: "Company Setup", path: "/" },
      { label: "Items & Inventory" },
      { label: "Unit of Measure" },
    ];
  }
  if (pathname.startsWith("/unit/")) {
    return [
      { label: "Company Setup", path: "/" },
      { label: "Items & Inventory" },
      { label: "Unit of Measure", path: "/uom" },
      { label: "Unit Detail" },
    ];
  }
  if (pathname === "/items") {
    return [
      { label: "Items & Inventory" },
      { label: "Items" },
    ];
  }
  if (pathname.startsWith("/partners")) {
    const sub = pathname.replace("/partners", "").replace("/", "");
    const subLabels: Record<string, string> = {
      "": "Overview",
      list: "Partners",
      groups: "Partner Groups",
      contacts: "Contacts Directory",
      credit: "Credit Management",
      carrier: "Carrier Management",
      locations: "Partner Locations",
      reports: "Reports & Analytics",
      vendors: "Qualified Vendors",
    };
    return [
      { label: "Partners Management", path: "/partners" },
      { label: subLabels[sub] || "Overview" },
    ];
  }
  if (pathname.startsWith("/supply-chain")) {
    return [{ label: "Supply Chain Management" }];
  }
  if (pathname.startsWith("/production")) {
    return [{ label: "Production & Planning" }];
  }
  if (pathname.startsWith("/sales")) {
    return [{ label: "Sales" }];
  }
  if (pathname.startsWith("/accounting")) {
    return [{ label: "Accounting & Finance" }];
  }
  if (pathname.startsWith("/people")) {
    return [{ label: "People Management" }];
  }
  if (pathname.startsWith("/company")) {
    const sub = pathname.replace("/company/", "").replace("/company", "");
    const subLabels: Record<string, string> = {
      "buildings": "Buildings",
      "work-centers": "Work Centers",
      "shift-policies": "Shift Policies",
      "clock-policies": "Clock In / Clock Out Policies",
      "overtime-policies": "Overtime Policies",
      "auth-policies": "Authentication Policies",
    };
    return [
      { label: "Company Setup", path: "/" },
      { label: subLabels[sub] || "Overview" },
    ];
  }
  return [{ label: "Dashboard" }];
}

/* ═══════════════════════════════════════════════
   Icon Button (reusable)
   ═══════════════════════════════════════════════ */

function HeaderIconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center justify-center shrink-0 cursor-pointer transition-colors"
      style={{
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--card)",
        color: "var(--text-default)",
        padding: 0,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   TopHeader Component
   ═══════════════════════════════════════════════ */

export function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className="flex items-center shrink-0"
      style={{
        height: 56,
        padding: "0 24px",
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Left: Breadcrumb ── */}
      <div className="flex items-center flex-1 min-w-0" style={{ gap: 8 }}>
        {breadcrumbs.map((seg, idx) => (
          <span key={idx} className="flex items-center" style={{ gap: 8 }}>
            {idx > 0 && (
              <span
                className="text-[13px]"
                style={{
                  color: "var(--text-subtle)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  lineHeight: 1,
                }}
              >
                /
              </span>
            )}
            <span
              className="text-[13px] truncate"
              style={{
                color:
                  idx === breadcrumbs.length - 1
                    ? "var(--text-strong)"
                    : "var(--text-muted)",
                fontWeight:
                  idx === breadcrumbs.length - 1
                    ? ("var(--font-weight-semibold)" as any)
                    : ("var(--font-weight-normal)" as any),
                cursor: seg.path ? "pointer" : "default",
                lineHeight: 1,
              }}
              onClick={() => {
                if (seg.path) navigate(seg.path);
              }}
              onMouseEnter={(e) => {
                if (seg.path) {
                  (e.currentTarget as HTMLElement).style.color = "var(--primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (seg.path) {
                  (e.currentTarget as HTMLElement).style.color =
                    idx === breadcrumbs.length - 1
                      ? "var(--text-strong)"
                      : "var(--text-muted)";
                }
              }}
            >
              {seg.label}
            </span>
          </span>
        ))}
      </div>

      {/* ── Right: Actions group ── */}
      <div className="flex items-center shrink-0" style={{ gap: 12 }}>
        {/* + Add button */}
        <HeaderIconButton title="Add new">
          <Plus size={16} strokeWidth={2} />
        </HeaderIconButton>

        {/* Chat / Comments button */}
        <HeaderIconButton title="Messages">
          <MessageSquare size={16} strokeWidth={2} />
        </HeaderIconButton>

        {/* Search field */}
        <div
          className="flex items-center"
          style={{
            gap: 6,
            padding: "7px 14px",
            borderRadius: "var(--radius-md)",
            border: searchFocused
              ? "1px solid var(--primary-border)"
              : "1px solid var(--border)",
            backgroundColor: "var(--card)",
            transition: "border-color 150ms ease",
            minWidth: 160,
          }}
        >
          <Search
            size={14}
            strokeWidth={2}
            style={{ color: "var(--text-subtle)", flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="outline-none bg-transparent text-[13px] w-full"
            style={{
              border: "none",
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "var(--font-weight-normal)" as any,
              lineHeight: 1,
              padding: 0,
            }}
          />
        </div>

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 28,
            backgroundColor: "var(--border)",
            flexShrink: 0,
          }}
        />

        {/* User profile */}
        <div className="flex items-center shrink-0" style={{ gap: 10 }}>
          {/* Avatar */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              backgroundColor: "var(--primary-surface)",
              border: "2px solid var(--primary-border)",
              color: "var(--sidebar-primary)",
              fontSize: 12,
              fontWeight: "var(--font-weight-semibold)" as any,
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1,
            }}
          >
            AA
          </div>

          <div className="min-w-0">
            <div
              className="text-[13px] truncate"
              style={{
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--foreground)",
                lineHeight: "1.3",
              }}
            >
              Ahtisham Ahmad
            </div>
            <div
              className="text-[11px] truncate"
              style={{
                color: "var(--text-muted)",
                fontWeight: "var(--font-weight-normal)" as any,
                lineHeight: "1.3",
              }}
            >
              Sr. Product Designer
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}