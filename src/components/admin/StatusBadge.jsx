"use client";

// Status pill used across admin tables. Pass an `onToggle` callback to turn it
// into a quick Active/Inactive toggle (used in the services table).
export default function StatusBadge({ status, onToggle, disabled = false }) {
  const isActive = String(status ?? "").toLowerCase() === "active";

  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isActive ? "bg-[#E4F4F2] text-[#1B6D67]" : "bg-[#F2F0EC] text-[#8A7F70]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#218F87]" : "bg-[#B9AE9E]"}`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  if (!onToggle) return badge;

  return (
    <button
      type="button"
      onClick={() => onToggle(isActive ? "Inactive" : "Active")}
      disabled={disabled}
      title="Click to change status"
      aria-label={`Change status (currently ${isActive ? "Active" : "Inactive"})`}
      className="transition-opacity hover:opacity-75 disabled:opacity-50"
    >
      {badge}
    </button>
  );
}
