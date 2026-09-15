"use client";

import { useMemo, useState } from "react";
import ServiceCard from "./ServiceCard";
import ServiceFilters from "./ServiceFilters";
import ServiceCategorySidebar from "./ServiceCategorySidebar";
import { services } from "@/data/services";

export default function AllServices() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("menu");

  const filteredServices = useMemo(() => {
    let result = [...services];

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter(
        (service) =>
          service.categoryId === activeCategory ||
          service.categorySlug === activeCategory ||
          service.category === activeCategory,
      );
    }

    // Search
    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((service) => {
        const searchableText = [
          service.serviceName,
          service.name,
          service.category,
          service.description,
          service.gender,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchTerm);
      });
    }

    // Sorting
    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.serviceName || a.name || "").localeCompare(
          b.serviceName || b.name || "",
        ),
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
    }

    if (sortBy === "menu") {
      result.sort(
        (a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999),
      );
    }

    return result;
  }, [activeCategory, search, sortBy]);

  return (
    <section className="bg-[#FFFDF9] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Filters */}
        <ServiceFilters
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Mobile / Tablet Categories */}
        <div className="mb-8 lg:hidden">
          <ServiceCategorySidebar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>

        {/* Main Layout */}
        <div className="flex items-start gap-8 lg:gap-10">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <ServiceCategorySidebar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>

          {/* Services */}
          <div className="min-w-0 flex-1">
            {/* Result Header */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#218F87]">
                  {activeCategory === "all"
                    ? "All Services"
                    : "Selected Category"}
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#173B38] sm:text-2xl">
                  {activeCategory === "all"
                    ? "Explore Our Services"
                    : getCategoryTitle(activeCategory)}
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-[#EAF5F3] px-3 py-1.5 text-xs font-semibold text-[#218F87]">
                {filteredServices.length}{" "}
                {filteredServices.length === 1 ? "Service" : "Services"}
              </span>
            </div>

            {/* Cards */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                search={search}
                onClear={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getStartingPrice(service) {
  if (service.fixedPrice != null) {
    return Number(service.fixedPrice) || 0;
  }

  if (service.startingPrice != null) {
    return Number(service.startingPrice) || 0;
  }

  if (Array.isArray(service.tiers) && service.tiers.length > 0) {
    const prices = service.tiers
      .map((tier) => Number(tier.price))
      .filter((price) => !Number.isNaN(price));

    return prices.length ? Math.min(...prices) : 0;
  }

  if (service.price != null) {
    return Number(service.price) || 0;
  }

  return 0;
}

function getCategoryTitle(categoryId) {
  if (categoryId === "all") {
    return "Explore Our Services";
  }

  // Lazy import is intentionally avoided here.
  // The sidebar already controls the category ID.
  return categoryId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EmptyState({ search, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#CFE0DD] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF5F3] text-xl text-[#218F87]">
        ✦
      </div>

      <h3 className="mt-5 text-lg font-semibold text-[#173B38]">
        No services found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647572]">
        {search
          ? `We couldn't find any services matching "${search}".`
          : "There are no services available in this category right now."}
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-full bg-[#218F87] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#197B74]"
      >
        View All Services
      </button>
    </div>
  );
}
