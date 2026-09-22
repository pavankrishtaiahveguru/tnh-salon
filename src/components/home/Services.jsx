import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const services = [
  {
    name: "Hair Colour & Colour Correction",
    category: "Hair",
    description:
      "Professional hair colour services including balayage, global colour, grey coverage, grey blending and colour correction. Every colour service begins with a consultation to understand your existing colour, hair history and desired result.",
    image: "/images/services/hair-colour.jpg",
    size: "large",
  },

  {
    name: "Hair Cut, Styling & Treatments",
    category: "Hair",
    description:
      "Professional haircuts, styling, hair spa and treatments tailored to your hair type, condition and desired look.",
    image: "/images/services/hair-cut-and-styling.jpg",
    size: "large",
  },

  {
    name: "Facials & Korean Skincare",
    category: "Skin",
    description:
      "Korean facials, hydrafacial and consultation-led skin treatments. We match the facial to your skin concern, not to a package.",
    image: "/images/services/facial.jpg",
    size: "large",
  },
  {
    name: "Nails — Manicure, Pedicure, Extensions & Nail Art",
    category: "Nails",
    description:
      "Manicure, Pedicure, nail extensions, BIAB, Russian manicure, Infills/Refills, safe nail removal and custom nail art including French, chrome and 3D designs.",
    image: "/images/services/nails.jpg",
    size: "medium",
  },

  {
    name: "Waxing & De-Tan",
    category: "Skin",
    description:
      "Waxing and de-tan for face and body. Single-use spatulas, hygiene protocol shared openly, with appointments available at both salons.",
    image: "/images/services/detan-waxing.jpeg",
    size: "medium",
  },

  {
    name: "Brows & Lashes",
    category: "Beauty",
    description:
      "Brow mapping, threading, waxing, tinting and lash treatments at The Nail Hue, Indiranagar and Sarjapur Road. Shape planned to your face and growth pattern.",
    image: "/images/services/brows-lashes.jpg",
    size: "medium",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="bg-[#FFFDF9] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#218F87]">
            What We Offer
          </span>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#173B38] sm:text-5xl">
            Our Services
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#647572] sm:text-base">
            Discover our carefully curated beauty services designed to help you
            look and feel your best.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.name}
              href="/services"
              className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(33,143,135,0.08)] ring-1 ring-[#218F87]/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(33,143,135,0.16)]"
            >
              {/* Image */}
              <div
                className={`relative w-full overflow-hidden ${
                  service.size === "large"
                    ? "aspect-[4/5]"
                    : service.size === "medium"
                      ? "aspect-square"
                      : service.size === "portrait"
                        ? "aspect-[2/3]"
                        : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={service.image}
                  alt={`${service.name} at The Nail Hue`}
                  fill
                  loading="eager"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                {/* Category */}
                <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#218F87] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {service.category}
                </div>

                {/* Arrow */}
                <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#218F87] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowRight size={17} />
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 w-full p-5">
                  <h4 className="text-xl font-semibold leading-tight text-white sm:text-2xl">
                    {service.name}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <div className="p-5">
                <p className="text-sm leading-6 text-[#647572]">
                  {service.description}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#218F87]">
                  Explore Services
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Services */}
        <div className="mt-14 flex justify-center lg:mt-16">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full bg-[#218F87] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#197B74] hover:shadow-lg"
          >
            View All Services
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
