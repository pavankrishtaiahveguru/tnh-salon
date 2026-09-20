import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function FloatingButtons() {
  return (
    <>
      {/* Instagram */}
      <a
        href="https://www.instagram.com/thenailhue?igsh=aDR0bmltaGhrNWt0"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow The Nail Hue on Instagram"
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FEDA75] via-[#D62976] to-[#4F5BD5] text-white shadow-[0_8px_25px_rgba(214,41,118,0.3)] transition-all duration-300 hover:scale-105 md:bottom-28 md:right-7 md:h-16 md:w-auto md:gap-3 md:p-5"
      >
        <FaInstagram className="text-[30px] md:text-[27px]" />
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/919740355663"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Book on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#218F87] text-white shadow-[0_8px_25px_rgba(33,143,135,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#197B74] md:bottom-7 md:right-7 md:h-16 md:w-auto md:gap-3 md:p-5"
      >
        <FaWhatsapp className="text-[30px] md:text-[27px]" />
      </a>
    </>
  );
}
