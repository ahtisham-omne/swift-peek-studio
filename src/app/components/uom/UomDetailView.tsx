/**
 * UOM Module — Unit Detail View
 *
 * Full-page detail view matching the list view's design language.
 * Structure: white header bar → tab bar → content panel
 *
 * Design rules:
 * - Header bg matches ModuleHeader: var(--background) with border-bottom
 * - No redundant info: recent activity lives inside the Activity tab
 * - All font-family handled by global CSS — no hardcoded fontFamily
 * - All font sizes use CSS variables (--text-label, --text-h4, etc.)
 * - All colors use CSS custom properties from theme.css
 * - borderColor always set as single value (motion library compat)
 */

import React, { useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CategoryBadge, UOM_CATEGORIES, type UomCategory } from "./CategoryBadge";
import { TypeLabel } from "./TypeLabel";
import { SAMPLE_UNITS, type UomUnit } from "./sample-data";
import { useToast } from "./Toast";
import { CreateUomModal } from "./CreateUomModal";
import {
  Copy,
  Pencil,
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  ArrowRightLeft,
  Activity,
  ExternalLink,
  Check,
  Layers,
  Plus,
  X,
  AlertTriangle,
  MapPin,
  Building2,
} from "lucide-react";

const ARCHIVE_BLOCKING_REFERENCES = [
  {
    label: "Items",
    entries: ["STL-FLAT-48", "CAB-REEL-12", "BALE-500"],
  },
  {
    label: "Purchase orders",
    entries: ["PO-10428", "PO-10431", "PO-10444", "PO-10452"],
  },
  {
    label: "BOMs",
    entries: ["BOM-882", "BOM-901", "BOM-944"],
  },
];

/* ═════════════════════════════════════════���═════
   Static detail data
   ═══════════════════════════════════════════════ */

interface ConversionRow {
  factor: number;
  unitSymbol: string;
  unitName: string;
  type?: "Standard" | "Custom";
  category?: UomCategory;
}

// Sample conversions are derived per-unit category below in the component
const SAMPLE_SAME_CONVERSIONS: Record<string, ConversionRow> = {
  "Quantity": { factor: 48, unitSymbol: "ea", unitName: "Each", type: "Standard" },
  "Length": { factor: 100, unitSymbol: "cm", unitName: "Centimeter", type: "Standard" },
  "Mass": { factor: 500, unitSymbol: "lb", unitName: "Pound", type: "Standard" },
  "Volume": { factor: 1000, unitSymbol: "mL", unitName: "Milliliter", type: "Standard" },
  "Area": { factor: 10.7639, unitSymbol: "ft\u00B2", unitName: "Square Foot", type: "Standard" },
  "Time": { factor: 60, unitSymbol: "min", unitName: "Minute", type: "Standard" },
  "Temperature": { factor: 1, unitSymbol: "\u00B0F", unitName: "Degree Fahrenheit", type: "Standard" },
  "Force": { factor: 1000, unitSymbol: "N", unitName: "Newton", type: "Standard" },
  "Pressure": { factor: 1000, unitSymbol: "Pa", unitName: "Pascal", type: "Standard" },
  "Energy": { factor: 1000, unitSymbol: "J", unitName: "Joule", type: "Standard" },
  "Power": { factor: 1000, unitSymbol: "W", unitName: "Watt", type: "Standard" },
  "Electrical": { factor: 1, unitSymbol: "V", unitName: "Volt", type: "Standard" },
  "Frequency": { factor: 1000, unitSymbol: "Hz", unitName: "Hertz", type: "Standard" },
  "Other SI": { factor: 1, unitSymbol: "mol", unitName: "Mole", type: "Standard" },
};

const SAMPLE_CROSS_CONVERSIONS: Record<string, ConversionRow> = {
  "Quantity": { factor: 120, unitSymbol: "lb", unitName: "Pound", category: "Mass" },
  "Length": { factor: 3.28084, unitSymbol: "ft\u00B2", unitName: "Square Foot", category: "Area" },
  "Mass": { factor: 0.5, unitSymbol: "L", unitName: "Liter", category: "Volume" },
  "Volume": { factor: 1, unitSymbol: "kg", unitName: "Kilogram", category: "Mass" },
  "default": { factor: 1, unitSymbol: "ea", unitName: "Each", category: "Quantity" },
};

interface WhereUsedItem {
  sku: string;
  name: string;
  status: "Active" | "Inactive";
}

const WHERE_USED_ITEMS: WhereUsedItem[] = [
  { sku: "STL-FLAT-48", name: 'Steel Flat Bar 1/4" x 2" x 48"', status: "Active" },
  { sku: "ALU-SHT-4x8", name: 'Aluminum Sheet 0.063" 4x8', status: "Active" },
  { sku: "COP-TUBE-12", name: 'Copper Tube Type L 1/2" x 12ft', status: "Active" },
  { sku: "STL-ANGLE-36", name: 'Steel Angle 1.5" x 1.5" x 36"', status: "Inactive" },
];

interface VendorLocation {
  id: string;
  name: string;
  address: string;
  items: string[];
}

interface WhereUsedVendor {
  id: string;
  name: string;
  locations: VendorLocation[];
}

