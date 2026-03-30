/**
 * Omne ERP — Left Sidebar Navigation
 *
 * Hover-to-expand sidebar matching the Notion-style reference design.
 * Collapsed by default (icons only), expands on hover or can be pinned open.
 * All colors use CSS custom properties from theme.css.
 * Typography uses 'Inter' font family defined in fonts.css.
 */

import React, { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package,
  Handshake,
  Truck,
  Factory,
  ShoppingCart,
  Calculator,
  Users,
  Building2,
  Settings,
  Bell,
  LogOut,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Navigation Data
   ═══════════════════════════════════════════════ */

interface NavSubItem {
  label: string;
  path: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavSubItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "company",
    label: "Company Setup",
    icon: Building2,
    path: "/",
    children: [
      { label: "Overview", path: "/" },
      { label: "Buildings", path: "/company/buildings" },
      { label: "Work Centers", path: "/company/work-centers" },
      { label: "Shift Policies", path: "/company/shift-policies" },
      { label: "Clock In / Clock Out", path: "/company/clock-policies" },
      { label: "Overtime Policies", path: "/company/overtime-policies" },
      { label: "Auth Policies", path: "/company/auth-policies" },
    ],
  },
  {
    key: "items",
    label: "Items & Inventory",
    icon: Package,
    path: "/items",
    children: [
      { label: "Overview", path: "/items" },
      { label: "Unit of Measure", path: "/uom" },
    ],
  },
  {
    key: "partners",
    label: "Partners Management",
    icon: Handshake,
    path: "/partners",
    children: [
      { label: "Overview", path: "/partners" },
      { label: "Partners", path: "/partners/list" },
      { label: "Partner Groups", path: "/partners/groups" },
      { label: "Contacts Directory", path: "/partners/contacts" },
      { label: "Credit Management", path: "/partners/credit" },
      { label: "Carrier Management", path: "/partners/carrier" },
      { label: "Partner Locations", path: "/partners/locations" },
      { label: "Qualified Vendors", path: "/partners/vendors" },
      { label: "Reports & Analytics", path: "/partners/reports" },
    ],
  },
  {
    key: "supply",
    label: "Supply Chain Management",
    icon: Truck,
    path: "/supply-chain",
  },
  {
    key: "production",
    label: "Production & Planning",
    icon: Factory,
    path: "/production",
  },
  {
    key: "sales",
    label: "Sales",
    icon: ShoppingCart,
    path: "/sales",
    children: [
      { label: "Overview", path: "/sales" },
      { label: "Quotes", path: "/quotes/view" },
    ],
  },
  {
    key: "accounting",
    label: "Accounting & Finance",
    icon: Calculator,
    path: "/accounting",
  },
  {
    key: "people",
    label: "People Management",
    icon: Users,
    path: "/people",
  },
];

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 60;

/* ═══════════════════════════════════════════════
   Sidebar Component
   ═══════════════════════════════════════════════ */

export interface SidebarProps {
  pinned: boolean;
  onTogglePin: () => void;
}

