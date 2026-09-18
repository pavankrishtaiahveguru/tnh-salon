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
  AlertCircle,
} from "lucide-react";

import ServicesHero from "@/components/services/ServicesHero";
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

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      aria-pressed={isSelected}
      className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-all ${
        isSelected
          ? "border-transparent bg-[#218F87] text-white"
          : "border-[#DCE8E5] bg-transparent text-[#173B38] hover:bg-[#EEF6F4]"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ${
          isSelected ? "bg-white/15" : "bg-[#EEF6F4]"
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
          <Icon
            size={17}
            className={isSelected ? "text-white" : "text-[#218F87]"}
          />
        )}
      </div>

      <span
        className={`text-[11px] leading-tight ${
          isSelected ? "font-semibold text-white" : "font-medium text-[#173B38]"
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

  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [facetCategory, setFacetCategory] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [servicesError, setServicesError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [allServices, setAllServices] = useState(null); // booking catalogue
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

    // Current filter shape, shared by the page-1 fetch, View More, and the
    // retry action — so every request carries the SAME filters.
    const filters = {
      limit: SERVICES_PAGE_SIZE,
      search,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      subCategory:
        selectedSubCategory !== "all" ? selectedSubCategory : undefined,
      branch: selectedBranch === "all" ? "both" : selectedBranch,
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

  const handleSelectCategory = (id) =>
    updateParams({ category: id, subCategory: "all" });
  const handleSelectSubCategory = (name) => updateParams({ subCategory: name });
  const handleSortChange = (value) => updateParams({ sort: value });
  const handleBranchChange = (value) => updateParams({ branch: value });

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
        serviceCount={pagination?.total ?? services.length}
        categoryCount={categories.length}
        branches={branches}
      />

      {/* Services Browsing Section */}
      <section
        id="service-categories"
        className="mx-auto max-w-[1600px] bg-[#FFFDF9] px-5 pb-36 pt-8 sm:px-8 lg:px-12 lg:pb-32 lg:pt-12 xl:px-16"
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
                      onSelect={handleSelectCategory}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Services Area */}
          <div className="min-w-0">
            {/* Mobile Category Horizontal Scroll */}
            <div className="mb-3 lg:hidden overflow-hidden">
              {categoriesLoading ? (
                <CategoryStripSkeleton count={6} />
              ) : (
                <div className="flex w-full gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-hide">
                  {allCategories.map((category) => {
                    const Icon = CATEGORY_ICONS[category.id] ?? LayoutGrid;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleSelectCategory(category.id)}
                        className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl border px-2.5 py-2 text-center transition-all ${
                          isSelected
                            ? "border-transparent bg-[#218F87] text-white"
                            : "border-[#DCE8E5] bg-white text-[#173B38] hover:bg-[#EEF6F4]"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ${
                            isSelected ? "bg-white/15" : "bg-[#EEF6F4]"
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
                            <Icon
                              size={14}
                              className={
                                isSelected ? "text-white" : "text-[#218F87]"
                              }
                            />
                          )}
                        </div>

                        <span
                          className={`text-[10px] leading-tight ${
                            isSelected
                              ? "font-semibold text-white"
                              : "font-medium text-[#173B38]"
                          }`}
                        >
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search + Sort */}
            <div className="mb-7 flex flex-col gap-3 lg:flex-row">
              {/* Search */}
              <div className="relative flex-1">
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

              {/* Sort */}
              <div className="relative lg:w-48 xl:w-52">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  aria-label="Sort services"
                  className="h-12 w-full appearance-none rounded-xl border border-[#DCE8E5] bg-white px-4 pr-10 text-sm font-medium text-[#173B38] outline-none focus:border-[#218F87]"
                >
                  <option value="menu">Menu Order</option>
                  <option value="price-low">Price · Low to High</option>
                  <option value="price-high">Price · High to Low</option>
                  <option value="name">Name · A to Z</option>
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#647572]"
                />
              </div>
            </div>

            {selectedCategory !== "all" && (
              <div className="mb-5">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#718785]">
                  <span>Services</span>
                  <span aria-hidden="true">&gt;</span>
                  <span className="font-semibold text-[#09221F]">
                    {selectedCategoryName}
                  </span>
                  {selectedSubCategory !== "all" && (
                    <>
                      <span aria-hidden="true">&gt;</span>
                      <span className="font-semibold text-[#218F87]">
                        {selectedSubCategory}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSubCategory("all")}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:px-6 sm:py-3 ${
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
                      className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:px-6 sm:py-3 ${
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
                <div
                  aria-busy={isFetching}
                  className={`grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-200 ${
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
                  onClick={() => updateParams({ q: "", category: "all" })}
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
