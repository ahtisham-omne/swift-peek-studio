/**
 * UOM Module — Notion-style Column Header Dropdown Menu
 *
 * Appears when clicking a column's filter icon in the table header.
 * Shows: column name, Filter, Sort ▸ (submenu), Group, Hide, Freeze, Wrap Content.
 * Excluded per user request: Edit property, Insert left/right, Duplicate/Delete property.
 */

import React, { useRef, useEffect, useState } from "react";
import {
  Filter,
  EyeOff,
  Snowflake,
  ArrowUpAZ,
  ArrowDownAZ,
  ChevronRight,
  ArrowUpDown,
  Group,
  WrapText,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

interface UomColumnHeaderMenuProps {
  columnKey: string;
  columnLabel: string;
  canHide: boolean;
  isFrozen: boolean;
  isSortable: boolean;
  currentSortField?: string;
  currentSortDirection?: "asc" | "desc";
  isWrapped?: boolean;
  isGrouped?: boolean;
  onFilter: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onGroup: () => void;
  onHide: () => void;
  onToggleFreeze: () => void;
  onToggleWrap: () => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

/* ═══════════════════════════════════════════════
   Menu Row
   ═══════════════════════════════════════════════ */

function MenuRow({
  icon,
  label,
  active,
  disabled,
  hasSubmenu,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  hasSubmenu?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled)
          e.currentTarget.style.backgroundColor = "var(--surface-hover)";
        onMouseEnter?.();
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        onMouseLeave?.();
      }}
      className="flex items-center gap-[8px] w-full px-3 py-[7px] text-left transition-colors cursor-pointer"
      style={{
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Inter', sans-serif",
        border: "none",
        backgroundColor: "transparent",
      }}
    >
      <span
        style={{
          color: active ? "var(--primary)" : "var(--text-muted)",
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {icon}
      </span>
      <span
        className="flex-1"
        style={{
          fontSize: 13,
          lineHeight: "1.4",
          color: active ? "var(--primary-text-strong)" : "var(--text-strong)",
          fontWeight: "var(--font-weight-normal)" as any,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </span>
      {hasSubmenu && (
        <ChevronRight
          size={13}
          style={{ color: "var(--text-subtle)", flexShrink: 0 }}
        />
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Divider
   ═══════════════════════════════════════════════ */

function MenuDivider() {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: "var(--border-subtle)",
        margin: "4px 0",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

export function UomColumnHeaderMenu({
  columnKey,
  columnLabel,
  canHide,
  isFrozen,
  isSortable,
  currentSortField,
  currentSortDirection,
  isWrapped = false,
  isGrouped = false,
  onFilter,
  onSortAsc,
  onSortDesc,
  onGroup,
  onHide,
  onToggleFreeze,
  onToggleWrap,
  onClose,
  anchorRect,
}: UomColumnHeaderMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showSortSub, setShowSortSub] = useState(false);
  const sortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActiveSortCol = currentSortField === columnKey;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Cleanup sort submenu timer
  useEffect(() => {
    return () => {
      if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
    };
  }, []);

  // Calculate position
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
  };

  if (anchorRect) {
    menuStyle.top = anchorRect.bottom + 4;
    menuStyle.left = anchorRect.left;

    // Don't go off screen right
    if (anchorRect.left + 220 > window.innerWidth) {
      menuStyle.left = window.innerWidth - 230;
    }
    // Don't go off screen bottom
    if (anchorRect.bottom + 320 > window.innerHeight) {
      menuStyle.top = anchorRect.top - 320;
      if ((menuStyle.top as number) < 8) menuStyle.top = 8;
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        style={{
          ...menuStyle,
          width: 220,
          backgroundColor: "var(--popover)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          boxShadow:
            "var(--elevation-md)",
          overflow: "visible",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Column name header */}
        <div
          className="px-3 py-[10px]"
          style={{
            borderColor: "var(--border-subtle)",
            borderBottomWidth: 1,
            borderBottomStyle: "solid" as const,
          }}
        >
          <span
            className="truncate block"
            style={{
              fontSize: 13,
              lineHeight: "1.4",
              color: "var(--text-strong)",
              fontWeight: "var(--font-weight-medium)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {columnLabel}
          </span>
        </div>

        {/* Menu items */}
        <div className="py-[4px]">
          {/* Filter */}
          <MenuRow
            icon={<Filter size={15} />}
            label="Filter"
            onClick={() => {
              onFilter();
              onClose();
            }}
          />

          {/* Sort — with submenu */}
          {isSortable && (
            <div
              className="relative"
              onMouseEnter={() => {
                if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
                setShowSortSub(true);
              }}
              onMouseLeave={() => {
                sortTimerRef.current = setTimeout(
                  () => setShowSortSub(false),
                  150
                );
              }}
            >
              <MenuRow
                icon={<ArrowUpDown size={15} />}
                label="Sort"
                active={isActiveSortCol}
                hasSubmenu
                onClick={() => setShowSortSub((v) => !v)}
              />

              {/* Sort submenu */}
              {showSortSub && (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    left: "100%",
                    marginLeft: 4,
                    width: 180,
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    boxShadow:
                      "var(--elevation-md)",
                    padding: "4px 0",
                    zIndex: 10000,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <MenuRow
                    icon={<ArrowUpAZ size={15} />}
                    label="Ascending"
                    active={
                      isActiveSortCol && currentSortDirection === "asc"
                    }
                    onClick={() => {
                      onSortAsc();
                      onClose();
                    }}
                  />
                  <MenuRow
                    icon={<ArrowDownAZ size={15} />}
                    label="Descending"
                    active={
                      isActiveSortCol && currentSortDirection === "desc"
                    }
                    onClick={() => {
                      onSortDesc();
                      onClose();
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Group */}
          <MenuRow
            icon={<Group size={15} />}
            label={isGrouped ? "Ungroup" : "Group"}
            active={isGrouped}
            onClick={() => {
              onGroup();
              onClose();
            }}
          />

          <MenuDivider />

          {/* Freeze */}
          <MenuRow
            icon={<Snowflake size={15} />}
            label={isFrozen ? "Unfreeze" : "Freeze"}
            active={isFrozen}
            onClick={() => {
              onToggleFreeze();
              onClose();
            }}
          />

          {/* Hide */}
          <MenuRow
            icon={<EyeOff size={15} />}
            label="Hide"
            disabled={!canHide}
            onClick={() => {
              if (canHide) {
                onHide();
                onClose();
              }
            }}
          />

          {/* Wrap Content */}
          <MenuRow
            icon={<WrapText size={15} />}
            label={isWrapped ? "Unwrap content" : "Wrap content"}
            active={isWrapped}
            onClick={() => {
              onToggleWrap();
              onClose();
            }}
          />
        </div>
      </div>
    </>
  );
}