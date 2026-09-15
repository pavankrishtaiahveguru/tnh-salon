import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-5 py-20">
      <div className="mx-auto w-full max-w-2xl text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex">
          <Image
            src="/logo/logo.jpg"
            alt="The Nail Hue - TNH Salon"
            width={140}
            height={56}
            priority
            className="h-14 w-[140px] object-contain"
          />
        </Link>

        {/* 404 */}
        <p className="text-8xl font-bold tracking-tight text-[#218F87] sm:text-9xl">
          404
        </p>

        {/* Heading */}
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#173B38] sm:text-4xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#647572] sm:text-base">
          Oops! The page you’re looking for may have been moved, removed, or is
          no longer available.
        </p>

        {/* Home Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#218F87] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#197B74] hover:shadow-lg"
          >
            <Home size={17} />
            Back to Home
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Tagline */}
        <div className="mt-12 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#218F87]">
          <span className="h-px w-8 bg-[#218F87]/30" />
          Hair
          <span className="text-[#218F87]/40">|</span>
          Nail
          <span className="text-[#218F87]/40">|</span>
          Skin
          <span className="h-px w-8 bg-[#218F87]/30" />
        </div>
      </div>
    </main>
  );
}
