"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

const galleryItems = [
  {
    type: "video",
    category: "MIX",
    src: "https://res.cloudinary.com/eumjdehq/video/upload/v1789723022/Mix.mp4",
    alt: "Skin care at The Nail Hue",
    size: "portrait",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724022/hair1.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "large",
  },
  {
    type: "video",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/video/upload/v1789723009/hair.mp4",
    alt: "Hair care at The Nail Hue",
    size: "portrait",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724007/hair2.jpg",
    alt: "Hair transformation at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724012/hair3.jpg",
    alt: "Hair colour at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789723991/hair4.jpg",
    alt: "Hair styling transformation",
    size: "small",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724056/hair6.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724008/hair7.jpg",
    alt: "Hair styling transformation at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789723996/hair8.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789723975/hair9.jpg",
    alt: "Hair makeover at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724003/hair11.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789723974/hair12.jpg",
    alt: "Hair transformation at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789723981/hair13.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789723964/hair14.jpg",
    alt: "Hair makeover at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789723953/hair15.jpg",
    alt: "Hair styling transformation",
    size: "medium",
  },

  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724154/Nails.jpg",
    alt: "Nail art at The Nail Hue",
    size: "large",
  },
  {
    type: "video",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/video/upload/v1789722842/Nails_1.mp4",
    alt: "Nail care at The Nail Hue",
    size: "portrait",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724152/nails1.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724160/nails2.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "small",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724063/nails3.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724056/nails4.jpg",
    alt: "Nail art at The Nail Hue",
    size: "small",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724051/nails5.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724050/nails6.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724041/nails7.jpg",
    alt: "Nail art at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724075/nails8.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724065/nails9.jpg",
    alt: "Nail art at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724037/nails10.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "small",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724089/nails11.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724025/nails13.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "small",
  },

  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724184/skin1.jpg",
    alt: "Skin treatment at The Nail Hue",
    size: "large",
  },
  {
    type: "video",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/video/upload/v1789722755/skin.mp4",
    alt: "Skin care at The Nail Hue",
    size: "portrait",
  },
  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724180/skin2.jpg",
    alt: "Skin care treatment at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724180/skin3.jpg",
    alt: "Skin treatment at The Nail Hue",
    size: "small",
  },
  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789724184/skin4.jpg",
    alt: "Skin care at The Nail Hue",
    size: "portrait",
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
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-4">
          {" "}
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
  const aspectRatio =
    item.size === "large"
      ? "aspect-[4/5]"
      : item.size === "medium"
        ? "aspect-square"
        : item.size === "portrait"
          ? "aspect-[2/3]"
          : "aspect-[4/3]";

  const isVideo = item.type === "video";

  return (
    <div
      className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white p-2 shadow-[0_10px_35px_rgba(23,59,56,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,59,56,0.14)] lg:mb-5"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-[#EEF3F1] ${aspectRatio}`}
      >
        {/* IMAGE */}
        {!isVideo && (
          <img
            src={item.src}
            alt={item.alt}
            loading={index < 3 ? "eager" : "lazy"}
            fetchPriority={index < 3 ? "high" : "auto"}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        {/* VIDEO */}
        {isVideo && (
          <video
            src={item.src}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
            preload={index < 3 ? "auto" : "metadata"}
          />
        )}

        {/* Soft Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#173B38]/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Category */}
        {item.category && item.category !== "All" && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex rounded-full border border-white/30 bg-[#173B38]/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
              {item.category}
            </span>
          </div>
        )}

        {/* Video Indicator */}
        {isVideo && (
          <div className="pointer-events-none absolute bottom-3 right-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-[#173B38]/70 text-sm text-white backdrop-blur-md">
              ▶
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
