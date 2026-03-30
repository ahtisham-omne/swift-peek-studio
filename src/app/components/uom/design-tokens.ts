/**
 * UOM Module — Design Tokens & Constants
 *
 * Lightweight reference for unicode icons used across the
 * Unit of Measure module.
 *
 * Color / radius / shadow tokens live in /src/styles/theme.css as
 * CSS custom properties and are exposed to Tailwind via the
 * `@theme inline` block (e.g. `bg-primary`, `text-foreground`,
 * `border-border`, `rounded-md`, `shadow-elevation-sm`, etc.).
 *
 * Typography inherits from the `@layer base` Figma Styles in theme.css —
 * use semantic HTML elements (h1-h4, p, label, button, input) to pick up
 * the correct size / weight / line-height. All text uses Inter.
 */

/* --- Unicode Icon Map --- */
export const UOM_ICONS = {
  search: "\u2315", // ⌕
  copy: "\u29C9", // ⧉
  edit: "\u270E", // ✎
  delete: "\u00D7", // ×
  sortNeutral: "\u2195", // ↕
  sortAsc: "\u25B2", // ▲
  sortDesc: "\u25BC", // ▼
  chevronDown: "\u25BE", // ▾
  back: "\u2190", // ←
  grid: "\u229E", // ⊞
  check: "\u2713", // ✓
  close: "\u2715", // ✕
} as const;
