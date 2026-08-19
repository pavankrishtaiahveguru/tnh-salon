"use client";

import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Madhuri",
    initial: "M",
    text: "I had an incredible experience getting my hair color done at Nail Hue Salon. The stylist was a true artist, helping me choose the perfect shade that complements my skin tone. The color turned out exactly as I envisioned—vibrant and flawless. I’m thrilled with my new look!",
  },
  {
    name: "Sharon Mathew",
    initial: "S",
    text: "I had an incredible Hair Spa experience at Nail Hue Salon. The deep conditioning treatment left my hair feeling soft, shiny, and revitalized. The soothing scalp massage was the perfect way to unwind. I’ll definitely be returning for regular treatments!",
  },
  {
    name: "Varsha",
    initial: "V",
    text: "I visited the Sarjapur branch of Nail Hue Salon for a manicure and pedicure, and I couldn’t be happier with the results! The staff was incredibly attentive and made sure I was comfortable throughout the process. My hands and feet feel pampered, and my nails look fantastic.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="reviews"
      className="bg-[#FFFDF9] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#218F87]">
            Client Love
          </span>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#173B38] sm:text-5xl">
            What Our Clients Say
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#647572] sm:text-base">
            Real experiences from clients who trust TNH Salon for their beauty
            and self-care moments.
          </p>

          <div className="mx-auto mt-6 h-px w-16 bg-[#218F87]/40" />
        </div>

        {/* Testimonials */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="group relative flex min-h-[350px] flex-col overflow-hidden rounded-[28px] border border-[#218F87]/10 bg-white p-7 shadow-[0_10px_35px_rgba(33,143,135,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(33,143,135,0.14)] sm:p-8"
            >
              {/* Decorative Quote */}
              <div className="absolute right-6 top-5 text-[#218F87]/10 transition-all duration-500 group-hover:text-[#218F87]/20">
                <Quote size={70} strokeWidth={1.5} />
              </div>

              {/* Stars */}
              <div className="relative z-10 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className="fill-[#D5B04A] text-[#D5B04A]"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="relative z-10 mt-6 text-[15px] leading-7 text-[#536663] sm:text-base">
                “{testimonial.text}”
              </p>

              {/* Customer */}
              <div className="mt-auto flex items-center gap-4 border-t border-[#218F87]/10 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#218F87] text-base font-semibold text-white shadow-sm">
                  {testimonial.initial}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#173B38] sm:text-base">
                    {testimonial.name}
                  </h3>

                  <p className="mt-0.5 text-xs text-[#84928F]">
                    Verified Client
                  </p>
                </div>
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#218F87] transition-all duration-500 group-hover:w-full" />
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        {/* <div className="mt-12 text-center">
          <p className="text-sm text-[#647572]">
            Loved your experience at TNH?
          </p>

          <a
            href="/book"
            className="mt-3 inline-flex items-center rounded-full bg-[#218F87] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#197B74] hover:shadow-lg"
          >
            Book Your Experience
          </a>
        </div> */}
      </div>
    </section>
  );
}
