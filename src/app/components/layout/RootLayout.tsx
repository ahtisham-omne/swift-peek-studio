/**
 * Omne ERP — Root Layout Shell
 *
 * Wraps all pages with sidebar + top header.
 * Sidebar collapse/expand is responsive — content adjusts automatically.
 * All colors use CSS custom properties from theme.css.
 */

import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function RootLayout() {
  const location = useLocation();
  const hideTopHeader =
    location.pathname === "/" ||
    location.pathname === "/uom" ||
    location.pathname.startsWith("/uom/") ||
    location.pathname.startsWith("/unit/");

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main content area ── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* ── Top header ── */}
        {!hideTopHeader && <TopHeader />}

        {/* ── Page content ── */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-gutter-stable"
          style={{
            backgroundColor: "var(--background)",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}