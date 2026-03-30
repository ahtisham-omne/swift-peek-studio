import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";

import { PlaceholderPage } from "./components/layout/PlaceholderPage";

import { CompanySetupPage } from "./components/company/CompanySetupPage";
import { UomListView } from "./components/uom/UomListView";
import { UomFilteredListView } from "./components/uom/UomFilteredListView";
import { UomEmptyListView } from "./components/uom/UomEmptyListView";
import { UomDetailView } from "./components/uom/UomDetailView";
import { ItemsListView } from "./components/items/ItemsListView";
import { QuoteViewPage } from "./components/quotes/QuoteViewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: CompanySetupPage,
      },
      {
        path: "uom",
        Component: UomListView,
      },
      {
        path: "uom/filtered",
        Component: UomFilteredListView,
      },
      {
        path: "uom/empty",
        Component: UomEmptyListView,
      },
      {
        path: "unit/:id",
        Component: UomDetailView,
      },
      {
        path: "items",
        Component: ItemsListView,
      },
      {
        path: "quotes/view",
        Component: QuoteViewPage,
      },
      // Partners Management — nested catch-all
      {
        path: "partners",
        Component: PlaceholderPage,
        children: [
          {
            path: "*",
            Component: PlaceholderPage,
          },
        ],
      },
      // Other placeholder modules
      {
        path: "supply-chain",
        Component: PlaceholderPage,
      },
      {
        path: "production",
        Component: PlaceholderPage,
      },
      {
        path: "sales",
        Component: PlaceholderPage,
      },
      {
        path: "accounting",
        Component: PlaceholderPage,
      },
      {
        path: "people",
        Component: PlaceholderPage,
      },
      {
        path: "company",
        Component: PlaceholderPage,
        children: [
          {
            path: "*",
            Component: PlaceholderPage,
          },
        ],
      },
      // Catch-all for any other unmatched routes
      {
        path: "*",
        Component: PlaceholderPage,
      },
    ],
  },
]);
