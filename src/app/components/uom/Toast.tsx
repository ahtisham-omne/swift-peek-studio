/**
 * UOM Module — Toast Notification System
 *
 * Fixed bottom-right pill toasts with three variants:
 *   success (accent ✓), info (primary ℹ), error (destructive)
 *
 * Usage:
 *   1. Wrap your app with <ToastProvider />
 *   2. const { showToast } = useToast();
 *      showToast("success", "Bundle (Old) created");
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

type ToastVariant = "success" | "info" | "error";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (variant: ToastVariant, message: string) => void;
}

/* ═══════════════════════════════════════════════
   Variant config — uses CSS custom properties
   ═══════════════════════════════════════════════ */

const VARIANT_CONFIG: Record<
  ToastVariant,
  { bg: string; prefix: string }
> = {
  success: { bg: "var(--accent)", prefix: "\u2713" }, // ✓
  info: { bg: "var(--primary)", prefix: "\u2139" }, // ℹ
  error: { bg: "var(--destructive)", prefix: "" },
};

const TOAST_DURATION = 3500;
const EXIT_DURATION = 280;

/* ═══════════════════════════════════════════════
   Context
   ═══════════════════════════════════════════════ */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider />");
  }
  return ctx;
}

/* ═══════════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════════ */

let _toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = `toast_${++_toastId}`;
      setToasts((prev) => [...prev, { id, variant, message, exiting: false }]);
    },
    []
  );

  const startExit = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      {toasts.length > 0 && (
        <div
          className="fixed z-[9999] flex flex-col items-end"
          style={{
            bottom: 24,
            right: 24,
            gap: 8,
            pointerEvents: "none",
          }}
        >
          {toasts.map((toast) => (
            <ToastPill
              key={toast.id}
              toast={toast}
              onStartExit={startExit}
              onRemove={removeToast}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/* ═══════════════════════════════════════════════
   Individual Toast Pill
   ═══════════════════════════════════════════════ */

function ToastPill({
  toast,
  onStartExit,
  onRemove,
}: {
  toast: ToastItem;
  onStartExit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { bg, prefix } = VARIANT_CONFIG[toast.variant];

  /* Auto-dismiss */
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onStartExit(toast.id);
    }, TOAST_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onStartExit]);

  /* Remove after exit animation */
  useEffect(() => {
    if (!toast.exiting) return;
    exitTimerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, EXIT_DURATION);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [toast.exiting, toast.id, onRemove]);

  return (
    <div
      className="flex items-center text-[14px] leading-none"
      style={{
        backgroundColor: bg,
        color: "var(--primary-foreground)",
        borderRadius: "var(--radius)",
        padding: "12px 20px",
        gap: 8,
        fontWeight: "var(--font-weight-medium)" as any,
        boxShadow: "var(--elevation-sm)",
        pointerEvents: "auto",
        opacity: toast.exiting ? 0 : 1,
        transform: toast.exiting
          ? "translateX(24px)"
          : "translateX(0)",
        transition: `opacity ${EXIT_DURATION}ms ease, transform ${EXIT_DURATION}ms ease`,
        animation: toast.exiting
          ? undefined
          : `uomToastSlideIn ${EXIT_DURATION}ms ease`,
      }}
    >
      {prefix && <span>{prefix}</span>}
      <span>{toast.message}</span>
    </div>
  );
}
