"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export default function BranchHero({ branch, image }) {
  if (!branch) return null;

  return (
    <section className="relative min-h-[75vh] overflow-hidden bg-[#173B38] sm:min-h-[80vh] lg:min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={branch.heroImage}
          alt={`${branch.name} salon`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Primary Color Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#173B38]/2 via-[#173B38]/5 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-5 py-28 text-center sm:min-h-[80vh] sm:px-8 lg:min-h-screen lg:px-10">
        <div className="w-full max-w-5xl">
          {/* Eyebrow */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#A9D9D5]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A9D9D5] sm:text-xs">
              The Nail Hue
            </span>

            <span className="h-px w-10 bg-[#A9D9D5]" />
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-5xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {branch.title}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base lg:text-lg">
            {branch.subtitle}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/services"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#27A399] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#218F87] hover:shadow-xl"
            >
              Book an Appointment
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <a
              href={`tel:${branch.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-[#173B38]"
            >
              <Phone size={16} />
              Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
