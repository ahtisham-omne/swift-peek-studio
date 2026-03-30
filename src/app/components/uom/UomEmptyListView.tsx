/**
 * UOM Module — Empty / No-Results List View
 *
 * Pre-configured variant of UomListView demonstrating the zero-match state:
 *   - 2 Categories: Frequency, Pressure (all Standard in the dataset)
 *   - Custom type filter active (no Custom units exist in those categories)
 *   - In Use status filter active
 *   - Result: 0 matching units → empty table with message
 *
 * Navigable at `/empty`.
 */

import { UomListView, type Filters } from "./UomListView";
import type { UomCategory } from "./CategoryBadge";

const EMPTY_STATE_FILTERS: Filters = {
  search: "",
  type: "Custom",
  inUse: true,
  categories: new Set<UomCategory>(["Frequency", "Pressure"]),
};

export function UomEmptyListView() {
  return (
    <UomListView
      initialFilters={EMPTY_STATE_FILTERS}
      dropdownsClosed
    />
  );
}
