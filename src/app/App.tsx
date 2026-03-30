import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastProvider } from "./components/uom/Toast";

/**
 * Omne ERP — Main Entry Point
 *
 * Uses React Router v7 for all views.
 * All styling flows from CSS custom properties in /src/styles/theme.css
 * through the @theme inline bridge into Tailwind utilities.
 * Typography uses Inter font face from /src/styles/fonts.css.
 */
export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}