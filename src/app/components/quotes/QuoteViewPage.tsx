/**
 * Quotes — View Quote Page
 *
 * Full quote detail page with line items table and right sidebar cards.
 * All colors use CSS custom properties from theme.css.
 * Typography uses 'Inter' font family defined in fonts.css.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Download,
  Copy,
  ChevronDown,
  ChevronRight,
  Pencil,
  Package,
  TrendingUp,
  Paperclip,
  Link2,
  MessageSquare,
  Activity,
  GitBranch,
  Plus,
  Printer,
  CalendarDays,
  X,
  Check,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */

interface LineItem {
  id: string;
  productCode: string;
  serialized: boolean;
  serializationLabel: string;
  description: string;
  qty: number;
  uom: string;
  ppu: number;
  total: number;
  badges?: { label: string; color: string }[];
}

const LINE_ITEMS: LineItem[] = [
  {
    id: "1",
    productCode: "000-100-002",
    serialized: true,
    serializationLabel: "Serialized",
    description:
      "E-450 stripped chassis, 176\" WB, 7.3L V8, DRW, 16,000 GVWR, ambulance prep with reinforced frame, heavy-duty alternator, and...",
    qty: 2,
    uom: "EA",
    ppu: 48200.0,
    total: 90876,
  },
  {
    id: "2",
    productCode: "000-100-019",
    serialized: true,
    serializationLabel: "Serialized",
    description:
      'Cutaway-mount modular body, 152" compartment, 72" headroom, full walk-through cab access, aluminum/composite construction, KKK-A...',
    qty: 2,
    uom: "EA",
    ppu: 94200.0,
    total: 182480,
  },
  {
    id: "3",
    productCode: "000-100-019",
    serialized: true,
    serializationLabel: "Serialized",
    description:
      'Same module spec as line 2 but configured as bariatric-ready variant with 96" interior width option, reinforced stretcher rail, and widened...',
    qty: 1,
    uom: "EA",
    ppu: 94200.0,
    total: 101736,
    badges: [{ label: "Duplicate of #2", color: "var(--chart-3)" }],
  },
  {
    id: "4",
    productCode: "000-100-026",
    serialized: false,
    serializationLabel: "Non-Serialized",
    description:
      '54" full-size LED lightbar with 16 modules, red/white split for ambulance, integrated alley/takedown lights, programmable flash...',
    qty: 3,
    uom: "EA",
    ppu: 3250.0,
    total: 9165,
  },
  {
    id: "5",
    productCode: "000-100-041",
    serialized: false,
    serializationLabel: "Non-Serialized",
    description:
      "200-watt electronic siren with PA, wail/yelp/phaser/hi-lo tones, radio rebroadcast input, backlit controls, includes mounting bracket and...",
    qty: 3,
    uom: "EA",
    ppu: 685.0,
    total: 2055,
  },
  {
    id: "6",
    productCode: "000-100-049",
    serialized: true,
    serializationLabel: "Serialized",
    description:
      "Multi-band P25 Phase II mobile, VHF/UHF/700/800 MHz, TDMA, AES 256 encryption, GPS, Bluetooth, OTAP ready, Includes remote head d...",
    qty: 3,
    uom: "EA",
    ppu: 7850.0,
    total: 21174,
  },
  {
    id: "7",
    productCode: "000-100-059",
    serialized: true,
    serializationLabel: "Serialized",
    description:
      "Powered hydraulic stretcher, 700 lb capacity, battery operated, auto-...",
    qty: 2,
    uom: "EA",
    ppu: 18500.0,
    total: 34200,
  },
];

const TABS = [
  { key: "line-items", label: "Line Items", icon: Package, count: 5 },
  { key: "deal-info", label: "Deal Information", icon: TrendingUp, count: null },
  { key: "attachments", label: "Attachments", icon: Paperclip, count: 12 },
  { key: "linked", label: "Linked Transactions", icon: Link2, count: 9 },
  { key: "comms", label: "Communications", icon: MessageSquare, count: null },
  { key: "activity", label: "Activity", icon: Activity, count: null },
  { key: "versions", label: "Versions", icon: GitBranch, count: 4 },
];

