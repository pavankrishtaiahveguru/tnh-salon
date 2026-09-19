"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FaInstagram } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

const galleryItems = [
  // =========================
  // SKIN VIDEO
  // =========================
  {
    type: "video",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/video/upload/v1789723022/Mix.mp4",
    alt: "Skin care at The Nail Hue",
    size: "portrait",
  },

  // =========================
  // HAIR VIDEO
  // =========================
  {
    type: "video",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/video/upload/v1789723009/hair.mp4",
    alt: "Hair care at The Nail Hue",
    size: "portrait",
  },

  // =========================
  // HAIR IMAGES
  // =========================
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825027/hair-13.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825026/hair-14.jpg",
    alt: "Hair transformation at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825026/hair-12.jpg",
    alt: "Hair colour at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825026/hair-10.jpg",
    alt: "Hair styling transformation",
    size: "small",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825025/hair-11.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825025/hair-09.jpg",
    alt: "Hair styling transformation at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825024/hair-08.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825023/hair-06.jpg",
    alt: "Hair makeover at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825023/hair-07.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825023/hair-05.jpg",
    alt: "Hair styling transformation",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825022/hair-04.jpg",
    alt: "Hair transformation at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825021/hair-01.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825021/hair-03.jpg",
    alt: "Hair styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Hair",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825021/hair-02.jpg",
    alt: "Hair makeover at The Nail Hue",
    size: "large",
  },

  // =========================
  // NAILS
  // =========================
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825006/nails-013.jpg",
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
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825005/nails-011.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825005/nails-012.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825004/nails-010.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825003/nails-009.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825003/nails-006.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825003/nails-008.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825002/nails-007.jpg",
    alt: "Nail art at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825002/nails-005.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825001/nails-004.jpg",
    alt: "Nail art at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825001/nails-003.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825001/nails-002.jpg",
    alt: "Nail art at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Nails",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825000/nails-001.jpg",
    alt: "Nail styling at The Nail Hue",
    size: "medium",
  },

  // =========================
  // BTS
  // =========================
  {
    type: "image",
    category: "BTS",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825043/bts-05.jpg",
    alt: "Behind the scenes at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "BTS",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825042/bts-03.jpg",
    alt: "Behind the scenes at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "BTS",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825042/bts-04.jpg",
    alt: "Behind the scenes at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "BTS",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825041/bts-02.jpg",
    alt: "Behind the scenes at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "BTS",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789825040/bts-01.jpg",
    alt: "Behind the scenes at The Nail Hue",
    size: "medium",
  },

  // =========================
  // OTHERS
  // =========================
  {
    type: "image",
    category: "Others",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789824987/others-01.jpg",
    alt: "Salon experience at The Nail Hue",
    size: "large",
  },
  {
    type: "image",
    category: "Others",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789824985/others-02.jpg",
    alt: "Beauty experience at The Nail Hue",
    size: "medium",
  },

  // =========================
  // SKIN
  // =========================
  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789824968/skin-004.jpg",
    alt: "Skin treatment at The Nail Hue",
    size: "large",
  },
  {
    type: "video",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/video/upload/v1789729336/skin.mp4",
    alt: "Skin care at The Nail Hue",
    size: "portrait",
  },
  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789824968/skin-002.jpg",
    alt: "Skin care treatment at The Nail Hue",
    size: "medium",
  },
  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789824968/skin-003.jpg",
    alt: "Skin treatment at The Nail Hue",
    size: "small",
  },
  {
    type: "image",
    category: "Skin",
    src: "https://res.cloudinary.com/eumjdehq/image/upload/v1789824968/skin-001.jpg",
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

        {/* Instagram CTA */}
        <InstagramCta />
      </div>
    </main>
  );
}

function InstagramCta() {
  return (
    <section
      aria-labelledby="instagram-cta-heading"
      className="animate-fade-up mt-12 sm:mt-14 lg:mt-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#FEDA75_0%,#FA7E1E_18%,#D62976_48%,#962FBF_74%,#4F5BD5_100%)] px-4 py-9 text-center sm:rounded-[30px] sm:px-8 sm:py-11 lg:rounded-[36px] lg:px-6 lg:py-14">
          {/* Soft color glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(79,91,213,0.45),transparent_60%)]"
          />

          <div className="relative">
            {/* Instagram Icon */}
            <FaInstagram
              aria-hidden="true"
              size={56}
              className="mx-auto h-9 w-9 text-white sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            />

            {/* Heading */}
            <h2
              id="instagram-cta-heading"
              className="mt-4 font-serif text-2xl font-medium leading-tight tracking-tight text-white sm:mt-5 sm:text-3xl lg:mt-6 lg:text-4xl"
            >
              This is just a glimpse.
            </h2>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white sm:mt-4 sm:max-w-3xl sm:text-base lg:text-lg">
              We post new transformations, behind-the-scenes and client results
              almost daily — see the full archive on Instagram.
            </p>

            {/* Instagram Button */}
            <a
              href="https://www.instagram.com/thenailhue?igsh=aDR0bmltaGhrNWt0"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow The Nail Hue on Instagram"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#D62976] shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.22)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-7 sm:px-7 sm:py-3.5 sm:text-sm lg:text-base"
            >
              Follow @thenailhue
              <FiArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
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
