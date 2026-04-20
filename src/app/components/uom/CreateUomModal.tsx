/**
 * UOM Module — Create Unit of Measure Modal
 *
 * Two-step wizard matching the Omne ERP design language.
 * Step 1: Basic Info
 * Step 2: Unit Conversions (tabbed — Same Category + Cross Category)
 *
 * All colors use CSS custom properties from theme.css.
 * Typography uses 'Inter' font family defined in fonts.css.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { X, Search, ChevronDown, Check } from "lucide-react";
import { UOM_CATEGORIES, CategoryBadge, type UomCategory } from "./CategoryBadge";
import { SAMPLE_UNITS, type UomUnit } from "./sample-data";

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Unit Conversions" },
];

const DESC_MAX = 500;
const NAME_MAX = 100;
const SYMBOL_MAX = 15;

/* ═══════════════════════════════════════════════
   Cross-category row type
   ══════════════════════════════════════════════ */

interface CrossCatRow {
  id: string;
  factor: string;
  targetUnitId: string;
}

let _crossRowId = 0;
function nextCrossRowId() {
  return `xr_${++_crossRowId}`;
}

/* ═══════════════════════════════════════════════
   Shared input styles
   ═══════════════════════════════════════════════ */

const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--primary)";
    e.currentTarget.style.boxShadow = "var(--ring-primary-glow)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--border-strong)";
    e.currentTarget.style.boxShadow = "none";
  },
};

const INPUT_STYLE: React.CSSProperties = {
  height: "var(--input-height)",
  padding: "0 12px",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  color: "var(--foreground)",
  fontSize: "var(--text-label)",
  backgroundColor: "var(--input-background)",
  boxSizing: "border-box",
};

/* ══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

function StepTab({
  step,
  isActive,
  isDone,
  disabled,
  onClick,
}: {
  step: (typeof STEPS)[number];
  isActive: boolean;
  isDone: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  // Match Partners CreatePartnerModal stepper exactly:
  // - completed → emerald check on emerald background, emerald label + underline
  // - active    → primary number on primary background, primary label + underline
  // - default   → white circle with subtle border, slate label
  let dotClasses = "border-[1.5px] border-slate-300 text-slate-500 bg-white";
  let labelColor = "text-slate-700";
  let labelWeight = 500;
  let underlineColor: string | null = null;

  if (disabled) {
    dotClasses = "border-[1.5px] border-slate-200 text-slate-300 bg-white";
    labelColor = "text-slate-400";
    labelWeight = 400;
  } else if (isDone) {
    dotClasses = "bg-emerald-500 text-white";
    labelColor = "text-emerald-500";
    labelWeight = 600;
    underlineColor = "bg-emerald-500";
  } else if (isActive) {
    dotClasses = "bg-primary text-primary-foreground";
    labelColor = "text-primary";
    labelWeight = 600;
    underlineColor = "bg-primary";
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="relative flex items-center gap-2 bg-transparent border-none outline-none"
      style={{
        padding: "12px 18px",
        marginBottom: -1,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
        fontFamily: "var(--font-family)",
        transition: "all 0.2s ease",
      }}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200 ${dotClasses}`}
        style={{
          width: 24,
          height: 24,
          fontSize: 12,
          lineHeight: "1",
          fontWeight: 600,
          fontFamily: "var(--font-family)",
        }}
      >
        {isDone ? <Check size={12} strokeWidth={2.5} /> : step.number}
      </span>

      <span
        className={`whitespace-nowrap transition-colors ${labelColor}`}
        style={{
          fontSize: 13,
          lineHeight: "1",
          fontWeight: labelWeight,
          fontFamily: "var(--font-family)",
        }}
      >
        {step.label}
      </span>

      {underlineColor && (
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full ${underlineColor}`} />
      )}
    </button>
  );
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label
      className="block"
      style={{
        fontSize: "var(--text-label)",
        lineHeight: "1.4",
        fontWeight: "var(--font-weight-medium)" as any,
        color: "var(--text-strong)",
        marginBottom: 8,
        fontFamily: "var(--font-family)",
      }}
    >
      {label}
      {required && (
        <span style={{ color: "var(--destructive)", marginLeft: 3, fontWeight: "var(--font-weight-normal)" as any }}>*</span>
      )}
    </label>
  );
}

/** Inline validation error message */
function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <span
      style={{
        display: "block",
        fontSize: 12,
        lineHeight: "1.3",
        color: "var(--destructive)",
        marginTop: 6,
        fontFamily: "var(--font-family)",
        fontWeight: "var(--font-weight-normal)" as any,
      }}
    >
      {message}
    </span>
  );
}

