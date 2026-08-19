import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Scissors, Star } from "lucide-react";

const uniqueness = [
  {
    icon: Sparkles,
    title: "Personalized Beauty",
    description:
      "Every service is tailored to your style, preferences, and beauty goals.",
  },
  {
    icon: Star,
    title: "Expert Professionals",
    description:
      "Our skilled professionals focus on creativity, precision, and beautiful results.",
  },
  {
    icon: Scissors,
    title: "Complete Beauty Care",
    description:
      "Hair, nails, and skin services thoughtfully brought together under one roof.",
  },
  {
    icon: Heart,
    title: "A Relaxing Experience",
    description:
      "A warm and welcoming space where you can relax, refresh, and feel your best.",
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
                src="/about/salon.jpg"
                alt="The Nail Hue Salon"
                width={900}
                height={1100}
                className="h-[500px] w-full object-cover sm:h-[600px]"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#173B38]/50 via-transparent to-transparent" />
            </div>

            {/* Experience Badge */}
            <div className="absolute -bottom-5 right-5 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#218F87] text-center text-white shadow-[0_12px_30px_rgba(33,143,135,0.25)] sm:right-8">
              <span className="text-3xl font-semibold">TNH</span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/80">
                Beauty Studio
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#218F87]">
              Why The Nail Hue
            </span>

            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-[#173B38] sm:text-5xl lg:text-[3.5rem]">
              More Than a Salon.
              <span className="block text-[#218F87]">
                A Space to Feel Beautiful.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#647572] sm:text-base">
              At The Nail Hue, beauty is more than a service — it is an
              experience. We bring creativity, expertise, and attention to
              detail together to create a beauty experience that feels personal,
              comfortable, and uniquely yours.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#647572] sm:text-base">
              From beautiful hair and artistic nails to radiant skin, every
              treatment is thoughtfully designed to help you look good, feel
              confident, and leave feeling refreshed.
            </p>

            {/* Uniqueness Grid */}
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
                        <h3 className="text-sm font-semibold text-[#173B38] sm:text-base">
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
