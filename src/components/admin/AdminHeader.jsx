"use client";

import { Menu, LogOut } from "lucide-react";

// Compact top header for the admin panel.
export default function AdminHeader({ title, subtitle, onMenuClick, userEmail, onSignOut }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#D7EAE7] bg-[#FFFDF9]/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D7EAE7] bg-white text-[#173B38] transition-colors hover:bg-[#F3F8F6] lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-[#09221F] sm:text-lg">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-[#5F7774]">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {userEmail ? (
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs font-medium text-[#5F7774] sm:block">{userEmail}</span>
          <button
            type="button"
            onClick={onSignOut}
            className="flex h-9 items-center gap-2 rounded-lg border border-[#D7EAE7] bg-white px-3 text-xs font-semibold text-[#173B38] transition-colors hover:bg-[#F3F8F6]"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      ) : null}
    </header>
  );
}
