"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Client-side logo link for the (server) Footer. On the Home page it smooth
// scrolls to the very top instead of pushing another "/" history entry; on
// any other page it navigates to "/" normally.
export default function FooterLogo() {
  const pathname = usePathname();

  const handleClick = (event) => {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      aria-label="The Nail Hue Home"
      className="flex items-center"
    >
      <Image
        src="/logo/logo.jpg"
        alt="The Nail Hue - TNH Salon"
        width={150}
        height={60}
        priority
        className="h-14 w-auto object-contain"
      />
    </Link>
  );
}
