"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Clock, UserRound, Plus, X } from "lucide-react";
import BookingModal from "./BookingModal";

// Card grid images are ~48–64px tiles served from Cloudinary. Fixed
// responsive sizes prevent the browser from downloading oversized originals
// (Phase 16). Detail-modal imagery reuses the same underlying file with a
// larger slot, so it keeps fill + a bigger sizes value.
const CARD_IMAGE_SIZES =
  "(max-width: 640px) 48px, (max-width: 768px) 64px, 64px";
const MODAL_IMAGE_SIZES = "152px";

function ServiceCard({ service, onBook }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const variants = service.variants ?? [];

  const startingPrice =
    service.price ?? variants[0]?.price ?? service.priceRange?.min ?? null;

  const hasVariants = variants.length > 0;

  // Lock background page scrolling while popup is open
  useEffect(() => {
    if (showDetails) {
      const originalOverflow = document.body.style.overflow;

      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showDetails]);

  // Close popup with Escape key
  useEffect(() => {
    if (!showDetails) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDetails(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDetails]);

  // Stable identity for the parent grid's onBook prop (Phase 15): keeps the
  // memo comparison meaningful when the Services page re-renders for
  // pagination/fetch state changes.
  const handleBookClick = useCallback(() => {
    if (onBook) {
      onBook(service);
    } else {
      setIsBookingOpen(true);
    }
  }, [onBook, service]);

  const handleDetailsBook = useCallback(() => {
    setShowDetails(false);
    if (onBook) {
      onBook(service);
    } else {
      setIsBookingOpen(true);
    }
  }, [onBook, service]);

  const openDetails = useCallback(() => setShowDetails(true), []);
  const closeDetails = useCallback(() => setShowDetails(false), []);

  return (
    <>
      {/* ================= SERVICE CARD ================= */}
      <article className="group relative overflow-hidden rounded-[18px] border border-[#D7EAE7] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(23,59,56,0.07)]">
        {/* Left Accent */}
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#28B8B0]" />

        <div className="p-2.5 sm:p-5">
          {/* Top */}
          <div className="flex items-start gap-3">
            {/* Image / Initial */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#E8F6F4] sm:h-[64px] sm:w-[64px] sm:rounded-[14px]">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.name}
                  width={64}
                  height={64}
                  sizes={CARD_IMAGE_SIZES}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-[#28B8B0] sm:text-xl">
                  {service.name?.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="min-w-0 pt-0.5">
              <h2 className="mt-1 text-xs font-bold leading-tight text-[#09221F] sm:text-[15px]">
                {service.name}
              </h2>
            </div>
          </div>

          {/* Description — capped at 2 lines on every breakpoint (Part 3);
              the full text stays available in View Details and the booking
              flow. Only the display is clamped — stored data is untouched. */}
          {service.description && (
            <p className="mt-2 line-clamp-2 text-[10px] leading-[1.45] text-[#718785] sm:mt-3 sm:text-xs">
              {service.description}
            </p>
          )}

          {/* Meta — compact on mobile so both values stay above the price. */}
          <div className="mt-2 flex min-w-0 flex-nowrap gap-1 overflow-hidden sm:mt-3 sm:gap-1.5">
            {service.gender && (
              <span className="flex min-w-0 shrink items-center gap-0.5 rounded-lg bg-[#EAF5F3] px-1.5 py-1 text-[9px] font-medium text-[#285F5A] sm:gap-1 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                <UserRound size={10} className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{service.gender}</span>
              </span>
            )}

            {service.duration && (
              <span className="flex min-w-0 shrink items-center gap-0.5 rounded-lg bg-[#EAF5F3] px-1.5 py-1 text-[9px] font-medium text-[#456764] sm:gap-1 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                <Clock size={10} className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{service.duration}</span>
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-dashed border-[#D7EAE7] sm:my-3" />

          {/* Price */}
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#7A8D8A]">
              {hasVariants ? "From" : "Price"}
            </p>

            {startingPrice != null ? (
              <p className="mt-0.5 text-base font-bold leading-none text-[#09221F] sm:text-xl">
                ₹{startingPrice}
              </p>
            ) : (
              <p className="mt-1 text-xs font-semibold text-[#218F87]">
                Price on request
              </p>
            )}
          </div>

          {/* Variants — EVERY variant returned by the backend is rendered
              (Parts 4 + 31): S/M/L shows all three, S/M shows two, one shows
              one. auto-cols-fr + grid-flow-col gives each variant an equal
              fraction of the card width so all variants ALWAYS sit in a
              single row — even 3-up inside the narrow 2-per-row mobile cards
              (a 375px viewport leaves ~139px per card; each box gets ~43px).
              Nothing is hidden, wrapped, or scrollable; prices/labels just
              truncate instead of ever forcing a second row. */}
          {hasVariants && (
            <div className="mt-2 grid auto-cols-fr grid-flow-col gap-1.5 sm:mt-3 sm:gap-2">
              {variants.map((variant, index) => (
                <div
                  key={variant.id ?? `${variant.label}-${index}`}
                  className="min-w-0 rounded-lg border border-[#E0EEEC] px-1.5 py-1.5 sm:px-2.5 sm:py-2"
                >
                  <p className="truncate text-[8px] font-bold leading-none text-[#09221F] sm:text-sm">
                    ₹{variant.price}
                  </p>

                  <p className="mt-1 truncate text-[7px] uppercase tracking-wide text-[#718785] sm:text-[8px]">
                    {variant.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-3 flex gap-1.5 sm:mt-4 sm:gap-2">
            {/* VIEW DETAILS */}
            <button
              type="button"
              onClick={openDetails}
              className="flex-1 rounded-lg bg-[#d4fffa] border border-[#25ffe6] px-1.5 py-1.5 text-[9px] font-bold text-[#09221F] transition-colors hover:border-[#28B8B0] hover:bg-[#F3FAF9] sm:px-2 sm:py-2 sm:text-[11px]"
            >
              View details
            </button>

            {/* BOOK */}
            <button
              type="button"
              onClick={handleBookClick}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#218F87] px-1.5 py-1.5 text-[9px] font-bold text-white transition-colors hover:bg-[#093c36] sm:gap-1.5 sm:px-2 sm:py-2 sm:text-[11px]"
            >
              <Plus size={13} />
              Book
            </button>
          </div>
        </div>
      </article>

      {/* ================= DETAILS POPUP ================= */}
      {showDetails && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09221F]/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-details-title"
            className="relative max-h-[90vh] w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[#D7EAE7] bg-white shadow-[0_25px_80px_rgba(9,34,31,0.25)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5EFED] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#218F87]">
                  Service Details
                </p>

                <h2
                  id="service-details-title"
                  className="mt-1 text-lg font-bold text-[#09221F] sm:text-xl"
                >
                  {service.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close service details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF6F4] text-[#285F5A] transition-colors hover:bg-[#DCEDEA]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[calc(90vh-76px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {/* Service Top */}
              <div className="flex items-start gap-4">
                <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#E8F6F4]">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.name}
                      width={76}
                      height={76}
                      sizes={MODAL_IMAGE_SIZES}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[#28B8B0]">
                      {service.name?.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  {service.gender && (
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#718785]">
                      {service.gender}
                    </p>
                  )}

                  <h3 className="mt-1 text-xl font-bold leading-tight text-[#09221F]">
                    {service.name}
                  </h3>

                  {service.category && (
                    <p className="mt-2 text-xs text-[#218F87]">
                      {service.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {service.description && (
                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A8D8A]">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#647572]">
                    {service.description}
                  </p>
                </div>
              )}

              {/* Information */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {service.gender && (
                  <div className="rounded-xl bg-[#F1F8F7] p-3">
                    <p className="text-[9px] font-medium uppercase tracking-wide text-[#7A8D8A]">
                      Suitable For
                    </p>

                    <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#285F5A]">
                      <UserRound size={15} />
                      {service.gender}
                    </div>
                  </div>
                )}

                {service.duration && (
                  <div className="rounded-xl bg-[#F1F8F7] p-3">
                    <p className="text-[9px] font-medium uppercase tracking-wide text-[#7A8D8A]">
                      Duration
                    </p>

                    <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#285F5A]">
                      <Clock size={15} />
                      {service.duration}
                    </div>
                  </div>
                )}
              </div>

              {/* Branch */}
              {service.branch && (
                <div className="mt-3 rounded-xl bg-[#F1F8F7] p-3">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-[#7A8D8A]">
                    Branch
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#285F5A]">
                    {service.branch}
                  </p>
                </div>
              )}

              {/* Price */}
              <div className="mt-5 border-t border-dashed border-[#D7EAE7] pt-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A8D8A]">
                  {hasVariants ? "Starting From" : "Price"}
                </p>

                {startingPrice != null ? (
                  <p className="mt-1 text-2xl font-bold text-[#09221F]">
                    ₹{startingPrice}
                  </p>
                ) : (
                  <p className="mt-1 text-base font-semibold text-[#218F87]">
                    Price on request
                  </p>
                )}
              </div>

              {/* All Variants */}
              {hasVariants && (
                <div className="mt-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A8D8A]">
                    Available Options
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {variants.map((variant, index) => (
                      <div
                        key={`${variant.label}-${index}`}
                        className="rounded-xl border border-[#DCEBE8] bg-[#FAFCFB] p-3"
                      >
                        <p className="text-base font-bold text-[#09221F]">
                          ₹{variant.price}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wide text-[#718785]">
                          {variant.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              {service.status && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F1F8F7] px-4 py-3">
                  <span className="text-xs text-[#718785]">Availability</span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      service.status === "Active"
                        ? "bg-[#DDF5EE] text-[#16806B]"
                        : "bg-[#F5EAEA] text-[#A94B4B]"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="flex-1 rounded-xl border border-[#CDE6E3] px-4 py-3 text-sm font-bold text-[#09221F] transition-colors hover:border-[#28B8B0] hover:bg-[#F3FAF9]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleDetailsBook}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#09221F] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#218F87]"
                >
                  <Plus size={16} />
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBookingOpen && (
        <BookingModal
          service={service}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </>
  );
}

// memo: the Services page re-renders on fetch/pagination state changes; with
// stable service objects and the useCallback handlers above, unchanged cards
// skip re-rendering. (React Compiler auto-memoizes much of this, but the
// explicit boundary keeps the prop contract clear and covers non-compiler
// builds.)
export default memo(ServiceCard);
