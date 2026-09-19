"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { prefetchFirstServicesPage, prefetchServicesMeta } from "@/lib/services";

const navLinks = [
  { name: "Services", href: "/services" },
  { name: "Gallery", href: "/gallery" },
];

const secondaryLinks = [
  { name: "Academy", href: "/academy" },
  { name: "Founder", href: "/founder" },
];

const branches = [
  { name: "Sarjapur Road", href: "/branches/sarjapur" },
  { name: "Indiranagar", href: "/branches/indiranagar" },
];

const TEAL = "#218F87";
const DARK_GREEN = "#173B38";

// Thin, animated underline shared by desktop nav items.
// Grows in from the left on hover/active, retracts smoothly on mouse-leave.
const underlineClasses = (active) =>
  `pointer-events-none absolute -bottom-1.5 left-0 h-[1.5px] w-full origin-left transition-transform duration-300 ease-out ${
    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
  }`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBranchesOpen, setIsBranchesOpen] = useState(false);
  const [hash, setHash] = useState("");

  const pathname = usePathname();

  const closeMenu = () => {
    setIsOpen(false);
    setIsBranchesOpen(false);
  };

  // Track hash changes so the in-page "Services" link can be marked active.
  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = useCallback(
    (href) => {
      if (href.startsWith("#")) {
        return pathname === "/" && hash === href;
      }
      return pathname === href;
    },
    [pathname, hash],
  );

  // Phase 12 — when the user is anywhere on the public site and hovers or
  // focuses the Services nav link, prefetch the first Services API page and
  // its metadata so clicking navigates into an already-warm cache. Next.js
  // <Link> already prefetches the route itself in production; this warms the
  // data layer, which route prefetch cannot do. Bounded to one request per
  // cache window by the TTL cache in lib/services.js.
  const handleServicesPrefetch = useCallback(() => {
    if (pathname?.startsWith("/services")) return;
    prefetchFirstServicesPage();
    prefetchServicesMeta();
  }, [pathname]);

  const isBranchesActive = pathname?.startsWith("/branches");

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-border bg-white shadow-sm">
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
            <p
              className="truncate text-xl font-semibold tracking-wide"
              style={{ color: DARK_GREEN }}
            >
              THE NAIL HUE
            </p>

            <p
              className="mt-0.5 pl-1 text-[7px] font-medium uppercase tracking-[0.16em] sm:text-[9px] sm:tracking-[0.2em]"
              style={{ color: TEAL }}
            >
              Hair • Nails • Skin
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={handleServicesPrefetch}
                onFocus={handleServicesPrefetch}
                className="group relative inline-block py-1 text-[17px] font-medium transition-colors duration-300 ease-in-out"
                style={{ color: active ? TEAL : DARK_GREEN }}
              >
                {link.name}
                <span
                  className={underlineClasses(active)}
                  style={{ backgroundColor: TEAL }}
                />
              </Link>
            );
          })}

          {/* Branches Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsBranchesOpen(true)}
            onMouseLeave={() => setIsBranchesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsBranchesOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-[17px] font-medium transition-colors duration-300 ease-in-out"
              style={{ color: isBranchesActive ? TEAL : DARK_GREEN }}
              aria-expanded={isBranchesOpen}
            >
              <span className="group relative inline-block py-1">
                Branches
                <span
                  className={underlineClasses(isBranchesActive)}
                  style={{ backgroundColor: TEAL }}
                />
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`transition-transform duration-300 ${
                  isBranchesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Desktop Branch Dropdown */}
            <div
              className={`absolute left-1/2 top-full mt-3 w-52 -translate-x-1/2 rounded-xl border border-border bg-white p-2 shadow-xl transition-all duration-300 ease-out ${
                isBranchesOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }`}
            >
              {branches.map((branch) => (
                <Link
                  key={branch.name}
                  href={branch.href}
                  onClick={() => setIsBranchesOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 hover:bg-[#EAF7F5] hover:text-[#218F87] ${
                    pathname === branch.href
                      ? "bg-[#EAF7F5] text-[#218F87]"
                      : "text-[#173B38]"
                  }`}
                >
                  {branch.name}
                </Link>
              ))}
            </div>
          </div>

          {secondaryLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group relative inline-block py-1 text-[17px] font-medium transition-colors duration-300 ease-in-out"
                style={{ color: active ? TEAL : DARK_GREEN }}
              >
                {link.name}
                <span
                  className={underlineClasses(active)}
                  style={{ backgroundColor: TEAL }}
                />
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:bg-primary-dark hover:shadow-md"
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
          className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-in-out hover:bg-primary-soft lg:hidden"
          style={{ color: DARK_GREEN }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`absolute left-0 top-full w-full overflow-hidden border-t border-border bg-white shadow-lg transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "max-h-[calc(100vh-5rem)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-5 py-2 sm:px-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  closeMenu();
                  handleServicesPrefetch();
                }}
                className="relative flex items-center border-b border-border py-4 text-base font-medium transition-colors duration-300"
                style={{ color: active ? TEAL : DARK_GREEN }}
              >
                <span className="relative inline-flex items-center gap-2">
                  {link.name}
                  {active && (
                    <span
                      className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-100 transition-transform duration-300 ease-out"
                      style={{ backgroundColor: TEAL }}
                    />
                  )}
                </span>
              </Link>
            );
          })}

          {/* Branches */}
          <div className="border-b border-border">
            <button
              type="button"
              onClick={() => setIsBranchesOpen((prev) => !prev)}
              className="flex w-full items-center justify-between py-4 text-base font-medium transition-colors duration-300"
              style={{ color: isBranchesActive ? TEAL : DARK_GREEN }}
              aria-expanded={isBranchesOpen}
            >
              <span>Branches</span>
              <ChevronDown
                size={19}
                strokeWidth={2}
                className="transition-transform duration-300"
                style={{
                  color: isBranchesOpen ? TEAL : DARK_GREEN,
                  transform: isBranchesOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Mobile Branches */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isBranchesOpen
                  ? "max-h-40 pb-2 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {branches.map((branch) => (
                <Link
                  key={branch.name}
                  href={branch.href}
                  onClick={closeMenu}
                  className={`flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 hover:bg-[#EAF7F5] hover:text-[#218F87] ${
                    pathname === branch.href
                      ? "text-[#218F87]"
                      : "text-[#647572]"
                  }`}
                >
                  {branch.name}
                </Link>
              ))}
            </div>
          </div>

          {secondaryLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="relative flex items-center border-b border-border py-4 text-base font-medium transition-colors duration-300"
                style={{ color: active ? TEAL : DARK_GREEN }}
              >
                <span className="relative inline-flex items-center gap-2">
                  {link.name}
                  {active && (
                    <span
                      className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-100 transition-transform duration-300 ease-out"
                      style={{ backgroundColor: TEAL }}
                    />
                  )}
                </span>
              </Link>
            );
          })}

          {/* Book Button */}
          <Link
            href="/services"
            onClick={closeMenu}
            className="my-5 flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:bg-primary-dark hover:shadow-md"
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
