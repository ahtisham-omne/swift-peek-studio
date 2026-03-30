/**
 * UOM Module — Filtered List View
 *
 * Pre-configured variant of UomListView demonstrating a fully-filtered state:
 *   - 3 Categories: Length, Mass, Electrical
 *   - Standard type filter active
 *   - In Use status filter active
 *   - Dropdowns start closed (clean filtered UI)
 *
 * Navigable at `/filtered`.
 */

import { UomListView, type Filters } from "./UomListView";
import type { UomCategory } from "./CategoryBadge";

const FILTERED_INITIAL: Filters = {
  search: "",
  type: "Standard",
  inUse: true,
  categories: new Set<UomCategory>(["Length", "Mass", "Electrical"]),
};

export function UomFilteredListView() {
  return (
    <UomListView
      initialFilters={FILTERED_INITIAL}
      dropdownsClosed
    />
  );
}
