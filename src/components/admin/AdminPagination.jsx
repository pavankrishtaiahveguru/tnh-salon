"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

// Compact pagination bar: "Showing x–y of z" + Previous / Next controls.
export default function AdminPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = "services",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-[#E3EFED] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-[#5F7774]">
        Showing{" "}
        <span className="font-semibold text-[#173B38]">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[#173B38]">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 items-center gap-1 rounded-lg border border-[#D7EAE7] bg-white px-3 text-xs font-semibold text-[#173B38] transition-colors hover:bg-[#F3F8F6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <span className="px-1 text-xs font-medium text-[#5F7774]">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 items-center gap-1 rounded-lg border border-[#D7EAE7] bg-white px-3 text-xs font-semibold text-[#173B38] transition-colors hover:bg-[#F3F8F6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