const WHERE_USED_VENDORS: WhereUsedVendor[] = [
  {
    id: "VND-001",
    name: "Toyota",
    locations: [
      { id: "LOC-001", name: "Toyota Location 206", address: "2972 Westheimer Rd. Santa Ana, Illinois 85486", items: ["STL-FLAT-48", "STL-ANGLE-36", "BRS-ROD-24"] },
      { id: "LOC-002", name: "Toyota Location 29", address: "2972 Westheimer Rd. Santa Ana, Illinois 85486", items: ["ALU-SHT-4x8", "COP-TUBE-12", "STL-FLAT-48", "BRS-ROD-24", "STL-PIPE-60", "ALU-BAR-12", "COP-SHT-4x4", "STL-BEAM-96", "NKL-TUBE-18", "ZNC-PLT-2x6"] },
    ],
  },
  {
    id: "VND-002",
    name: "Apex Steel Distributors",
    locations: [
      { id: "LOC-003", name: "Apex HQ Warehouse", address: "4517 Washington Ave. Manchester, Kentucky 39495", items: ["STL-FLAT-48", "STL-ANGLE-36", "BRS-ROD-24", "STL-PIPE-60", "ALU-BAR-12"] },
      { id: "LOC-004", name: "Apex West Coast", address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", items: ["COP-SHT-4x4", "STL-BEAM-96", "NKL-TUBE-18"] },
      { id: "LOC-005", name: "Apex Southeast", address: "8502 Preston Rd. Inglewood, Maine 98380", items: ["ZNC-PLT-2x6", "TIN-WIRE-50", "STL-FLAT-48", "BRS-ROD-24"] },
    ],
  },
  {
    id: "VND-003",
    name: "Pacific Metal Supply Co.",
    locations: [
      { id: "LOC-006", name: "Pacific Main Depot", address: "3517 W. Gray St. Utica, Pennsylvania 57867", items: ["ALU-SHT-4x8", "COP-TUBE-12", "STL-FLAT-48", "BRS-ROD-24", "STL-PIPE-60"] },
    ],
  },
];

interface ActivityItem {
  action: string;
  user: string;
  userInitials: string;
  date: string;
  detail?: string;
  field?: string;
  value?: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { action: "Created", user: "Admin", userInitials: "AD", date: "Jan 15, 2026", detail: "Unit created as Custom type", field: "Created On", value: "01/15/2026" },
  { action: "Edited", user: "Sarah K.", userInitials: "SK", date: "Jan 22, 2026", detail: "Updated description field", field: "Last Modified", value: "Updated description field" },
  { action: "Conversion Added", user: "Admin", userInitials: "AD", date: "Feb 3, 2026", detail: "Added cross-category conversion to Pound", field: "Conversion Added", value: "Cross-category → Pound" },
  { action: "Used in Item", user: "System", userInitials: "SY", date: "Feb 10, 2026", detail: "Linked to STL-FLAT-48", field: "Item Linked", value: "STL-FLAT-48" },
];

type DetailTabId = "conversions" | "whereUsed" | "activity";

interface DetailTab {
  id: DetailTabId;
  label: string;
  count: number | null;
  icon: typeof ArrowRightLeft;
}

const DETAIL_TABS_TEMPLATE: DetailTab[] = [
  { id: "conversions", label: "Conversions", count: 0, icon: ArrowRightLeft },
  { id: "whereUsed", label: "Where Used", count: 0, icon: Package },
  { id: "activity", label: "Activity", count: null, icon: Activity },
];

const WHERE_USED_SUB_TABS = [
  { id: "items", label: "Items", count: 4 },
  { id: "vendors", label: "Vendors", count: WHERE_USED_VENDORS.length },
];



/* ═══════════════════════════════════════════════
   Main Component
   ══════════════���════════════════════════════════ */

export function UomDetailView() {
  const [activeTab, setActiveTab] = useState("conversions");
  const [whereUsedSubTab, setWhereUsedSubTab] = useState("items");
  const [conversionSection, setConversionSection] = useState<"same" | "cross">("same");
  const [conversionPage, setConversionPage] = useState(1);
  const [conversionPerPage, setConversionPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const unit = SAMPLE_UNITS.find((u) => u.id === id);

  /* ── Persisted local state ── */
  const [localName, setLocalName] = useState<string | null>(null);
  const [localSymbol, setLocalSymbol] = useState<string | null>(null);
  const [localDescription, setLocalDescription] = useState<string | null>(null);

  const displayName = localName ?? unit?.name ?? "Bundle (Old)";
  const displaySymbol = localSymbol ?? unit?.symbol ?? "bndl";
  const displayCategory = (unit?.category ?? "Quantity") as UomCategory;
  const displayType = unit?.type ?? "Custom";
  const displayDescription = localDescription ?? unit?.description ?? "Legacy bundle grouping unit";
  const isCustom = displayType === "Custom";
  const isInUse = unit?.inUse ?? false;

  /* ── Conversion state — initialized per unit's category ── */
  const initialSame = SAMPLE_SAME_CONVERSIONS[displayCategory];
  const initialCross = SAMPLE_CROSS_CONVERSIONS[displayCategory] || SAMPLE_CROSS_CONVERSIONS["default"];
  // Ensure sample conversion isn't the same unit as the one being viewed
  const safeSame = initialSame && initialSame.unitSymbol !== displaySymbol ? [initialSame] : [];
  const safeCross = initialCross && initialCross.category !== displayCategory ? [initialCross] : [];
  const [sameCatConversions, setSameCatConversions] = useState<ConversionRow[]>(safeSame);
  const [crossCatConversions, setCrossCatConversions] = useState<ConversionRow[]>(safeCross);

  /* ── Inline add conversion state ── */
  const [isAddingConversion, setIsAddingConversion] = useState(false);
  const [newConvFactor, setNewConvFactor] = useState("");
  const [newConvUnitId, setNewConvUnitId] = useState("");
  const [newConvType, setNewConvType] = useState<"Standard" | "Custom">("Custom");
  const [newConvCategory, setNewConvCategory] = useState<UomCategory>("Mass");

  /* Derive symbol/name from selected unit id */
  const selectedNewConvUnit = SAMPLE_UNITS.find((u) => u.id === newConvUnitId);
  const newConvSymbol = selectedNewConvUnit?.symbol ?? "";
  const newConvName = selectedNewConvUnit?.name ?? "";

  /* Same-category units for the dropdown (exclude the current unit and already-added conversions) */
  const sameCatUnitOptions = SAMPLE_UNITS.filter(
    (u) =>
      u.category === displayCategory &&
      u.id !== id &&
      !sameCatConversions.some((c) => c.unitSymbol === u.symbol)
  );

  const resetNewConvForm = useCallback(() => {
    setNewConvFactor("");
    setNewConvUnitId("");
    setNewConvType("Custom");
    setNewConvCategory("Mass");
    setIsAddingConversion(false);
  }, []);

  const handleAddConversion = useCallback(() => {
    const factor = parseFloat(newConvFactor);
    if (!factor || !newConvSymbol || !newConvName) {
      showToast("error", "Please select a unit and enter a factor");
      return;
    }
    const newRow: ConversionRow = {
      factor,
      unitSymbol: newConvSymbol,
      unitName: newConvName,
    };
    if (conversionSection === "same") {
      newRow.type = selectedNewConvUnit?.type as "Standard" | "Custom" ?? newConvType;
      setSameCatConversions((prev) => [...prev, newRow]);
    } else {
      // Only one cross-category conversion allowed
      newRow.category = newConvCategory;
      setCrossCatConversions([newRow]);
    }
    showToast("success", `Conversion to "${newConvName}" added`);
    resetNewConvForm();
  }, [newConvFactor, newConvSymbol, newConvName, newConvType, newConvCategory, conversionSection, showToast, resetNewConvForm, selectedNewConvUnit]);

  /* ── Edit form state ── */
  const [editName, setEditName] = useState(displayName);
  const [editSymbol, setEditSymbol] = useState(displaySymbol);
  const [editDescription, setEditDescription] = useState(displayDescription);

  const handleEditStart = useCallback(() => {
    if (isInUse) {
      showToast("info", "This UOM can’t be edited while it is in use. Remove active references to make changes.");
      return;
    }
    setEditName(displayName);
    setEditSymbol(displaySymbol);
    setEditDescription(displayDescription);
    setIsEditing(true);
  }, [displayName, displaySymbol, displayDescription, isInUse, showToast]);

  const handleEditSave = useCallback(() => {
    setLocalName(editName.trim() || displayName);
    setLocalSymbol(editSymbol.trim() || displaySymbol);
    setLocalDescription(editDescription.trim() || displayDescription);
    setIsEditing(false);
    showToast("success", `${editName.trim() || displayName} updated successfully`);
  }, [editName, editSymbol, editDescription, displayName, displaySymbol, displayDescription, showToast]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    showToast("info", "Edit cancelled — no changes saved");
  }, [showToast]);

  const handleDuplicate = useCallback(() => {
    showToast("success", `"${displayName}" duplicated as "${displayName} (Copy)"`);
  }, [displayName, showToast]);

  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set(["VND-001"]));

  const toggleVendorExpand = useCallback((vendorId: string) => {
    setExpandedVendors((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  }, []);

  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const handleArchiveConfirm = useCallback(() => {
    setArchiveModalOpen(false);
    showToast("success", `"${displayName}" archived successfully`);
    setTimeout(() => navigate("/uom"), 300);
  }, [displayName, showToast, navigate]);

  const handleSkuClick = useCallback((sku: string) => {
    navigate("/items");
    showToast("info", `Navigating to item ${sku}`);
  }, [navigate, showToast]);

  /* ── Dynamic tab counts ── */
  const DETAIL_TABS: DetailTab[] = DETAIL_TABS_TEMPLATE.map((tab) => {
    if (tab.id === "conversions") return { ...tab, count: sameCatConversions.length + crossCatConversions.length };
    if (tab.id === "whereUsed") return { ...tab, count: WHERE_USED_ITEMS.length };
    return tab;
  });

  /* ── Container style matching list view ── */
  const containerCls = "mx-auto px-4 sm:px-6 2xl:px-10";
  const containerMax: React.CSSProperties = { maxWidth: "var(--container-max-width)" };

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        backgroundColor: "var(--secondary)",
        minHeight: "100%",
      }}
    >
      {/* ═══════════════════════════════════════
         HEADER CARD — rounded card matching reference
         ═══════════════════════════════════════ */}
      <div
        className={containerCls}
        style={{ ...containerMax, paddingTop: 16, paddingBottom: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "var(--radius)",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "var(--border)",
            boxShadow: "var(--elevation-xs)",
            overflow: "hidden",
          }}
        >
          {/* ── Row 1: Back + Icon + Name/Desc + Actions ── */}
          <div
            className="flex items-center justify-between flex-wrap"
            style={{ padding: "14px 20px", gap: 10 }}
          >
            {/* Left cluster: back, divider, icon, name+desc */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back button */}
              <motion.button
                whileHover={{ backgroundColor: "var(--surface-hover)" }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate("/uom")}
                className="inline-flex items-center gap-[3px] cursor-pointer border-none shrink-0"
                style={{
                  padding: "6px 10px 6px 6px",
                  borderRadius: "var(--radius)",
                  backgroundColor: "rgba(0,0,0,0)",
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  color: "var(--text-muted)",
                  transition: "all 0.12s",
                  lineHeight: "1",
                }}
              >
                <ChevronLeft size={14} strokeWidth={1.8} />
                Back
              </motion.button>

              {/* Vertical divider */}
              <div style={{ width: 1, height: 28, backgroundColor: "var(--border)", flexShrink: 0 }} />

              {/* Icon badge */}
              <div
                className="inline-flex items-center justify-center shrink-0"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--surface-raised)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "var(--border)",
                }}
              >
                <Layers size={15} style={{ color: "var(--primary-soft)" }} strokeWidth={1.6} />
              </div>

              {/* Name + description stacked */}
              <div className="min-w-0 flex flex-col" style={{ gap: 3 }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="outline-none"
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-semibold)" as any,
                      color: "var(--foreground)",
                      backgroundColor: "var(--input-background)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--primary)",
                      borderRadius: "var(--radius-sm)",
                      height: "var(--input-height)",
                      padding: "0 12px",
                      boxSizing: "border-box",
                      minWidth: 200,
                      lineHeight: "1",
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-semibold)" as any,
                      color: "var(--foreground)",
                      lineHeight: "1.2",
                    }}
                  >
                    {displayName}
                  </span>
                )}

                {/* Description — directly under name */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="outline-none w-full"
                    style={{
                      fontSize: "var(--text-label)",
                      color: "var(--foreground)",
                      maxWidth: 500,
                      backgroundColor: "var(--input-background)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--primary)",
                      borderRadius: "var(--radius-sm)",
                      height: "var(--input-height)",
                      padding: "0 12px",
                      boxSizing: "border-box",
                      fontWeight: "var(--font-weight-normal)" as any,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      color: "var(--text-muted)",
                      lineHeight: "1.4",
                    }}
                  >
                    {displayDescription}
                  </span>
                )}
              </div>
            </div>

            {/* Right cluster: action buttons */}
            <div className="flex items-center gap-[6px] shrink-0">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ filter: "brightness(1.08)" }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handleEditSave}
                    className="inline-flex items-center gap-[4px] cursor-pointer border-none"
                    style={{
                      padding: "7px 18px",
                      borderRadius: "var(--radius)",
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      lineHeight: "1",
                    }}
                  >
                    <Check size={12} strokeWidth={2.5} /> Save
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: "var(--surface-raised)" }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handleEditCancel}
                    className="inline-flex items-center gap-[4px] cursor-pointer"
                    style={{
                      padding: "6px 14px",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                      backgroundColor: "var(--card)",
                      color: "var(--text-muted)",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      lineHeight: "1",
                    }}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  {[
                    { icon: Copy, label: "Duplicate", handler: handleDuplicate },
                    { icon: Archive, label: "Archive", handler: () => setArchiveModalOpen(true) },
                  ].map(({ icon: BtnIcon, label, handler }) => (
                    <motion.button
                      key={label}
                      whileHover={{ backgroundColor: "var(--surface-hover)" }}
                      whileTap={{ scale: 0.94 }}
                      type="button"
                      aria-label={label}
                      title={label}
                      className="inline-flex items-center justify-center cursor-pointer"
                      style={{
                        width: 34,
                        height: 34,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        backgroundColor: "rgba(0,0,0,0)",
                        color: "var(--text-subtle)",
                        padding: 0,
                        transition: "all 0.12s",
                      }}
                      onClick={handler}
                    >
                      <BtnIcon size={14} strokeWidth={1.8} />
                    </motion.button>
                  ))}

                  {isCustom && (
                    <motion.button
                      whileHover={{ filter: "brightness(1.06)" }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => {
                        if (isInUse) {
                          showToast("info", "This UOM can’t be edited while it is in use. Remove active references to make changes.");
                          return;
                        }
                        setEditModalOpen(true);
                      }}
                      className="inline-flex items-center gap-[5px] border-none"
                      disabled={isInUse}
                      aria-disabled={isInUse ? "true" : undefined}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "var(--radius)",
                        backgroundColor: isInUse ? "var(--surface-raised)" : "var(--primary)",
                        color: isInUse ? "var(--text-muted)" : "var(--primary-foreground)",
                        fontSize: "var(--text-label)",
                        fontWeight: "var(--font-weight-medium)" as any,
                        lineHeight: "1",
                        marginLeft: 2,
                        cursor: isInUse ? "not-allowed" : "pointer",
                      }}
                    >
                      <Pencil size={12} /> {isInUse ? "Editing Locked" : "Edit Unit"}
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Row 2: Meta info — Type · Category · Symbol · Fractional quantities ── */}
          <div
            style={{
              borderTopWidth: 1,
              borderTopStyle: "solid",
              borderColor: "var(--border-subtle)",
              padding: "10px 20px",
            }}
          >
            {isInUse && (
              <div
                style={{
                  marginBottom: 8,
                  padding: "8px 10px",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--surface-raised)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-muted)",
                  fontSize: 12,
                  fontWeight: "var(--font-weight-normal)" as any,
                  lineHeight: "1.35",
                }}
              >
                This UOM is in active use, so editing is locked to protect existing items and transactions.
              </div>
            )}
            <div
              className="flex items-center flex-wrap"
              style={{
                gap: "6px 0",
                fontSize: "var(--text-label)",
                fontWeight: "var(--font-weight-normal)" as any,
                color: "var(--text-muted)",
                lineHeight: "1",
              }}
            >
              {/* Type badge */}
              <TypeLabel type={displayType as any} />

              <MetaDot />

              {/* Category badge */}
              <span
                className="inline-flex items-center shrink-0"
                style={{
                  fontSize: 12,
                  lineHeight: "1",
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: "var(--primary-surface)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "var(--primary-border)",
                  color: "var(--primary-text-strong)",
                  fontWeight: "var(--font-weight-normal)" as any,
                }}
              >
                {displayCategory}
              </span>

              <MetaDot />

              {/* Symbol */}
              <span style={{ color: "var(--text-muted)" }}>
                Symbol:{" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={editSymbol}
                    onChange={(e) => setEditSymbol(e.target.value)}
                    className="outline-none"
                    style={{
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      color: "var(--text-strong)",
                      backgroundColor: "var(--input-background)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--primary)",
                      borderRadius: "var(--radius-sm)",
                      padding: "2px 8px",
                      width: 54,
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: "var(--font-weight-medium)" as any, color: "var(--text-strong)" }}>
                    {displaySymbol}
                  </span>
                )}
              </span>

            </div>
          </div>

          {/* Editing Banner */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="flex items-center gap-[10px]"
                  style={{
                    margin: "0 20px 14px",
                    padding: "10px 14px",
                    borderRadius: "var(--radius)",
                    backgroundColor: "var(--primary-surface)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "var(--primary-border)",
                  }}
                >
                  <Pencil size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <div>
                    <span
                      style={{
                        fontSize: "var(--text-label)",
                        fontWeight: "var(--font-weight-semibold)" as any,
                        color: "var(--primary-text-strong)",
                      }}
                    >
                      Editing mode
                    </span>
                    <br />
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--primary)",
                        fontWeight: "var(--font-weight-normal)" as any,
                      }}
                    >
                      Modify fields above and click Save to apply changes
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
         CONTENT: Tab bar + panels
         ═══════════════════════════════════════ */}
      <div
        className={containerCls}
        style={{ ...containerMax, paddingTop: 20, paddingBottom: 48 }}
      >
        {/* Tab bar */}
        <div
          className="flex items-end overflow-x-auto no-scrollbar"
          style={{
            padding: "0 2px",
            gap: 0,
            position: "relative",
            borderColor: "var(--border)",
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
          }}
        >
          {DETAIL_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="inline-flex items-center gap-[6px] cursor-pointer outline-none whitespace-nowrap shrink-0 border-0"
                style={{
                  padding: "10px 15px",
                  fontSize: "var(--text-label)",
                  fontWeight: isActive
                    ? ("var(--font-weight-semibold)" as any)
                    : ("var(--font-weight-medium)" as any),
                  color: isActive ? "var(--foreground)" : "var(--text-muted)",
                  backgroundColor: isActive ? "var(--card)" : "rgba(0,0,0,0)",
                  borderTopWidth: isActive ? 1 : 0,
                  borderLeftWidth: isActive ? 1 : 0,
                  borderRightWidth: isActive ? 1 : 0,
                  borderBottomWidth: 0,
                  borderStyle: "solid",
                  borderColor: isActive ? "var(--border)" : "rgba(0,0,0,0)",
                  borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                  transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                  lineHeight: "1",
                  position: "relative",
                  zIndex: isActive ? 2 : 1,
                  marginBottom: isActive ? -1 : 0,
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
                    e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
                  }
                }}
              >
                <tab.icon size={14} strokeWidth={isActive ? 2 : 1.6} style={{ opacity: isActive ? 1 : 0.55 }} />
                {tab.label}
                {tab.count !== null && (
                  <span
                    className="inline-flex items-center justify-center"
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: isActive
                        ? "var(--primary-surface)"
                        : "var(--surface-raised)",
                      color: isActive
                        ? "var(--primary)"
                        : "var(--text-subtle)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      lineHeight: "1",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: isActive ? "rgba(0,0,0,0)" : "var(--border)",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div
          className="flex flex-col lg:flex-row"
          style={{
            paddingTop: 16,
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          {/* ── LEFT PANEL ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="flex-1 min-w-0"
            style={{
              backgroundColor: "var(--card)",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--elevation-xs)",
            }}
          >
            <div style={{ padding: activeTab === "conversions" ? 0 : 20 }}>
              {/* ──── CONVERSIONS TAB ──── */}
              {activeTab === "conversions" && (() => {
                const activeRows = conversionSection === "same" ? sameCatConversions : crossCatConversions;
                const totalRows = activeRows.length;
                const totalPages = Math.max(1, Math.ceil(totalRows / conversionPerPage));
                const safePage = Math.min(conversionPage, totalPages);
                const startIdx = (safePage - 1) * conversionPerPage;
                const pageRows = activeRows.slice(startIdx, startIdx + conversionPerPage);
                const sectionTitle = conversionSection === "same" ? "Same Category Conversions" : "Cross Category Conversions";

                const CONV_NAV_ITEMS = [
                  { id: "same" as const, label: "Same Category Conversions", count: sameCatConversions.length },
                  { id: "cross" as const, label: "Cross Category Conversions", count: crossCatConversions.length },
                ];

                return (
                  <div className="flex flex-col md:flex-row" style={{ gap: 0, minHeight: 520 }}>
                    {/* ── Left sidebar nav ── */}
                    <div
                      className="shrink-0 md:w-[220px]"
                      style={{
                        borderColor: "var(--border)",
                        borderRightWidth: 1,
                        borderRightStyle: "solid",
                        backgroundColor: "var(--card)",
                      }}
                    >
                      <div className="flex flex-row md:flex-col" style={{ padding: "8px 8px 0" }}>
                        {CONV_NAV_ITEMS.map((nav) => {
                          const isNavActive = nav.id === conversionSection;
                          return (
                            <button
                              key={nav.id}
                              type="button"
                              onClick={() => { setConversionSection(nav.id); setConversionPage(1); resetNewConvForm(); }}
                              className="flex items-center gap-2 w-full cursor-pointer border-none outline-none text-left"
                              style={{
                                padding: "10px 12px",
                                borderRadius: "var(--radius)",
                                backgroundColor: isNavActive ? "var(--primary-surface)" : "rgba(0,0,0,0)",
                                color: isNavActive ? "var(--primary)" : "var(--text-muted)",
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)" as any,
                                lineHeight: "1.3",
                                transition: "all 0.15s ease",
                                marginBottom: 2,
                              }}
                              onMouseEnter={(e) => {
                                if (!isNavActive) e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isNavActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
                              }}
                            >
                              {isNavActive && (
                                <div style={{
                                  width: 3,
                                  height: 16,
                                  borderRadius: 2,
                                  backgroundColor: "var(--primary)",
                                  flexShrink: 0,
                                }} />
                              )}
                              <span className="flex-1">{nav.label}</span>
                              <span
                                className="inline-flex items-center justify-center"
                                style={{
                                  fontSize: 11,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  backgroundColor: isNavActive ? "var(--primary-surface-strong)" : "var(--surface-raised)",
                                  color: isNavActive ? "var(--primary)" : "var(--text-subtle)",
                                  fontWeight: "var(--font-weight-medium)" as any,
                                  lineHeight: "1",
                                }}
                              >
                                {nav.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Right content area ── */}
                    <div className="flex-1 min-w-0 flex flex-col" style={{ padding: "20px 24px" }}>
                      {/* Section title + Add button */}
                      <div className="flex items-start justify-between" style={{ marginBottom: 16, gap: 12 }}>
                        <div>
                          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)" as any, color: "var(--foreground)", lineHeight: "1.2" }}>
                              {sectionTitle}
                            </span>
                          </div>
                          <span style={{ fontSize: "var(--text-label)", color: "var(--text-muted)", fontWeight: "var(--font-weight-normal)" as any, lineHeight: "1.3" }}>
                            {conversionSection === "same"
                              ? `Only one same-category conversion is allowed. This applies to all units in the ${unit?.category || "this"} category.`
                              : `Define how ${displaySymbol} converts to a unit in another category.`
                            }
                          </span>
                        </div>
                        {!isAddingConversion && !(conversionSection === "same" && sameCatConversions.length >= 1) && !(conversionSection === "cross" && crossCatConversions.length >= 1) && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ opacity: 0.8 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setIsAddingConversion(true);
                              const total = conversionSection === "same" ? sameCatConversions.length : crossCatConversions.length;
                              const lastPage = Math.max(1, Math.ceil((total + 1) / conversionPerPage));
                              setConversionPage(lastPage);
                            }}
                            className="inline-flex items-center gap-[5px] cursor-pointer border-none shrink-0"
                            style={{
                              padding: 0,
                              backgroundColor: "rgba(0,0,0,0)",
                              color: "var(--primary)",
                              fontSize: "var(--text-label)",
                              fontWeight: "var(--font-weight-medium)" as any,
                              lineHeight: "1",
                            }}
                          >
                            <Plus size={13} strokeWidth={2} /> Add Conversion
                          </motion.button>
                        )}
                      </div>

                      {/* ── Prominent single conversion result ── */}
                      {conversionSection === "same" && sameCatConversions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            marginBottom: 16,
                            padding: "16px 20px",
                            borderRadius: "var(--radius)",
                            backgroundColor: "var(--primary-surface)",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "var(--primary-border)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="inline-flex items-center justify-center shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "var(--radius)",
                                backgroundColor: "var(--primary)",
                              }}
                            >
                              <ArrowRightLeft size={16} style={{ color: "var(--primary-foreground)" }} />
                            </div>
                            <div>
                              <div style={{ fontSize: "var(--text-label)", color: "var(--primary)", fontWeight: "var(--font-weight-medium)" as any, marginBottom: 2, lineHeight: "1" }}>
                                Defined Conversion
                              </div>
                              <div style={{ fontSize: 18, fontWeight: "var(--font-weight-semibold)" as any, color: "var(--primary-text-strong)", lineHeight: "1.3" }}>
                                1{" "}
                                <span style={{ fontWeight: "var(--font-weight-semibold)" as any }}>{displaySymbol}</span>
                                <span style={{ color: "var(--primary)", fontWeight: "var(--font-weight-normal)" as any, margin: "0 8px" }}>=</span>
                                {sameCatConversions[0].factor.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                                <span style={{ fontWeight: "var(--font-weight-semibold)" as any }}>{sameCatConversions[0].unitSymbol}</span>
                                <span style={{ fontSize: 14, color: "var(--primary)", fontWeight: "var(--font-weight-normal)" as any, marginLeft: 6 }}>
                                  ({sameCatConversions[0].unitName})
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {conversionSection === "cross" && crossCatConversions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            marginBottom: 16,
                            padding: "16px 20px",
                            borderRadius: "var(--radius)",
                            backgroundColor: "var(--primary-surface)",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "var(--primary-border)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="inline-flex items-center justify-center shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "var(--radius)",
                                backgroundColor: "var(--primary)",
                              }}
                            >
                              <ArrowRightLeft size={16} style={{ color: "var(--primary-foreground)" }} />
                            </div>
                            <div>
                              <div style={{ fontSize: "var(--text-label)", color: "var(--primary)", fontWeight: "var(--font-weight-medium)" as any, marginBottom: 2, lineHeight: "1" }}>
                                Defined Conversion
                              </div>
                              <div className="flex items-center gap-2" style={{ fontSize: 18, fontWeight: "var(--font-weight-semibold)" as any, color: "var(--primary-text-strong)", lineHeight: "1.3" }}>
                                <span>
                                  1{" "}{displaySymbol}
                                  <span style={{ color: "var(--primary)", fontWeight: "var(--font-weight-normal)" as any, margin: "0 8px" }}>=</span>
                                  {crossCatConversions[0].factor.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                                  {crossCatConversions[0].unitSymbol}
                                  <span style={{ fontSize: 14, color: "var(--primary)", fontWeight: "var(--font-weight-normal)" as any, marginLeft: 6 }}>
                                    ({crossCatConversions[0].unitName})
                                  </span>
                                </span>
                                <CategoryBadge category={crossCatConversions[0].category!} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Table — Same category: show ALL units in category with derived factors */}
                      {(() => {
                        // For same-category: derive all category units from the base conversion
                        let derivedRows: ConversionRow[] = [];
                        if (conversionSection === "same" && sameCatConversions.length > 0) {
                          const baseConv = sameCatConversions[0]; // e.g., 1 Box = 48 Each
                          const categoryUnits = SAMPLE_UNITS.filter(
                            (u) => u.category === displayCategory && u.id !== id
                          );
                          // Build a simple lookup: how many "Each" (base target) each unit equals
                          // We'll use the base conversion's target as the pivot
                          // Known standard conversions within common categories
                          const KNOWN_RATIOS: Record<string, Record<string, number>> = {
                            // Quantity: everything in terms of "ea" (Each)
                            "Quantity": { "ea": 1, "pr": 2, "dz": 12, "gro": 144, "pc": 1, "box": 48, "plt": 960, "bndl": 24, "case": 24, "rm": 500 },
                            // Length: everything in terms of "m" (Meter)
                            "Length": { "m": 1, "cm": 0.01, "mm": 0.001, "km": 1000, "in": 0.0254, "ft": 0.3048, "yd": 0.9144, "mi": 1609.344, "\u00B5m": 0.000001, "nm": 0.000000001, "rod": 5.0292, "ch": 20.1168 },
                            // Area: everything in terms of "m²"
                            "Area": { "m\u00B2": 1, "ft\u00B2": 0.092903, "ha": 10000, "ac": 4046.86, "km\u00B2": 1000000, "in\u00B2": 0.00064516 },
                            // Volume: everything in terms of "L"
                            "Volume": { "L": 1, "mL": 0.001, "m\u00B3": 1000, "gal": 3.78541, "fl oz": 0.0295735, "ft\u00B3": 28.3168, "bbl": 158.987, "55GAL": 208.198, "tote": 1040.99, "qt": 0.946353 },
                            // Mass: everything in terms of "kg"
                            "Mass": { "kg": 1, "g": 0.001, "mg": 0.000001, "t": 1000, "lb": 0.453592, "oz": 0.0283495, "st": 6.35029, "ton": 907.185, "LT": 1016.05, "bale": 226.796 },
                            // Time: everything in terms of "s"
                            "Time": { "s": 1, "min": 60, "h": 3600, "d": 86400, "wk": 604800, "mo": 2629800, "yr": 31557600, "ms": 0.001 },
                            // Temperature: no linear ratios, show base only
                            "Temperature": { "\u00B0C": 1, "\u00B0F": 0.5556, "K": 1, "\u00B0R": 0.5556, "\u00B0De": 0.6667 },
                            // Force: in terms of "N"
                            "Force": { "N": 1, "kN": 1000, "lbf": 4.44822, "dyn": 0.00001 },
                            // Pressure: in terms of "Pa"
                            "Pressure": { "Pa": 1, "kPa": 1000, "bar": 100000, "psi": 6894.76, "atm": 101325, "Torr": 133.322 },
                            // Energy: in terms of "J"
                            "Energy": { "J": 1, "kJ": 1000, "cal": 4.184, "kcal": 4184, "Wh": 3600, "BTU": 1055.06 },
                            // Power: in terms of "W"
                            "Power": { "W": 1, "kW": 1000, "MW": 1000000, "hp": 745.7, "kVA": 1000 },
                            // Electrical: in terms of base (show factor 1 for simplicity)
                            "Electrical": { "A": 1, "V": 1, "\u2126": 1, "F": 1, "H": 1, "C": 1 },
                            // Frequency: in terms of "Hz"
                            "Frequency": { "Hz": 1, "kHz": 1000, "MHz": 1000000, "GHz": 1000000000, "rpm": 0.0166667 },
                            // Other SI: no meaningful cross-conversions
                            "Other SI": {},
                          };
                          const catRatios = KNOWN_RATIOS[displayCategory] || {};
                          const baseTargetRatio = catRatios[baseConv.unitSymbol]; // how much base SI unit the target equals
                          const currentUnitRatio = catRatios[displaySymbol]; // how much base SI unit current unit equals

                          categoryUnits.forEach((u) => {
                            const unitRatio = catRatios[u.symbol];
                            if (unitRatio !== undefined && baseTargetRatio !== undefined && currentUnitRatio !== undefined && currentUnitRatio !== 0) {
                              // factor = how many of u fit in 1 of current unit
                              // 1 current = (currentUnitRatio / unitRatio) of u
                              const factor = currentUnitRatio / unitRatio;
                              derivedRows.push({
                                factor: parseFloat(factor.toPrecision(8)),
                                unitSymbol: u.symbol,
                                unitName: u.name,
                                type: u.type as "Standard" | "Custom",
                              });
                            } else {
                              // Fallback: derive from the base conversion if possible
                              derivedRows.push({
                                factor: 0,
                                unitSymbol: u.symbol,
                                unitName: u.name,
                                type: u.type as "Standard" | "Custom",
                              });
                            }
                          });
                          // Sort: defined conversion first, then by factor descending
                          derivedRows.sort((a, b) => {
                            if (a.unitSymbol === baseConv.unitSymbol) return -1;
                            if (b.unitSymbol === baseConv.unitSymbol) return 1;
                            return b.factor - a.factor;
                          });
                        }

                        const displayRows = conversionSection === "same"
                          ? (sameCatConversions.length > 0 ? derivedRows : [])
                          : crossCatConversions;
                        const totalRows = displayRows.length;
                        const totalPages = Math.max(1, Math.ceil(totalRows / conversionPerPage));
                        const safePage = Math.min(conversionPage, totalPages);
                        const startIdx = (safePage - 1) * conversionPerPage;
                        const pageRows = displayRows.slice(startIdx, startIdx + conversionPerPage);

                        return (
                          <>
                      <div
                        className="overflow-hidden flex-1"
                        style={{
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor: "var(--border)",
                          borderRadius: "var(--radius)",
                        }}
                      >
                        <ConversionTableHeader
                          cols={conversionSection === "same"
                            ? ["CONVERSION FACTOR", "UNITS", "TYPE"]
                            : ["CONVERSION FACTOR", "UNITS", "CATEGORY"]}
                          template={conversionSection === "same"
                            ? "1fr 1fr minmax(80px, 120px)"
                            : "1fr 1fr minmax(100px, 140px)"}
                        />
                        {pageRows.length === 0 && !isAddingConversion && (
                          <div
                            className="flex items-center justify-center"
                            style={{
                              padding: "40px 20px",
                              color: "var(--text-muted)",
                              fontSize: "var(--text-label)",
                              fontWeight: "var(--font-weight-normal)" as any,
                            }}
                          >
                            No conversions defined yet. Click "Add Conversion" to get started.
                          </div>
                        )}
                        {pageRows.map((row, idx) => {
                          const isBaseConversion = conversionSection === "same" && sameCatConversions.length > 0 && row.unitSymbol === sameCatConversions[0].unitSymbol;
                          return (
                          <motion.div
                            key={`conv-${startIdx + idx}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.03 * idx, duration: 0.2 }}
                            className="grid items-center transition-colors"
                            style={{
                              gridTemplateColumns: conversionSection === "same"
                                ? "1fr 1fr minmax(80px, 120px)"
                                : "1fr 1fr minmax(100px, 140px)",
                              borderColor: "var(--border-subtle)",
                              borderBottomWidth: idx < pageRows.length - 1 ? 1 : 0,
                              borderBottomStyle: "solid" as const,
                              backgroundColor: isBaseConversion ? "var(--primary-surface)" : "rgba(0,0,0,0)",
                              transition: "background-color 0.12s ease",
                            }}
                            onMouseEnter={(e) => { if (!isBaseConversion) e.currentTarget.style.backgroundColor = "var(--surface-hover)"; }}
                            onMouseLeave={(e) => { if (!isBaseConversion) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)"; }}
                          >
                            {/* Conversion Factor */}
                            <div style={{ padding: "12px 16px", fontSize: "var(--text-label)", lineHeight: "1.4", fontWeight: "var(--font-weight-normal)" as any, color: "var(--foreground)" }}>
                              {row.factor === 0 ? (
                                <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>—</span>
                              ) : (
                                row.factor.toLocaleString(undefined, { maximumFractionDigits: 6 })
                              )}
                            </div>
                            {/* Units — symbol (name) */}
                            <div className="flex items-center gap-2" style={{ padding: "12px 16px", fontSize: "var(--text-label)", lineHeight: "1.4" }}>
                              <span style={{ fontWeight: "var(--font-weight-medium)" as any, color: "var(--text-strong)" }}>
                                {row.unitSymbol}
                              </span>
                              {"  "}
                              <span style={{ color: "var(--text-subtle)", fontWeight: "var(--font-weight-normal)" as any }}>
                                ({row.unitName})
                              </span>
                              {isBaseConversion && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    backgroundColor: "var(--primary)",
                                    color: "var(--primary-foreground)",
                                    fontWeight: "var(--font-weight-medium)" as any,
                                    lineHeight: "1",
                                    marginLeft: 4,
                                  }}
                                >
                                  Defined
                                </span>
                              )}
                            </div>
                            {/* Type col for same-category / Category col for cross-category */}
                            {conversionSection === "same" && (
                              <div style={{ padding: "12px 16px" }}>
                                <TypeLabel type={(row.type || "Standard") as any} />
                              </div>
                            )}
                            {conversionSection === "cross" && (
                              <div style={{ padding: "12px 16px" }}>
                                <CategoryBadge category={row.category!} />
                              </div>
                            )}
                          </motion.div>
                          );
                        })}

                        {/* ── Inline add conversion row ── */}
                        <AnimatePresence>
                          {isAddingConversion && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="grid items-center"
                              style={{
                                gridTemplateColumns: conversionSection === "same"
                                  ? "1fr 1fr"
                                  : "1fr 1fr minmax(100px, 140px)",
                                borderColor: "var(--primary)",
                                borderTopWidth: 1,
                                borderTopStyle: "solid",
                                backgroundColor: "var(--primary-surface)",
                              }}
                            >
                              {/* Unit select dropdown */}
                              <div className="flex items-center" style={{ padding: "8px 12px", gap: 8 }}>
                                <select
                                  value={newConvUnitId}
                                  onChange={(e) => setNewConvUnitId(e.target.value)}
                                  autoFocus
                                  className="flex-1 min-w-0 outline-none cursor-pointer border-0"
                                  style={{
                                    height: "var(--input-height)",
                                    padding: "0 10px",
                                    fontSize: "var(--text-label)",
                                    fontWeight: "var(--font-weight-normal)" as any,
                                    color: newConvUnitId ? "var(--foreground)" : "var(--text-subtle)",
                                    backgroundColor: "var(--card)",
                                    borderWidth: 1,
                                    borderStyle: "solid",
                                    borderColor: "var(--border)",
                                    borderRadius: "var(--radius-sm)",
                                    lineHeight: "1",
                                    appearance: "none",
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "right 10px center",
                                    paddingRight: 28,
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") resetNewConvForm();
                                  }}
                                >
                                  <option value="" disabled>Select Unit</option>
                                  {sameCatUnitOptions.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.symbol} ({u.name})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {/* Factor input */}
                              <div className="flex items-center" style={{ padding: "8px 12px", gap: 8 }}>
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="0"
                                  value={newConvFactor}
                                  onChange={(e) => setNewConvFactor(e.target.value)}
                                  disabled={!newConvUnitId}
                                  className="w-full outline-none border-0"
                                  style={{
                                    height: "var(--input-height)",
                                    padding: "0 10px",
                                    fontSize: "var(--text-label)",
                                    fontWeight: "var(--font-weight-normal)" as any,
                                    color: "var(--foreground)",
                                    backgroundColor: "var(--card)",
                                    borderWidth: 1,
                                    borderStyle: "solid",
                                    borderColor: "var(--border)",
                                    borderRadius: "var(--radius-sm)",
                                    lineHeight: "1",
                                    opacity: !newConvUnitId ? 0.5 : 1,
                                    cursor: !newConvUnitId ? "not-allowed" : undefined,
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddConversion();
                                    if (e.key === "Escape") resetNewConvForm();
                                  }}
                                />
                                {/* Confirm / Cancel buttons — visible in same-category since no 3rd col */}
                                {conversionSection === "same" && (
                                  <div className="flex items-center shrink-0" style={{ gap: 4 }}>
                                    <motion.button
                                      whileHover={{ filter: "brightness(1.06)" }}
                                      whileTap={{ scale: 0.95 }}
                                      type="button"
                                      onClick={handleAddConversion}
                                      className="inline-flex items-center justify-center cursor-pointer border-none"
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "var(--radius-sm)",
                                        backgroundColor: "var(--primary)",
                                        color: "var(--primary-foreground)",
                                      }}
                                    >
                                      <Check size={14} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ backgroundColor: "var(--surface-hover)" }}
                                      whileTap={{ scale: 0.95 }}
                                      type="button"
                                      onClick={resetNewConvForm}
                                      className="inline-flex items-center justify-center cursor-pointer border-none"
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "var(--radius-sm)",
                                        backgroundColor: "rgba(0,0,0,0)",
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      <X size={14} />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                              {/* Category dropdown + actions for cross-category */}
                              {conversionSection === "cross" && (
                                <div className="flex items-center" style={{ padding: "8px 12px", gap: 8 }}>
                                  <select
                                    value={newConvCategory}
                                    onChange={(e) => setNewConvCategory(e.target.value as UomCategory)}
                                    className="flex-1 min-w-0 outline-none cursor-pointer border-0"
                                    style={{
                                      height: "var(--input-height)",
                                      padding: "0 8px",
                                      fontSize: "var(--text-label)",
                                      fontWeight: "var(--font-weight-normal)" as any,
                                      color: "var(--foreground)",
                                      backgroundColor: "var(--card)",
                                      borderWidth: 1,
                                      borderStyle: "solid",
                                      borderColor: "var(--border)",
                                      borderRadius: "var(--radius-sm)",
                                      lineHeight: "1",
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleAddConversion();
                                      if (e.key === "Escape") resetNewConvForm();
                                    }}
                                  >
                                    {UOM_CATEGORIES.filter((c) => c !== displayCategory).map((cat) => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                  <div className="flex items-center shrink-0" style={{ gap: 4 }}>
                                    <motion.button
                                      whileHover={{ filter: "brightness(1.06)" }}
                                      whileTap={{ scale: 0.95 }}
                                      type="button"
                                      onClick={handleAddConversion}
                                      className="inline-flex items-center justify-center cursor-pointer border-none"
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "var(--radius-sm)",
                                        backgroundColor: "var(--primary)",
                                        color: "var(--primary-foreground)",
                                      }}
                                    >
                                      <Check size={14} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ backgroundColor: "var(--surface-hover)" }}
                                      whileTap={{ scale: 0.95 }}
                                      type="button"
                                      onClick={resetNewConvForm}
                                      className="inline-flex items-center justify-center cursor-pointer border-none"
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "var(--radius-sm)",
                                        backgroundColor: "rgba(0,0,0,0)",
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      <X size={14} />
                                    </motion.button>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Pagination bar */}
                      <div
                        className="flex items-center justify-between flex-wrap"
                        style={{ marginTop: "auto", paddingTop: 16, gap: 10 }}
                      >
                        {/* Records per page */}
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "var(--text-label)", color: "var(--text-muted)", fontWeight: "var(--font-weight-normal)" as any, lineHeight: "1" }}>
                            Records per page
                          </span>
                          <select
                            value={conversionPerPage}
                            onChange={(e) => { setConversionPerPage(Number(e.target.value)); setConversionPage(1); }}
                            className="outline-none cursor-pointer"
                            style={{
                              fontSize: "var(--text-label)",
                              fontWeight: "var(--font-weight-normal)" as any,
                              color: "var(--foreground)",
                              backgroundColor: "var(--card)",
                              borderWidth: 1,
                              borderStyle: "solid",
                              borderColor: "var(--border)",
                              borderRadius: "var(--radius-sm)",
                              padding: "4px 8px",
                              lineHeight: "1.2",
                            }}
                          >
                            {[5, 10, 20].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>

                        {/* Page navigation */}
                        <div className="flex items-center" style={{ gap: 2 }}>
                          <PaginationBtn
                            disabled={safePage <= 1}
                            onClick={() => setConversionPage(1)}
                            aria-label="First page"
                          >
                            <ChevronsLeft size={14} />
                          </PaginationBtn>
                          <PaginationBtn
                            disabled={safePage <= 1}
                            onClick={() => setConversionPage((p) => Math.max(1, p - 1))}
                            aria-label="Previous page"
                          >
                            <ChevronLeft size={14} />
                            <span style={{ fontSize: "var(--text-label)", lineHeight: "1" }}>Prev</span>
                          </PaginationBtn>

                          {/* Page numbers */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => setConversionPage(pg)}
                              className="inline-flex items-center justify-center cursor-pointer border-none outline-none"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "var(--radius-sm)",
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)" as any,
                                lineHeight: "1",
                                color: pg === safePage ? "var(--primary-foreground)" : "var(--text-muted)",
                                backgroundColor: pg === safePage ? "var(--primary)" : "rgba(0,0,0,0)",
                                transition: "all 0.12s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (pg !== safePage) e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                              }}
                              onMouseLeave={(e) => {
                                if (pg !== safePage) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
                              }}
                            >
                              {pg}
                            </button>
                          ))}

                          <PaginationBtn
                            disabled={safePage >= totalPages}
                            onClick={() => setConversionPage((p) => Math.min(totalPages, p + 1))}
                            aria-label="Next page"
                          >
                            <span style={{ fontSize: "var(--text-label)", lineHeight: "1" }}>Next</span>
                            <ChevronRight size={14} />
                          </PaginationBtn>
                          <PaginationBtn
                            disabled={safePage >= totalPages}
                            onClick={() => setConversionPage(totalPages)}
                            aria-label="Last page"
                          >
                            <ChevronsRight size={14} />
                          </PaginationBtn>
                        </div>
                      </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* ──── WHERE USED TAB ──── */}
              {activeTab === "whereUsed" && (
                <div>
                  {/* Segment control */}
                  <div
                    className="inline-flex items-center overflow-x-auto no-scrollbar"
                    style={{
                      gap: 2,
                      marginBottom: 16,
                      padding: 3,
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--secondary)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    {WHERE_USED_SUB_TABS.map((tab) => {
                      const isSubActive = tab.id === whereUsedSubTab;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setWhereUsedSubTab(tab.id)}
                          className="inline-flex items-center gap-[5px] cursor-pointer border-none outline-none whitespace-nowrap shrink-0"
                          style={{
                            padding: "7px 14px",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: isSubActive ? "var(--card)" : "rgba(0,0,0,0)",
                            color: isSubActive ? "var(--foreground)" : "var(--text-muted)",
                            fontSize: "var(--text-label)",
                            fontWeight: isSubActive ? ("var(--font-weight-semibold)" as any) : ("var(--font-weight-medium)" as any),
                            lineHeight: "1",
                            transition: "all 0.15s ease",
                            boxShadow: isSubActive ? "var(--elevation-xs)" : "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                              e.currentTarget.style.color = "var(--text-strong)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
                              e.currentTarget.style.color = "var(--text-muted)";
                            }
                          }}
                        >
                          {tab.label}
                          <span
                            className="inline-flex items-center justify-center"
                            style={{
                              fontSize: 10,
                              lineHeight: "1",
                              padding: "1px 6px",
                              borderRadius: 4,
                              backgroundColor: isSubActive ? "var(--primary-surface)" : "rgba(0,0,0,0)",
                              color: isSubActive ? "var(--primary)" : "var(--text-subtle)",
                              fontWeight: "var(--font-weight-medium)" as any,
                            }}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {whereUsedSubTab === "items" && (
                    <div
                      className="overflow-x-auto"
                      style={{
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <div style={{ minWidth: 480 }}>
                        <TableHeader cols={["#", "PART NUMBER", "DESCRIPTION", "STATUS"]} template="40px minmax(100px, 140px) 1fr minmax(80px, 100px)" />
                        {WHERE_USED_ITEMS.map((item, idx) => (
                          <motion.div
                            key={item.sku}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * idx, duration: 0.22 }}
                            className="grid items-center transition-colors"
                            style={{
                              gridTemplateColumns: "40px minmax(100px, 140px) 1fr minmax(80px, 100px)",
                              borderColor: "var(--border-subtle)",
                              borderBottomWidth: idx < WHERE_USED_ITEMS.length - 1 ? 1 : 0,
                              borderBottomStyle: "solid" as const,
                              backgroundColor: "rgba(0,0,0,0)",
                              transition: "background-color 0.12s ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-hover)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)"; }}
                          >
                            <Cell muted>{idx + 1}</Cell>
                            <div
                              onClick={() => handleSkuClick(item.sku)}
                              style={{
                                padding: "11px 16px",
                                fontSize: "var(--text-label)",
                                lineHeight: "1",
                                fontWeight: "var(--font-weight-medium)" as any,
                                color: "var(--primary)",
                                cursor: "pointer",
                              }}
                            >
                              <span className="flex items-center gap-[4px]">
                                {item.sku}
                                <ExternalLink size={10} style={{ opacity: 0.6 }} />
                              </span>
                            </div>
                            <Cell className="truncate">{item.name}</Cell>
                            <div style={{ padding: "11px 16px" }}>
                              <span
                                className="inline-flex items-center"
                                style={{
                                  fontSize: 11,
                                  lineHeight: "1",
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  fontWeight: "var(--font-weight-medium)" as any,
                                  backgroundColor: item.status === "Active" ? "var(--accent-surface)" : "var(--surface-raised)",
                                  color: item.status === "Active" ? "var(--accent-text-strong)" : "var(--text-muted)",
                                }}
                              >
                                {item.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {whereUsedSubTab === "vendors" && (
                    <div
                      style={{
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                      }}
                    >
                      {WHERE_USED_VENDORS.map((vendor, vIdx) => {
                        const isExpanded = expandedVendors.has(vendor.id);
                        const totalItems = vendor.locations.reduce((sum, loc) => sum + loc.items.length, 0);
                        const locationCount = vendor.locations.length;
                        return (
                          <div
                            key={vendor.id}
                            style={{
                              borderColor: "var(--border-subtle)",
                              borderBottomWidth: vIdx < WHERE_USED_VENDORS.length - 1 ? 1 : 0,
                              borderBottomStyle: "solid" as const,
                            }}
                          >
                            {/* ── Vendor row (clickable to expand) ── */}
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.04 * vIdx, duration: 0.22 }}
                              className="flex items-center cursor-pointer transition-colors"
                              style={{
                                padding: "12px 16px",
                                gap: 10,
                                backgroundColor: "rgba(0,0,0,0)",
                                transition: "background-color 0.12s ease",
                              }}
                              onClick={() => toggleVendorExpand(vendor.id)}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-hover)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)"; }}
                            >
                              {/* Expand chevron */}
                              <motion.div
                                animate={{ rotate: isExpanded ? 0 : -90 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center justify-center shrink-0"
                                style={{ width: 16, height: 16 }}
                              >
                                <ChevronDown size={14} strokeWidth={1.8} style={{ color: "var(--text-muted)" }} />
                              </motion.div>

                              {/* Vendor icon */}
                              <div
                                className="flex items-center justify-center shrink-0"
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "var(--radius-sm)",
                                  backgroundColor: "var(--primary-surface)",
                                  borderWidth: 1,
                                  borderStyle: "solid",
                                  borderColor: "var(--primary-border)",
                                }}
                              >
                                <Building2 size={13} style={{ color: "var(--primary)" }} />
                              </div>

                              {/* Name + meta */}
                              <div className="flex-1 min-w-0">
                                <span
                                  style={{
                                    fontSize: "var(--text-label)",
                                    fontWeight: "var(--font-weight-medium)" as any,
                                    color: "var(--foreground)",
                                    lineHeight: "1",
                                    fontFamily: "var(--font-family)",
                                  }}
                                >
                                  {vendor.name}
                                </span>
                              </div>

                              {/* Badges: locations + items */}
                              <div className="flex items-center gap-[6px] shrink-0">
                                <span
                                  className="inline-flex items-center gap-[4px]"
                                  style={{
                                    fontSize: 11,
                                    lineHeight: "1",
                                    padding: "3px 8px",
                                    borderRadius: 6,
                                    fontWeight: "var(--font-weight-normal)" as any,
                                    backgroundColor: "var(--surface-raised)",
                                    color: "var(--text-muted)",
                                    fontFamily: "var(--font-family)",
                                  }}
                                >
                                  <MapPin size={10} strokeWidth={1.8} />
                                  {locationCount} location{locationCount > 1 ? "s" : ""}
                                </span>
                                <span
                                  className="inline-flex items-center gap-[4px]"
                                  style={{
                                    fontSize: 11,
                                    lineHeight: "1",
                                    padding: "3px 8px",
                                    borderRadius: 6,
                                    fontWeight: "var(--font-weight-normal)" as any,
                                    backgroundColor: "var(--primary-surface)",
                                    color: "var(--primary-text-strong)",
                                    fontFamily: "var(--font-family)",
                                    borderWidth: 1,
                                    borderStyle: "solid",
                                    borderColor: "var(--primary-border)",
                                  }}
                                >
                                  <Package size={10} strokeWidth={1.8} />
                                  {totalItems} item{totalItems > 1 ? "s" : ""}
                                </span>
                              </div>
                            </motion.div>

                            {/* ── Expanded locations ── */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div
                                    style={{
                                      borderTopWidth: 1,
                                      borderTopStyle: "solid",
                                      borderColor: "var(--border-subtle)",
                                    }}
                                  >
                                    {/* Location table header */}
                                    <div
                                      className="grid"
                                      style={{
                                        gridTemplateColumns: "44px minmax(180px, 1fr) minmax(220px, 280px) minmax(200px, 1fr)",
                                        backgroundColor: "var(--secondary)",
                                        borderColor: "var(--border-subtle)",
                                        borderBottomWidth: 1,
                                        borderBottomStyle: "solid",
                                        padding: "0 0 0 26px",
                                      }}
                                    >
                                      {["#", "LOCATION", "ADDRESS", "ITEMS"].map((col) => (
                                        <div
                                          key={col}
                                          style={{
                                            padding: "7px 16px",
                                            fontSize: 11,
                                            fontWeight: "var(--font-weight-medium)" as any,
                                            color: "var(--text-subtle)",
                                            lineHeight: "1",
                                            letterSpacing: "0.04em",
                                            fontFamily: "var(--font-family)",
                                            textTransform: "uppercase" as const,
                                          }}
                                        >
                                          {col}
                                        </div>
                                      ))}
                                    </div>

                                    {/* Location rows */}
                                    {vendor.locations.map((loc, lIdx) => (
                                      <motion.div
                                        key={loc.id}
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.03 * lIdx, duration: 0.18 }}
                                        className="grid items-center transition-colors"
                                        style={{
                                          gridTemplateColumns: "44px minmax(180px, 1fr) minmax(220px, 280px) minmax(200px, 1fr)",
                                          borderColor: "var(--border-subtle)",
                                          borderBottomWidth: lIdx < vendor.locations.length - 1 ? 1 : 0,
                                          borderBottomStyle: "solid" as const,
                                          backgroundColor: "var(--background)",
                                          transition: "background-color 0.12s ease",
                                          paddingLeft: 26,
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-hover)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--background)"; }}
                                      >
                                        {/* Row number */}
                                        <div
                                          style={{
                                            padding: "11px 16px",
                                            fontSize: "var(--text-label)",
                                            fontWeight: "var(--font-weight-normal)" as any,
                                            color: "var(--text-muted)",
                                            lineHeight: "1",
                                            fontFamily: "var(--font-family)",
                                          }}
                                        >
                                          {lIdx + 1}
                                        </div>

                                        {/* Location name */}
                                        <div
                                          style={{
                                            padding: "11px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                          }}
                                        >
                                          <div
                                            className="flex items-center justify-center shrink-0"
                                            style={{
                                              width: 24,
                                              height: 24,
                                              borderRadius: "var(--radius-sm)",
                                              backgroundColor: "var(--card)",
                                              borderWidth: 1,
                                              borderStyle: "solid",
                                              borderColor: "var(--border)",
                                            }}
                                          >
                                            <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                                          </div>
                                          <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
                                            <span
                                              style={{
                                                fontSize: "var(--text-label)",
                                                fontWeight: "var(--font-weight-medium)" as any,
                                                color: "var(--foreground)",
                                                lineHeight: "1.2",
                                                fontFamily: "var(--font-family)",
                                              }}
                                            >
                                              {loc.name}
                                            </span>
                                            <span
                                              style={{
                                                fontSize: 11,
                                                fontWeight: "var(--font-weight-normal)" as any,
                                                color: "var(--text-muted)",
                                                lineHeight: "1",
                                                fontFamily: "var(--font-family)",
                                              }}
                                            >
                                              {loc.items.length} item{loc.items.length > 1 ? "s" : ""} using this UOM
                                            </span>
                                          </div>
                                        </div>

                                        {/* Address */}
                                        <div
                                          style={{
                                            padding: "11px 16px",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 5,
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "var(--text-label)",
                                              fontWeight: "var(--font-weight-normal)" as any,
                                              color: "var(--text-subtle)",
                                              lineHeight: "1.4",
                                              fontFamily: "var(--font-family)",
                                            }}
                                          >
                                            {loc.address}
                                          </span>
                                        </div>

                                        {/* Items */}
                                        <VendorItemsCell items={loc.items} onSkuClick={handleSkuClick} />
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ──── ACTIVITY TAB — Recent Activity ──── */}
              {activeTab === "activity" && (
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: "var(--text-label)", fontWeight: "var(--font-weight-medium)" as any, color: "var(--foreground)", lineHeight: "1" }}>
                      Recent Activity
                    </span>
                    <CountBadge count={RECENT_ACTIVITY.length} />
                  </div>

                  <div
                    style={{
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                    }}
                  >
                    {RECENT_ACTIVITY.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * idx, duration: 0.22 }}
                        className="flex items-start gap-3 transition-colors"
                        style={{
                          padding: "12px 16px",
                          borderColor: "var(--border-subtle)",
                          borderBottomWidth: idx < RECENT_ACTIVITY.length - 1 ? 1 : 0,
                          borderBottomStyle: "solid" as const,
                          backgroundColor: "rgba(0,0,0,0)",
                          transition: "background-color 0.12s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-hover)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)"; }}
                      >
                        {/* User avatar */}
                        <span
                          className="inline-flex items-center justify-center shrink-0"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: "var(--primary-surface)",
                            color: "var(--primary)",
                            fontSize: 9,
                            fontWeight: "var(--font-weight-medium)" as any,
                            lineHeight: "1",
                            marginTop: 1,
                          }}
                        >
                          {item.userInitials}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[6px]">
                            <span style={{ fontSize: "var(--text-label)", lineHeight: "1", fontWeight: "var(--font-weight-medium)" as any, color: "var(--text-strong)" }}>
                              {item.action}
                            </span>
                            <span
                              className="shrink-0"
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: "50%",
                                backgroundColor: "var(--text-subtle)",
                                display: "inline-block",
                              }}
                            />
                            <span style={{ fontSize: 12, lineHeight: "1", color: "var(--text-muted)", fontWeight: "var(--font-weight-normal)" as any }}>
                              {item.user}
                            </span>
                          </div>
                          {item.detail && (
                            <span className="block" style={{ fontSize: 12, lineHeight: "1.4", color: "var(--text-muted)", marginTop: 4, fontWeight: "var(--font-weight-normal)" as any }}>
                              {item.detail}
                            </span>
                          )}
                          {item.field && item.value && (
                            <div className="flex items-center gap-[6px]" style={{ marginTop: 4 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  lineHeight: "1",
                                  fontWeight: "var(--font-weight-medium)" as any,
                                  color: "var(--text-subtle)",
                                  backgroundColor: "var(--surface-raised)",
                                  padding: "3px 7px",
                                  borderRadius: 4,
                                }}
                              >
                                {item.field}
                              </span>
                              <span style={{ fontSize: 11, lineHeight: "1", color: "var(--text-muted)", fontWeight: "var(--font-weight-normal)" as any }}>
                                {item.value}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Date */}
                        <span className="shrink-0" style={{ fontSize: 11, lineHeight: "1", color: "var(--text-subtle)", marginTop: 2, fontWeight: "var(--font-weight-normal)" as any }}>
                          {item.date}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>

    {/* ── EDIT MODAL ── */}
    <CreateUomModal
      open={editModalOpen}
      onClose={() => setEditModalOpen(false)}
        editUnit={!isInUse && unit ? {
        ...unit,
        name: displayName,
        symbol: displaySymbol,
        description: displayDescription,
        category: displayCategory,
      } : null}
      onEdited={(updatedFields) => {
        setEditModalOpen(false);
        setLocalName(updatedFields.name);
        setLocalSymbol(updatedFields.symbol);
        setLocalDescription(updatedFields.description);
        showToast("success", `"${updatedFields.name}" updated successfully`);
      }}
    />

    {/* ═══ ARCHIVE CONFIRMATION MODAL ═══ */}
    <AnimatePresence>
      {archiveModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setArchiveModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.35)",
              zIndex: 9998,
            }}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              width: 560,
              maxWidth: "calc(100vw - 40px)",
              backgroundColor: "var(--background)",
              borderRadius: "var(--radius-lg)",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "var(--border)",
              boxShadow: "0 20px 60px -12px rgba(0,0,0,0.18)",
              maxHeight: "calc(100vh - 40px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              pointerEvents: "auto",
            }}
          >
            <div style={{ overflowY: "auto", flex: 1, paddingBottom: 8 }}>
              {/* Header */}
              <div
                className="flex items-start gap-[14px]"
                style={{ padding: "24px 24px 0 24px" }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius)",
                    backgroundColor: "var(--destructive-surface)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "var(--destructive-border)",
                  }}
                >
                  <AlertTriangle
                    size={18}
                    strokeWidth={2}
                    style={{ color: "var(--destructive)" }}
                  />
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-medium)" as any,
                      color: "var(--foreground)",
                      lineHeight: "1.3",
                      fontFamily: "var(--font-family)",
                    }}
                  >
                    Archive "{displayName}"?
                  </h3>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      color: "var(--text-muted)",
                      lineHeight: "1.5",
                      fontFamily: "var(--font-family)",
                    }}
                  >
                    This unit can’t be archived while it is associated with active transactions and records.
                  </p>
                </div>
              </div>

              {/* Blocking explanation */}
              <div style={{ padding: "16px 24px 0 78px" }}>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {[
                    "Remove or complete the active references listed below before archiving this unit",
                    "Historical records stay intact after the unit is no longer actively referenced",
                    "Once associations are cleared, archiving will become available again",
                  ].map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-[8px]"
                      style={{
                        fontSize: "var(--text-label)",
                        fontWeight: "var(--font-weight-normal)" as any,
                        color: "var(--text-subtle)",
                        lineHeight: "1.45",
                        fontFamily: "var(--font-family)",
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          backgroundColor: "var(--text-muted)",
                          marginTop: 5,
                          flexShrink: 0,
                        }}
                      />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage summary */}
              <div
                style={{
                  margin: "16px 24px 0 24px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--destructive-surface)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "var(--destructive-border)",
                }}
              >
                <div
                  className="flex items-center gap-[8px]"
                  style={{
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--destructive)",
                    lineHeight: "1",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  <AlertTriangle size={13} strokeWidth={2} />
                  Archiving is unavailable until these active references are removed
                </div>
              </div>

              <div style={{ padding: "16px 24px 0 24px" }}>
                <div
                  style={{
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--foreground)",
                    lineHeight: "1.4",
                  }}
                >
                  Active references
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {ARCHIVE_BLOCKING_REFERENCES.map((group) => (
                    <div
                      key={group.label}
                      className="flex flex-wrap items-start gap-x-2 gap-y-1"
                      style={{
                        fontSize: "var(--text-label)",
                        lineHeight: "1.6",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "var(--text-label)",
                          fontWeight: "var(--font-weight-medium)" as any,
                          color: "var(--foreground)",
                          lineHeight: "1.4",
                        }}
                      >
                        {group.label}:
                      </div>
                      <div
                        style={{
                          color: "var(--text-subtle)",
                          fontSize: "var(--text-label)",
                          lineHeight: "1.6",
                        }}
                      >
                        {group.entries.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center justify-end gap-[10px]"
              style={{
                padding: "16px 24px 20px",
                borderTop: "1px solid var(--border-subtle)",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setArchiveModalOpen(false)}
                className="cursor-pointer border-none"
                style={{
                  padding: "8px 18px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  lineHeight: "1",
                  backgroundColor: "rgba(0,0,0,0)",
                  color: "var(--text-subtle)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family)",
                  transition: "all 0.12s",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                disabled
                aria-disabled="true"
                className="border-none"
                style={{
                  padding: "8px 18px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-label)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  lineHeight: "1",
                  backgroundColor: "var(--surface-raised)",
                  color: "var(--text-muted)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family)",
                  transition: "all 0.12s",
                  cursor: "not-allowed",
                }}
              >
                Cannot Archive
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

/* ══��════════════════════════════════════════════
   Shared small components (DRY helpers)
   ═══════════════════════════════════════════════ */

/** Count badge used in section headers */
function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        fontSize: 11,
        padding: "2px 6px",
        borderRadius: 4,
        backgroundColor: "var(--surface-raised)",
        color: "var(--text-subtle)",
        fontWeight: "var(--font-weight-medium)" as any,
        lineHeight: "1",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--border)",
      }}
    >
      {count}
    </span>
  );
}

/** Middle dot separator for meta line */
function MetaDot() {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: 20,
        color: "var(--text-disabled)",
        fontSize: "var(--text-label)",
        lineHeight: "1",
        userSelect: "none",
      }}
      aria-hidden
    >
      ·
    </span>
  );
}

/** Vendor items cell — shows max 3 items, rest as +N with hover popover */
const VENDOR_ITEMS_VISIBLE = 3;

function VendorItemsCell({ items, onSkuClick }: { items: string[]; onSkuClick: (sku: string) => void }) {
  const visible = items.slice(0, VENDOR_ITEMS_VISIBLE);
  const overflow = items.slice(VENDOR_ITEMS_VISIBLE);
  const hasOverflow = overflow.length > 0;
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPopover = () => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + 6, left: rect.left });
    setPopoverOpen(true);
  };

  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setPopoverOpen(false), 180);
  };

  const cancelHide = () => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  };

  const itemBadge = (sku: string) => (
    <span
      key={sku}
      onClick={() => onSkuClick(sku)}
      className="cursor-pointer inline-flex items-center"
      style={{
        fontSize: 11,
        lineHeight: "1",
        padding: "3px 8px",
        borderRadius: 6,
        fontWeight: "var(--font-weight-medium)" as any,
        backgroundColor: "var(--surface-raised)",
        color: "var(--primary)",
        fontFamily: "var(--font-family)",
        gap: 3,
        transition: "background-color 0.12s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-surface)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--surface-raised)"; }}
    >
      {sku}
      <ExternalLink size={9} style={{ opacity: 0.6 }} />
    </span>
  );

  return (
    <div
      style={{
        padding: "11px 16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 5,
      }}
    >
      {visible.map((sku) => itemBadge(sku))}
      {hasOverflow && (
        <span
          ref={badgeRef}
          onMouseEnter={showPopover}
          onMouseLeave={scheduleHide}
          className="cursor-pointer inline-flex items-center"
          style={{
            fontSize: 11,
            lineHeight: "1",
            padding: "3px 8px",
            borderRadius: 6,
            fontWeight: "var(--font-weight-medium)" as any,
            backgroundColor: "var(--secondary)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-family)",
            transition: "all 0.12s",
          }}
        >
          +{overflow.length} more
        </span>
      )}

      {/* Popover portal */}
      {popoverOpen && popoverPos && hasOverflow && ReactDOM.createPortal(
        <div
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          style={{
            position: "fixed",
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 9999,
            backgroundColor: "var(--card)",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--elevation-sm)",
            padding: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            maxWidth: 320,
          }}
        >
          <div
            style={{
              width: "100%",
              fontSize: 11,
              lineHeight: "1",
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--text-subtle)",
              fontFamily: "var(--font-family)",
              marginBottom: 2,
            }}
          >
            All items ({items.length})
          </div>
          {items.map((sku) => itemBadge(sku))}
        </div>,
        document.body,
      )}
    </div>
  );
}

/** Table header row */
function TableHeader({ cols, template }: { cols: string[]; template: string }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: template,
        backgroundColor: "var(--secondary)",
        borderColor: "var(--border)",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
      }}
    >
      {cols.map((col) => (
        <div
          key={col}
          style={{
            padding: "9px 16px",
            fontSize: 10,
            textTransform: "uppercase" as const,
            lineHeight: "1",
            letterSpacing: "0.05em",
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--text-muted)",
          }}
        >
          {col}
        </div>
      ))}
    </div>
  );
}

/** Conversion table header — cleaner, lighter variant for conversions */
function ConversionTableHeader({ cols, template }: { cols: string[]; template: string }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: template,
        backgroundColor: "var(--surface-raised)",
        borderColor: "var(--border-subtle)",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
      }}
    >
      {cols.map((col) => (
        <div
          key={col}
          style={{
            padding: "10px 16px",
            fontSize: 11,
            textTransform: "uppercase" as const,
            lineHeight: "1",
            letterSpacing: "0.06em",
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--text-subtle)",
          }}
        >
          {col}
        </div>
      ))}
    </div>
  );
}

/** Table cell */
function Cell({
  children,
  muted = false,
  className = "",
}: {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        padding: "11px 16px",
        fontSize: "var(--text-label)",
        lineHeight: "1",
        color: muted ? "var(--text-subtle)" : "var(--text-strong)",
        fontWeight: "var(--font-weight-normal)" as any,
      }}
    >
      {children}
    </div>
  );
}

/** Pagination button */
function PaginationBtn({
  children,
  disabled = false,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center gap-[2px] cursor-pointer border-none outline-none"
      style={{
        padding: "6px 8px",
        borderRadius: "var(--radius-sm)",
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-weight-normal)" as any,
        lineHeight: "1",
        color: disabled ? "var(--text-disabled)" : "var(--text-muted)",
        backgroundColor: "rgba(0,0,0,0)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.12s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
      }}
    >
      {children}
    </button>
  );
}