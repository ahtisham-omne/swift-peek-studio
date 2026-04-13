

# UOM Page — Side-by-Side Comparison & Fix Plan

## Detailed Differences Found

After comparing both pages line-by-line, here are ALL remaining mismatches:

### 1. Table Body Rows — Wrong hover, missing density classes
- **Partners**: `hover:bg-[#F0F7FF]` on `<TableRow>`, density via `[&>td]:py-1 [&>td]:pl-4 [&>td]:pr-2` (condensed) / `[&>td]:py-2 [&>td]:pl-4 [&>td]:pr-2` (comfort)
- **UOM**: Uses `hover:bg-muted/20` on raw `<tr>`, inline `style={{ backgroundColor: ROW_BG }}` with `#F0F7FF` on hover via state, density class `[&>td]:py-1 [&>td]:px-2` (missing `pl-4 pr-2` pattern)
- **Fix**: Change hover to `hover:bg-[#F0F7FF]`, update density classes to `[&>td]:py-1 [&>td]:pl-4 [&>td]:pr-2` / `[&>td]:py-2 [&>td]:pl-4 [&>td]:pr-2`, remove inline ROW_BG hover state management

### 2. Table Uses Raw HTML Instead of shadcn Components
- **Partners**: Uses `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>` from shadcn
- **UOM**: Uses raw `<table>`, `<thead>`, `<tr>`, `<th>`, `<td>`
- **Fix**: Replace raw HTML elements with shadcn Table components in `TableRow.tsx`. This ensures consistent base styles (border-b, padding, etc.)

### 3. Selected Row Background
- **Partners**: Selected = `!bg-[#EDF4FF]/60`, hover on selected row still `group-hover:bg-[#F0F7FF]`
- **UOM**: Selected = `#EDF4FF` via inline style
- **Fix**: Use Tailwind classes instead of inline styles

### 4. Checkbox — Custom vs shadcn Checkbox
- **Partners**: Uses shadcn `<Checkbox>` component
- **UOM**: Custom checkbox with inline styles and manual SVG rendering
- **Fix**: Replace custom checkbox with shadcn `<Checkbox>` component in both header and body rows

### 5. Cell Padding — Inline Styles vs Tailwind
- **Partners**: No inline padding on cells — density is controlled entirely by `[&>td]` classes on the `<TableRow>`
- **UOM**: Every cell renders its own `cellPad` inline style (`paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16`)
- **Fix**: Remove all `cellPad` / `CELL_PADDING` inline styles from cells. Let the density classes on `<TableRow>` handle padding.

### 6. Search Bar — Raw Input vs shadcn Input
- **Partners**: Uses shadcn `<Input>` component with class `pl-9 pr-8 h-9 text-sm bg-white border-border/80 shadow-sm placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20`
- **UOM**: Uses raw `<input>` with similar classes but missing the shadcn focus-visible ring behavior
- **Fix**: Use the shadcn `<Input>` component from `../ui/input`

### 7. Count Display — Different Typography
- **Partners**: Uses colored spans: `<span className="text-foreground">{filtered}</span><span className="text-muted-foreground/60"> of </span><span className="text-muted-foreground">{total}</span><span className="text-muted-foreground/70"> partners</span>`
- **UOM**: Uses a plain string `${filteredUnits.length} of ${allUnits.length} units` with `text-muted-foreground`
- **Fix**: Match Partners' colored span pattern with separate styling for count vs label

### 8. Pagination — Raw Buttons vs shadcn Button
- **Partners**: Uses shadcn `<Button variant="ghost" size="sm">` and shadcn `<Select>` for records-per-page
- **UOM**: Uses raw `<button>` elements and raw `<select>` for records-per-page
- **Fix**: Replace with shadcn `<Button>` and `<Select>` components

### 9. Header Row — Missing `TableHeader` sticky wrapper
- **Partners**: `<TableHeader className="sticky top-0 z-20 bg-card">`
- **UOM**: Raw `<thead>` without sticky class
- **Fix**: Add sticky positioning to header

### 10. Module Header — Button Style
- **Partners**: Uses shadcn `<Button>` component: `<Button className="bg-primary text-primary-foreground shrink-0">`
- **UOM**: Raw `<button>` with inline classes
- **Fix**: Use shadcn `<Button>` component

---

## Implementation Plan

### Step 1: Refactor TableRow.tsx — Use shadcn Table Components
- Replace `<thead>`, `<tr>`, `<th>` with `<TableHeader>`, `<TableRow>`, `<TableHead>` from `../ui/table`
- Replace body `<tr>`, `<td>` with `<TableRow>`, `<TableCell>`
- Replace custom checkbox with shadcn `<Checkbox>` from `../ui/checkbox`
- Remove all `cellPad` / `CELL_PADDING` inline styles — let density classes control padding
- Change header row class to `bg-muted/30 hover:bg-muted/30`
- Change body row hover to `hover:bg-[#F0F7FF]`
- Use density classes: condensed `[&>td]:py-1 [&>td]:pl-4 [&>td]:pr-2`, comfort `[&>td]:py-2 [&>td]:pl-4 [&>td]:pr-2`
- Remove the inline `backgroundColor: ROW_BG` hover state management (the `hovered` state + inline style)
- Selected row: use class-based `bg-[#EDF4FF]/60` instead of inline style

### Step 2: Refactor UomListView.tsx — Search, Count, Pagination, Module Header
- **Search**: Replace raw `<input>` with shadcn `<Input>` component
- **Count display**: Use colored spans matching Partners pattern
- **Pagination**: Replace raw `<button>` with shadcn `<Button variant="ghost" size="sm">`, replace raw `<select>` with shadcn `<Select>`
- **Table wrapper**: Replace raw `<table>` with shadcn `<Table>`, add `<TableHeader className="sticky top-0 z-20 bg-card">` around header, use `<TableBody>`
- **Module header**: Use shadcn `<Button>` for "Create New Unit"

### Step 3: DensityDropdown.tsx — Already aligned (3 modes)
- No changes needed — already has condensed/comfort/card

### Step 4: FilterPill.tsx — Already aligned
- Already matches Partners' FilterPills exactly

### Files to modify
- `src/app/components/uom/TableRow.tsx` — major refactor: shadcn components, remove inline styles, density classes
- `src/app/components/uom/UomListView.tsx` — search bar, count display, pagination, table wrapper, module header