/** Focus handlers that respect error state */
function makeInputFocusHandlers(hasError: boolean) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = hasError ? "var(--destructive)" : "var(--primary)";
      e.currentTarget.style.boxShadow = hasError
        ? "0 0 0 2px rgba(255,69,58,0.12)"
        : "var(--ring-primary-glow)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = hasError ? "var(--destructive)" : "var(--border-strong)";
      e.currentTarget.style.boxShadow = "none";
    },
  };
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          backgroundColor: "var(--highlight-bg)",
          color: "inherit",
          padding: "0 1px",
          borderRadius: 2,
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ═══════════════════════════════════════════════
   Conversion Sub-Tab
   ═══════════════════════════════════════════════ */

function ConversionSubTab({
  label,
  isActive,
  badge,
  onClick,
}: {
  label: string;
  isActive: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[6px] border-none outline-none"
      style={{
        padding: "5px 12px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        fontFamily: "var(--font-family)",
        transition: "all 0.15s ease",
        backgroundColor: isActive ? "var(--card)" : "rgba(0,0,0,0)",
        boxShadow: isActive
          ? "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--border)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
      }}
    >
      <span
        style={{
          fontSize: "var(--text-label)",
          lineHeight: "1",
          fontWeight: isActive
            ? ("var(--font-weight-medium)" as any)
            : ("var(--font-weight-normal)" as any),
          color: isActive ? "var(--text-strong)" : "var(--text-muted)",
          fontFamily: "var(--font-family)",
        }}
      >
        {label}
      </span>
      {badge && (
        <span
          style={{
            fontSize: 10,
            lineHeight: "1",
            fontWeight: "var(--font-weight-medium)" as any,
            color: isActive ? "var(--text-default)" : "var(--text-subtle)",
            backgroundColor: isActive
              ? "var(--secondary)"
              : "rgba(0,0,0,0)",
            padding: "2px 6px",
            borderRadius: 6,
            fontFamily: "var(--font-family)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Category Select (portal dropdown)
   ═══════════════════════════════════════════════ */

function CategorySelect({
  value,
  onChange,
  hasError,
  onBlur,
}: {
  value: UomCategory | null;
  onChange: (cat: UomCategory) => void;
  hasError?: boolean;
  onBlur?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, { capture: true } as any);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const hasBeenOpenedRef = useRef(false);

  useEffect(() => {
    if (open) {
      hasBeenOpenedRef.current = true;
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setSearch("");
      // Only fire onBlur when transitioning from open→closed (not on initial mount)
      if (hasBeenOpenedRef.current) {
        onBlur?.();
      }
    }
  }, [open]); // Removed onBlur from dependencies to prevent infinite loop

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return UOM_CATEGORIES;
    const q = search.toLowerCase();
    return UOM_CATEGORIES.filter((cat) => cat.toLowerCase().includes(q));
  }, [search]);

  const dropdownContent = open && dropdownPos
    ? ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--elevation-sm)",
          }}
        >
          <div
            style={{
              padding: 8,
              borderColor: "var(--border-subtle)",
              borderBottomWidth: 1,
              borderBottomStyle: "solid" as const,
            }}
          >
            <div className="relative">
              <Search
                size={13}
                className="absolute left-[8px] top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-subtle)" }}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full outline-none"
                style={{
                  fontSize: 13,
                  lineHeight: "1",
                  padding: "6px 10px 6px 28px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--foreground)",
                  backgroundColor: "var(--input-background)",
                  fontFamily: "var(--font-family)",
                }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 180, overflowY: "auto" }} className="scrollbar-overlay">
            {filteredCategories.length === 0 ? (
              <div
                className="text-center"
                style={{
                  padding: "14px 12px",
                  color: "var(--text-subtle)",
                  fontSize: 13,
                  fontFamily: "var(--font-family)",
                }}
              >
                No matching categories
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="flex items-center w-full bg-transparent border-none cursor-pointer transition-colors hover:bg-secondary"
                  style={{
                    padding: "8px 12px",
                    fontSize: 13,
                    lineHeight: "1",
                    color: cat === value
                      ? "var(--primary)"
                      : "var(--text-strong)",
                    fontWeight: cat === value
                      ? ("var(--font-weight-medium)" as any)
                      : ("var(--font-weight-normal)" as any),
                    fontFamily: "var(--font-family)",
                  }}
                  onClick={() => {
                    onChange(cat);
                    setOpen(false);
                  }}
                >
                  {search ? highlightMatch(cat, search) : cat}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full cursor-pointer transition-colors"
        style={{
          ...INPUT_STYLE,
          fontSize: 14,
          lineHeight: "1",
          color: value ? "var(--foreground)" : "var(--text-subtle)",
          outline: "none",
          ...(hasError ? { borderColor: "var(--destructive)" } : {}),
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = hasError ? "var(--destructive)" : "var(--primary)";
          e.currentTarget.style.boxShadow = hasError
            ? "0 0 0 2px rgba(255,69,58,0.12)"
            : "var(--ring-primary-glow)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = hasError ? "var(--destructive)" : "var(--border-strong)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span>{value ?? "Select Unit Category"}</span>
        <ChevronDown size={14} style={{ color: "var(--text-subtle)" }} />
      </button>

      {dropdownContent}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

interface CreateUomModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (unitName: string) => void;
  /** When provided, the modal operates in "Edit" mode with pre-populated fields */
  editUnit?: UomUnit | null;
  onEdited?: (updatedFields: { name: string; symbol: string; description: string; category: UomCategory | null }) => void;
}

export function CreateUomModal({ open, onClose, onCreated, editUnit, onEdited }: CreateUomModalProps) {
  const isEditMode = !!editUnit;
  const [activeStep, setActiveStep] = useState(1);
  /** Sub-tab within Step 2: "same" or "cross" */
  const [conversionTab, setConversionTab] = useState<"same" | "cross">("same");

  const [symbol, setSymbol] = useState(editUnit?.symbol ?? "");
  const [unitName, setUnitName] = useState(editUnit?.name ?? "");
  const [category, setCategory] = useState<UomCategory | null>(editUnit?.category ?? null);
  const [description, setDescription] = useState(editUnit?.description ?? "");

  const [convertFactor, setConvertFactor] = useState("");
  const [convertTarget, setConvertTarget] = useState("");
  const [siblingSearch, setSiblingSearch] = useState("");

  const [crossRows, setCrossRows] = useState<CrossCatRow[]>(() => []);

  /** Track which fields the user has interacted with (for showing errors on blur) */
  const [touched, setTouched] = useState<{ name: boolean; symbol: boolean; category: boolean }>({
    name: false,
    symbol: false,
    category: false,
  });
  /** Set to true when user clicks Next/Save to force-show all errors */
  const [submitted, setSubmitted] = useState(false);

  /* ── Computed validation errors ── */
  const nameError = useMemo(() => {
    const trimmed = unitName.trim();
    if (!trimmed) return "Unit Name is Required";
    if (unitName.length > NAME_MAX) return "Character Limit Exceeded";
    // Uniqueness check (case-insensitive, skip self in edit mode)
    const duplicate = SAMPLE_UNITS.find(
      (u) => u.name.toLowerCase() === trimmed.toLowerCase() && (!editUnit || u.id !== editUnit.id)
    );
    if (duplicate) return "Unit Already Exists, Enter a Different Name";
    return null;
  }, [unitName, editUnit]);

  const symbolError = useMemo(() => {
    const trimmed = symbol.trim();
    if (!trimmed) return "Unit Symbol is Required";
    if (symbol.length > SYMBOL_MAX) return "Character Limit Exceeded";
    // Uniqueness check (case-insensitive, skip self in edit mode)
    const duplicate = SAMPLE_UNITS.find(
      (u) => u.symbol.toLowerCase() === trimmed.toLowerCase() && (!editUnit || u.id !== editUnit.id)
    );
    if (duplicate) return "Unit Already Exists, Enter a Different Unit";
    return null;
  }, [symbol, editUnit]);

  const categoryError = useMemo(() => {
    if (!category) return "Unit Category is Required";
    return null;
  }, [category]);

  /** Whether all Step 1 fields are valid (no errors at all) */
  const isStep1Valid = !nameError && !symbolError && !categoryError;

  /** Whether to show an error for a given field */
  const showError = (field: "name" | "symbol" | "category") => {
    return submitted || touched[field];
  };

  const siblingUnits = useMemo(() => {
    if (!category) return [];
    return SAMPLE_UNITS.filter((u) => u.category === category);
  }, [category]);

  const filteredSiblings = useMemo(() => {
    if (!siblingSearch) return siblingUnits;
    const q = siblingSearch.toLowerCase();
    return siblingUnits.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.symbol.toLowerCase().includes(q)
    );
  }, [siblingUnits, siblingSearch]);

  const crossCatUnits = useMemo(() => {
    if (!category) return SAMPLE_UNITS;
    return SAMPLE_UNITS.filter((u) => u.category !== category);
  }, [category]);

  const unitById = useMemo(() => {
    const map = new Map<string, (typeof SAMPLE_UNITS)[number]>();
    for (const u of SAMPLE_UNITS) map.set(u.id, u);
    return map;
  }, []);

  const updateCrossRow = useCallback(
    (rowId: string, patch: Partial<Omit<CrossCatRow, "id">>) => {
      setCrossRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r))
      );
    },
    []
  );

  const removeCrossRow = useCallback((rowId: string) => {
    setCrossRows((prev) => prev.filter((r) => r.id !== rowId));
  }, []);

  const addCrossRow = useCallback(() => {
    setCrossRows((prev) => [
      ...prev,
      { id: nextCrossRowId(), factor: "", targetUnitId: "" },
    ]);
  }, []);

  /** Handles category change — resets conversion data when category is switched */
  const handleCategoryChange = useCallback(
    (newCat: UomCategory) => {
      if (newCat !== category) {
        // Reset all conversion data when category changes
        setConvertFactor("");
        setConvertTarget("");
        setSiblingSearch("");
        setCrossRows([]);
        setConversionTab("same");
      }
      setCategory(newCat);
      setTouched((prev) => ({ ...prev, category: true }));
    },
    [category]
  );

  const resetForm = useCallback(() => {
    setActiveStep(1);
    setConversionTab("same");
    if (editUnit) {
      setSymbol(editUnit.symbol);
      setUnitName(editUnit.name);
      setCategory(editUnit.category);
      setDescription(editUnit.description);
    } else {
      setSymbol("");
      setUnitName("");
      setCategory(null);
      setDescription("");
    }
    setConvertFactor("");
    setConvertTarget("");
    setSiblingSearch("");
    setCrossRows([]);
    setTouched({ name: false, symbol: false, category: false });
    setSubmitted(false);
  }, [editUnit]);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "var(--overlay-backdrop)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto relative flex flex-col w-full sm:max-w-[660px]"
          style={{
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--card)",
            boxShadow: "0 24px 48px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
            height: "min(680px, 90vh)",
            fontFamily: "var(--font-family)",
          }}
        >
          {/* ═══ HEADER ═══ */}
          <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
            {/* Close button */}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute cursor-pointer bg-transparent border-none inline-flex items-center justify-center transition-colors hover:opacity-70"
              style={{
                top: 20,
                right: 20,
                padding: 4,
                color: "var(--text-subtle)",
              }}
            >
              <X size={18} strokeWidth={1.8} />
            </button>

            <h2
              style={{
                fontSize: "var(--text-h4)",
                lineHeight: "1.3",
                fontWeight: "var(--font-weight-semibold)" as any,
                color: "var(--foreground)",
                margin: 0,
                fontFamily: "var(--font-family)",
                letterSpacing: "-0.01em",
              }}
            >
              {isEditMode ? "Edit Unit of Measure" : "Create Unit of Measure"}
            </h2>
            <p
              style={{
                fontSize: "var(--text-label)",
                lineHeight: "1.5",
                color: "var(--text-muted)",
                margin: "6px 0 0",
                fontFamily: "var(--font-family)",
                fontWeight: "var(--font-weight-normal)" as any,
              }}
            >
              {isEditMode
                ? "Update the unit details."
                : "Create a custom unit of measure and define its conversions."}
            </p>
          </div>

          {/* ══ STEP TABS ═══ */}
          {!isEditMode && (
            <div
              className="flex overflow-x-auto no-scrollbar"
              style={{
                borderColor: "var(--border)",
                borderBottomWidth: 1,
                borderBottomStyle: "solid",
                marginTop: 16,
                paddingLeft: 10,
                flexShrink: 0,
              }}
            >
              {STEPS.map((step) => (
                <StepTab
                  key={step.number}
                  step={step}
                  isActive={step.number === activeStep}
                  isDone={step.number < activeStep}
                  disabled={step.number > 1 && !isStep1Valid}
                  onClick={() => {
                    if (step.number > 1 && !isStep1Valid) {
                      setSubmitted(true);
                      return;
                    }
                    setActiveStep(step.number);
                  }}
                />
              ))}
            </div>
          )}

          {/* ═══ FORM CONTENT ═══ */}
          <div
            className="scrollbar-overlay"
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── STEP 1: Basic Info ── */}
            {activeStep === 1 && (
              <div style={{ padding: "24px 28px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 18 }}>
                  {/* ── Unit Symbol ── */}
                  <div>
                    <FieldLabel label="Unit Symbol" required />
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= SYMBOL_MAX) {
                          setSymbol(val);
                        }
                        // If at limit, the field silently stops — error message shows below
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, symbol: true }))}
                      placeholder="Enter Unit Symbol"
                      maxLength={SYMBOL_MAX}
                      className="w-full outline-none transition-shadow"
                      style={{
                        ...INPUT_STYLE,
                        fontSize: 14,
                        lineHeight: "1",
                        ...(showError("symbol") && symbolError ? { borderColor: "var(--destructive)" } : {}),
                      }}
                      {...makeInputFocusHandlers(!!(showError("symbol") && symbolError))}
                    />
                    <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                      <FieldError message={showError("symbol") ? symbolError : null} />
                      <span
                        style={{
                          fontSize: 11,
                          lineHeight: "1",
                          color: symbol.length >= SYMBOL_MAX ? "var(--destructive)" : "var(--text-subtle)",
                          fontFamily: "var(--font-family)",
                          marginLeft: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {symbol.length >= SYMBOL_MAX ? "Character Limit Exceeded" : `${symbol.length}/${SYMBOL_MAX}`}
                      </span>
                    </div>
                  </div>

                  {/* ── Unit Name ── */}
                  <div>
                    <FieldLabel label="Unit Name" required />
                    <input
                      type="text"
                      value={unitName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= NAME_MAX) {
                          setUnitName(val);
                        }
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      placeholder="Enter Unit Name"
                      maxLength={NAME_MAX}
                      className="w-full outline-none transition-shadow"
                      style={{
                        ...INPUT_STYLE,
                        fontSize: 14,
                        lineHeight: "1",
                        ...(showError("name") && nameError ? { borderColor: "var(--destructive)" } : {}),
                      }}
                      {...makeInputFocusHandlers(!!(showError("name") && nameError))}
                    />
                    <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                      <FieldError message={showError("name") ? nameError : null} />
                      <span
                        style={{
                          fontSize: 11,
                          lineHeight: "1",
                          color: unitName.length >= NAME_MAX ? "var(--destructive)" : "var(--text-subtle)",
                          fontFamily: "var(--font-family)",
                          marginLeft: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {unitName.length >= NAME_MAX ? "Character Limit Exceeded" : `${unitName.length}/${NAME_MAX}`}
                      </span>
                    </div>
                  </div>

                  {/* ── Unit Category ── */}
                  <div>
                    <FieldLabel label="Unit Category" required />
                    <CategorySelect
                      value={category}
                      onChange={handleCategoryChange}
                      hasError={!!(showError("category") && categoryError)}
                      onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
                    />
                    <FieldError message={showError("category") ? categoryError : null} />
                  </div>

                  {/* ── Description ── */}
                  <div>
                    <FieldLabel label="Description" />
                    <textarea
                      value={description}
                      onChange={(e) => {
                        if (e.target.value.length <= DESC_MAX)
                          setDescription(e.target.value);
                      }}
                      placeholder="Enter Description"
                      rows={2}
                      className="w-full outline-none transition-shadow"
                      style={{
                        ...INPUT_STYLE,
                        height: "auto",
                        padding: "10px 12px",
                        fontSize: 14,
                        lineHeight: "1.5",
                        resize: "none",
                        display: "block",
                      }}
                      {...inputFocusHandlers}
                    />
                    <div
                      className="flex items-center justify-end"
                      style={{ marginTop: 4 }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          lineHeight: "1",
                          color: description.length >= DESC_MAX ? "var(--destructive)" : "var(--text-subtle)",
                          fontFamily: "var(--font-family)",
                        }}
                      >
                        {description.length >= DESC_MAX ? "Character Limit Exceeded" : `${description.length}/${DESC_MAX}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Unit Conversions (tabbed) ── */}
            {activeStep === 2 && category && (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Sub-tab bar */}
                <div
                  className="flex shrink-0 items-center"
                  style={{
                    padding: "12px 28px",
                    gap: 4,
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border-subtle)",
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                  }}
                >
                  <div
                    className="inline-flex items-center"
                    style={{
                      padding: 3,
                      gap: 2,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--secondary)",
                    }}
                  >
                    <ConversionSubTab
                      label="Same Category"
                      isActive={conversionTab === "same"}
                      badge={String(siblingUnits.length)}
                      onClick={() => setConversionTab("same")}
                    />
                    <ConversionSubTab
                      label="Cross Category"
                      isActive={conversionTab === "cross"}
                      badge={crossRows.length > 0 ? "1" : "Optional"}
                      onClick={() => setConversionTab("cross")}
                    />
                  </div>
                </div>

                {/* Tab content */}
                <div
                  className="scrollbar-overlay flex-1 min-h-0"
                  style={{ padding: "24px 28px", overflowY: "auto" }}
                >
                  {/* ── Same Category Tab ── */}
                  {conversionTab === "same" && (
                    <div>
                      {/* Section title + badge */}
                      <div className="flex items-center gap-[10px]" style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: "var(--text-base)",
                            lineHeight: "1.35",
                            fontWeight: "var(--font-weight-semibold)" as any,
                            color: "var(--foreground)",
                            fontFamily: "var(--font-family)",
                            letterSpacing: "-0.005em",
                          }}
                        >
                          Same Category Unit Conversion
                        </span>
                        <CategoryBadge category={category} />
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: "var(--text-label)",
                          lineHeight: "1.6",
                          color: "var(--text-muted)",
                          margin: "0 0 22px",
                          fontFamily: "var(--font-family)",
                          fontWeight: "var(--font-weight-normal)" as any,
                          maxWidth: 540,
                        }}
                      >
                        Define how {unitName || "UOM"} converts to one other {category} unit. Only one same-category conversion is allowed. This applies to all items using this unit.
                      </p>

                      {/* Convert from / Convert to */}
                      <div className="grid grid-cols-2" style={{ gap: 16, marginBottom: 24 }}>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              lineHeight: "1.4",
                              fontWeight: "var(--font-weight-medium)" as any,
                              color: "var(--text-strong)",
                              marginBottom: 8,
                              fontFamily: "var(--font-family)",
                            }}
                          >
                            Convert from
                          </div>
                          <div
                            className="flex items-center"
                            style={{
                              backgroundColor: "var(--secondary)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius-md)",
                              height: "var(--input-height)",
                              padding: "0 12px",
                              boxSizing: "border-box",
                              fontSize: "var(--text-label)",
                              lineHeight: "1",
                              color: "var(--foreground)",
                              fontFamily: "var(--font-family)",
                              fontWeight: "var(--font-weight-medium)" as any,
                            }}
                          >
                            1 {symbol} ({unitName})
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              lineHeight: "1.4",
                              fontWeight: "var(--font-weight-medium)" as any,
                              color: "var(--text-strong)",
                              marginBottom: 8,
                              fontFamily: "var(--font-family)",
                            }}
                          >
                            Convert to
                          </div>
                          <div className="flex items-center" style={{ gap: 8 }}>
                            <select
                              value={convertTarget}
                              onChange={(e) => setConvertTarget(e.target.value)}
                              className="outline-none cursor-pointer transition-shadow flex-1"
                              style={{
                                ...INPUT_STYLE,
                                fontSize: 13,
                                lineHeight: "1",
                                minWidth: 0,
                                color: convertTarget ? "var(--foreground)" : "var(--text-subtle)",
                                appearance: "none",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 10px center",
                                paddingRight: 28,
                              }}
                              {...inputFocusHandlers}
                            >
                              <option value="" disabled>Select Unit</option>
                              {siblingUnits.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.symbol} ({u.name})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={convertFactor}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || Number(val) >= 0) setConvertFactor(val);
                              }}
                              onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
                              min="0"
                              placeholder="0"
                              disabled={!convertTarget}
                              className="outline-none transition-shadow"
                              style={{
                                ...INPUT_STYLE,
                                fontSize: 13,
                                lineHeight: "1",
                                width: 72,
                                opacity: !convertTarget ? 0.5 : 1,
                                cursor: !convertTarget ? "not-allowed" : undefined,
                              }}
                              {...inputFocusHandlers}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ── Sibling units reference table ── */}
                      <div
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                        }}
                      >
                        {/* Table toolbar */}
                        <div
                          className="flex items-center justify-between"
                          style={{
                            padding: "8px 14px",
                            backgroundColor: "var(--secondary)",
                            borderColor: "var(--border)",
                            borderBottomWidth: 1,
                            borderBottomStyle: "solid" as const,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              lineHeight: "1",
                              fontWeight: "var(--font-weight-medium)" as any,
                              color: "var(--text-muted)",
                              fontFamily: "var(--font-family)",
                            }}
                          >
                            {category}{" "}
                            <span style={{ color: "var(--text-subtle)" }}>
                              ({siblingUnits.length} Units)
                            </span>
                          </span>
                          <div className="relative">
                            <Search
                              size={12}
                              className="absolute left-[7px] top-1/2 -translate-y-1/2"
                              style={{ color: "var(--text-subtle)" }}
                            />
                            <input
                              type="text"
                              value={siblingSearch}
                              onChange={(e) => setSiblingSearch(e.target.value)}
                              placeholder="Search Unit"
                              className="outline-none"
                              style={{
                                width: 140,
                                padding: "5px 8px 5px 24px",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-sm)",
                                color: "var(--foreground)",
                                backgroundColor: "var(--input-background)",
                                fontSize: 12,
                                lineHeight: "1",
                                fontFamily: "var(--font-family)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Column headers */}
                        <div
                          className="grid"
                          style={{
                            gridTemplateColumns: "1fr 1fr 100px",
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            borderBottomWidth: 1,
                            borderBottomStyle: "solid" as const,
                          }}
                        >
                          {["Conversion Name", "Unit", "Unit Type"].map((col) => (
                            <div
                              key={col}
                              style={{
                                padding: "8px 14px",
                                fontSize: 11,
                                lineHeight: "1",
                                fontWeight: "var(--font-weight-medium)" as any,
                                color: "var(--text-muted)",
                                letterSpacing: "0.03em",
                                textTransform: "uppercase" as const,
                                fontFamily: "var(--font-family)",
                              }}
                            >
                              {col}
                            </div>
                          ))}
                        </div>

                        {/* Rows */}
                        <div className="scrollbar-overlay" style={{ maxHeight: 200 }}>
                          {filteredSiblings.length === 0 ? (
                            <div
                              className="flex items-center justify-center"
                              style={{
                                color: "var(--text-subtle)",
                                padding: "20px 14px",
                                fontSize: 13,
                                fontFamily: "var(--font-family)",
                              }}
                            >
                              No matching units
                            </div>
                          ) : (
                            filteredSiblings.map((unit, idx) => (
                              <div
                                key={unit.id}
                                className="grid items-center transition-colors"
                                style={{
                                  gridTemplateColumns: "1fr 1fr 100px",
                                  borderColor: "var(--border-subtle)",
                                  borderBottomWidth: idx < filteredSiblings.length - 1 ? 1 : 0,
                                  borderBottomStyle: "solid" as const,
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor = "var(--surface-hover)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor = "transparent")
                                }
                              >
                                <div
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: 13,
                                    lineHeight: "1",
                                    color: "var(--text-strong)",
                                    fontWeight: "var(--font-weight-medium)" as any,
                                    fontFamily: "var(--font-family)",
                                  }}
                                >
                                  {unit.symbol}{" "}
                                  <span style={{ color: "var(--text-subtle)", fontWeight: "var(--font-weight-normal)" as any }}>
                                    ({unit.name})
                                  </span>
                                </div>
                                <div
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: 13,
                                    lineHeight: "1",
                                    color: "var(--text-default)",
                                    fontFamily: "var(--font-family)",
                                  }}
                                >
                                  {unit.name}
                                </div>
                                <div
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: 12,
                                    lineHeight: "1",
                                    color: unit.type === "Custom"
                                      ? "var(--chart-3)"
                                      : "var(--text-subtle)",
                                    fontWeight: "var(--font-weight-medium)" as any,
                                    fontFamily: "var(--font-family)",
                                  }}
                                >
                                  {unit.type}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Cross Category Tab ── */}
                  {conversionTab === "cross" && (
                    <div>
                      <div className="flex items-center gap-[10px]" style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: "var(--text-base)",
                            lineHeight: "1.35",
                            fontWeight: "var(--font-weight-semibold)" as any,
                            color: "var(--foreground)",
                            fontFamily: "var(--font-family)",
                            letterSpacing: "-0.005em",
                          }}
                        >
                          Cross-Category Conversions
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            lineHeight: "1",
                            fontWeight: "var(--font-weight-medium)" as any,
                            color: "var(--text-subtle)",
                            backgroundColor: "var(--secondary)",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontFamily: "var(--font-family)",
                          }}
                        >
                          Optional
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: "var(--text-label)",
                          lineHeight: "1.6",
                          color: "var(--text-muted)",
                          margin: "0 0 22px",
                          fontFamily: "var(--font-family)",
                          fontWeight: "var(--font-weight-normal)" as any,
                        }}
                      >
                        Define how {symbol || "UOM"} converts to a unit in another category. These conversions apply to all items using this unit.
                      </p>

                      {crossRows.length === 0 ? (
                        <div
                          className="flex flex-col items-center justify-center"
                          style={{
                            border: "2px dashed var(--border)",
                            borderRadius: "var(--radius-lg)",
                            padding: "36px 24px",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-label)",
                              lineHeight: "1",
                              color: "var(--text-subtle)",
                              fontFamily: "var(--font-family)",
                            }}
                          >
                            No cross-category conversions added yet.
                          </span>
                          <button
                            type="button"
                            onClick={addCrossRow}
                            className="bg-transparent border-none cursor-pointer transition-colors hover:opacity-70"
                            style={{
                              padding: 0,
                              fontSize: "var(--text-label)",
                              lineHeight: "1",
                              fontWeight: "var(--font-weight-medium)" as any,
                              color: "var(--primary)",
                              fontFamily: "var(--font-family)",
                            }}
                          >
                            + Add your first conversion
                          </button>
                        </div>
                      ) : (
                        <div>
                          {crossRows.map((row) => (
                            <div
                              key={row.id}
                              className="flex items-center"
                              style={{ gap: 8, marginBottom: 12 }}
                            >
                              <span
                                className="shrink-0"
                                style={{
                                  fontSize: "var(--text-label)",
                                  lineHeight: "1",
                                  color: "var(--text-muted)",
                                  whiteSpace: "nowrap",
                                  fontFamily: "var(--font-family)",
                                  fontWeight: "var(--font-weight-medium)" as any,
                                }}
                              >
                                1 {symbol} =
                              </span>
                              <select
                                value={row.targetUnitId}
                                onChange={(e) =>
                                  updateCrossRow(row.id, { targetUnitId: e.target.value })
                                }
                                className="outline-none cursor-pointer transition-shadow flex-1"
                                style={{
                                  ...INPUT_STYLE,
                                  fontSize: 13,
                                  lineHeight: "1",
                                  minWidth: 0,
                                  color: row.targetUnitId ? "var(--foreground)" : "var(--text-subtle)",
                                  appearance: "none",
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "right 10px center",
                                  paddingRight: 28,
                                }}
                                {...inputFocusHandlers}
                              >
                                <option value="" disabled>Select Unit</option>
                                {crossCatUnits.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.symbol} ({u.name}) — {u.category}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={row.factor}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || Number(val) >= 0) {
                                    updateCrossRow(row.id, { factor: val });
                                  }
                                }}
                                onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
                                min="0"
                                placeholder="0"
                                disabled={!row.targetUnitId}
                                className="outline-none transition-shadow shrink-0"
                                style={{
                                  ...INPUT_STYLE,
                                  fontSize: 13,
                                  lineHeight: "1",
                                  width: 80,
                                  opacity: !row.targetUnitId ? 0.5 : 1,
                                  cursor: !row.targetUnitId ? "not-allowed" : undefined,
                                }}
                                {...inputFocusHandlers}
                              />
                              <button
                                type="button"
                                onClick={() => removeCrossRow(row.id)}
                                className="shrink-0 bg-transparent border-none cursor-pointer transition-colors hover:opacity-70 inline-flex items-center justify-center"
                                style={{
                                  padding: 4,
                                  color: "var(--text-subtle)",
                                }}
                              >
                                <X size={15} strokeWidth={1.8} />
                              </button>
                            </div>
                          ))}

                          {/* Only one cross-category conversion allowed — no add button after first row */}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ═══ FOOTER ═══ */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: "16px 28px",
              borderColor: "var(--border)",
              borderTopWidth: 1,
              borderTopStyle: "solid" as const,
              flexShrink: 0,
            }}
          >
            {/* Left action */}
            {activeStep === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border-none cursor-pointer transition-colors hover:opacity-70"
                style={{
                  padding: 0,
                  fontSize: "var(--text-label)",
                  lineHeight: "1",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--text-default)",
                  fontFamily: "var(--font-family)",
                }}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="bg-transparent border-none cursor-pointer transition-colors hover:opacity-70"
                style={{
                  padding: 0,
                  fontSize: "var(--text-label)",
                  lineHeight: "1",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--text-default)",
                  fontFamily: "var(--font-family)",
                }}
              >
                Back
              </button>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-[14px]">
              {activeStep === 1 && !isEditMode && (
                <button
                  type="button"
                  className="border-none cursor-pointer transition-colors"
                  style={{
                    padding: "9px 22px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-label)",
                    lineHeight: "1",
                    fontWeight: "var(--font-weight-semibold)" as any,
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    opacity: !isStep1Valid ? 0.5 : 1,
                    cursor: !isStep1Valid ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-family)",
                  }}
                  onClick={() => {
                    setSubmitted(true);
                    if (isStep1Valid) setActiveStep(2);
                  }}
                >
                  Next
                </button>
              )}

              {activeStep === 1 && isEditMode && (
                <button
                  type="button"
                  className="border-none cursor-pointer transition-colors hover:opacity-90"
                  style={{
                    padding: "9px 22px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-label)",
                    lineHeight: "1",
                    fontWeight: "var(--font-weight-semibold)" as any,
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    opacity: !isStep1Valid ? 0.5 : 1,
                    cursor: !isStep1Valid ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-family)",
                  }}
                  onClick={() => {
                    setSubmitted(true);
                    if (!isStep1Valid) return;
                    onClose();
                    if (onEdited) {
                      onEdited({ name: unitName, symbol, description, category });
                    }
                  }}
                >
                  Save Changes
                </button>
              )}

              {activeStep === 2 && (
                <button
                  type="button"
                  className="border-none cursor-pointer transition-colors hover:opacity-90"
                  style={{
                    padding: "9px 22px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-label)",
                    lineHeight: "1",
                    fontWeight: "var(--font-weight-semibold)" as any,
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    fontFamily: "var(--font-family)",
                  }}
                  onClick={() => {
                    onClose();
                    if (isEditMode && onEdited) {
                      onEdited({ name: unitName, symbol, description, category });
                    } else if (onCreated) {
                      onCreated(unitName);
                    }
                  }}
                >
                  {isEditMode ? "Save Changes" : "Create Unit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}