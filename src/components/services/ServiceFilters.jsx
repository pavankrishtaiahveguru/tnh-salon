"use client";

import { Search, ChevronDown } from "lucide-react";

export default function ServiceFilters({
  search,
  setSearch,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <div className="relative w-full lg:max-w-2xl">
        <Search
          size={21}
          strokeWidth={1.8}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#173B38]"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services, e.g. gel, balayage, pedicure"
          className="h-14 w-full rounded-xl border border-[#D8E9E6] bg-white pl-12 pr-5 text-sm text-[#173B38] outline-none transition-all placeholder:text-[#7B8D89] focus:border-[#218F87] focus:ring-2 focus:ring-[#218F87]/10 sm:text-base"
        />
      </div>

      {/* Sort */}
      <div className="relative w-full lg:w-[220px]">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-14 w-full appearance-none rounded-xl border border-[#D8E9E6] bg-white px-5 pr-11 text-sm font-medium text-[#173B38] outline-none transition-all focus:border-[#218F87] focus:ring-2 focus:ring-[#218F87]/10"
        >
          <option value="menu">Sort · menu order</option>
          <option value="price-low">Price · low to high</option>
          <option value="price-high">Price · high to low</option>
          <option value="name">Name · A to Z</option>
        </select>

        <ChevronDown
          size={18}
          strokeWidth={1.8}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#173B38]"
        />
      </div>
    </div>
  );
}