const STATUS_STEPS = [
  { key: "draft", label: "Draft", active: true, done: true },
  { key: "sent", label: "Sent to Customer", active: false, done: false },
  {
    key: "confirmed",
    label: "Confirmed by Customer",
    active: false,
    done: false,
  },
  {
    key: "conversion",
    label: "Sales Order Conversion",
    active: false,
    done: false,
  },
];

/* ═══════════════════════════════════════════════
   Helper: format currency
   ═══════════════════════════════════════════════ */

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

function formatPrice(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

export function QuoteViewPage() {
  const [activeTab, setActiveTab] = useState("line-items");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "var(--secondary)",
        minHeight: "100%",
      }}
    >
      {/* ═══ HEADER AREA ═══ */}
      <div
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
        }}
      >
        {/* ── Breadcrumb ── */}
        <div style={{ padding: "14px 28px 0" }}>
          <div
            className="flex items-center gap-[6px]"
            style={{
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              color: "var(--text-muted)",
              fontWeight: "var(--font-weight-normal)" as any,
            }}
          >
            <span
              className="cursor-pointer"
              style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              Quotes
            </span>
            <ChevronRight size={12} style={{ color: "var(--text-subtle)" }} />
            <span
              style={{
                color: "var(--text-strong)",
                fontWeight: "var(--font-weight-medium)" as any,
              }}
            >
              View Quote
            </span>
          </div>
        </div>

        {/* ── Main header row ── */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "10px 28px 8px" }}
        >
          {/* Left group */}
          <div className="flex items-center gap-[14px]">
            {/* Back */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              className="inline-flex items-center gap-[5px] cursor-pointer"
              style={{
                padding: "5px 12px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--card)",
                color: "var(--text-strong)",
                fontSize: 13,
                fontWeight: "var(--font-weight-medium)" as any,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <ArrowLeft size={14} />
              Back
            </motion.button>

            {/* Doc icon + Quote ID */}
            <div className="flex items-center gap-[8px]">
              <div
                className="inline-flex items-center justify-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--primary-surface)",
                  color: "var(--primary)",
                }}
              >
                <FileText size={15} />
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: "var(--font-weight-semibold)" as any,
                  color: "var(--foreground)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Q-000-000-000
              </span>
            </div>

            {/* V4 Latest badge */}
            <div
              className="inline-flex items-center gap-[5px]"
              style={{
                padding: "3px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface-raised)",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: "var(--font-weight-semibold)" as any,
                  color: "var(--text-strong)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                V4
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--primary-foreground)",
                  backgroundColor: "var(--primary)",
                  padding: "1px 6px",
                  borderRadius: 3,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Latest
              </span>
            </div>

            {/* Date */}
            <div className="inline-flex items-center gap-[4px]">
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Feb 25, 2026
              </span>
              <ChevronDown
                size={12}
                style={{ color: "var(--text-subtle)" }}
              />
            </div>

            {/* High priority pill */}
            <div
              className="inline-flex items-center gap-[5px]"
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                backgroundColor: "var(--destructive)",
                color: "var(--destructive-foreground)",
                fontSize: 12,
                fontWeight: "var(--font-weight-semibold)" as any,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "var(--destructive-foreground)",
                  display: "inline-block",
                  opacity: 0.7,
                }}
              />
              High
            </div>
          </div>

          {/* Right group */}
          <div className="flex items-center gap-[8px]">
            {[
              { icon: Printer, label: "Print" },
              { icon: Download, label: "Download" },
              { icon: Copy, label: "Copy" },
              { icon: CalendarDays, label: "Schedule" },
            ].map(({ icon: Icon, label }) => (
              <motion.button
                key={label}
                whileHover={{ backgroundColor: "var(--surface-raised)" }}
                whileTap={{ scale: 0.94 }}
                type="button"
                aria-label={label}
                className="inline-flex items-center justify-center cursor-pointer"
                style={{
                  width: 34,
                  height: 34,
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--card)",
                  color: "var(--text-muted)",
                  padding: 0,
                  transition: "background-color 0.15s",
                }}
              >
                <Icon size={15} strokeWidth={1.8} />
              </motion.button>
            ))}

            {/* Send to Customer split button */}
            <div className="inline-flex items-center" style={{ marginLeft: 6 }}>
              <motion.button
                whileHover={{ filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="inline-flex items-center cursor-pointer border-none"
                style={{
                  padding: "8px 18px",
                  borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: 13,
                  fontWeight: "var(--font-weight-semibold)" as any,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Send to Customer
              </motion.button>
              <motion.button
                whileHover={{ filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="inline-flex items-center justify-center cursor-pointer border-none"
                style={{
                  width: 34,
                  height: 36,
                  borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderLeftWidth: 1,
                  borderLeftStyle: "solid",
                  borderLeftColor: "var(--bar-divider-subtle)",
                  borderColor: "var(--bar-divider-subtle)",
                  padding: 0,
                }}
              >
                <ChevronDown size={14} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Description line ── */}
        <div
          className="flex items-center gap-[6px]"
          style={{ padding: "0 28px 14px" }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontWeight: "var(--font-weight-normal)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Type III ambulance conversion on Ford E-450 chassis
          </span>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            className="bg-transparent border-none cursor-pointer inline-flex items-center"
            style={{ padding: 2, color: "var(--text-subtle)" }}
          >
            <Pencil size={12} />
          </motion.button>
        </div>

        {/* ── Status Stepper ── */}
        <div
          className="flex items-center"
          style={{
            padding: "14px 28px",
            borderColor: "var(--border)",
            borderTopWidth: 1,
            borderTopStyle: "solid",
          }}
        >
          {STATUS_STEPS.map((step, idx) => (
            <React.Fragment key={step.key}>
              <motion.div
                className="flex items-center gap-[8px]"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.25 }}
              >
                <div
                  className="inline-flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: step.done
                      ? "var(--accent)"
                      : "var(--surface-raised)",
                    color: step.done
                      ? "var(--accent-foreground)"
                      : "var(--text-subtle)",
                    fontSize: 11,
                    fontWeight: "var(--font-weight-semibold)" as any,
                    fontFamily: "'Inter', sans-serif",
                    border: step.done
                      ? "none"
                      : "1.5px solid var(--border-strong)",
                    transition: "all 0.2s",
                  }}
                >
                  {step.done ? (
                    <Check size={13} strokeWidth={2.5} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: step.done
                      ? "var(--accent-text-strong)"
                      : "var(--text-muted)",
                    fontWeight: step.done
                      ? ("var(--font-weight-semibold)" as any)
                      : ("var(--font-weight-normal)" as any),
                    whiteSpace: "nowrap",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {step.label}
                </span>
              </motion.div>
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 0,
                    margin: "0 16px",
                    borderColor: step.done
                      ? "var(--accent)"
                      : "var(--border-strong)",
                    borderTopWidth: 2,
                    borderTopStyle: "dashed",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Info banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.25 }}
          className="flex items-center gap-[10px]"
          style={{
            margin: "0 28px 14px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--primary-surface)",
            border: "1px solid var(--primary-border)",
          }}
        >
          <Pencil
            size={14}
            style={{ color: "var(--primary)", flexShrink: 0 }}
          />
          <div>
            <span
              style={{
                fontSize: 13,
                fontWeight: "var(--font-weight-semibold)" as any,
                color: "var(--primary-text-strong)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Editing Version 4 draft
            </span>
            <br />
            <span
              style={{
                fontSize: 12,
                color: "var(--primary)",
                fontWeight: "var(--font-weight-normal)" as any,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Send when ready to finalize as V4
            </span>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div
          className="flex items-end overflow-x-auto no-scrollbar"
          style={{
            padding: "0 28px",
            gap: 2,
            borderColor: "var(--border)",
            borderTopWidth: 1,
            borderTopStyle: "solid",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                whileHover={{ y: isActive ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-[6px] cursor-pointer border-none outline-none"
                style={{
                  padding: "11px 14px",
                  fontSize: 13,
                  fontWeight: isActive
                    ? ("var(--font-weight-semibold)" as any)
                    : ("var(--font-weight-medium)" as any),
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  backgroundColor: "transparent",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor: isActive
                    ? "var(--primary)"
                    : "transparent",
                  borderColor: isActive ? "var(--primary)" : "transparent",
                  whiteSpace: "nowrap",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  marginBottom: -1,
                  borderRadius: isActive ? "var(--radius-md) var(--radius-md) 0 0" : 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-strong)";
                    e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <motion.span
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive ? 0.95 : 0.65,
                  }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  <tab.icon
                    size={14}
                    strokeWidth={isActive ? 2 : 1.8}
                  />
                </motion.span>
                {tab.label}
                {tab.count != null && (
                  <motion.span
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontSize: 11,
                      padding: "2px 7px",
                      borderRadius: 999,
                      backgroundColor: isActive
                        ? "var(--primary-surface-strong)"
                        : "var(--surface-raised)",
                      color: isActive
                        ? "var(--primary)"
                        : "var(--text-subtle)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.count}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ═══ BODY: Table + Sidebar ═══ */}
      <div
        className="flex"
        style={{
          padding: "20px 28px",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        {/* ── Left: Line Items Table Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: "var(--card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: "14px 20px",
              borderColor: "var(--border)",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: "var(--font-weight-semibold)" as any,
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Line Items
            </span>
            <motion.button
              whileHover={{ filter: "brightness(1.08)" }}
              whileTap={{ scale: 0.96 }}
              type="button"
              className="inline-flex items-center gap-[5px] cursor-pointer border-none"
              style={{
                padding: "7px 16px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                fontSize: 12,
                fontWeight: "var(--font-weight-semibold)" as any,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Add Line Item
            </motion.button>
          </div>

          {/* Column headers */}
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns:
                "44px 28px minmax(200px, 1fr) 100px 120px 100px 32px",
              padding: "0 16px",
              backgroundColor: "var(--secondary)",
              borderColor: "var(--border)",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
            }}
          >
            {/* # */}
            <div
              style={{
                padding: "9px 0",
                fontSize: 11,
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--text-subtle)",
                letterSpacing: "0.04em",
                fontFamily: "'Inter', sans-serif",
                textAlign: "center",
              }}
            />
            {/* expand chevron placeholder */}
            <div />
            <div
              style={{
                padding: "9px 8px",
                fontSize: 11,
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--text-subtle)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              PRODUCT
            </div>
            <div
              style={{
                padding: "9px 4px",
                fontSize: 11,
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--text-subtle)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
                textAlign: "center",
              }}
            >
              QTY / UOM
            </div>
            <div
              style={{
                padding: "9px 8px",
                fontSize: 11,
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--text-subtle)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
                textAlign: "right",
              }}
            >
              PPU
            </div>
            <div
              style={{
                padding: "9px 8px",
                fontSize: 11,
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--text-subtle)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
                textAlign: "right",
              }}
            >
              TOTAL
            </div>
            <div />
          </div>

          {/* ── Rows ── */}
          <div>
            {LINE_ITEMS.map((item, idx) => (
              <LineItemRow
                key={item.id}
                item={item}
                index={idx}
                isLast={idx === LINE_ITEMS.length - 1}
                isHovered={hoveredRow === item.id}
                onHover={(h) => setHoveredRow(h ? item.id : null)}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Right Sidebar Cards ── */}
        <div
          className="flex flex-col shrink-0"
          style={{ width: 280, gap: 16 }}
        >
          <SidebarCard title="CUSTOMER INFORMATION" defaultOpen index={0}>
            <CustomerInfoContent />
          </SidebarCard>

          <SidebarCard title="SHIPPING / BILLING LOCATIONS" index={1} />

          <SidebarCard title="PAYMENT & SHIPPING" index={2} />

          <SidebarCard title="QUOTE SUMMARY" defaultOpen index={3}>
            <QuoteSummaryContent />
          </SidebarCard>

          <SidebarCard title="TIMELINE" defaultOpen index={4}>
            <TimelineContent />
          </SidebarCard>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Line Item Row
   ═══════════════════════════════════════════════ */

function LineItemRow({
  item,
  index,
  isLast,
  isHovered,
  onHover,
}: {
  item: LineItem;
  index: number;
  isLast: boolean;
  isHovered: boolean;
  onHover: (h: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.22 }}
      className="grid items-start"
      style={{
        gridTemplateColumns:
          "44px 28px minmax(200px, 1fr) 100px 120px 100px 32px",
        padding: "14px 16px",
        borderColor: "var(--border-subtle)",
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomStyle: "solid",
        backgroundColor: isHovered ? "var(--surface-hover)" : "transparent",
        transition: "background-color 0.12s ease",
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* # */}
      <div
        style={{
          fontSize: 12,
          color: "var(--text-subtle)",
          fontFamily: "'Inter', sans-serif",
          textAlign: "center",
          paddingTop: 4,
        }}
      >
        {index + 1}
      </div>

      {/* Expand chevron */}
      <div style={{ paddingTop: 4 }}>
        <motion.button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          whileTap={{ scale: 0.85 }}
          className="bg-transparent border-none cursor-pointer inline-flex items-center justify-center"
          style={{
            padding: 0,
            color: "var(--text-subtle)",
            width: 18,
            height: 18,
            borderRadius: "var(--radius-sm)",
            transition: "color 0.15s, background-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-raised)";
            e.currentTarget.style.color = "var(--text-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-subtle)";
          }}
        >
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="inline-flex"
          >
            <ChevronRight size={13} />
          </motion.span>
        </motion.button>
      </div>

      {/* Product */}
      <div style={{ padding: "0 8px" }}>
        <div className="flex items-center gap-[8px] flex-wrap">
          <span
            style={{
              fontSize: 13,
              fontWeight: "var(--font-weight-semibold)" as any,
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {item.productCode}
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              backgroundColor: item.serialized
                ? "var(--primary-surface)"
                : "var(--surface-raised)",
              color: item.serialized
                ? "var(--primary)"
                : "var(--text-muted)",
              fontWeight: "var(--font-weight-medium)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {item.serializationLabel}
          </span>
          {item.badges?.map((b, bi) => (
            <span
              key={bi}
              className="inline-flex items-center gap-[3px]"
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 999,
                backgroundColor: "var(--chart-3-surface, rgba(239,162,47,0.12))",
                color: b.color,
                fontWeight: "var(--font-weight-medium)" as any,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ⚠ {b.label}
            </span>
          ))}
        </div>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            margin: "4px 0 0",
            lineHeight: 1.45,
            fontWeight: "var(--font-weight-normal)" as any,
            fontFamily: "'Inter', sans-serif",
            display: "-webkit-box",
            WebkitLineClamp: expanded ? 20 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.description}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="bg-transparent border-none cursor-pointer"
          style={{
            fontSize: 11,
            color: "var(--primary)",
            fontWeight: "var(--font-weight-medium)" as any,
            padding: 0,
            marginTop: 3,
            fontFamily: "'Inter', sans-serif",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {expanded ? "less ↑" : "more →"}
        </button>
      </div>

      {/* QTY / UOM */}
      <div
        className="flex items-center justify-center gap-[4px]"
        style={{ paddingTop: 2 }}
      >
        <div
          className="inline-flex items-center justify-center"
          style={{
            width: 32,
            height: 28,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            fontSize: 13,
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {item.qty}
        </div>
        <div
          className="inline-flex items-center gap-[2px]"
          style={{
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            fontSize: 12,
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--text-strong)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {item.uom}
          <ChevronDown size={10} style={{ color: "var(--text-subtle)" }} />
        </div>
      </div>

      {/* PPU */}
      <div style={{ paddingTop: 2, textAlign: "right" }}>
        <div
          className="inline-flex items-center"
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            fontSize: 13,
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--text-strong)",
            fontFamily: "'Inter', sans-serif",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--text-subtle)",
              fontWeight: "var(--font-weight-normal)" as any,
            }}
          >
            $
          </span>
          {formatPrice(item.ppu)}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-subtle)",
            marginTop: 3,
            fontWeight: "var(--font-weight-normal)" as any,
            fontFamily: "'Inter', sans-serif",
            textAlign: "right",
          }}
        >
          Each
        </div>
      </div>

      {/* Total */}
      <div
        style={{
          paddingTop: 4,
          textAlign: "right",
          fontSize: 13,
          fontWeight: "var(--font-weight-semibold)" as any,
          color: "var(--foreground)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {formatCurrency(item.total)}
      </div>

      {/* Delete X */}
      <div style={{ paddingTop: 3, textAlign: "center" }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.15, color: "var(--destructive)" }}
          whileTap={{ scale: 0.9 }}
          className="bg-transparent border-none cursor-pointer inline-flex items-center justify-center"
          style={{
            padding: 3,
            color: "var(--text-subtle)",
            borderRadius: "var(--radius-sm)",
            transition: "color 0.15s",
          }}
        >
          <X size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Sidebar Card (collapsible)
   ═══════════════════════════════════════════════ */

function SidebarCard({
  title,
  defaultOpen = false,
  children,
  index,
}: {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  index?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + (index ?? 0) * 0.06, duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        borderColor: "var(--border)",
        overflow: "hidden",
        boxShadow: hovered
          ? "var(--elevation-sm)"
          : "var(--elevation-xs)",
        transition: "box-shadow 0.2s ease",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer"
        style={{
          padding: "12px 16px",
          fontFamily: "'Inter', sans-serif",
          transition: "background-color 0.12s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--surface-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: "var(--font-weight-semibold)" as any,
            color: "var(--text-muted)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            color: "var(--text-subtle)",
            display: "inline-flex",
          }}
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 14px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════��═══════════════════════════════
   Sidebar Content Blocks
   ═══════════════════════════════════════════════ */

function CustomerInfoContent() {
  return (
    <div>
      <div className="flex items-center gap-[10px]">
        <div
          className="inline-flex items-center justify-center shrink-0"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: "var(--primary-surface-strong)",
            color: "var(--primary)",
            fontSize: 13,
            fontWeight: "var(--font-weight-semibold)" as any,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          MC
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: "var(--font-weight-semibold)" as any,
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Metro City Fire & Rescue
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontWeight: "var(--font-weight-normal)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Customer
          </div>
        </div>
      </div>

      {/* Point of contacts */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-subtle)",
            fontWeight: "var(--font-weight-medium)" as any,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          POINT OF CONTACTS
        </div>

        <div className="flex items-center gap-[8px]">
          <div
            className="inline-flex items-center justify-center shrink-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "var(--accent-surface)",
              color: "var(--accent-text-strong)",
              fontSize: 10,
              fontWeight: "var(--font-weight-semibold)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            SM
          </div>
          <div>
            <div className="flex items-center gap-[5px]">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--text-strong)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Sarah Moore
              </span>
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 3,
                  backgroundColor: "var(--chart-3)",
                  color: "var(--primary-foreground)",
                  fontWeight: "var(--font-weight-semibold)" as any,
                  textTransform: "uppercase",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                PRIMARY
              </span>
            </div>
          </div>
        </div>

        {/* Stacked avatars row */}
        <div
          className="flex items-center"
          style={{ marginTop: 8, marginLeft: 36 }}
        >
          {[
            { initials: "TW", bg: "var(--chart-4)" },
            { initials: "JR", bg: "var(--chart-1)" },
            { initials: "KL", bg: "var(--chart-3)" },
          ].map((a, i) => (
            <div
              key={a.initials}
              className="inline-flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: a.bg,
                color: "var(--primary-foreground)",
                fontSize: 8,
                fontWeight: "var(--font-weight-semibold)" as any,
                marginLeft: i > 0 ? -5 : 0,
                border: "2px solid var(--card)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {a.initials}
            </div>
          ))}
          <span
            style={{
              fontSize: 10,
              marginLeft: 6,
              color: "var(--text-subtle)",
              fontWeight: "var(--font-weight-medium)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            +5 more
          </span>
        </div>
      </div>
    </div>
  );
}

function QuoteSummaryContent() {
  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 12,
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--text-muted)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Subtotal (5 items)
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: "var(--font-weight-semibold)" as any,
            color: "var(--text-strong)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          $87,000
        </span>
      </div>

      {/* Pricing Rules */}
      <div>
        <div className="flex items-center justify-between">
          <span
            style={{
              fontSize: 12,
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--text-muted)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Pricing Rules Applied
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: "var(--font-weight-semibold)" as any,
              color: "var(--destructive)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            -$7,425
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-subtle)",
            marginTop: 2,
            fontWeight: "var(--font-weight-normal)" as any,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          3 rules · applied to 5 items /
        </div>
      </div>

      {/* Discounts */}
      <div>
        <div className="flex items-center justify-between">
          <span
            style={{
              fontSize: 12,
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--text-muted)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            One-Time Discounts/Premiums
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: "var(--font-weight-semibold)" as any,
              color: "var(--accent-text-strong)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            +$1,700
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-subtle)",
            marginTop: 2,
            fontWeight: "var(--font-weight-normal)" as any,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          4 discounts · 2 quote-level /
        </div>
      </div>

      {/* Grand Total */}
      <div
        style={{
          borderColor: "var(--border)",
          borderTopWidth: 1,
          borderTopStyle: "solid",
          marginTop: 4,
          paddingTop: 12,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              fontSize: 13,
              fontWeight: "var(--font-weight-semibold)" as any,
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Grand Total
          </span>
          <span
            style={{
              fontSize: 17,
              fontWeight: "var(--font-weight-semibold)" as any,
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            $77,875
          </span>
        </div>
      </div>
    </div>
  );
}

function TimelineContent() {
  const rows = [
    {
      label: "Request Date",
      value: "01/28",
      dotColor: "var(--border-strong)",
      valueColor: "var(--text-strong)",
    },
    {
      label: "Created",
      value: "01/22",
      dotColor: "var(--border-strong)",
      valueColor: "var(--text-strong)",
    },
    {
      label: "Respond By",
      value: "02/16",
      dotColor: "var(--destructive)",
      valueColor: "var(--destructive)",
    },
    {
      label: "Effective From",
      value: "When sent",
      dotColor: "var(--border-strong)",
      valueColor: "var(--text-muted)",
    },
  ];

  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-[8px]">
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: row.dotColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontWeight: "var(--font-weight-normal)" as any,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {row.label}
            </span>
          </div>
          <div className="flex items-center gap-[4px]">
            <span
              style={{
                fontSize: 12,
                fontWeight: "var(--font-weight-medium)" as any,
                color: row.valueColor,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {row.value}
            </span>
            <Pencil
              size={10}
              style={{ color: "var(--text-subtle)", cursor: "pointer" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}