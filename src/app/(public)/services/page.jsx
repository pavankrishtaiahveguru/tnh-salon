"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronDown,
  MapPin,
  LayoutGrid,
  Scissors,
  Waves,
  Droplets,
  Leaf,
  Palette,
  FlaskConical,
  Sun,
  Sparkles,
  Flame,
  Hand,
  Smile,
  Gem,
  PersonStanding,
  Paintbrush,
  Droplet,
  Eye,
  UserRound,
  AlertCircle,
} from "lucide-react";

import ServicesHero from "@/components/services/ServicesHero";
import ServicesBreadcrumb from "@/components/services/ServicesBreadcrumb";
import ServiceCard from "@/components/services/ServiceCard";
import ServicesGridSkeleton from "@/components/services/ServicesGridSkeleton";
import {
  CategoryGridSkeleton,
  CategoryStripSkeleton,
} from "@/components/services/ServiceCategoriesSkeleton";
import CurrentBookingModal from "@/components/services/BookingModal";
import PendingBookingBar from "@/components/services/PendingBookingBar";
import {
  getServicesPage,
  getCategoriesCached,
  getBranchesCached,
  getAllActiveServices,
  getTotalServiceCount,
  clearServicesCache,
  SERVICES_PAGE_SIZE,
} from "@/lib/services";
import { areServicesAvailableAtStudio } from "@/components/services/bookingUtils";

// Debounce window for search-as-you-type (each commit is a server request).
const SEARCH_DEBOUNCE_MS = 350;

// Icon fallback for each category (used only if category.image isn't provided).
const CATEGORY_ICONS = {
  all: LayoutGrid,
  "hair-cut-styles": Scissors,
  "head-massages": Waves,
  "hair-spas": Droplets,
  "scalp-hair-treatments": Leaf,
  "hair-colours": Palette,
  "hair-chemical-treatments": FlaskConical,
  "bleach-d-tan": Sun,
  "face-threading": Sparkles,
  waxing: Flame,
  "hands-feet": Hand,
  facials: Smile,
  nails: Gem,
  body: PersonStanding,
  makeup: Paintbrush,
  "skin-care-treatments": Droplet,
  "brow-lashes": Eye,
};

// Server-side sort keys (backend whitelists these; anything else = menu order).
const SORT_PARAMS = {
  menu: "menu",
  "price-low": "priceAsc",
  "price-high": "priceDesc",
  name: "nameAsc",
};

function CategoryTile({ category, isSelected, onSelect }) {
  const Icon = CATEGORY_ICONS[category.id] ?? LayoutGrid;

  // Image + text layout: the image IS the tile — rounded, square, object-cover,
  // visually dominant. The name sits directly below with no card/border around
  // the pair. Selected state = subtle teal ring around the image + teal label.
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      aria-pressed={isSelected}
      className="flex w-full min-w-0 flex-col items-center gap-1 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218F87]"
    >
      <div
        className={`aspect-square w-[calc(80%)] overflow-hidden rounded-xl ring-1 transition-all duration-200 sm:w-[78%] ${
          isSelected
            ? "ring-2 ring-[#218F87]"
            : "ring-[#DCE8E5] hover:ring-[#28B8B0]"
        }`}
      >
        {category.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          // Icon fallback (e.g. All Services) — same footprint as the image.
          <span
            className={`flex h-full w-full items-center justify-center ${
              isSelected ? "bg-[#E4F4F2]" : "bg-[#EEF6F4]"
            }`}
          >
            <Icon size={20} strokeWidth={1.8} className="text-[#218F87]" />
          </span>
        )}
      </div>

      <span
        className={`w-full text-[11px] leading-tight sm:text-xs ${
          isSelected
            ? "font-semibold text-[#218F87]"
            : "font-medium text-[#173B38]"
        }`}
      >
        {category.name}
      </span>
    </button>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFFDF9]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <p className="text-sm text-[#647572]">Loading services…</p>
      </div>
    </main>
  );
}

function ServicesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL; the page mirrors them into API calls. The
  // category/subCategory params are trusted as-is (validated server-side) so
  // deep links don't trigger a double fetch while metadata loads.
  const search = searchParams.get("q") ?? "";
  const sortBy = searchParams.get("sort") ?? "menu";
  const branchParam = searchParams.get("branch") ?? "all";
  const categoryParam = searchParams.get("category");
  const subCategoryParam = searchParams.get("subCategory");
  // Gender filter — backed by the existing `audience` column values (Women /
  // Men). Server-side, Women/Men also include Unisex services (Unisex is
  // bookable by either audience). "All" clears the param, so every audience
  // remains visible under All. No new data structures.
  const genderParam = searchParams.get("gender");
  const selectedGender =
    genderParam === "Women" || genderParam === "Men" ? genderParam : "all";

  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [facetCategory, setFacetCategory] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [servicesError, setServicesError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [allServices, setAllServices] = useState(null); // booking catalogue
  // Unfiltered catalog total for the hero SERVICES stat. Fetched ONCE via a
  // dedicated COUNT endpoint, independent of every filter — so it never
  // changes when category/branch/gender/search params change.
  const [totalServiceCount, setTotalServiceCount] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // ---- Append-only "View More" pagination (internal state, NOT in URL) ----
  // The fetch effect always requests page 1 and REPLACES the list; View More
  // requests the next page and APPENDS. `page` is kept in a ref so filter
  // resets never race a stale page number.
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  // Shared filter shape for page-1 fetch, View More, and retry — guarantees
  // every request carries the same search/category/branch/subCategory/sort.
  const filtersRef = useRef(null);

  // Local search input with debounce — avoids one API request per keystroke.
  // Render-time reset (React docs "adjusting state during render"): when the
  // committed URL search changes externally (back/forward, clear filters),
  // the input snaps to it without an effect round-trip.
  const [searchInput, setSearchInput] = useState(search);
  const [lastCommittedSearch, setLastCommittedSearch] = useState(search);
  if (search !== lastCommittedSearch) {
    setLastCommittedSearch(search);
    setSearchInput(search);
  }

  // Guards against out-of-order responses when filters change quickly: only
  // the newest request may commit state. Also mirrors isFetching without
  // synchronous setState inside the effect (see below).
  const requestIdRef = useRef(0);
  const pendingRef = useRef(false);

  // Debounced commit of the search box into the URL (which drives the fetch).
  // No `page` param exists in the URL anymore — resetting to page 1 happens
  // automatically because the fetch effect always requests page 1.
  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("q", searchInput);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const branchOptions = useMemo(
    () => [
      // "Both branches" = available at either branch (backend branch=both).
      { id: "all", name: "Both branches" },
      ...branches,
    ],
    [branches],
  );
  const selectedBranch = branchOptions.some(
    (branch) => branch.id === branchParam,
  )
    ? branchParam
    : "all";

  const allCategories = useMemo(
    () => [{ id: "all", name: "All Services" }, ...categories],
    [categories],
  );

  // Categories come from the API (getCategoriesCached) — a genuine loading
  // state, so the category section shows skeletons until the first batch
  // resolves. Once loaded it stays loaded; category selection never blanks
  // the strip (service filtering is a grid-only loading state).
  const categoriesLoading = categories.length === 0;
  const selectedCategory = categoryParam || "all";
  const selectedSubCategory = subCategoryParam || "all";

  // Sub-category chips come from the server's facet counts. They're only
  // shown when they belong to the currently selected category, so switching
  // categories never flashes the previous category's chips.
  const availableSubCategories =
    facetCategory === selectedCategory ? subCategories : [];

  // ---- Server-backed fetching (page 1 / filter changes) ---------------------
  // Runs on mount and whenever any filter/search/sort changes. ALWAYS requests
  // page 1 and REPLACES the whole list — filter changes must never append.
  // Out-of-order responses are dropped via requestIdRef; isFetching is
  // mirrored via pendingRef and cleared in the commit callbacks.
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    pendingRef.current = true;
    pageRef.current = 1;

    // Metadata + booking catalogue resolve independently so a failure in one
    // doesn't blank the page. Cached (60s) after the first visit.
    getCategoriesCached()
      .then((data) => {
        if (requestIdRef.current === requestId) setCategories(data);
      })
      .catch(() => {});

    getBranchesCached()
      .then((data) => {
        if (requestIdRef.current === requestId) setBranches(data);
      })
      .catch(() => {});

    getAllActiveServices()
      .then((data) => {
        if (requestIdRef.current === requestId) setAllServices(data);
      })
      .catch(() => {});

    // Hero total — resolves independently of the filtered listing so filter
    // changes never alter it (and a failure in one doesn't blank the other).
    // Cached after the first visit; Retry's clearServicesCache() refetches it.
    getTotalServiceCount()
      .then((count) => {
        if (requestIdRef.current === requestId) setTotalServiceCount(count);
      })
      .catch(() => {});

    // Current filter shape, shared by the page-1 fetch, View More, and the
    // retry action — so every request carries the SAME filters.
    const filters = {
      limit: SERVICES_PAGE_SIZE,
      search,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      subCategory:
        selectedSubCategory !== "all" ? selectedSubCategory : undefined,
      branch: selectedBranch === "all" ? "both" : selectedBranch,
      gender: selectedGender !== "all" ? selectedGender : undefined,
      sort: SORT_PARAMS[sortBy] ?? "menu",
    };
    filtersRef.current = filters;

    getServicesPage({ ...filters, page: 1 })
      .then((result) => {
        if (requestIdRef.current !== requestId) return;
        setServices(result.services);
        setPage(1);
        setHasMore(
          result.services.length > 0 &&
            (!result.pagination ||
              result.pagination.page < result.pagination.totalPages),
        );
        setPagination(result.pagination);
        if (result.subCategories) {
          setSubCategories(result.subCategories);
          setFacetCategory(selectedCategory);
        }
        pendingRef.current = false;
        setIsFetching(false);
      })
      .catch((error) => {
        if (requestIdRef.current !== requestId) return;
        pendingRef.current = false;
        if (error?.name === "AbortError") return;
        setServicesError(
          "Unable to load services right now. Please try again.",
        );
        setIsFetching(false);
      });

    // While a new request is pending, the grid dims (stale-while-revalidate);
    // this async pass only flips flags back when a response commits. A filter
    // change also cancels any pending View More request (its requestId is now
    // stale) so the in-progress "Loading…" state resets here.
    Promise.resolve().then(() => {
      if (requestIdRef.current === requestId && pendingRef.current) {
        setIsFetching(true);
        setLoadingMore(false);
      }
    });
  }, [
    search,
    selectedCategory,
    selectedSubCategory,
    selectedBranch,
    selectedGender,
    sortBy,
    retryCount,
  ]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      const isDefaultBranch = key === "branch" && value === "all";
      if (!value || (value === "all" && !isDefaultBranch) || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Any filter/search/sort change restarts the list at page 1.
    const resetsPagination = !("page" in updates);
    if (resetsPagination) params.delete("page");

    const query = params.toString();
    // Keep the committed-search mirror in sync so the render-time input reset
    // above doesn't fight the user's typing right after a manual updateParams.
    if (updates.q !== undefined) setLastCommittedSearch(updates.q ?? "");
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  // Mobile/tablet: after a category selection commits (URL update → render),
  // smoothly scroll so the user lands on Selected category → Subcategory
  // filter → Services — never past the filters and never straight to the
  // cards. `scroll-mt-24` on the targets keeps the fixed navbar (h-20) from
  // covering them. Desktop uses the sidebar and never scrolls.
  const pendingCategoryScrollRef = useRef(false);

  useEffect(() => {
    if (!pendingCategoryScrollRef.current) return;
    pendingCategoryScrollRef.current = false;
    if (typeof window === "undefined") return;
    const target =
      selectedCategory === "all"
        ? document.getElementById("mobile-category-grid")
        : document.getElementById("subcategory-filters");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedCategory, selectedSubCategory]);

  // Keep the horizontally-scrolling subcategory chip rows in a sensible
  // position whenever the active category/subcategory changes — e.g. after
  // navigating back from a subcategory the row starts at "All {Category}"
  // again instead of wherever a long chip list happened to be scrolled.
  useEffect(() => {
    if (typeof window === "undefined") return;
    document
      .querySelectorAll(".tnh-subcategory-scroll")
      .forEach((el) => el.scrollTo({ left: 0, behavior: "smooth" }));
  }, [selectedCategory, selectedSubCategory]);

  const handleSelectCategory = (id) => {
    if (id === selectedCategory) {
      // Re-selecting the active category walks BACK one level: an active
      // subcategory is removed while the category stays selected (the parent
      // click must drop only its child filter). Once already at the category
      // level, nothing changes in the URL, so the effect above won't fire —
      // scroll directly instead.
      if (selectedSubCategory !== "all") {
        pendingCategoryScrollRef.current = true;
        updateParams({ subCategory: "all" });
        return;
      }
      if (typeof window !== "undefined") {
        const target =
          id === "all"
            ? document.getElementById("mobile-category-grid")
            : document.getElementById("subcategory-filters");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    // Selection happens first; the scroll runs once the re-render commits
    // and the subcategory section exists in the DOM.
    pendingCategoryScrollRef.current = true;
    updateParams({ category: id, subCategory: "all" });
  };

  // Desktop sidebar keeps its existing behavior: category changes apply with
  // no page scrolling.
  const handleSelectCategoryDesktop = (id) =>
    updateParams({ category: id, subCategory: "all" });
  const handleSelectSubCategory = (name) => updateParams({ subCategory: name });

  // Breadcrumb navigation — a parent click removes ONLY its child filter:
  // "Services" clears category + subCategory; "{Category}" drops just the
  // subcategory and stays inside the category. Other filters (search, branch,
  // gender) are never touched, and pagination restarts at page 1 because the
  // fetch effect always requests page 1.
  const handleBreadcrumbSelectServices = () =>
    updateParams({ category: "all", subCategory: "all" });
  const handleBreadcrumbSelectCategory = () =>
    updateParams({ subCategory: "all" });
  const handleBranchChange = (value) => updateParams({ branch: value });
  // "all" deletes the URL param (All = no audience filter server-side).
  const handleGenderChange = (value) =>
    updateParams({ gender: value === "all" ? "" : value });

  // Booking flow state (unchanged behavior).
  const [bookingService, setBookingService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [serviceToAdd, setServiceToAdd] = useState(null);

  const handleBook = (service) => {
    if (!pendingBooking?.selectedServices?.length) {
      setBookingService(service);
      setServiceToAdd(null);
      setIsBookingOpen(true);
      return;
    }

    const selectedStudio = pendingBooking.selectedStudio;
    if (
      selectedStudio &&
      areServicesAvailableAtStudio(
        pendingBooking.selectedServices,
        selectedStudio,
        service,
      )
    ) {
      setPendingBooking((current) => addServiceToBooking(current, service));
      setBookingService(pendingBooking.selectedServices[0].service);
      setServiceToAdd(null);
    } else {
      setBookingService(pendingBooking.selectedServices[0].service);
      setServiceToAdd(service);
    }
    setIsBookingOpen(true);
  };

  const addServiceToBooking = (booking, service) => {
    if (
      booking.selectedServices.some((entry) => entry.service.id === service.id)
    ) {
      return booking;
    }
    const variants = service.variants ?? [];
    return {
      ...booking,
      selectedServices: [
        ...booking.selectedServices,
        {
          service,
          selectedVariantId: variants.length === 1 ? variants[0].id : null,
        },
      ],
    };
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setBookingService(null);
    setServiceToAdd(null);
  };

  const handleRetry = () => {
    // Drop cached/pending responses (a failed request must not be re-joined)
    // and re-run the fetch effect.
    clearServicesCache();
    setRetryCount((count) => count + 1);
  };

  // ---- View More (append-only) ----------------------------------------------
  // Fetches the NEXT page with the exact same filter shape as page 1 (kept in
  // filtersRef), appends with id-based dedup, and never touches the URL.
  // Errors keep every previously loaded card on screen and leave the button
  // enabled so the same page can be retried (page is NOT incremented).
  const handleLoadMore = () => {
    if (loadingMore || isFetching || !hasMore) return;

    const requestId = ++requestIdRef.current;
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);

    getServicesPage({ ...filtersRef.current, page: nextPage })
      .then((result) => {
        if (requestIdRef.current !== requestId) return;
        // Defensive dedup by real service id — normal pagination never
        // repeats rows (deterministic ORDER BY + id tiebreaker), this only
        // guards against edge cases like concurrent filter resets.
        setServices((prev) => {
          const existingIds = new Set(prev.map((service) => service.id));
          const unique = result.services.filter(
            (service) => !existingIds.has(service.id),
          );
          return [...prev, ...unique];
        });
        pageRef.current = nextPage;
        setPage(nextPage);
        const more =
          result.services.length > 0 &&
          (!result.pagination ||
            result.pagination.page < result.pagination.totalPages);
        setHasMore(more);
        if (result.pagination) setPagination(result.pagination);
        setLoadingMore(false);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        // Keep existing services + the button; page stays the same so the
        // click retries the same page.
        setLoadingMore(false);
      });
  };

  const selectedCategoryName =
    selectedCategory !== "all"
      ? allCategories.find((c) => c.id === selectedCategory)?.name
      : null;

  // Initial load = nothing to show yet → full skeleton. Refetches with data
  // already on screen keep the layout stable and just dim it (aria-busy).
  const initialLoading = isFetching && services.length === 0 && !servicesError;

  return (
    <>
      <ServicesHero
        serviceCount={totalServiceCount}
        categoryCount={categories.length}
        branches={branches}
      />

      {/* Services Browsing Section */}
      <section
        id="service-categories"
        className="mx-auto max-w-[1600px] overflow-x-clip bg-[#FFFDF9] px-5 pb-36 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pb-32 lg:pt-12 xl:px-16"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#647572]">
                Service Categories
              </p>

              {categoriesLoading ? (
                <CategoryGridSkeleton count={9} />
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {allCategories.map((category) => (
                    <CategoryTile
                      key={category.id}
                      category={category}
                      isSelected={selectedCategory === category.id}
                      onSelect={handleSelectCategoryDesktop}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Services Area */}
          <div className="min-w-0">
            {/* Mobile / Tablet: STICKY SEARCH — the SAME controlled input as
                before (one search state, no duplicate component). It lives as
                a direct child of this tall column so position:sticky can
                follow the whole page scroll (a sticky element only sticks
                within its parent, and the previous #service-filters wrapper
                was too short). It sits just below the fixed navbar (h-20 =
                80px), gets the page background + a subtle bottom border so
                content never shows through, and unmounts ENTIRELY while the
                booking modal is open so it can never appear above/behind/
                through it. Desktop (lg+) keeps the existing inline row below. */}
            {!isBookingOpen && (
              <div className="sticky top-20 z-40 -mx-5 mb-4 border-b border-[#E5EFED] bg-[#FFFDF9]/95 px-5 pb-3 pt-2 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:hidden">
                <div className="relative">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C8C89]"
                  />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search services, e.g. balayage, pedicure"
                    aria-label="Search services"
                    className="h-12 w-full rounded-xl border border-[#DCE8E5] bg-white pl-11 pr-4 text-sm text-[#173B38] outline-none transition-colors placeholder:text-[#8A9996] focus:border-[#218F87]"
                  />
                </div>
              </div>
            )}

            {/* Mobile / Tablet: Branch/Gender — ALWAYS ABOVE categories.
                Desktop renders this row further down (lg:hidden here) so the
                sidebar keeps its existing search/branch layout. */}
            <div id="service-filters" className="mb-6 scroll-mt-24 lg:hidden">
              {/* Branch + Gender side-by-side, equal widths (Parts 7 + 8) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#647572]"
                  />
                  <select
                    value={selectedBranch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    aria-label="Filter services by branch"
                    className="h-12 w-full appearance-none rounded-xl border border-[#DCE8E5] bg-white px-3 pl-10 pr-8 text-sm font-medium text-[#173B38] outline-none focus:border-[#218F87]"
                  >
                    {branchOptions.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#647572]"
                  />
                </div>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#647572]"
                  />
                  <select
                    value={selectedGender}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    aria-label="Filter services by gender"
                    className="h-12 w-full appearance-none rounded-xl border border-[#DCE8E5] bg-white px-3 pl-10 pr-8 text-sm font-medium text-[#173B38] outline-none focus:border-[#218F87]"
                  >
                    <option value="all">Gender · All</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#647572]"
                  />
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Category Grid — full grid, no horizontal scroll */}
            <div id="mobile-category-grid" className="mb-3 scroll-mt-36 lg:hidden">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#647572]">
                Service Categories
              </p>

              {categoriesLoading ? (
                <CategoryStripSkeleton count={15} />
              ) : (
                // Image + text tiles: 3 per row on phones, 5 on tablets. Full
                // width vertical grid — no carousel, no horizontal scrolling.
                <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
                  {allCategories.map((category) => (
                    <CategoryTile
                      key={category.id}
                      category={category}
                      isSelected={selectedCategory === category.id}
                      onSelect={handleSelectCategory}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Subcategory chips (mobile/tablet) — rendered right below the
                category grid, above the result count (Parts 10–13). Desktop
                keeps them inline above the grid (lg:hidden here). */}
            {selectedCategory !== "all" && (
              <div
                id="subcategory-filters"
                className="mb-5 scroll-mt-36 lg:hidden"
              >
                <div className="mb-3">
                  <ServicesBreadcrumb
                    categoryName={selectedCategoryName ?? selectedCategory}
                    subCategoryName={
                      selectedSubCategory !== "all" ? selectedSubCategory : null
                    }
                    onSelectRoot={handleBreadcrumbSelectServices}
                    onSelectCategory={handleBreadcrumbSelectCategory}
                  />
                </div>

                {/* Single row — chips never wrap; the container scrolls
                    horizontally when the list exceeds the card width. Only
                    this container scrolls; the page never gains horizontal
                    overflow (Part 10). Negative margins + matching padding
                    let chips run edge-to-edge inside the section padding. */}
                <div className="tnh-subcategory-scroll -mx-5 flex gap-2 px-5 pb-3 sm:-mx-8 sm:px-8">
                  <button
                    type="button"
                    onClick={() => handleSelectSubCategory("all")}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:px-6 sm:py-3 ${
                      selectedSubCategory === "all"
                        ? "border-[#3DD4C8] bg-[#3DD4C8] font-bold text-[#09221F]"
                        : "border-[#D7EAE7] bg-white text-[#456764] hover:border-[#3DD4C8]"
                    }`}
                  >
                    All {selectedCategoryName}
                  </button>

                  {availableSubCategories.map((subCategory) => (
                    <button
                      key={subCategory.name}
                      type="button"
                      onClick={() => handleSelectSubCategory(subCategory.name)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:px-6 sm:py-3 ${
                        selectedSubCategory === subCategory.name
                          ? "border-[#3DD4C8] bg-[#3DD4C8] font-bold text-[#09221F]"
                          : "border-[#D7EAE7] bg-white text-[#456764] hover:border-[#3DD4C8]"
                      }`}
                    >
                      {subCategory.name} {subCategory.count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Search + Branch/Gender — one aligned row: search takes
                the remaining width (flex-1 + min-w-0), branch/gender keep their
                existing fixed widths. Mobile/tablet use the lg:hidden block. */}
            <div
              id="service-filters-desktop"
              className="mb-7 hidden flex-col gap-3 lg:flex lg:flex-row"
            >
              {/* Search */}
              <div className="relative min-w-0 flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C8C89]"
                />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search services, e.g. balayage, pedicure"
                  aria-label="Search services"
                  className="h-12 w-full rounded-xl border border-[#DCE8E5] bg-white pl-11 pr-4 text-sm text-[#173B38] outline-none transition-colors placeholder:text-[#8A9996] focus:border-[#218F87]"
                />
              </div>

              {/* Branch */}
              <div className="relative lg:w-48 xl:w-52">
                <MapPin
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#647572]"
                />
                <select
                  value={selectedBranch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  aria-label="Filter services by branch"
                  className="h-12 w-full appearance-none rounded-xl border border-[#DCE8E5] bg-white px-4 pl-11 pr-10 text-sm font-medium text-[#173B38] outline-none focus:border-[#218F87]"
                >
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#647572]"
                />
              </div>

              {/* Gender (replaces Menu Order — Part 7) */}
              <div className="relative lg:w-48 xl:w-52">
                <UserRound
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#647572]"
                />
                <select
                  value={selectedGender}
                  onChange={(e) => handleGenderChange(e.target.value)}
                  aria-label="Filter services by gender"
                  className="h-12 w-full appearance-none rounded-xl border border-[#DCE8E5] bg-white px-4 pl-11 pr-10 text-sm font-medium text-[#173B38] outline-none focus:border-[#218F87]"
                >
                  <option value="all">Gender · All</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#647572]"
                />
              </div>
            </div>

            {/* Subcategory chips (desktop) — inline above the grid, same chips
                fed by the same server-side facet counts as mobile. */}
            {selectedCategory !== "all" && (
              <div className="mb-5 hidden lg:block">
                <div className="mb-3">
                  <ServicesBreadcrumb
                    categoryName={selectedCategoryName ?? selectedCategory}
                    subCategoryName={
                      selectedSubCategory !== "all" ? selectedSubCategory : null
                    }
                    onSelectRoot={handleBreadcrumbSelectServices}
                    onSelectCategory={handleBreadcrumbSelectCategory}
                  />
                </div>

                <div className="tnh-subcategory-scroll -mx-4 flex gap-2 px-4 pb-3">
                  <button
                    type="button"
                    onClick={() => handleSelectSubCategory("all")}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:px-6 sm:py-3 ${
                      selectedSubCategory === "all"
                        ? "border-[#3DD4C8] bg-[#3DD4C8] font-bold text-[#09221F]"
                        : "border-[#D7EAE7] bg-white text-[#456764] hover:border-[#3DD4C8]"
                    }`}
                  >
                    All {selectedCategoryName}
                  </button>

                  {availableSubCategories.map((subCategory) => (
                    <button
                      key={subCategory.name}
                      type="button"
                      onClick={() => handleSelectSubCategory(subCategory.name)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:px-6 sm:py-3 ${
                        selectedSubCategory === subCategory.name
                          ? "border-[#3DD4C8] bg-[#3DD4C8] font-bold text-[#09221F]"
                          : "border-[#D7EAE7] bg-white text-[#456764] hover:border-[#3DD4C8]"
                      }`}
                    >
                      {subCategory.name} {subCategory.count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result Count */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-[#647572]">
                <span className="font-semibold text-[#173B38]">
                  {pagination ? pagination.total : "…"}
                </span>{" "}
                services
                {selectedCategoryName && (
                  <>
                    {" "}
                    in{" "}
                    <span className="font-medium text-[#218F87]">
                      {selectedCategoryName}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Service Grid */}
            {initialLoading ? (
              <ServicesGridSkeleton count={6} />
            ) : servicesError ? (
              <div
                role="alert"
                className="rounded-2xl border border-[#F3C9C0] bg-[#FDF6F4] px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FBEBE7] text-[#B23B23]">
                  <AlertCircle size={24} />
                </div>

                <h2 className="mt-5 text-lg font-semibold text-[#173B38]">
                  Unable to load services right now.
                </h2>

                <p className="mt-2 text-sm text-[#647572]">
                  Please check your connection and try again.
                </p>

                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-5 rounded-full bg-[#218F87] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#197B74]"
                >
                  Try Again
                </button>
              </div>
            ) : services.length > 0 ? (
              <>
                {/* 2 cards per row on mobile (Part 1); tablet/desktop keep the
                    existing responsive columns. min-w-0 grid children cannot
                    force horizontal overflow. */}
                <div
                  aria-busy={isFetching}
                  className={`grid grid-cols-2 gap-x-2.5 gap-y-4 transition-opacity duration-200 md:grid-cols-2 md:gap-5 xl:grid-cols-3 ${
                    isFetching ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onBook={handleBook}
                    />
                  ))}
                </div>

                {/* View More — append-only; page numbers are intentionally not
                    shown anywhere in the UI. */}
                {(hasMore || loadingMore) && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      aria-busy={loadingMore}
                      className="rounded-full border border-[#218F87] bg-white px-8 py-3 text-sm font-medium text-[#218F87] transition-all duration-300 hover:bg-[#218F87] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218F87] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? "Loading…" : "View More"}
                    </button>
                  </div>
                )}

                {/* Skeletons for the incoming batch only — existing cards stay
                    fully visible and interactive while loading more. */}
                {loadingMore && (
                  <div aria-hidden="true" className="mt-10">
                    <ServicesGridSkeleton count={3} />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-[#DCE8E5] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF6F4] text-[#218F87]">
                  <Search size={24} />
                </div>

                <h2 className="mt-5 text-lg font-semibold text-[#173B38]">
                  No services found matching your selected filters.
                </h2>

                <p className="mt-2 text-sm text-[#647572]">
                  Try changing your search or selecting another category.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    updateParams({ q: "", category: "all", subCategory: "all" })
                  }
                  className="mt-5 rounded-full bg-[#218F87] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#197B74]"
                >
                  View All Services
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {isBookingOpen && bookingService && (
        <CurrentBookingModal
          service={bookingService}
          allServices={allServices ?? services}
          categories={allCategories}
          branches={branches}
          bookingState={pendingBooking}
          onBookingChange={setPendingBooking}
          onBookingComplete={() => setPendingBooking(null)}
          serviceToAdd={serviceToAdd}
          onServiceAdded={(service) => {
            setPendingBooking((current) =>
              addServiceToBooking(current, service),
            );
            setServiceToAdd(null);
          }}
          initialStep={pendingBooking ? "booking" : "studio"}
          onClose={closeBooking}
        />
      )}

      {!isBookingOpen && pendingBooking?.selectedServices?.length > 0 && (
        <PendingBookingBar
          booking={pendingBooking}
          onClear={() => setPendingBooking(null)}
          onReview={() => {
            setBookingService(pendingBooking.selectedServices[0].service);
            setServiceToAdd(null);
            setIsBookingOpen(true);
          }}
        />
      )}
    </>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ServicesContent />
    </Suspense>
  );
}
