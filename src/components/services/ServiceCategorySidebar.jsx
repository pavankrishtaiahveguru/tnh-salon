"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { serviceCategories } from "@/data/serviceCategories";

export default function ServiceCategorySidebar({
  activeCategory,
  setActiveCategory,
}) {
  const sidebarRef = useRef(null);

  const scrollSidebar = (direction) => {
    if (!sidebarRef.current) return;

    sidebarRef.current.scrollBy({
      top: direction === "up" ? -250 : 250,
      behavior: "smooth",
    });
  };

  return (
    <aside className="relative w-full lg:w-[250px] lg:shrink-0">
      {/* Mobile / Tablet */}
      <div className="lg:hidden">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-3">
          {/* All Services */}
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`group flex w-[100px] shrink-0 flex-col text-left transition-all duration-300 ${
              activeCategory === "all" ? "scale-[1.02]" : ""
            }`}
          >
            <div
              className={`relative aspect-square overflow-hidden rounded-2xl border transition-all duration-300 ${
                activeCategory === "all"
                  ? "border-[#218F87] ring-2 ring-[#218F87]/15"
                  : "border-[#E2EBE9]"
              }`}
            >
              <div className="flex h-full w-full items-center justify-center bg-[#EAF5F3]">
                <span className="text-center text-xs font-semibold text-[#218F87]">
                  All
                  <br />
                  Services
                </span>
              </div>
            </div>

            <h3
              className={`mt-2 text-xs font-semibold leading-4 ${
                activeCategory === "all" ? "text-[#218F87]" : "text-[#173B38]"
              }`}
            >
              All Services
            </h3>
          </button>

          {serviceCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`group flex w-[100px] shrink-0 flex-col text-left transition-all duration-300 ${
                activeCategory === category.id ? "scale-[1.02]" : ""
              }`}
            >
              <div
                className={`relative aspect-square overflow-hidden rounded-2xl border bg-[#F1F6F5] transition-all duration-300 ${
                  activeCategory === category.id
                    ? "border-[#218F87] ring-2 ring-[#218F87]/15"
                    : "border-[#E2EBE9]"
                }`}
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-xs font-medium text-[#218F87]">
                    {category.name}
                  </div>
                )}
              </div>

              <h3
                className={`mt-2 line-clamp-2 text-xs font-semibold leading-4 ${
                  activeCategory === category.id
                    ? "text-[#218F87]"
                    : "text-[#173B38]"
                }`}
              >
                {category.name}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Category Grid */}
      <div className="relative hidden lg:block">
        <div className="sticky top-28">
          {/* Header */}
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#218F87]">
              Select services
            </p>
          </div>

          {/* Category Cards */}
          <div
            ref={sidebarRef}
            className="scrollbar-hide max-h-[calc(100vh-220px)] overflow-y-auto pr-1"
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {/* All Services */}
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="group text-left"
              >
                <div
                  className={`relative aspect-square overflow-hidden rounded-xl border transition-all duration-300 ${
                    activeCategory === "all"
                      ? "border-[#218F87] ring-2 ring-[#218F87]/15"
                      : "border-[#E2EBE9]"
                  }`}
                >
                  <div className="flex h-full w-full items-center justify-center bg-[#EAF5F3]">
                    <span className="text-center text-sm font-semibold leading-5 text-[#218F87]">
                      All
                      <br />
                      Services
                    </span>
                  </div>
                </div>

                <h3
                  className={`mt-2 text-sm font-semibold leading-5 ${
                    activeCategory === "all"
                      ? "text-[#218F87]"
                      : "text-[#173B38]"
                  }`}
                >
                  All Services
                </h3>
              </button>

              {serviceCategories.map((category) => {
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className="group text-left"
                  >
                    {/* Image */}
                    <div
                      className={`relative aspect-square overflow-hidden rounded-xl border bg-[#F1F6F5] transition-all duration-300 ${
                        isActive
                          ? "border-[#218F87] ring-2 ring-[#218F87]/15"
                          : "border-[#E2EBE9]"
                      }`}
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[#218F87]">
                          {category.name}
                        </div>
                      )}

                      {/* Active Overlay */}
                      {isActive && (
                        <div className="absolute inset-0 bg-[#218F87]/10" />
                      )}
                    </div>

                    {/* Name */}
                    <h3
                      className={`mt-2 line-clamp-2 text-sm font-semibold leading-5 transition-colors ${
                        isActive
                          ? "text-[#218F87]"
                          : "text-[#173B38] group-hover:text-[#218F87]"
                      }`}
                    >
                      {category.name}
                    </h3>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scroll Controls */}
          <div className="mt-5 flex overflow-hidden rounded-xl border border-[#DCE8E5] bg-white">
            <button
              type="button"
              onClick={() => scrollSidebar("up")}
              aria-label="Scroll categories up"
              className="flex h-9 flex-1 items-center justify-center border-r border-[#E8EFED] text-[#647572] transition-colors hover:bg-[#EAF5F3] hover:text-[#218F87]"
            >
              <ChevronLeft size={17} className="rotate-90" />
            </button>

            <button
              type="button"
              onClick={() => scrollSidebar("down")}
              aria-label="Scroll categories down"
              className="flex h-9 flex-1 items-center justify-center text-[#647572] transition-colors hover:bg-[#EAF5F3] hover:text-[#218F87]"
            >
              <ChevronRight size={17} className="rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
