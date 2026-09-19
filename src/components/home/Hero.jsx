"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const videos = [
  "https://res.cloudinary.com/eumjdehq/video/upload/v1789723717/salon-2.mp4",
  "https://res.cloudinary.com/eumjdehq/video/upload/v1789723872/salon-1.mov",
];

export default function Hero() {
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % videos.length);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentVideo = videoRefs.current[activeVideo];

    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(() => {});
    }
  }, [activeVideo]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#163B38]">
      {/* Background Videos */}
      {videos.map((video, index) => (
        <video
          key={video}
          ref={(element) => {
            videoRefs.current[index] = element;
          }}
          src={video}
          muted
          playsInline
          autoPlay={index === 0}
          preload="auto"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            activeVideo === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Teal Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#163B38]/20 via-[#163B38]/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-20 pt-32 sm:px-8 lg:px-10">
        <div className="w-full max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#A9D9D5]" />

            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A9D9D5] sm:text-sm">
              The Nail Hue
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Where Beauty
            <br />
            Meets <span className="text-[#A9D9D5]">Creativity.</span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Discover a creative salon experience for beautiful hair, stunning
            nails, and radiant skin. Step in, relax, and let our experts
            transform your look.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/services"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#27A399] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#218F87] hover:shadow-xl"
            >
              Book Your Appointment
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-[#163B38]"
            >
              Explore Services
            </Link>
          </div>

          {/* Hair / Nail / Skin */}
          <div className="mt-10 max-w-2xl border-t border-white/20 pt-6 sm:mt-12">
            <div className="grid grid-cols-3">
              {/* Hair */}
              <div>
                <p className="text-2xl font-semibold text-white sm:text-3xl">
                  Hair
                </p>

                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60 sm:text-xs">
                  Styling
                </p>
              </div>

              {/* Nail */}
              <div className="border-l border-white/20 pl-4 sm:pl-6">
                <p className="text-2xl font-semibold text-white sm:text-3xl">
                  Nail
                </p>

                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60 sm:text-xs">
                  Artistry
                </p>
              </div>

              {/* Skin */}
              <div className="border-l border-white/20 pl-4 sm:pl-6">
                <p className="text-2xl font-semibold text-white sm:text-3xl">
                  Skin
                </p>

                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60 sm:text-xs">
                  Care
                </p>
              </div>
            </div>
          </div>

          {/* Salon Stats */}
          <div className="mt-7 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
            {/* 100% Hygienic */}
            <div className="flex min-h-[90px] flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/15 sm:min-h-[100px] sm:px-3">
              <p className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
                100%
              </p>

              <p className="mt-1 text-[9px] leading-3 text-white/75 sm:text-xs sm:leading-4">
                Pristine &amp; Hygienic Environment
              </p>
            </div>

            {/* 100% Vegan */}
            <div className="flex min-h-[90px] flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/15 sm:min-h-[100px] sm:px-3">
              <p className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
                100%
              </p>

              <p className="mt-1 text-[9px] leading-3 text-white/75 sm:text-xs sm:leading-4">
                Quality and Vegan Products
              </p>
            </div>

            {/* 10+ Years */}
            <div className="flex min-h-[90px] flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center backdrop-blur-sm transition-all duration-300 sm:min-h-[100px] sm:px-3">
              <p className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
                10+
              </p>

              <p className="mt-1 text-[9px] leading-3 text-white/75 sm:text-xs sm:leading-4">
                Years Of Experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {videos.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveVideo(index)}
            aria-label={`Show video ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              activeVideo === index
                ? "w-10 bg-[#27A399]"
                : "w-2 bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-7 right-6 z-20 hidden items-center gap-3 text-white/60 lg:flex">
        <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>

        <div className="h-10 w-px bg-white/30" />
      </div>
    </section>
  );
}
