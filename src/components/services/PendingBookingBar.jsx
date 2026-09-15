"use client";

import { ArrowRight, Trash2 } from "lucide-react";
import { computeBookingTotal, formatPrice } from "./bookingUtils";

export default function PendingBookingBar({ booking, onClear, onReview }) {
  const services = booking.selectedServices ?? [];
  const { total } = computeBookingTotal(services);
  const names = services.map(({ service }) => service.name).join(" · ");

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-[#D7EAE7] bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(9,34,31,0.1)] backdrop-blur sm:px-8 sm:py-4">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#09211E] sm:text-base">
            {services.length} service{services.length === 1 ? "" : "s"} ·{" "}
            {formatPrice(total)}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-[#647572] sm:text-sm">
            {names}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClear}
            aria-label="Delete pending booking"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E3D4D0] text-[#A94B4B] transition hover:bg-[#FDF1EE]"
          >
            <Trash2 size={18} />
          </button>
          <button
            type="button"
            onClick={onReview}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-[#218F87] px-3 text-sm font-bold text-white transition hover:bg-[#197B74] sm:px-4"
          >
            Review <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
