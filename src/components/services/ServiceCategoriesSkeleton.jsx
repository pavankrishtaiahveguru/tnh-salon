"use client";

// ==================================================
// Service Categories skeleton (loading state)
// ==================================================
// The /services page's category tiles are API-driven (getCategoriesCached),
// so there is a genuine loading window where only the "All Services" tile
// would render. These skeletons mirror the real CategoryTile / mobile strip
// dimensions so nothing shifts when actual categories arrive. Purely
// decorative — aria-hidden so they're never exposed as interactive controls.

const PULSE_BG = "bg-[#E8F6F4]"; // same tint used by ServicesGridSkeleton

// Sidebar variant — matches CategoryTile's grid tile: rounded-2xl card,
// 40px circular image, 11px name line.
function CategoryTileSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#DCE8E5] bg-white px-2 py-3"
    >
      <div className={`h-10 w-10 animate-pulse rounded-full ${PULSE_BG}`} />
      <div className={`h-2.5 w-14 animate-pulse rounded ${PULSE_BG}`} />
    </div>
  );
}

// Mobile variant — matches the horizontal strip chip: rounded-xl card,
// 36px circular image, 10px name line, fixed shrink-0 width so the
// scrollable row has the same overflow behavior as real chips.
function CategoryChipSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-[#DCE8E5] bg-white px-2.5 py-2"
    >
      <div className={`h-9 w-9 animate-pulse rounded-full ${PULSE_BG}`}></div>
      <div className={`h-2 w-12 animate-pulse rounded ${PULSE_BG}`}></div>
    </div>
  );
}

// Desktop sidebar: 3-column grid, same classes as the real grid.
export function CategoryGridSkeleton({ count = 9 }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading service categories"
      className="grid grid-cols-3 gap-2.5"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CategoryTileSkeleton key={index} />
      ))}
    </div>
  );
}

// Mobile horizontal strip: shrink-0 items in an overflow-x container,
// same container classes as the real strip.
export function CategoryStripSkeleton({ count = 6 }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading service categories"
      className="flex w-full gap-3 overflow-x-auto pb-2 scrollbar-hide"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CategoryChipSkeleton key={index} />
      ))}
    </div>
  );
}
