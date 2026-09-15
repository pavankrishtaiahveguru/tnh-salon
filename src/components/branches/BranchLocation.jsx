"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function BranchLocation({ branch }) {
  if (!branch) return null;

  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="max-w-2xl">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#218F87] sm:text-xs">
            Visit Us
          </span>

          <h2 className="mt-3 font-serif text-3xl font-medium text-[#173B38] sm:text-4xl lg:text-5xl">
            Find Us in {branch.name}
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#647572] sm:text-base">
            Visit The Nail Hue and experience professional beauty services in a
            welcoming and comfortable environment.
          </p>
        </div>

        {/* Location Content */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
          {/* Contact Details */}
          <div className="rounded-3xl bg-[#F5F9F8] p-6 sm:p-8">
            <div className="space-y-7">
              {/* Address */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#218F87]/10 text-[#218F87]">
                  <MapPin size={19} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#173B38]">
                    Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#647572]">
                    {branch.address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#218F87]/10 text-[#218F87]">
                  <Phone size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#173B38]">
                    Phone
                  </p>

                  <a
                    href={`tel:${branch.phone}`}
                    className="mt-2 block text-sm text-[#647572] transition-colors hover:text-[#218F87]"
                  >
                    +91 {branch.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#218F87]/10 text-[#218F87]">
                  <Mail size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#173B38]">
                    Email
                  </p>

                  <a
                    href={`mailto:${branch.email}`}
                    className="mt-2 block break-all text-sm text-[#647572] transition-colors hover:text-[#218F87]"
                  >
                    {branch.email}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#218F87]/10 text-[#218F87]">
                  <Clock size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#173B38]">
                    Opening Hours
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-[#647572]">
                    <p>
                      <span className="font-medium text-[#173B38]">
                        Mon - Fri:
                      </span>{" "}
                      {branch.hours.weekdays}
                    </p>

                    <p>
                      <span className="font-medium text-[#173B38]">
                        Sat - Sun:
                      </span>{" "}
                      {branch.hours.weekends}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="relative min-h-[380px] overflow-hidden rounded-3xl bg-[#E9EFED] sm:min-h-[450px]">
            <iframe
              src={branch.mapEmbedUrl}
              title={`${branch.name} location`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
