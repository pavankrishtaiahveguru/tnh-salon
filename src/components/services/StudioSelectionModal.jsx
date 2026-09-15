import { ArrowRight, MapPin, X } from "lucide-react";
import {
  formatPrice,
  getBasePrice,
  isServiceAvailableAtStudio,
} from "./bookingUtils";

export default function StudioSelectionModal({
  service,
  studios,
  onSelectStudio,
  onKeepBrowsing,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09221F]/45 p-3 backdrop-blur-sm sm:p-5">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[18px] border border-[#D7EAE7] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-[#E4EFED] px-4 py-3.5">
          <h2 className="text-base font-bold text-[#09221F]">Which studio?</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close studio selection"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCEAE8] text-[#718785] hover:bg-[#F1F8F6]"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3 rounded-xl border border-[#DCEBE8] bg-[#F8FCFB] p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E4F5F2]">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-bold text-[#28B8B0]">
                  {service.name?.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#09221F]">
                {service.name}
              </p>
              <p className="mt-0.5 text-[10px] text-[#718785]">
                {service.category || "Beauty Service"}
              </p>
            </div>
            <p className="ml-auto shrink-0 text-xs font-bold text-[#09221F]">
              {formatPrice(getBasePrice(service))}
            </p>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-[#456764]">
            Pick where you&apos;d like to come in. We&apos;ll show you what that
            studio offers.
          </p>
          <div className="mt-4 space-y-2.5">
            {studios.map((studio) =>
              (() => {
                const available = isServiceAvailableAtStudio(service, studio);
                return (
                  <button
                    key={studio.id}
                    type="button"
                    disabled={!available}
                    onClick={() => available && onSelectStudio(studio)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                      available
                        ? "border-[#D7EAE7] hover:border-[#28B8B0] hover:bg-[#F5FBFA]"
                        : "cursor-not-allowed border-[#E5ECEA] bg-[#F3F6F5] opacity-55"
                    }`}
                  >
                    <MapPin
                      size={18}
                      className={
                        available ? "text-[#28B8B0]" : "text-[#9AA9A6]"
                      }
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-[#09221F]">
                        {studio.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#718785]">
                        {available
                          ? studio.city
                          : "Unavailable for this service"}
                      </span>
                    </span>
                    <ArrowRight
                      size={17}
                      className={
                        available ? "text-[#718785]" : "text-[#AAB8B5]"
                      }
                    />
                  </button>
                );
              })(),
            )}
          </div>
          <button
            type="button"
            onClick={onKeepBrowsing}
            className="mt-4 w-full rounded-lg border border-[#DCEAE8] px-4 py-2.5 text-[11px] font-semibold text-[#456764] hover:bg-[#F6FBFA]"
          >
            Keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
