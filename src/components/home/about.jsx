import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Scissors, Star } from "lucide-react";

const uniqueness = [
  {
    icon: Sparkles,
    title: "Creative Nail Art & Makeovers",
    description:
      "Every nail design is imagined fresh — bold, detailed, and uniquely yours. No two sets are ever the same.",
  },
  {
    icon: Scissors,
    title: "Expert Hair Makeovers",
    description:
      "From cuts to color to complete transformations, our stylists blend creativity with flawless technique.",
  },
  {
    icon: Star,
    title: "Unmatched Salon Expertise",
    description:
      "Years of hands-on mastery across nail art and hair styling mean consistent, flawless results.",
  },
  {
    icon: Heart,
    title: "Vegan Nail & Skin Care",
    description:
      "Our nail and skin treatments use only vegan, cruelty-free products — beauty that's gentle, clean, and consciously crafted.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="bg-[#FFFDF9] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem]">
              <Image
                src="/images/about/salon.jpg"
                alt="The Nail Hue Salon"
                width={900}
                height={1100}
                loading="eager"
                className="h-[500px] w-full object-cover sm:h-[600px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#173B38]/50 via-transparent to-transparent" />
            </div>

            {/* Experience Badge */}
            <div className="absolute -bottom-5 right-5 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#218F87] text-center text-white shadow-[0_12px_30px_rgba(33,143,135,0.25)] sm:right-8">
              <span className="text-3xl font-semibold">TNH</span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/80">
                Beauty Salon
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            {/* H1 */}
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-[#173B38] sm:text-5xl lg:text-[3rem]">
              More Than a Salon — Creative Nail & Hair Makeovers with Vegan
              Beauty Care
            </h1>

            {/* H2 */}
            <h2 className="mt-5 max-w-2xl text-xl font-semibold leading-snug text-[#218F87] sm:text-2xl">
              Where Artistic Nail Designs Meet Expert Hair Makeovers, Powered by
              Vegan Products
            </h2>

            {/* Body */}
            <div className="mt-6 max-w-2xl space-y-4 text-sm leading-7 text-[#647572] sm:text-base">
              <p>
                The Nail Hue is Bangalore's go-to salon for hair, nails, and
                skin, with salons in Indiranagar and Sarjapur Road. For 5+
                years, our technicians have paired creativity with honest advice
                — recreating any Pinterest nail art you bring in, using vegan,
                cruelty-free products for every nail and skin service. Hair is
                where we push further still, known for solving even the most
                complex colour corrections alongside cuts, keratin treatments,
                and bridal styling. Step into our chic, welcoming space and let
                our experts turn your inspiration into your actual look
              </p>

              <p>
                Whether you're after a bold nail art transformation or a
                complete hair makeover, our artists bring imagination,
                precision, and years of hands-on expertise to every chair —
                because your look deserves to be designed, not repeated, and
                cared for the clean way.
              </p>
            </div>

            {/* Feature Blocks */}
            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {uniqueness.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="group">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#218F87] transition-all duration-300 group-hover:bg-[#218F87] group-hover:text-white">
                        <Icon size={20} strokeWidth={1.8} />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold leading-5 text-[#173B38] sm:text-base">
                          {item.title}
                        </h3>

                        <p className="mt-1.5 text-xs leading-6 text-[#71807D] sm:text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-9">
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 rounded-full bg-[#218F87] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#197B74] hover:shadow-lg"
              >
                Explore Our Services
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
