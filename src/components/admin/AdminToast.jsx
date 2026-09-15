"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: "border-[#BFE3DF] bg-[#EFF9F7] text-[#09221F]",
  error: "border-red-200 bg-red-50 text-[#7A1D1D]",
  info: "border-[#D7EAE7] bg-white text-[#09221F]",
};

const ICON_COLORS = {
  success: "text-[#218F87]",
  error: "text-red-500",
  info: "text-[#218F87]",
};

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
      info: (message) => push(message, "info"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] ?? Info;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_10px_30px_rgba(9,34,31,0.12)] ${STYLES[toast.type] ?? STYLES.info}`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${ICON_COLORS[toast.type] ?? ""}`} />
              <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-[#5F7774] transition-colors hover:text-[#09221F]"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return context;
}
