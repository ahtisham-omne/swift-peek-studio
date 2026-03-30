/**
 * Items Library — Sample Dataset & Types
 */

export type ItemStatus = "Active" | "Draft" | "Inactive" | "Archived";
export type ItemCategory = "Raw Materials" | "Components" | "Finished Goods" | "Consumables" | "Tools & Equipment" | "Packaging";
export type ItemUOM = "Each" | "Kg" | "Liter" | "Meter" | "Box" | "Pallet" | "Pair" | "Set";

export interface Item {
  id: string;
  name: string;
  sku: string;
  category: ItemCategory;
  status: ItemStatus;
  uom: ItemUOM;
  description: string;
  unitPrice: number;
  stockQty: number;
  reorderLevel: number;
  supplier: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  owner: "My Items" | "All Items";
}

export const ITEM_CATEGORIES: ItemCategory[] = [
  "Raw Materials",
  "Components",
  "Finished Goods",
  "Consumables",
  "Tools & Equipment",
  "Packaging",
];

export const ITEM_STATUSES: ItemStatus[] = ["Active", "Draft", "Inactive", "Archived"];

export const STATUS_COLORS: Record<ItemStatus, { bg: string; text: string; dot: string }> = {
  Active: { bg: "var(--accent-surface)", text: "var(--accent-text-strong)", dot: "var(--accent)" },
  Draft: { bg: "var(--primary-surface)", text: "var(--primary-text-strong)", dot: "var(--primary)" },
  Inactive: { bg: "var(--surface-raised)", text: "var(--text-muted)", dot: "var(--text-subtle)" },
  Archived: { bg: "var(--destructive-surface)", text: "var(--destructive)", dot: "var(--destructive)" },
};

