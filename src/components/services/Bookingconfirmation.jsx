"use client";

import { X, Check, MessageCircle } from "lucide-react";
import { formatDateDisplay, maskedWhatsAppNumber } from "./bookingUtils";

export default function BookingConfirmation({
  selectedServices,
  studioName,
  date,
  selectedTime,
  message,
  whatsAppNumber,
  onOpenWhatsAppAgain,
  onDone,
  onClose,
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4EFED] px-4 py-3.5">
        <h2 className="text-sm font-bold text-[#09221F] sm:text-base">
          Ready to send
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCEAE8] text-[#718785] transition hover:bg-[#F1F8F6] hover:text-[#09221F]"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Summary card */}
        <div className="rounded-xl border border-[#BFE7E1] bg-[#EAF7F5] p-3.5">
          <div className="space-y-1.5">
            {selectedServices.map(({ service }) => (
              <div key={service.id} className="flex items-start gap-2">
                <Check size={13} className="mt-0.5 shrink-0 text-[#218F87]" />
                <p className="text-xs font-bold text-[#09221F]">
                  {service.name}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-2.5 text-[10px] font-medium text-[#218F87]">
            {studioName} · {formatDateDisplay(date)} · {selectedTime}
          </p>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-[#456764]">
          Your booking message is ready. Send it on WhatsApp and the salon will
          confirm.
        </p>

        {/* Open WhatsApp again */}
        <button
          type="button"
          onClick={onOpenWhatsAppAgain}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#28B8B0] px-4 py-3 text-[10px] font-bold text-white transition hover:bg-[#218F87] sm:text-xs"
        >
          <MessageCircle size={14} />
          Open WhatsApp again
        </button>

        <p className="mt-1.5 text-center text-[9px] text-[#718785]">
          Goes to {maskedWhatsAppNumber(whatsAppNumber)}
        </p>

        {/* Message preview */}
        <p className="mb-1.5 mt-4 text-[9px] font-bold uppercase tracking-wide text-[#718785]">
          The message being sent
        </p>

        <div className="whitespace-pre-wrap rounded-xl border border-[#DCEAE8] bg-[#F8FCFB] p-3 text-[10px] leading-relaxed text-[#33504D]">
          {message}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E4EFED] bg-white p-3">
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-lg border border-[#DCEAE8] px-4 py-2.5 text-[11px] font-semibold text-[#456764] transition hover:bg-[#F6FBFA]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
