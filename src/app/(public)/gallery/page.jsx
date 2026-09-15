"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

const galleryItems = [
  {
    category: "Hair",
    src: "/images/gallery/hair1.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "large",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair2.jpg",
    alt: "Hair transformation at The Nail Hue",
    size: "large",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair3.jpg",
    alt: "Hair colour at The Nail Hue",
    size: "medium",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair4.jpeg",
    alt: "Hair styling transformation",
    size: "small",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair6.jpeg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair7.jpeg",
    alt: "Hair styling transformation at The Nail Hue",
    size: "small",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair8.jpeg",
    alt: "Hair styling at The Nail Hue",
    size: "large",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair9.jpeg",
    alt: "Hair makeover at The Nail Hue",
    size: "medium",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair11.JPG",
    alt: "Hair styling at The Nail Hue",
    size: "small",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair12.jpeg",
    alt: "Hair transformation at The Nail Hue",
    size: "medium",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair13.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "small",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair14.JPG",
    alt: "Hair makeover at The Nail Hue",
    size: "large",
  },
  {
    category: "Hair",
    src: "/images/gallery/hair15.jpg",
    alt: "Hair styling transformation",
    size: "medium",
  },


  {
    category: "Nails",
    src: "/images/gallery/Nails.JPG",
    alt: "Nail art at The Nail Hue",
    size: "large",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails1.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails2.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "small",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails3.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails4.jpg",
    alt: "Nail art at The Nail Hue",
    size: "small",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails5.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "large",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails6.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails7.jpg",
    alt: "Nail art at The Nail Hue",
    size: "small",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails8.jpeg",
    alt: "Nail styling at The Nail Hue",
    size: "medium",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails9.jpeg",
    alt: "Nail art at The Nail Hue",
    size: "large",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails10.jpeg",
    alt: "Nail styling at The Nail Hue",
    size: "small",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails11.jpeg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    category: "Nails",
    src: "/images/gallery/nails13.jpeg",
    alt: "Nail styling at The Nail Hue",
    size: "small",
  },

  {
    category: "Skin",
    src: "/images/gallery/skin1.jpg",
    alt: "Skin treatment at The Nail Hue",
    size: "large",
  },
  {
    category: "Skin",
    src: "/images/gallery/skin2.jpg",
    alt: "Skin care treatment at The Nail Hue",
    size: "medium",
  },
  {
    category: "Skin",
    src: "/images/gallery/skin3.jpg",
    alt: "Skin treatment at The Nail Hue",
    size: "small",
  },
  {
    category: "Skin",
    src: "/images/gallery/skin4.jpg",
    alt: "Skin care at The Nail Hue",
    size: "medium",
  },
];
export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  // Generate categories dynamically from gallery items
  const filters = useMemo(() => {
    const categories = galleryItems.map((item) => item.category);

    return ["All", ...new Set(categories)];
  }, []);

  // Filter gallery items
  const filteredItems = useMemo(() => {
    if (activeFilter === "All") {
      return galleryItems;
    }

    return galleryItems.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <main className="min-h-screen bg-[#FFFDF9] px-5 pb-20 pt-28 sm:px-8 lg:px-10 lg:pb-28 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#218F87] sm:text-xs">
            Our Work
          </span>

          <h1 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-tight text-[#173B38] sm:text-5xl lg:text-6xl">
            Transformations
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#647572] sm:text-base">
            Explore our latest beauty transformations, creative looks, beautiful
            details, and salon experiences.
          </p>
        </div>

        {/* Dynamic Filters */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:mt-12">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 sm:px-6 sm:py-2.5 sm:text-xs ${
                  isActive
                    ? "border-[#218F87] bg-[#218F87] text-white shadow-md"
                    : "border-[#D9E3E0] bg-white text-[#647572] hover:border-[#218F87] hover:text-[#218F87]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Masonry Gallery */}
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-5">
          {filteredItems.map((item, index) => (
            <GalleryCard
              key={`${item.src}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-[#173B38]">
                No gallery items found
              </p>

              <p className="mt-2 text-sm text-[#647572]">
                More transformations will be added soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function GalleryCard({ item, index }) {
  return (
    <div
      className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white p-2 shadow-[0_10px_35px_rgba(23,59,56,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,59,56,0.14)] lg:mb-5"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Image */}
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-[#EEF3F1] ${
          item.size === "large"
            ? "aspect-[4/5]"
            : item.size === "medium"
              ? "aspect-[4/3]"
              : "aspect-[16/9]"
        }`}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority={index < 3}
        />

        {/* Image Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#173B38]/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Category */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex rounded-full border border-white/30 bg-[#173B38]/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
            {item.category}
          </span>
        </div>
      </div>
    </div>
  );
}
