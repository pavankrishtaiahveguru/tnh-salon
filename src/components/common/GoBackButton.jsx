"use client";

import { ArrowLeft } from "lucide-react";

// The not-found page is a Server Component; this button needs the browser's
// history API, so it lives in its own Client Component.
export default function GoBackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#218F87]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#173B38] transition-all duration-300 hover:border-[#218F87]/40 hover:bg-[#F3F8F6] sm:w-auto"
    >
      <ArrowLeft size={17} strokeWidth={1.8} />
      Go Back
    </button>
  );
}
