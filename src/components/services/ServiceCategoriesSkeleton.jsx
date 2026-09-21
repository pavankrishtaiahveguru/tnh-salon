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

// Shared tile variant — matches CategoryTile's image + text design: square
// rounded image area on top, name line below, NO surrounding bordered card.
function CategoryTileSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex w-full min-w-0 flex-col items-center gap-1"
    >
      <div
        className={`aspect-square w-[calc(100%-5px)] animate-pulse rounded-xl sm:w-[80%] ${PULSE_BG}`}
      />
      <div className={`h-2.5 w-14 max-w-full animate-pulse rounded ${PULSE_BG}`} />
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

// Mobile/tablet grid: 3 columns on phones, 5 on tablets — same classes as
// the real grid, no horizontal scrolling.
export function CategoryStripSkeleton({ count = 6 }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading service categories"
      className="grid w-full grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CategoryTileSkeleton key={index} />
      ))}
    </div>
  );
}
