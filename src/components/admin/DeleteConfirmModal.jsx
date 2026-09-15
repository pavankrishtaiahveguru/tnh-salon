"use client";

import { AlertTriangle } from "lucide-react";
import AdminModal from "./AdminModal";

// Reusable confirmation modal for destructive actions.
export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Delete this item?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  deleting = false,
}) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={18} />
        </div>
        <p className="text-sm leading-6 text-[#3E5450]">{message}</p>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#D7EAE7] bg-white px-4 py-2 text-sm font-semibold text-[#173B38] transition-colors hover:bg-[#F3F8F6]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}
