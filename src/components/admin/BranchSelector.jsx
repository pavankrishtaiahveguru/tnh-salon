"use client";

import { MapPin } from "lucide-react";
import { branchAvailabilityLabel } from "@/lib/admin/config";
import { FieldLabel } from "./AdminFields";

// Branch availability checkbox group used in ServiceForm.
export default function BranchSelector({
  value = [],
  branches = [],
  onChange,
}) {
  const toggleBranch = (branchId) => {
    const next = value.includes(branchId)
      ? value.filter((id) => id !== branchId)
      : [...value, branchId];
    onChange(next);
  };

  return (
    <div>
      <FieldLabel required>Branch Availability</FieldLabel>
      <div className="grid gap-2 sm:grid-cols-2">
        {branches.map((branch) => {
          const checked = value.includes(branch.id);
          return (
            <button
              key={branch.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggleBranch(branch.id)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                checked
                  ? "border-[#218F87] bg-[#EAF6F4]"
                  : "border-[#D7EAE7] bg-white hover:bg-[#F9FCFB]"
              }`}
            >
              <span
                className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${
                  checked
                    ? "border-[#218F87] bg-[#218F87] text-white"
                    : "border-[#B9CFCB] bg-white"
                }`}
              >
                {checked ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-3 w-3"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 6.2 5 8.5l4.5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <MapPin
                size={14}
                className={checked ? "text-[#218F87]" : "text-[#9DB4B0]"}
              />
              <span className="text-sm font-medium text-[#09221F]">
                {branch.name}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] font-medium text-[#5F7774]">
        {branchAvailabilityLabel(value)}
      </p>
    </div>
  );
}
