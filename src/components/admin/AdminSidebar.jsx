"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  FolderTree,
  MapPin,
  ArrowDownUp,
  ExternalLink,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Services", href: "/admin/services", icon: Scissors },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Branches", href: "/admin/branches", icon: MapPin },
  { name: "Import & Export", href: "/admin/import-export", icon: ArrowDownUp },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[#09221F]/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#D7EAE7] bg-[#09221F] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/logo.jpg"
                alt="TNH Salon logo"
                className="h-full w-full object-cover"
              />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">TNH Salon</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/50">
                Salon Console
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-white/70 transition-colors hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#218F87] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-white/60 transition-colors hover:text-white"
          >
            <ExternalLink size={13} />
            View Website
          </Link>
        </div>
      </aside>
    </>
  );
}
