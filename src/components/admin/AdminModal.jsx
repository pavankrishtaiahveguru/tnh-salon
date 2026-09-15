"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Reusable admin modal shell with backdrop, Escape-to-close and scroll lock.
export default function AdminModal({ open, onClose, title, subtitle, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-[#09221F]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[20px] border border-[#D7EAE7] bg-[#FFFDF9] shadow-[0_25px_80px_rgba(9,34,31,0.2)] sm:rounded-[20px] ${maxWidth}`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E3EFED] bg-[#FFFDF9] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[#09221F]">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-[#5F7774]">{subtitle}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF6F4] text-[#285F5A] transition-colors hover:bg-[#DCEEEB]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
