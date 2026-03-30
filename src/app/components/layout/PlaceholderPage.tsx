/**
 * Placeholder page for modules not yet built.
 * Uses design-system CSS variables for all styling.
 */

import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/partners": "Partners Management",
  "/partners/list": "Partners",
  "/partners/groups": "Partner Groups",
  "/partners/contacts": "Contacts Directory",
  "/partners/credit": "Credit Management",
  "/partners/carrier": "Carrier Management",
  "/partners/locations": "Partner Locations",
  "/partners/reports": "Reports & Analytics",
  "/partners/vendors": "Qualified Vendors",
  "/supply-chain": "Supply Chain Management",
  "/production": "Production & Planning",
  "/sales": "Sales",
  "/accounting": "Accounting & Finance",
  "/people": "People Management",
  "/company": "Company Setup",
};

export function PlaceholderPage() {
  const location = useLocation();
  const title = ROUTE_LABELS[location.pathname] || "Page";

  return (
    <div
      className="flex flex-col items-center justify-center flex-1"
      style={{
        padding: "64px 24px",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--primary-surface)",
          color: "var(--primary)",
          marginBottom: 20,
        }}
      >
        <Construction size={28} strokeWidth={1.6} />
      </div>
      <div
        className="text-[18px]"
        style={{
          fontWeight: "var(--font-weight-semibold)" as any,
          color: "var(--text-strong)",
          marginBottom: 8,
          lineHeight: "1.3",
        }}
      >
        {title}
      </div>
      <div
        className="text-[14px]"
        style={{
          color: "var(--text-muted)",
          fontWeight: "var(--font-weight-normal)" as any,
          lineHeight: "1.5",
          textAlign: "center",
          maxWidth: 360,
        }}
      >
        This module is under development and will be available soon.
      </div>
    </div>
  );
}