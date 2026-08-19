"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Gallery", href: "/gallery" },
  { name: "Branches", href: "/branches" },
  { name: "Academy", href: "/academy" },
  { name: "Meet the Founder", href: "#founder" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md">
      {/* Main Navbar */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo + Brand */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
        >
          <Image
            src="/logo/logo.jpg"
            alt="The Nail Hue - TNH Salon"
            width={150}
            height={60}
            priority
            className="h-12 w-auto object-contain sm:h-14"
          />

          <div className="min-w-0 leading-tight">
            <p className="truncate font-semibold tracking-wide text-[#173B38] text-xl">
              THE NAIL HUE
            </p>

            <p className="mt-0.5 pl-1 text-[7px] font-medium uppercase tracking-[0.16em] text-[#218F87] sm:text-[9px] sm:tracking-[0.2em]">
              Hair • Nails • Skin
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative text-sm font-medium text-text-primary transition-colors duration-300 hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-primary-dark hover:shadow-md"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-primary transition-colors duration-300 hover:bg-primary-soft hover:text-primary lg:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`absolute left-0 top-full w-full overflow-hidden border-t border-border bg-white shadow-lg transition-all duration-300 lg:hidden ${
          isOpen ? "max-h-[calc(100vh-5rem)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-5 py-2 sm:px-8">
          {/* Navigation Links */}
          <div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center border-b border-border py-4 text-sm font-medium text-text-primary transition-colors duration-300 hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Book Button */}
          <Link
            href="/book"
            onClick={closeMenu}
            className="my-5 flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-primary-dark hover:shadow-md"
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
