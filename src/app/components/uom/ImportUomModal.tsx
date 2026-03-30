/**
 * UOM Module — Import Units Modal
 *
 * Two-state modal: upload (drag & drop / browse) → preview (parsed table).
 * All colors use CSS custom properties from theme.css.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { UOM_ICONS } from "./design-tokens";
import { CategoryBadge, type UomCategory } from "./CategoryBadge";

/* ═══════════════════════════════════════════════
   Mock imported data
   ═══════════════════════════════════════════════ */

interface ImportedUnit {
  symbol: string;
  name: string;
  category: UomCategory;
}

const MOCK_IMPORTED: ImportedUnit[] = [
  { symbol: "m", name: "Meter", category: "Length" },
  { symbol: "cm", name: "Centimeter", category: "Length" },
  { symbol: "kg", name: "Kilogram", category: "Mass" },
  { symbol: "g", name: "Gram", category: "Mass" },
  { symbol: "L", name: "Liter", category: "Volume" },
  { symbol: "mL", name: "Milliliter", category: "Volume" },
  { symbol: "m²", name: "Square Meter", category: "Area" },
  { symbol: "s", name: "Second", category: "Time" },
  { symbol: "min", name: "Minute", category: "Time" },
  { symbol: "°C", name: "Celsius", category: "Temperature" },
  { symbol: "N", name: "Newton", category: "Force" },
  { symbol: "Pa", name: "Pascal", category: "Pressure" },
];

const PREVIEW_ROWS = 6;

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

interface ImportUomModalProps {
  open: boolean;
  onClose: () => void;
  onImported?: (count: number) => void;
}

export function ImportUomModal({ open, onClose, onImported }: ImportUomModalProps) {
  const [state, setState] = useState<"upload" | "preview">("upload");
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setState("upload");
      setFileName("");
      setIsDragOver(false);
      setIsHover(false);
    }
  }, [open]);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setState("preview");
    setIsDragOver(false);
  }, []);

  const handleChangeFile = useCallback(() => {
    setState("upload");
    setFileName("");
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragOver) setIsDragOver(true);
    },
    [isDragOver]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (!open) return null;

  let dropBorder = "2px dashed var(--border-strong)";
  let dropBg = "transparent";
  if (isDragOver) {
    dropBorder = "2px dashed var(--primary)";
    dropBg = "var(--primary-surface-strong)";
  } else if (isHover) {
    dropBorder = "2px dashed var(--primary-border-hover)";
    dropBg = "var(--primary-surface)";
  }

  const importCount = MOCK_IMPORTED.length;
  const remaining = importCount - PREVIEW_ROWS;

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
          className="pointer-events-auto relative flex flex-col w-full sm:max-w-[540px]"
          style={{
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
            boxShadow:
              "var(--elevation-xl)",
            maxHeight: "90vh",
          }}
        >
          {/* HEADER */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <h2
              className="text-[18px] leading-[1.4]"
              style={{
                fontWeight: "var(--font-weight-semibold)" as any,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              Import Units
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="cursor-pointer bg-transparent border-none transition-colors hover:opacity-70"
              style={{
                padding: 0,
                fontSize: "var(--text-h4)",
                lineHeight: 1,
                color: "var(--text-subtle)",
              }}
            >
              {UOM_ICONS.close}
            </button>
          </div>

          {/* BODY */}
          <div
            className="scrollbar-overlay"
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            {state === "upload" && (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onMouseEnter={() => setIsHover(true)}
                  onMouseLeave={() => setIsHover(false)}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  className="flex flex-col items-center justify-center cursor-pointer outline-none transition-colors"
                  style={{
                    border: dropBorder,
                    borderRadius: "var(--radius)",
                    padding: 32,
                    backgroundColor: dropBg,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-h3)",
                      color: "var(--text-subtle)",
                      marginBottom: 12,
                      lineHeight: 1,
                    }}
                  >
                    {UOM_ICONS.grid}
                  </span>

                  <span
                    className="text-[14px] leading-[1.5]"
                    style={{
                      fontWeight: "var(--font-weight-medium)" as any,
                      color: "var(--text-strong)",
                      marginBottom: 4,
                    }}
                  >
                    Drop a CSV file here or click to browse
                  </span>
                  <span
                    className="text-[12px] leading-[1.5]"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    Required columns: name, symbol, category
                  </span>
                  <span
                    className="text-[12px] leading-[1.5]"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    Optional: description, type
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </>
            )}

            {state === "preview" && (
              <>
                {/* Success banner */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--accent-surface)",
                    border: "1px solid var(--accent-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 16px",
                    marginBottom: 16,
                  }}
                >
                  <span
                    className="text-[14px] leading-none"
                    style={{
                      fontWeight: "var(--font-weight-medium)" as any,
                      color: "var(--accent)",
                    }}
                  >
                    {UOM_ICONS.check} {importCount} units ready to import
                  </span>
                  <button
                    type="button"
                    onClick={handleChangeFile}
                    className="bg-transparent border-none cursor-pointer text-[12px] leading-none transition-colors hover:opacity-70"
                    style={{
                      padding: 0,
                      color: "var(--text-muted)",
                      fontWeight: "var(--font-weight-normal)" as any,
                    }}
                  >
                    Change file
                  </button>
                </div>

                {/* Preview table */}
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: "80px 1fr 120px",
                      backgroundColor: "var(--secondary)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {["Symbol", "Name", "Category"].map((col) => (
                      <div
                        key={col}
                        className="text-[11px] uppercase leading-none"
                        style={{
                          padding: "8px 16px",
                          fontWeight: "var(--font-weight-medium)" as any,
                          color: "var(--text-muted)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {col}
                      </div>
                    ))}
                  </div>

                  <div className="scrollbar-overlay">
                    {MOCK_IMPORTED.slice(0, PREVIEW_ROWS).map((unit, idx) => (
                      <div
                        key={`${unit.symbol}-${idx}`}
                        className="grid items-center"
                        style={{
                          gridTemplateColumns: "80px 1fr 120px",
                          borderColor: "var(--border-subtle)",
                          borderBottomWidth:
                            idx < PREVIEW_ROWS - 1 || remaining > 0
                              ? 1
                              : 0,
                          borderBottomStyle: "solid" as const,
                        }}
                      >
                        <div
                          className="text-[13px] leading-none"
                          style={{
                            padding: "8px 16px",
                            color: "var(--text-strong)",
                            fontWeight: "var(--font-weight-medium)" as any,
                          }}
                        >
                          {unit.symbol}
                        </div>
                        <div
                          className="text-[13px] leading-none"
                          style={{
                            padding: "8px 16px",
                            color: "var(--text-strong)",
                          }}
                        >
                          {unit.name}
                        </div>
                        <div style={{ padding: "8px 16px" }}>
                          <CategoryBadge category={unit.category} />
                        </div>
                      </div>
                    ))}

                    {remaining > 0 && (
                      <div
                        className="flex items-center justify-center text-[12px] leading-none"
                        style={{
                          color: "var(--text-subtle)",
                          padding: "10px 16px",
                        }}
                      >
                        …and {remaining} more
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <div
            className="flex items-center justify-end gap-[8px]"
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer transition-colors hover:bg-secondary"
              style={{
                padding: "8px 16px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--text-strong)",
                lineHeight: 1,
                backgroundColor: "var(--card)",
              }}
            >
              Cancel
            </button>

            {state === "preview" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onImported) onImported(importCount);
                }}
                className="text-[13px] leading-none border-none cursor-pointer transition-colors hover:opacity-90"
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "var(--font-weight-semibold)" as any,
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Import {importCount} Units
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}