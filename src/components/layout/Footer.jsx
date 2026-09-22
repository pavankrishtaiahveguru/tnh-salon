import Link from "next/link";
import FooterLogo from "./FooterLogo";
import {
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import DevelopedByStaffArc from "../DevelopedByStaffArc";

const quickLinks = [
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Gallery", href: "/gallery" },
  // { name: "Branches", href: "/branches" },
  { name: "Academy", href: "/academy" },
  { name: "Meet the Founder", href: "/founder" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-[#218F87] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <FooterLogo />

            <p className="mt-5 max-w-xs text-sm leading-6 text-white/80">
              Your destination for beautiful hair, stunning nails, and radiant
              skin. Experience creativity, care, and confidence at TNH Salon.
            </p>

            <a
              href="https://www.instagram.com/thenailhue?igsh=aDR0bmltaGhrNWt0"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition-all duration-300 hover:bg-white hover:text-[#218F87]"
            >
              <FaInstagram size={20} />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-white/80 transition-colors duration-300 hover:text-white"
                  >
                    {link.name}

                    <FiArrowUpRight
                      size={14}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
              Get In Touch
            </h3>

            <div className="mt-5 space-y-4">
              <a
                href="tel:+919740355663"
                className="flex items-center gap-3 text-sm text-white/80 transition-colors hover:text-white"
              >
                <FaPhoneAlt size={15} />
                <span>+91 97403 55663</span>
              </a>

              <a
                href="mailto:thenailhue@gmail.com"
                className="flex items-center gap-3 text-sm text-white/80 transition-colors hover:text-white"
              >
                <FaEnvelope size={16} />
                <span>thenailhue@gmail.com</span>
              </a>

              <div className="flex items-start gap-3 text-sm leading-6 text-white/80">
                <FaMapMarkerAlt size={16} className="mt-1 shrink-0" />

                <span>
                  Bengaluru,
                  <br />
                  Karnataka, India
                </span>
              </div>
            </div>
          </div>

          {/* Booking */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
              Visit TNH
            </h3>

            <p className="mt-5 text-sm leading-6 text-white/80">
              Ready for your next beauty experience? Book your appointment with
              our team today.
            </p>

            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#218F87] transition-all duration-300 hover:bg-[#E8F5F3]"
            >
              Book Appointment
              <FiArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-center sm:px-8 md:flex-row md:items-center md:justify-between md:text-left lg:px-10">
          <p className="text-xs text-white/70">
            Copyright © {new Date().getFullYear()} The Nail Hue - TNH Salon |
            Powered by The Nail Hue - TNH Salon
          </p>

          <DevelopedByStaffArc />

          <p className="text-xs text-white/60">
            Hair <span className="mx-1">|</span> Nail{" "}
            <span className="mx-1">|</span> Skin
          </p>
        </div>
      </div>
    </footer>
  );
}
