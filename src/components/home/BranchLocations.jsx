"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";

const branches = [
  {
    name: "Indiranagar",
    slug: "indiranagar",
    address:
      "787, 1st Floor, 1st Cross, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008",
    phone: "9177185103",
    email: "thenailhue@gmail.com",
    hours: "Mon–Fri 11:00 AM – 8:30 PM · Sat–Sun 10:30 AM – 8:30 PM",
    mapUrl: "https://maps.app.goo.gl/v3jdNYf2fPMxgrT8A",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.591564349146!2d77.6407109!3d12.9699346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1764aed89e7b%3A0x7c259acaaa8d4b00!2sThe%20Nail%20Hue%20(TNH)%20-Hair%20and%20Nail%20Salon%20Indiranagar!5e1!3m2!1sen!2sin!4v1787205972166!5m2!1sen!2sin",
  },
  {
    name: "Sarjapur Road",
    slug: "sarjapur",
    address:
      "1, Ground Floor, PNR Pride, No 78, Sarjapur - Marathahalli Rd, Behind Indriya - Aditya Birla Jewellery, Doddakannelli, Bengaluru, Karnataka 560035",
    phone: "9740355663",
    email: "thenailhue@gmail.com",
    hours: "Mon–Fri 11:00 AM – 8:30 PM · Sat–Sun 10:30 AM – 8:30 PM",
    mapUrl: "https://maps.app.goo.gl/wagpMExGq441M8g8",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.4615440872917!2d77.682917!3d12.912426199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1310c7bd603f%3A0x2d656e3030f26b44!2sThe%20Nail%20Hue%20(TNH)%20-%20Nail%20and%20Hair%20salon%20Sarjapura%20Road!5e1!3m2!1sen!2sin!4v1787206004211!5m2!1sen!2sin",
  },
];

function BranchCard({ branch }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#DDEBE8] bg-white">
      {/* Content */}
      <div className="p-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#218F87]">
          TNH Salon
        </p>

        <h3 className="text-2xl font-semibold tracking-tight text-[#09211E]">
          <Link
            href={`/branches/${branch.slug}`}
            className="transition-colors duration-200 hover:text-[#218F87]"
          >
            {branch.name}
          </Link>
        </h3>

        <div className="mt-5 space-y-3 text-sm text-[#58706D]">
          <div className="flex gap-3">
            <MapPin size={17} className="mt-0.5 shrink-0 text-[#218F87]" />
            <span>{branch.address}</span>
          </div>

          <div className="flex gap-3">
            <Phone size={16} className="mt-0.5 shrink-0 text-[#218F87]" />
            <a href={`tel:+91${branch.phone}`} className="hover:text-[#218F87]">
              +91 {branch.phone}
            </a>
          </div>

          <div className="flex gap-3">
            <Mail size={16} className="mt-0.5 shrink-0 text-[#218F87]" />
            <a href={`mailto:${branch.email}`} className="hover:text-[#218F87]">
              {branch.email}
            </a>
          </div>

          <div className="flex gap-3">
            <Clock size={16} className="mt-0.5 shrink-0 text-[#218F87]" />
            <span>{branch.hours}</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <iframe
        src={branch.mapEmbedUrl}
        title={`${branch.name} map`}
        loading="lazy"
        className="h-48 w-full border-0"
        allowFullScreen
      />

      {/* Actions */}
      <div className="flex gap-3 p-5">
        <a
          href={branch.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#218F87] px-4 py-2.5 text-sm font-semibold text-[#218F87] transition hover:bg-[#218F87] hover:text-white"
        >
          View Map
          <ArrowUpRight size={15} />
        </a>

        <a
          href="/services"
          className="flex flex-1 items-center justify-center rounded-full bg-[#218F87] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#197B74]"
        >
          Book Appointment
        </a>
      </div>
    </article>
  );
}

export default function BranchLocations() {
  return (
    <section className="bg-[#FFFDF9] px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#218F87]">
            Visit Us
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#09211E] sm:text-4xl">
            Our Salon Locations
          </h2>

          <p className="mt-2 max-w-xl text-sm text-[#687E7B]">
            Find the TNH salon closest to you.
          </p>
        </div>

        {/* Branches */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BranchCard branch={branches[0]} />
          <BranchCard branch={branches[1]} />
        </div>
      </div>
    </section>
  );
}
