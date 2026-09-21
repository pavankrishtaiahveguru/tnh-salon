"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Droplet,
  Droplets,
  Eye,
  Flame,
  FlaskConical,
  Gem,
  Hand,
  LayoutGrid,
  Leaf,
  Palette,
  Paintbrush,
  PersonStanding,
  Plus,
  Scissors,
  Search,
  Smile,
  Sparkles,
  Sun,
  Waves,
  X,
} from "lucide-react";
import {
  formatPrice,
  getBasePrice,
  getVariants,
  isServiceAvailableAtStudio,
} from "./bookingUtils";

export default function ServiceCategorySelector({
  categories,
  allServices,
  selectedServices,
  selectedStudio,
  studios,
  onContinue,
  onBack,
  onClose,
}) {
  const [categoryId, setCategoryId] = useState(null);
  const [subCategory, setSubCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [pendingIds, setPendingIds] = useState(
    () => new Set(selectedServices.map((entry) => entry.service.id)),
  );

  const selectedStudioData = studios.find(
    (studio) => studio.id === selectedStudio,
  );
  const categoryServices = useMemo(
    () =>
      allServices.filter(
        (service) =>
          (!categoryId ||
            categoryId === "all" ||
            service.categoryId === categoryId) &&
          (!selectedStudioData ||
            isServiceAvailableAtStudio(service, selectedStudioData)),
      ),
    [categoryId, allServices, selectedStudioData],
  );
  const subCategories = useMemo(() => {
    const counts = categoryServices.reduce((result, service) => {
      if (service.subCategory) {
        result[service.subCategory] = (result[service.subCategory] ?? 0) + 1;
      }
      return result;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [categoryServices]);
  const visibleServices = categoryServices.filter((service) => {
    const matchesSubCategory =
      subCategory === "all" || service.subCategory === subCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        service.name,
        service.category,
        service.subCategory,
        service.gender,
        service.description,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    return matchesSubCategory && matchesSearch;
  });

  function handleCategoryChange(nextCategoryId) {
    setCategoryId(nextCategoryId);
    setSubCategory("all");
    setSearch("");
  }

  function toggleService(service) {
    setPendingIds((current) => {
      const next = new Set(current);
      if (next.has(service.id)) {
        if (selectedServices.some((entry) => entry.service.id === service.id))
          return next;
        next.delete(service.id);
      } else {
        next.add(service.id);
      }
      return next;
    });
  }

  const selectedCount = pendingIds.size;
  const selectedCategoryName = categories.find(
    (category) => category.id === categoryId,
  )?.name;
  const categoryIcons = {
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#E4EFED] px-4 py-3.5">
        <button
          type="button"
          onClick={
            // Back walks up one level: Services → Subcategory list → Category
            // list → booking. Category/subcategory data stays untouched.
            categoryId && subCategory !== "all"
              ? () => setSubCategory("all")
              : categoryId
                ? () => handleCategoryChange(null)
                : onBack
          }
          aria-label="Back"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCEAE8] text-[#718785] hover:bg-[#F1F8F6]"
        >
          <ArrowLeft size={15} />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-[#09221F]">
          {!categoryId
            ? `Add a service · ${selectedCount} selected`
            : subCategory === "all"
              ? `Select subcategory · ${selectedCategoryName}`
              : `${selectedCategoryName} · ${subCategory}`}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close add service"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DCEAE8] text-[#718785] hover:bg-[#F1F8F6]"
        >
          <X size={15} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 [scrollbar-width:thin]">
        {selectedStudioData && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#BFE3DE] bg-[#F1FAF8] px-3 py-2.5 text-xs text-[#285F5A]">
            <Check size={15} className="mt-0.5 shrink-0 text-[#218F87]" />
            <p>
              Services available at <strong>{selectedStudioData.name}</strong>
            </p>
          </div>
        )}

        {!categoryId ? (
          <div className="space-y-2">
            {categories.map((category) => {
              const count =
                category.id === "all"
                  ? categoryServices.length
                  : categoryServices.filter(
                      (service) => service.categoryId === category.id,
                    ).length;
              const Icon = categoryIcons[category.id] ?? LayoutGrid;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex min-h-[72px] w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors sm:min-h-[78px] sm:px-3.5 ${
                    categoryId === category.id
                      ? "border-[#28B8B0] bg-[#F1FAF8]"
                      : "border-[#DCEAE8] bg-white hover:border-[#28B8B0] hover:bg-[#F6FBFA]"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#218F87] sm:h-12 sm:w-12">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-[#09221F] sm:text-sm">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-[#718785] sm:text-[10px]">
                      {count} services
                    </span>
                  </span>
                  <span className="shrink-0 text-lg leading-none text-[#28B8B0]">
                    &rarr;
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="relative mb-3">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#718785]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search the whole menu"
                className="w-full rounded-lg border border-[#DCEAE8] py-2.5 pl-9 pr-3 text-xs text-[#09221F] outline-none focus:border-[#28B8B0]"
              />
            </div>
            {/* Subcategory step (Parts 18–20): the chips carry live counts
                computed from the same mapped catalogue the Services page uses
                (service.subCategory ← subcategory_name), so both flows stay
                consistent with the backend data. Wraps — never overflows. */}
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#718785]">
              Subcategory
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSubCategory("all")}
                className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${subCategory === "all" ? "border-[#3DD4C8] bg-[#3DD4C8] text-[#09221F]" : "border-[#D7EAE7] bg-white text-[#456764]"}`}
              >
                All {selectedCategoryName}
              </button>
              {subCategories.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSubCategory(item.name)}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${subCategory === item.name ? "border-[#3DD4C8] bg-[#3DD4C8] text-[#09221F]" : "border-[#D7EAE7] bg-white text-[#456764]"}`}
                >
                  {item.name} {item.count}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {visibleServices.length > 0 ? (
                visibleServices.map((service) => {
                  const variants = getVariants(service);
                  const selected = pendingIds.has(service.id);
                  const alreadyBooked = selectedServices.some(
                    (entry) => entry.service.id === service.id,
                  );
                  return (
                    <div
                      key={service.id}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${selected ? "border-[#28B8B0] bg-[#F1FAF8]" : "border-[#DCEAE8]"}`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E8F6F4]">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#28B8B0]">
                            {service.name?.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#09221F]">
                          {service.name}
                        </p>
                        <p className="mt-0.5 text-[9px] text-[#718785]">
                          {service.gender || "Unisex"}{" "}
                          {service.duration ? `· ${service.duration}` : ""}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-[#218F87]">
                          {variants.length
                            ? `From ${formatPrice(getBasePrice(service))}`
                            : formatPrice(service.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={alreadyBooked}
                        onClick={() => toggleService(service)}
                        className="flex items-center gap-1 rounded-lg bg-[#09221F] px-2.5 py-2 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#DCEAE8] disabled:text-[#718785]"
                      >
                        {selected ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-[#D7EAE7] px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-[#09221F]">
                    No additional services are available
                    {selectedStudioData ? ` at ${selectedStudioData.name}` : ""}
                    .
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {categoryId && (
        <div className="shrink-0 border-t border-[#E4EFED] bg-white p-3">
          <button
            type="button"
            onClick={() =>
              onContinue(
                allServices.filter((service) => pendingIds.has(service.id)),
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28B8B0] px-4 py-3 text-xs font-bold text-white hover:bg-[#218F87]"
          >
            Continue with {selectedCount}{" "}
            {selectedCount === 1 ? "service" : "services"}
          </button>
        </div>
      )}
    </div>
  );
}
