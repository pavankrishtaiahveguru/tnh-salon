"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ServicesHero({
  serviceCount,
  categoryCount,
  branches,
}) {
  const branchNames = branches.map((branch) => branch.name).filter(Boolean);

  return (
    <section className="hidden bg-[#FFFDF9] lg:block">
      <div className="mx-auto flex min-h-[58vh] max-w-7xl items-center justify-center px-5 pt-22 text-center sm:px-8 lg:min-h-[62vh] lg:px-10 lg:py-25">
        <div className="w-full max-w-4xl">
          {/* Label */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#218F87]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#218F87] sm:text-xs">
              The Nail Hue
            </span>

            <span className="h-px w-8 bg-[#218F87]" />
          </div>

          {/* Heading */}
          <h1 className="font-sans text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#09211E] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Every service,
            <br />
            every <span className="text-[#218F87]">hue.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-[#49615E] sm:text-base sm:leading-7">
            Hair, nails, skin and grooming across our{" "}
            {branchNames.join(" and ")} salons.
          </p>

          {/* Stats */}
          <div className="mx-auto mt-8 flex justify-center gap-10 sm:gap-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#78908D] sm:text-xs">
                Services
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#09211E] sm:text-3xl">
                {serviceCount}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#78908D] sm:text-xs">
                Categories
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#09211E] sm:text-3xl">
                {categoryCount}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#78908D] sm:text-xs">
                Salons
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#09211E] sm:text-3xl">
                {branches.length}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/book"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#218F87] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#197B74]"
            >
              Book an Appointment
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#service-categories"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#173B38]/20 bg-white px-7 py-3.5 text-sm font-semibold text-[#173B38] transition-all duration-300 hover:border-[#218F87] hover:bg-[#218F87] hover:text-white"
            >
              <Sparkles size={16} />
              Explore Services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
