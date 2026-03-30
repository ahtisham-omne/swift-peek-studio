/**
 * UOM Module — Bulk Actions Bar
 *
 * Fixed bottom bar that slides in when one or more rows are selected.
 * Provides bulk actions: Archive, Duplicate, Export, Mark In Use / Unused.
 * All colors use CSS custom properties from theme.css.
 */

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Archive,
  Files,
  Download,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

export interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onDeselectAll: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onMarkInUse: () => void;
  onMarkUnused: () => void;
}

/* ═══════════════════════════════════════════════
   Action button with tooltip
   ═══════════════════════════════════════════════ */

function BulkActionBtn({
  label,
  icon,
  onClick,
  variant = "default",
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}) {
  const [hovered, setHovered] = useState(false);
  const isDestructive = variant === "destructive";

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="inline-flex items-center gap-[6px] cursor-pointer border-0 transition-all"
        style={{
          padding: "6px 12px",
          borderRadius: "var(--radius-md)",
          backgroundColor: hovered
            ? isDestructive
              ? "var(--bar-hover-strong)"
              : "var(--bar-hover)"
            : "rgba(0,0,0,0)",
          color: isDestructive
            ? hovered
              ? "var(--destructive-border)"
              : "var(--bar-text-muted)"
            : hovered
              ? "var(--primary-foreground)"
              : "var(--bar-text)",
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-medium)" as any,
          lineHeight: "normal",
          whiteSpace: "nowrap",
        }}
      >
        {icon}
        <span>{label}</span>
      </button>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            padding: "5px 10px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--tooltip-bg)",
            color: "var(--primary-foreground)",
            fontSize: 11,
            fontWeight: "var(--font-weight-medium)" as any,
            lineHeight: 1,
            boxShadow: "var(--elevation-tooltip)",
          }}
        >
          {label}
          <div
            style={{
              position: "absolute",
              bottom: -3,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 6,
              height: 6,
              backgroundColor: "var(--tooltip-bg)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Status Dropdown — Mark as In Use / Unused
   ═══════════════════════════════════════════════ */

function StatusDropdown({
  onMarkInUse,
  onMarkUnused,
}: {
  onMarkInUse: () => void;
  onMarkUnused: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="inline-flex items-center gap-[6px] cursor-pointer border-0 transition-all"
        style={{
          padding: "6px 12px",
          borderRadius: "var(--radius-md)",
          backgroundColor: hovered || open
            ? "var(--bar-hover)"
            : "rgba(0,0,0,0)",
          color: hovered || open
            ? "var(--primary-foreground)"
            : "var(--bar-text)",
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-weight-medium)" as any,
          lineHeight: "normal",
          whiteSpace: "nowrap",
        }}
      >
        <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
        <span>Status</span>
        <ChevronDown
          size={12}
          style={{
            flexShrink: 0,
            transition: "transform 150ms",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0"
              style={{ zIndex: 99998 }}
              onClick={() => setOpen(false)}
            />
            {/* Dropdown — opens upward from the bar */}
            <div
              style={{
                position: "fixed",
                bottom: btnRef.current
                  ? window.innerHeight - btnRef.current.getBoundingClientRect().top + 6
                  : 60,
                left: btnRef.current
                  ? btnRef.current.getBoundingClientRect().left
                  : 0,
                zIndex: 99999,
                minWidth: 190,
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow:
                  "var(--elevation-md-up)",
                padding: "4px 0",
              }}
            >
              <button
                type="button"
                className="flex items-center gap-2.5 w-full cursor-pointer border-none bg-transparent transition-colors"
                style={{
                  padding: "8px 14px",
                  color: "var(--accent-text-strong)",
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  lineHeight: "20px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-surface)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => {
                  onMarkInUse();
                  setOpen(false);
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>Mark as In Use</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2.5 w-full cursor-pointer border-none bg-transparent transition-colors"
                style={{
                  padding: "8px 14px",
                  color: "var(--text-base-second)",
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  lineHeight: "20px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                  e.currentTarget.style.color = "var(--text-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-base-second)";
                }}
                onClick={() => {
                  onMarkUnused();
                  setOpen(false);
                }}
              >
                <XCircle size={15} style={{ flexShrink: 0 }} />
                <span>Mark as Unused</span>
              </button>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Bar Component — fixed bottom
   ═══════════════════════════════════════════════ */

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onDeselectAll,
  onSelectAll,
  onDelete,
  onDuplicate,
  onExport,
  onMarkInUse,
  onMarkUnused,
}: BulkActionsBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return createPortal(
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center border-0"
      style={{
        padding: "0 24px 20px",
        pointerEvents: "none",
      }}
    >
      <div
        className="flex items-center border-0"
        style={{
          height: 48,
          backgroundColor: "var(--primary)",
          borderRadius: "var(--radius-lg)",
          padding: "0 14px",
          gap: 2,
          boxShadow:
            "var(--elevation-lg)",
          pointerEvents: "auto",
          width: "auto",
        }}
      >
        {/* ── Left: Selection info ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Deselect (X) button */}
          <button
            type="button"
            onClick={onDeselectAll}
            className="inline-flex items-center justify-center cursor-pointer border-0 transition-all"
            style={{
              width: 26,
              height: 26,
              padding: 0,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(0,0,0,0)",
              color: "var(--bar-text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bar-hover-strong)";
              e.currentTarget.style.color = "var(--primary-foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
              e.currentTarget.style.color = "var(--bar-text-muted)";
            }}
            aria-label="Deselect all"
          >
            <X size={14} />
          </button>

          {/* Count */}
          <span
            style={{
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-weight-semibold)" as any,
              color: "var(--primary-foreground)",
              lineHeight: "normal",
              whiteSpace: "nowrap",
            }}
          >
            {selectedCount} selected
          </span>

          {/* Select all link */}
          {!allSelected && (
            <>
              <span
                style={{
                  width: 1,
                  height: 14,
                  backgroundColor: "var(--bar-divider-subtle)",
                  flexShrink: 0,
                }}
              />
              <button
                type="button"
                onClick={onSelectAll}
                className="cursor-pointer border-0 transition-all"
                style={{
                  padding: 0,
                  backgroundColor: "rgba(0,0,0,0)",
                  fontSize: 12,
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--bar-text-muted)",
                  lineHeight: "normal",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--primary-foreground)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--bar-text-muted)";
                }}
              >
                Select all {totalCount}
              </button>
            </>
          )}
        </div>

        {/* ── Divider ── */}
        <span
          style={{
            width: 1,
            height: 22,
            backgroundColor: "var(--bar-divider-subtle)",
            flexShrink: 0,
            marginLeft: 10,
            marginRight: 6,
          }}
        />

        {/* ── Center: Action buttons ── */}
        <div className="flex items-center gap-0">
          <BulkActionBtn
            label="Duplicate"
            icon={<Files size={14} style={{ flexShrink: 0 }} />}
            onClick={onDuplicate}
          />

          <BulkActionBtn
            label="Export"
            icon={<Download size={14} style={{ flexShrink: 0 }} />}
            onClick={onExport}
          />

          <StatusDropdown
            onMarkInUse={onMarkInUse}
            onMarkUnused={onMarkUnused}
          />

          {/* ── Divider before destructive ── */}
          <span
            style={{
              width: 1,
              height: 22,
              backgroundColor: "var(--bar-divider-subtle)",
              flexShrink: 0,
              marginLeft: 2,
              marginRight: 2,
            }}
          />

          <BulkActionBtn
            label="Archive"
            icon={<Archive size={14} style={{ flexShrink: 0 }} />}
            onClick={onDelete}
            variant="destructive"
          />
        </div>
      </div>
    </motion.div>,
    document.body
  );
}