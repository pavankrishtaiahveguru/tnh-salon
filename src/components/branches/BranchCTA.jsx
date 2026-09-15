"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export default function BranchCTA({ branch }) {
  if (!branch) return null;

  return (
    <section className="bg-[#FFFDF9] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-[#173B38] px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-16">
          {/* Decorative Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#27A399]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#27A399]/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A9D9D5] sm:text-xs">
              Visit The Nail Hue
            </span>

            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Feel Beautiful?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Book your appointment at our {branch.name} salon and let our
              experts create a look that feels uniquely you.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/book"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#27A399] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#218F87] hover:shadow-xl sm:w-auto"
              >
                Book Your Appointment
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <a
                href={`tel:${branch.phone}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/15 sm:w-auto"
              >
                <Phone size={16} />
                Call Salon
              </a>
            </div>

            {/* Branch Contact */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs text-white/50">
                {branch.name} • {branch.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