const IMG = {
  pipe: "https://images.unsplash.com/photo-1745449562896-71ba57d1e2b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwc3RlZWwlMjBwaXBlJTIwZml0dGluZ3xlbnwxfHx8fDE3NzE4ODAyNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  wire: "https://images.unsplash.com/photo-1635179885954-c778885a1197?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3BwZXIlMjB3aXJlJTIwc3Bvb2wlMjBlbGVjdHJpY2FsfGVufDF8fHx8MTc3MTg3OTcxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  lumber: "https://images.unsplash.com/photo-1564691848938-d0fc26235733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBsdW1iZXIlMjBwbHl3b29kfGVufDF8fHx8MTc3MTg4MDI3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  valve: "https://images.unsplash.com/photo-1598023707207-276835c2b5fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwdmFsdmUlMjBzdGFpbmxlc3N8ZW58MXx8fHwxNzcxODgwMjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  cement: "https://images.unsplash.com/photo-1593812742588-92d10d2f2e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jcmV0ZSUyMGNlbWVudCUyMGJhZ3MlMjB3YXJlaG91c2V8ZW58MXx8fHwxNzcxODgwMjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  bolts: "https://images.unsplash.com/photo-1769971361807-1e3d025c2abb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYm9sdHMlMjBudXRzJTIwaGFyZHdhcmV8ZW58MXx8fHwxNzcxODgwMjc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

export const SAMPLE_ITEMS: Item[] = [
  { id: "ITM-001", name: "Steel Pipe 2\"", sku: "RM-STL-001", category: "Raw Materials", status: "Active", uom: "Meter", description: "2-inch galvanized steel pipe for industrial plumbing", unitPrice: 24.50, stockQty: 1250, reorderLevel: 200, supplier: "MetalCorp Inc.", imageUrl: IMG.pipe, createdAt: "2025-08-15", updatedAt: "2026-01-10", owner: "My Items" },
  { id: "ITM-002", name: "Copper Wire 14 AWG", sku: "RM-COP-002", category: "Raw Materials", status: "Active", uom: "Meter", description: "14 AWG insulated copper wire for electrical wiring", unitPrice: 3.75, stockQty: 8500, reorderLevel: 1000, supplier: "WireTech Solutions", imageUrl: IMG.wire, createdAt: "2025-07-20", updatedAt: "2026-02-05", owner: "All Items" },
  { id: "ITM-003", name: "Plywood Sheet 4x8", sku: "RM-PLY-003", category: "Raw Materials", status: "Active", uom: "Each", description: "3/4\" structural plywood for construction framing", unitPrice: 42.00, stockQty: 380, reorderLevel: 50, supplier: "TimberLand Supply", imageUrl: IMG.lumber, createdAt: "2025-09-01", updatedAt: "2026-01-28", owner: "My Items" },
  { id: "ITM-004", name: "Ball Valve DN50", sku: "CP-VLV-004", category: "Components", status: "Active", uom: "Each", description: "Stainless steel ball valve 2\" DN50 for process control", unitPrice: 89.00, stockQty: 145, reorderLevel: 20, supplier: "FlowControl Ltd.", imageUrl: IMG.valve, createdAt: "2025-06-10", updatedAt: "2026-02-12", owner: "All Items" },
  { id: "ITM-005", name: "Portland Cement 50kg", sku: "RM-CEM-005", category: "Raw Materials", status: "Active", uom: "Each", description: "Type I/II Portland cement for general construction", unitPrice: 12.50, stockQty: 2400, reorderLevel: 500, supplier: "BuildMat Corp.", imageUrl: IMG.cement, createdAt: "2025-05-25", updatedAt: "2026-01-15", owner: "My Items" },
  { id: "ITM-006", name: "Hex Bolt M12x50", sku: "CP-BLT-006", category: "Components", status: "Active", uom: "Box", description: "Grade 8.8 hex bolt M12x50mm, zinc plated, 100/box", unitPrice: 18.75, stockQty: 520, reorderLevel: 100, supplier: "FastenAll Dist.", imageUrl: IMG.bolts, createdAt: "2025-10-05", updatedAt: "2026-02-01", owner: "All Items" },
  { id: "ITM-007", name: "Safety Goggles Pro", sku: "TE-SAF-007", category: "Tools & Equipment", status: "Active", uom: "Each", description: "Anti-fog impact-resistant safety goggles, ANSI Z87.1", unitPrice: 15.99, stockQty: 200, reorderLevel: 50, supplier: "SafetyFirst Inc.", createdAt: "2025-11-01", updatedAt: "2026-01-20", owner: "My Items" },
  { id: "ITM-008", name: "Welding Rod E7018", sku: "CN-WLD-008", category: "Consumables", status: "Active", uom: "Kg", description: "Low hydrogen welding electrode 3.2mm", unitPrice: 8.50, stockQty: 340, reorderLevel: 80, supplier: "WeldSupply Co.", createdAt: "2025-08-22", updatedAt: "2026-02-08", owner: "All Items" },
  { id: "ITM-009", name: "Cardboard Box 24x18", sku: "PK-BOX-009", category: "Packaging", status: "Active", uom: "Each", description: "Double-wall corrugated shipping box 24x18x12\"", unitPrice: 2.25, stockQty: 3200, reorderLevel: 500, supplier: "PackRight LLC", createdAt: "2025-07-14", updatedAt: "2026-01-30", owner: "My Items" },
  { id: "ITM-010", name: "Hydraulic Hose 1/2\"", sku: "CP-HOS-010", category: "Components", status: "Draft", uom: "Meter", description: "SAE 100R2AT hydraulic hose, 3000 PSI rated", unitPrice: 14.80, stockQty: 0, reorderLevel: 100, supplier: "HydraFlex Inc.", createdAt: "2026-01-15", updatedAt: "2026-02-10", owner: "My Items" },
  { id: "ITM-011", name: "Aluminum Sheet 3mm", sku: "RM-ALU-011", category: "Raw Materials", status: "Draft", uom: "Each", description: "6061-T6 aluminum sheet 4x8' for fabrication", unitPrice: 85.00, stockQty: 0, reorderLevel: 25, supplier: "AlumniTech Corp.", createdAt: "2026-02-01", updatedAt: "2026-02-15", owner: "All Items" },
  { id: "ITM-012", name: "Pipe Wrench 18\"", sku: "TE-WRN-012", category: "Tools & Equipment", status: "Active", uom: "Each", description: "Heavy-duty cast iron pipe wrench 18-inch", unitPrice: 34.50, stockQty: 45, reorderLevel: 10, supplier: "ToolMax Ltd.", createdAt: "2025-09-18", updatedAt: "2026-01-25", owner: "My Items" },
  { id: "ITM-013", name: "Lubricant WD-40 400ml", sku: "CN-LUB-013", category: "Consumables", status: "Active", uom: "Each", description: "Multi-purpose lubricant and corrosion inhibitor", unitPrice: 7.99, stockQty: 150, reorderLevel: 30, supplier: "ChemSupply Inc.", createdAt: "2025-10-22", updatedAt: "2026-02-03", owner: "All Items" },
  { id: "ITM-014", name: "Control Panel Assembly", sku: "FG-CTL-014", category: "Finished Goods", status: "Active", uom: "Each", description: "Pre-wired PLC control panel for automation systems", unitPrice: 2450.00, stockQty: 12, reorderLevel: 5, supplier: "AutomaTech Co.", createdAt: "2025-06-30", updatedAt: "2026-02-14", owner: "My Items" },
  { id: "ITM-015", name: "Stretch Wrap 500mm", sku: "PK-WRP-015", category: "Packaging", status: "Active", uom: "Each", description: "Machine-grade stretch wrap film 500mm x 1500m", unitPrice: 45.00, stockQty: 85, reorderLevel: 20, supplier: "PackRight LLC", createdAt: "2025-08-10", updatedAt: "2026-01-18", owner: "All Items" },
  { id: "ITM-016", name: "O-Ring Kit NBR", sku: "CP-ORI-016", category: "Components", status: "Inactive", uom: "Set", description: "NBR O-ring assortment kit, 382 pieces, metric", unitPrice: 22.00, stockQty: 18, reorderLevel: 10, supplier: "SealTech Corp.", createdAt: "2025-04-12", updatedAt: "2025-11-30", owner: "My Items" },
  { id: "ITM-017", name: "Epoxy Resin 2-Part", sku: "CN-EPX-017", category: "Consumables", status: "Active", uom: "Kg", description: "Industrial-grade 2-part epoxy adhesive system", unitPrice: 32.00, stockQty: 75, reorderLevel: 15, supplier: "AdhesivePro Inc.", createdAt: "2025-09-28", updatedAt: "2026-02-06", owner: "All Items" },
  { id: "ITM-018", name: "Motor Assembly 5HP", sku: "FG-MOT-018", category: "Finished Goods", status: "Active", uom: "Each", description: "3-phase AC motor 5HP with mounting bracket", unitPrice: 875.00, stockQty: 8, reorderLevel: 3, supplier: "PowerDrive Ltd.", createdAt: "2025-07-05", updatedAt: "2026-01-22", owner: "My Items" },
  { id: "ITM-019", name: "Sandpaper 120 Grit", sku: "CN-SND-019", category: "Consumables", status: "Archived", uom: "Box", description: "Premium aluminum oxide sandpaper sheets, 100/box — discontinued SKU", unitPrice: 15.00, stockQty: 5, reorderLevel: 0, supplier: "AbrasiveCo.", createdAt: "2024-11-15", updatedAt: "2025-08-20", owner: "All Items" },
  { id: "ITM-020", name: "Bubble Wrap Roll", sku: "PK-BWR-020", category: "Packaging", status: "Active", uom: "Each", description: "Air bubble wrap roll 12\" x 175', perforated every 12\"", unitPrice: 18.50, stockQty: 120, reorderLevel: 25, supplier: "PackRight LLC", createdAt: "2025-10-10", updatedAt: "2026-02-11", owner: "My Items" },
  { id: "ITM-021", name: "Stainless Rod 316L", sku: "RM-SSR-021", category: "Raw Materials", status: "Active", uom: "Meter", description: "316L stainless steel round bar, 25mm diameter", unitPrice: 38.00, stockQty: 600, reorderLevel: 100, supplier: "MetalCorp Inc.", imageUrl: IMG.valve, createdAt: "2025-08-28", updatedAt: "2026-02-09", owner: "All Items" },
  { id: "ITM-022", name: "Pressure Gauge 0-100", sku: "CP-GAU-022", category: "Components", status: "Draft", uom: "Each", description: "Bourdon tube pressure gauge 0-100 PSI, 4\" dial", unitPrice: 45.00, stockQty: 0, reorderLevel: 15, supplier: "InstruTech Corp.", createdAt: "2026-02-10", updatedAt: "2026-02-18", owner: "My Items" },
  { id: "ITM-023", name: "Cable Ties 300mm", sku: "CN-CTY-023", category: "Consumables", status: "Active", uom: "Box", description: "Nylon cable ties 300mm x 4.8mm, UV resistant, 1000/box", unitPrice: 12.00, stockQty: 280, reorderLevel: 50, supplier: "FastenAll Dist.", createdAt: "2025-11-15", updatedAt: "2026-01-28", owner: "All Items" },
  { id: "ITM-024", name: "Torque Wrench 1/2\"", sku: "TE-TRQ-024", category: "Tools & Equipment", status: "Inactive", uom: "Each", description: "Click-type torque wrench 1/2\" drive, 20-150 ft-lb", unitPrice: 89.00, stockQty: 3, reorderLevel: 2, supplier: "ToolMax Ltd.", createdAt: "2025-03-20", updatedAt: "2025-10-15", owner: "My Items" },
];
