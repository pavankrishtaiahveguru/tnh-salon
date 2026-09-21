"use client";

// ==================================================
// Services grid skeleton (Phase 13)
// ==================================================
// Mirrors ServiceCard's exact box structure (image tile, gender label, name
// lines, description lines, meta chips, divider, price block, variant chips,
// button row) so the grid does not shift when real cards arrive. Responsive:
// 3 columns desktop / 2 tablet / 2 mobile — matching the real grid classes.
// Purely decorative — hidden from assistive tech; the container carries
// aria-busy and an aria-live region instead.

function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#D7EAE7] bg-white p-2.5 sm:p-5">
      {/* Top: image + name */}
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-[12px] bg-[#E8F6F4] sm:h-[64px] sm:w-[64px] sm:rounded-[14px]" />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="h-2.5 w-14 animate-pulse rounded bg-[#E8F6F4]" />
          <div className="mt-2 h-3.5 w-3/4 animate-pulse rounded bg-[#E3EFED] sm:h-4" />
        </div>
      </div>

      {/* Description lines */}
      <div className="mt-2 space-y-1.5 sm:mt-3">
        <div className="h-2.5 w-full animate-pulse rounded bg-[#F0F7F5]" />
        <div className="h-2.5 w-5/6 animate-pulse rounded bg-[#F0F7F5]" />
      </div>

      {/* Meta chips */}
      <div className="mt-2 flex gap-1.5 sm:mt-3">
        <div className="h-6 w-16 animate-pulse rounded-lg bg-[#F0F7F5]" />
        <div className="h-6 w-20 animate-pulse rounded-lg bg-[#F0F7F5]" />
      </div>

      {/* Divider */}
      <div className="my-2 border-t border-dashed border-[#D7EAE7] sm:my-3" />

      {/* Price + variant chips */}
      <div className="h-2.5 w-10 animate-pulse rounded bg-[#F0F7F5]" />
      <div className="mt-1.5 h-5 w-16 animate-pulse rounded bg-[#E3EFED] sm:h-6" />
      <div className="mt-2 flex gap-2">
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-[#F0F7F5]" />
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-[#F0F7F5]" />
      </div>
    </div>
  );
}

export default function ServicesGridSkeleton({ count = 6 }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading services"
      className="grid grid-cols-2 gap-x-2.5 gap-y-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}
