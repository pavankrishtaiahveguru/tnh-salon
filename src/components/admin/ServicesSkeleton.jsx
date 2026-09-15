"use client";

import { Scissors } from "lucide-react";

const ROWS = 8;

// Skeleton rows shown while the services list is "loading". Mirrors the table
// structure so it also works when the list later comes from the REST API.
export default function ServicesSkeleton({ rows = ROWS }) {
  return (
    <div aria-hidden="true" className="animate-pulse">
      {/* Header row */}
      <div className="hidden gap-4 border-b border-[#E3EFED] px-5 py-3 md:flex">
        {["Service", "Category", "Sub-category", "For", "Price", "Branch", "Status"].map(
          (label) => (
            <div
              key={label}
              className="h-3 flex-1 rounded bg-[#E3EFED]"
              style={{ maxWidth: label === "Service" ? "220px" : undefined }}
            />
          ),
        )}
      </div>

      {/* Skeleton rows */}
      <ul className="divide-y divide-[#E3EFED]">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-[#E3EFED]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-[#E3EFED]" />
              <div className="h-2.5 w-1/4 rounded bg-[#F0F7F5]" />
            </div>
            <div className="hidden h-3 flex-1 rounded bg-[#F0F7F5] md:block" />
            <div className="hidden h-3 w-20 rounded bg-[#F0F7F5] md:block" />
            <div className="hidden h-3 w-16 rounded bg-[#F0F7F5] md:block" />
            <div className="hidden h-3 w-24 rounded bg-[#F0F7F5] md:block" />
            <div className="h-6 w-16 shrink-0 rounded-full bg-[#E3EFED]" />
            <Scissors size={14} className="shrink-0 text-[#E3EFED]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
