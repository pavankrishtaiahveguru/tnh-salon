import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const services = [
  {
    name: "Hair Cut and Styling",
    category: "Hair",
    image: "/images/services/hair-cut-and-styling.jpg",
  },
  {
    name: "Hair Colour",
    category: "Hair",
    image: "/images/services/hair-colour.jpg",
  },
  {
    name: "Hair Spa",
    category: "Hair",
    image: "/images/services/hair-colour.jpg",
  },
  {
    name: "Pedi",
    category: "Nails",
    image: "/images/services/nail-art.jpg",
  },
  {
    name: "Nail Extensions",
    category: "Nails",
    image: "/images/services/nail-extensions.jpg",
  },
  {
    name: "Nail Art",
    category: "Nails",
    image: "/images/services/nail.jpg",
  },
  {
    name: "Facial",
    category: "Skin",
    image: "/images/services/facial.jpg",
  },
  {
    name: "Cleanup",
    category: "Skin",
    image: "/images/services/pedi.jpg",
  },
  {
    name: "D-Tan",
    category: "Skin",
    image: "/images/services/facial.jpg",
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
              className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(33,143,135,0.08)] ring-1 ring-[#218F87]/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(33,143,135,0.16)]"
            >
              {/* Category Badge */}
              <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-[#218F87] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {service.category}
              </div>

              {/* Image */}
              <div className="relative h-64 overflow-hidden sm:h-72">
                <Image
                  src={service.image}
                  alt={`${service.name} at TNH Salon`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Arrow */}
                <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#218F87] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowRight size={17} />
                </div>

                {/* Service Name */}
                <div className="absolute bottom-0 left-0 w-full p-5">
                  <h4 className="text-xl font-semibold text-white sm:text-2xl">
                    {service.name}
                  </h4>
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
