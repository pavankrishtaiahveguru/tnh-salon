import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import AiChatWidget from "./AiChatWidget";

export default function FloatingButtons() {
  return (
    <>
      {/* Instagram - bottom left */}
      <div className="fixed bottom-6 left-6 z-50">
        <a
          href="https://www.instagram.com/thenailhue?igsh=aDR0bmltaGhrNWt0"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow The Nail Hue on Instagram"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FEDA75] via-[#D62976] to-[#4F5BD5] text-white shadow-[0_8px_25px_rgba(214,41,118,0.3)] transition-all duration-300 hover:scale-105 md:h-16 md:w-auto md:gap-3 md:p-5"
        >
          <FaInstagram className="text-[30px] md:text-[27px]" />
        </a>
      </div>

      {/* AI chat assistant + WhatsApp - bottom right */}
      <div className="fixed bottom-25 right-6 z-50 flex flex-col gap-4 md:bottom-26 md:right-8 md:gap-5">
        <AiChatWidget />
        {/* AI chat assistant */}
      </div>

      <div className="fixed bottom-6 right-8 z-50 flex flex-col gap-4 md:bottom-7 md:right-7 md:gap-5">

        {/* WhatsApp */}
        <a
          href="https://wa.me/919740355663"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book on WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_8px_25px_rgba(33,143,135,0.35)] transition-all duration-300 hover:scale-105 md:h-16 md:w-auto md:gap-3 md:p-5"
        >
          <FaWhatsapp className="text-[30px] md:text-[27px]" />
        </a>
      </div>
    </>
  );
}
