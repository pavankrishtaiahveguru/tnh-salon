"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
  X,
  Check,
} from "lucide-react";

import ServicesHero from "@/components/services/ServicesHero";
import ServiceCard from "@/components/services/ServiceCard";
import CurrentBookingModal from "@/components/services/BookingModal";
import PendingBookingBar from "@/components/services/PendingBookingBar";
import { getServices } from "@/lib/admin/services";
import { getCategories } from "@/lib/admin/categories";
import { getBranches } from "@/lib/branches";
import {
  areServicesAvailableAtStudio,
  isServiceAvailableAtStudio,
} from "@/components/services/bookingUtils";

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

function getMinPrice(service) {
  if (service.pricingType === "fixed" || service.pricingType === "from") {
    return service.price ?? Number.MAX_SAFE_INTEGER;
  }
  if (service.variants && service.variants.length > 0) {
    return Math.min(...service.variants.map((v) => v.price));
  }
  return Number.MAX_SAFE_INTEGER;
}

function getMaxPrice(service) {
  if (service.pricingType === "fixed" || service.pricingType === "from") {
    return service.price ?? 0;
  }
  if (service.variants && service.variants.length > 0) {
    return Math.max(...service.variants.map((v) => v.price));
  }
  return 0;
}

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

function BookingModal({ service, bookingStep, setBookingStep, onClose }) {
  if (!service) return null;

  const variants = service.variants ?? [];
  const startingPrice =
    service.price ?? variants[0]?.price ?? service.priceRange?.min ?? null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#09221F]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-[0_25px_80px_rgba(9,34,31,0.2)] sm:max-w-[520px] sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E3EFED] bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#218F87]">
              Book appointment
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#09221F]">
              {service.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF6F4] text-[#285F5A] transition-colors hover:bg-[#DCEEEB]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {bookingStep === "service" ? (
            <>
              <div className="rounded-2xl border border-[#D7EAE7] bg-[#FAFCFB] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#E8F6F4]">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-[#28B8B0]">
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
                    <h3 className="mt-1 text-base font-bold text-[#09221F]">
                      {service.name}
                    </h3>
                  </div>
                </div>

                {service.description && (
                  <p className="mt-4 text-sm leading-6 text-[#718785]">
                    {service.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {service.gender && (
                    <span className="rounded-lg bg-[#EAF5F3] px-3 py-1.5 text-xs font-medium text-[#285F5A]">
                      {service.gender}
                    </span>
                  )}
                  {service.duration && (
                    <span className="rounded-lg bg-[#EAF5F3] px-3 py-1.5 text-xs font-medium text-[#456764]">
                      {service.duration}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-dashed border-[#D7EAE7] pt-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A8D8A]">
                  {variants.length > 0 ? "Choose a service option" : "Price"}
                </p>

                {variants.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {variants.map((variant, index) => (
                      <button
                        key={`${variant.label}-${index}`}
                        type="button"
                        onClick={() => setBookingStep(`variant-${index}`)}
                        className="rounded-xl border border-[#D7EAE7] bg-white p-3 text-left transition-all hover:border-[#28B8B0] hover:bg-[#F3FAF9]"
                      >
                        <p className="text-base font-bold text-[#09221F]">
                          ₹{variant.price}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-[#718785]">
                          {variant.label}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-2xl font-bold text-[#09221F]">
                    {startingPrice != null
                      ? `₹${startingPrice}`
                      : "Price on request"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setBookingStep("details")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#09221F] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#218F87]"
              >
                <Check size={17} />
                Continue Booking
              </button>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F6F4] text-[#218F87]">
                <Check size={26} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#09221F]">
                {bookingStep.startsWith("variant-")
                  ? "Option selected"
                  : "Service selected"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#718785]">
                {service.name} is ready to book. Continue with your appointment
                details.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-[#09221F] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#218F87]"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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

  const search = searchParams.get("q") ?? "";
  const sortBy = searchParams.get("sort") ?? "menu";
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [servicesError, setServicesError] = useState("");

  const branchParam = searchParams.get("branch") ?? "all";
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

  const categoryParam = searchParams.get("category");
  const selectedCategory =
    categoryParam && allCategories.some((c) => c.id === categoryParam)
      ? categoryParam
      : "all";

  // Loading state: true on mount and whenever the branch selection changes,
  // derived from the fetch sequence rather than a setState inside the effect.
  const [fetchedBranch, setFetchedBranch] = useState(branchParam);
  const servicesLoading = fetchedBranch !== branchParam;

  useEffect(() => {
    let active = true;

    Promise.all([
      // The backend filters via service_branches. "Both branches" (default)
      // maps to branch=both — available at either branch.
      getServices({
        status: "Active",
        branch: selectedBranch === "all" ? "both" : selectedBranch,
      }),
      getCategories(),
      getBranches(),
    ])
      .then(([serviceData, categoryData, branchData]) => {
        if (!active) return;
        setServices(serviceData);
        setCategories(categoryData);
        setBranches(branchData);
        setFetchedBranch(branchParam);
      })
      .catch(() => {
        if (active) {
          setServicesError("Unable to load services and locations.");
          setFetchedBranch(branchParam);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedBranch, branchParam]);

  const subCategoryParam = searchParams.get("subCategory");
  const categoryServices = services.filter(
    (service) =>
      selectedCategory !== "all" && service.categoryId === selectedCategory,
  );
  const subCategoryCounts = categoryServices.reduce((counts, service) => {
    if (service.subCategory) {
      counts[service.subCategory] = (counts[service.subCategory] ?? 0) + 1;
    }
    return counts;
  }, {});
  const availableSubCategories = Object.entries(subCategoryCounts).map(
    ([name, count]) => ({ name, count }),
  );
  const selectedSubCategory = availableSubCategories.some(
    (subCategory) => subCategory.name === subCategoryParam,
  )
    ? subCategoryParam
    : "all";

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

    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleSelectCategory = (id) =>
    updateParams({ category: id, subCategory: "all" });
  const handleSelectSubCategory = (name) => updateParams({ subCategory: name });
  const handleSearchChange = (value) => updateParams({ q: value });
  const handleSortChange = (value) => updateParams({ sort: value });
  const handleBranchChange = (value) => updateParams({ branch: value });

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

  const selectedCategoryName =
    selectedCategory !== "all"
      ? allCategories.find((c) => c.id === selectedCategory)?.name
      : null;

  const filteredServices = useMemo(() => {
    let result = [...services];

    // Category filter — match on categoryId, not the display-name category field.
    if (selectedCategory !== "all") {
      result = result.filter(
        (service) => service.categoryId === selectedCategory,
      );
    }

    if (selectedSubCategory !== "all") {
      result = result.filter(
        (service) => service.subCategory === selectedSubCategory,
      );
    }

    if (selectedBranch !== "all") {
      // The API already restricts services to the selected branch via
      // service_branches; this client-side guard only trims stale rows while
      // a re-fetch is in flight. branchIds holds branch slugs (see
      // lib/admin/services.js mapServiceRow).
      result = result.filter((service) =>
        service.branchIds?.includes(selectedBranch),
      );
    }

    // Search
    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((service) =>
        [
          service.name,
          service.category,
          service.subCategory,
          service.gender,
          service.description,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query)),
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => getMaxPrice(b) - getMaxPrice(a));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    // "menu" keeps the original catalog order — no sort needed.

    return result;
  }, [
    services,
    search,
    selectedCategory,
    selectedSubCategory,
    selectedBranch,
    sortBy,
  ]);

  return (
    <>
      <ServicesHero
        serviceCount={services.length}
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
            </div>
          </aside>

          {/* Services Area */}
          <div className="min-w-0">
            {/* Mobile Category Horizontal Scroll */}
            <div className="mb-3 lg:hidden overflow-hidden">
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
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search services, e.g. balayage, pedicure"
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
                  {filteredServices.length}
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
            {servicesLoading ? (
              <p className="text-sm text-[#647572]">Loading services…</p>
            ) : servicesError ? (
              <p className="text-sm text-[#A94B4B]">{servicesError}</p>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBook={handleBook}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#DCE8E5] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF6F4] text-[#218F87]">
                  <Search size={24} />
                </div>

                <h2 className="mt-5 text-lg font-semibold text-[#173B38]">
                  No services found
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
          allServices={services}
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
