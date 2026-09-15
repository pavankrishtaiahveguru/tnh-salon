import Link from "next/link";
import { Home, Scissors } from "lucide-react";
import GoBackButton from "@/components/common/GoBackButton";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-5 py-20 sm:px-8">
      <div className="w-full max-w-xl text-center">
        {/* 404 Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F6F4] text-[#218F87]">
          <Scissors size={34} strokeWidth={1.5} />
        </div>

        {/* 404 */}
        <p className="mt-8 text-7xl font-semibold tracking-tight text-[#173B38] sm:text-8xl">
          404
        </p>

        {/* Heading */}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#173B38] sm:text-3xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#647572] sm:text-base">
          The page you’re looking for doesn’t exist or may have been moved.
          Let’s get you back to The Nail Hue.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/* Go Home */}
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#218F87] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#197B74] hover:shadow-lg sm:w-auto"
          >
            <Home size={17} strokeWidth={1.8} />
            Go to Home
          </Link>

          {/* Go Back */}
          <GoBackButton />
        </div>

        {/* Brand */}
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#218F87]">
            The Nail Hue
          </p>
          <p className="mt-2 text-xs text-[#71807D]">
            Beauty • Creativity • Confidence
          </p>
        </div>
      </div>
    </main>
  );
}
