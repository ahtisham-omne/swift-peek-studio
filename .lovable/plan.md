

# UOM Listing Table — Match Partner Management Design

## Root Cause Analysis

The UOM table was built with custom inline styles and a raw `<table>` element, while the Partner Management table uses **shadcn/ui `<Table>` components** with Tailwind utility classes for density, hover states, and header backgrounds. Here are the specific mismatches:

### Issues Found

**1. Search Bar** — UOM uses a raw `<input>` with mixed inline/Tailwind styles. Partners uses the shadcn `<Input>` component with class `pl-9 pr-8 h-9 text-sm bg-white border-border/80 shadow-sm placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20`.

**2. Table Header** — UOM uses hardcoded `backgroundColor: "#f8fafc"` via inline styles on each `<th>`. Partners uses `bg-muted/30 hover:bg-muted/30` on the header `<TableRow>`, with density classes `[&>th]:h-8` (condensed) / `[&>th]:h-12` (relaxed).

**3. Filter Pills (grey color)** — UOM's inactive pills use `border-border text-muted-foreground` which is correct, but the active state count badge uses `bg-primary/10` which may render differently. Partners uses `bg-muted` for inactive count badges.

**4. Density / Row Styling** — UOM uses custom inline `DENSITY_PADDING` objects applied via `style={{}}`. Partners uses Tailwind classes:
   - Condensed: `[&>td]:py-1 [&>td]:px-2`
   - Comfort: `[&>td]:py-2 [&>td]:pl-4 [&>td]:pr-2` (or `[&>td]:py-3`)
   - Row hover: `hover:bg-[#F0F7FF]` (not `hover:bg-muted/50`)

**5. Table structure** — UOM uses raw `<table>/<thead>/<tr>/<th>/<td>` elements. Partners uses shadcn `<Table>/<TableHeader>/<TableRow>/<TableHead>/<TableCell>` components which apply consistent base styles.

**6. Typography** — UOM header text is `text-[13px] font-500` which is close. Partners uses shadcn `<TableHead>` defaults (`text-foreground h-10 px-2 text-left font-medium whitespace-nowrap`) then density overrides.

**7. Density dropdown** — UOM has 4 modes (condensed/comfort/relaxed/card). Partners has 3 (condensed/comfort/card). The relaxed mode doesn't exist in Partners.

---

## Plan

### Step 1: Update Search Bar to use shadcn `<Input>`
- Replace the raw `<input>` in `UomListView.tsx` toolbar with the shadcn `<Input>` component
- Apply exact Partner classes: `pl-9 pr-8 h-9 text-sm bg-white border-border/80 shadow-sm placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20`

### Step 2: Refactor Table to use shadcn Table components
- Replace raw `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` in `TableRow.tsx` with shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`
- Apply Partner header row classes: `bg-muted/30 hover:bg-muted/30` with density variants `[&>th]:h-8` (condensed), default h-10, `[&>th]:h-12` (relaxed)
- Apply Partner body row classes: `hover:bg-[#F0F7FF] cursor-pointer` with density: condensed `[&>td]:py-1 [&>td]:px-2`, comfort `[&>td]:py-2 [&>td]:pl-4 [&>td]:pr-2`
- Remove all inline style-based padding/color from header and body cells

### Step 3: Fix Filter Pills inactive background
- Ensure inactive pill count badges use `bg-muted` (not `bg-muted/50` or similar)
- Match exact Partner `FilterPills` styling for active/inactive states

### Step 4: Align Density modes with Partners
- Remove "relaxed" density option from `DensityDropdown.tsx` — Partners only has condensed/comfort/card
- Update density Tailwind classes to match Partners exactly
- Remove the `DENSITY_PADDING` inline style system and use Tailwind class approach

### Step 5: Typography alignment
- Table header: use shadcn `<TableHead>` defaults (font-medium, text-foreground)
- Table body cells: `text-sm` (13px), `text-foreground` for primary content, `text-muted-foreground` for secondary
- Filters button: `text-sm font-500`
- Count display: `text-sm tabular-nums font-500`

### Files to modify
- `src/app/components/uom/UomListView.tsx` — search bar, toolbar, table wrapper, pagination
- `src/app/components/uom/TableRow.tsx` — header and body row components (use shadcn Table primitives, Tailwind density classes)
- `src/app/components/uom/DensityDropdown.tsx` — remove "relaxed" mode, simplify to 3 options
- `src/app/components/uom/FilterPill.tsx` — minor tweaks to inactive state background

