"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  Scissors,
  Hand,
  Droplets,
  Sparkles,
  Palette,
  Waves,
  Sun,
  Smile,
  SprayCan,
  Flower2,
  Gem,
  User,
  Brush,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { serviceCategories } from "@/data/serviceCategories";

const iconMap = {
  scissors: Scissors,
  hand: Hand,
  droplets: Droplets,
  sparkles: Sparkles,
  palette: Palette,
  waves: Waves,
  sun: Sun,
  smile: Smile,
  "spray-can": SprayCan,
  flower: Flower2,
  gem: Gem,
  user: User,
  brush: Brush,
  heart: Heart,
  eye: Eye,
};

// Shared card renderer so mobile/tablet grid and desktop carousel use the
// exact same card design (border, icon, colors, typography) — single source
// of truth, no duplicated category data or link logic.
function CategoryCard({ category, imageSizes }) {
  const Icon = iconMap[category.icon];

  return (
    <Link
      href={`/services/all?category=${category.id}`}
      data-service-item
      className="group flex w-full min-w-0 flex-col items-center text-center"
    >
      {/* Icon / Image */}
      <div className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-[#F1F6F5] transition-transform duration-300 group-hover:scale-105 sm:h-[84px] sm:w-[84px] lg:h-[96px] lg:w-[96px]">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes={imageSizes}
            className="object-cover"
          />
        ) : Icon ? (
          <Icon size={30} strokeWidth={1.5} className="text-[#218F87]" />
        ) : null}
      </div>

      {/* Service Name */}
      <h3 className="mt-3 line-clamp-2 text-[11px] font-semibold leading-4 text-[#173B38] transition-colors duration-300 group-hover:text-[#218F87] sm:text-xs lg:text-[13px]">
        {category.name}
      </h3>
    </Link>
  );
}

export default function ServiceCategories() {
  const scrollRef = useRef(null);

  // Desktop-only: scrolls the horizontal carousel. On mobile/tablet the
  // layout is a CSS grid (no overflow), so this never fires there — the
  // arrows themselves are hidden below md/lg.
  const scrollServices = (direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const firstItem = container.querySelector("[data-service-item]");

    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth;
    const styles = window.getComputedStyle(container);
    const gap = parseFloat(styles.columnGap || styles.gap || 0);

    const scrollAmount = (itemWidth + gap) * 2;

    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="service-categories"
      className="bg-white px-5 py-12 sm:px-8 lg:px-10 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#218F87] sm:text-xs">
            Explore Our Services
          </span>
        </div>

        {/* Mobile / Tablet: responsive grid — all categories, no horizontal scrolling */}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:hidden">
          {serviceCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              imageSizes="96px"
            />
          ))}
        </div>

        {/* Desktop: existing horizontal carousel — unchanged */}
        <div className="relative hidden md:block">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => scrollServices("left")}
            aria-label="Previous services"
            className="absolute -left-10 top-1/3 z-20 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#DCE8E5] bg-white text-[#218F87] shadow-md transition-all duration-300 hover:bg-[#218F87] hover:text-white md:flex"
          >
            <ChevronLeft size={20} strokeWidth={1.8} />
          </button>

          {/* Scroll Area */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-5 overflow-x-auto scroll-smooth sm:gap-6 lg:gap-7"
          >
            {serviceCategories.map((category) => (
              <div
                key={category.id}
                className="w-[72px] shrink-0 sm:w-[88px] lg:w-[100px]"
              >
                <CategoryCard category={category} imageSizes="96px" />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => scrollServices("right")}
            aria-label="Next services"
            className="absolute -right-6 top-1/3 z-20 hidden h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#DCE8E5] bg-white text-[#218F87] shadow-md transition-all duration-300 hover:bg-[#218F87] hover:text-white md:flex"
          >
            <ChevronRight size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </section>
  );
}