export function Sidebar({ pinned, onTogglePin }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    getActiveSection(location.pathname)
  );
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sidebar is visually expanded when pinned OR hovered
  const isExpanded = pinned || hovered;
  const sidebarWidth = isExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setHovered(true), 120);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setHovered(false), 200);
  }, []);

  function getActiveSection(pathname: string): string | null {
    for (const item of NAV_ITEMS) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path === pathname) return item.key;
        }
      }
      if (item.path === pathname) return item.key;
    }
    return "items";
  }

  function isItemActive(item: NavItem): boolean {
    if (item.children) {
      return item.children.some((c) => c.path === location.pathname);
    }
    return item.path === location.pathname;
  }

  function isSubItemActive(sub: NavSubItem): boolean {
    return sub.path === location.pathname;
  }

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      if (!isExpanded) {
        // If collapsed, expand via pin and open section
        onTogglePin();
        setExpandedSection(item.key);
      } else {
        setExpandedSection(expandedSection === item.key ? null : item.key);
      }
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubItemClick = (sub: NavSubItem) => {
    navigate(sub.path);
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col shrink-0 h-screen select-none"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        backgroundColor: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
        transition:
          "width 220ms cubic-bezier(0.4, 0, 0.2, 1), min-width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        zIndex: 40,
        position: "relative",
      }}
    >
      {/* ── Brand header ── */}
      <div
        className="flex items-center shrink-0"
        style={{
          padding: isExpanded ? "16px 16px" : "16px 0",
          minHeight: 60,
          gap: isExpanded ? 10 : 0,
          justifyContent: isExpanded ? "flex-start" : "center",
        }}
      >
        {/* Logo mark */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background:
              "linear-gradient(135deg, var(--primary-icon) 0%, var(--primary) 100%)",
            color: "var(--primary-foreground)",
            fontWeight: "var(--font-weight-semibold)" as any,
            fontSize: "var(--text-label)",
            // fontFamily: "'Inter', sans-serif",
          }}
        >
          O
        </div>

        {isExpanded && (
          <>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                className="truncate"
                style={{
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-semibold)" as any,
                  color: "var(--sidebar-foreground)",
                  lineHeight: "1.3",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Omnesoft
              </div>
              <div
                className="truncate"
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  lineHeight: "1.3",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Enterprise Resource Planni...
              </div>
            </div>

            <button
              type="button"
              onClick={onTogglePin}
              className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-none transition-colors"
              style={{
                width: 26,
                height: 26,
                borderRadius: "var(--radius-sm)",
                color: pinned ? "var(--sidebar-primary)" : "var(--text-muted)",
                padding: 0,
                opacity: pinned ? 1 : 0.7,
              }}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              title={pinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              <ChevronsRight
                size={16}
                style={{
                  transform: pinned ? "rotate(180deg)" : "none",
                  transition: "transform 200ms ease",
                }}
              />
            </button>
          </>
        )}
      </div>

      {/* ── Main navigation ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-overlay"
        style={{ padding: isExpanded ? "4px 10px" : "4px 8px" }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          const expanded = expandedSection === item.key && !!item.children;

          return (
            <div key={item.key} style={{ marginBottom: 1 }}>
              {/* Main nav item */}
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                className="flex items-center w-full cursor-pointer bg-transparent border-none transition-all group"
                style={{
                  padding: isExpanded ? "8px 10px" : "8px 0",
                  gap: isExpanded ? 10 : 0,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: active
                    ? "var(--primary-surface)"
                    : "transparent",
                  color: active
                    ? "var(--sidebar-primary)"
                    : "var(--text-default)",
                  fontFamily: "'Inter', sans-serif",
                  justifyContent: isExpanded ? "flex-start" : "center",
                }}
                title={!isExpanded ? item.label : undefined}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--surface-raised)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent";
                  }
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  style={{
                    flexShrink: 0,
                    color: active
                      ? "var(--sidebar-primary)"
                      : "var(--text-muted)",
                    transition: "color 150ms ease",
                  }}
                />

                {isExpanded && (
                  <>
                    <span
                      className="flex-1 text-left truncate"
                      style={{
                        fontSize: "var(--text-label)",
                        fontWeight: active
                          ? ("var(--font-weight-semibold)" as any)
                          : ("var(--font-weight-medium)" as any),
                        transition: "color 150ms ease",
                        lineHeight: "1.4",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {item.label}
                    </span>

                    {item.children && (
                      <span
                        style={{
                          color: active
                            ? "var(--sidebar-primary)"
                            : "var(--text-subtle)",
                          flexShrink: 0,
                          transition: "transform 200ms ease",
                          transform: expanded
                            ? "rotate(0deg)"
                            : "rotate(-90deg)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ChevronDown size={14} />
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Sub-navigation */}
              {isExpanded && item.children && (
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: expanded ? item.children.length * 38 : 0,
                    opacity: expanded ? 1 : 0,
                    transition:
                      "max-height 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease",
                    paddingLeft: 38,
                  }}
                >
                  {item.children.map((sub) => {
                    const subActive = isSubItemActive(sub);
                    return (
                      <button
                        key={sub.path}
                        type="button"
                        onClick={() => handleSubItemClick(sub)}
                        className="flex items-center w-full cursor-pointer bg-transparent border-none transition-all"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: subActive
                            ? "var(--primary-surface)"
                            : "transparent",
                          color: subActive
                            ? "var(--sidebar-primary)"
                            : "var(--text-default)",
                          fontFamily: "'Inter', sans-serif",
                          marginBottom: 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!subActive) {
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor = "var(--surface-raised)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!subActive) {
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <span
                          className="truncate"
                          style={{
                            fontSize: 13,
                            fontWeight: subActive
                              ? ("var(--font-weight-semibold)" as any)
                              : ("var(--font-weight-normal)" as any),
                            lineHeight: "1.5",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {sub.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div
        className="shrink-0"
        style={{
          borderTop: "1px solid var(--sidebar-border)",
          padding: isExpanded ? "8px 10px" : "8px 8px",
        }}
      >
        {/* Settings row */}
        <div
          className="flex items-center"
          style={{
            padding: isExpanded ? "8px 10px" : "8px 0",
            gap: isExpanded ? 10 : 0,
            justifyContent: isExpanded ? "flex-start" : "center",
          }}
        >
          <button
            type="button"
            className="flex items-center cursor-pointer bg-transparent border-none transition-colors"
            style={{
              gap: 10,
              padding: 0,
              color: "var(--text-default)",
              fontFamily: "'Inter', sans-serif",
            }}
            title="Settings"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
          >
            <Settings
              size={20}
              strokeWidth={1.8}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
            {isExpanded && (
              <span
                style={{
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--text-default)",
                  lineHeight: "1.4",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Settings
              </span>
            )}
          </button>

          {isExpanded && (
            <button
              type="button"
              className="ml-auto flex items-center justify-center cursor-pointer bg-transparent border-none transition-colors"
              style={{
                padding: 0,
                color: "var(--text-muted)",
              }}
              title="Notifications"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              <Bell size={18} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* User profile row */}
        <div
          className="flex items-center"
          style={{
            padding: isExpanded ? "10px 10px" : "10px 0",
            gap: isExpanded ? 10 : 0,
            justifyContent: isExpanded ? "flex-start" : "center",
            borderTop: "1px solid var(--sidebar-border)",
            marginTop: 4,
          }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--primary-surface)",
              border: "1.5px solid var(--primary-border)",
              color: "var(--sidebar-primary)",
              fontSize: 12,
              fontWeight: "var(--font-weight-semibold)" as any,
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1,
            }}
          >
            AA
          </div>

          {isExpanded && (
            <>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div
                  className="truncate"
                  style={{
                    fontSize: 13,
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--sidebar-foreground)",
                    lineHeight: "1.3",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Ahtisham Ahmad
                </div>
                <div
                  className="truncate"
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontWeight: "var(--font-weight-normal)" as any,
                    lineHeight: "1.3",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  admin@omnesoft.com
                </div>
              </div>

              <button
                type="button"
                className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-none transition-colors"
                style={{
                  padding: 0,
                  color: "var(--text-muted)",
                }}
                title="Log out"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "0.7";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                }}
              >
                <LogOut size={16} strokeWidth={1.8} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}