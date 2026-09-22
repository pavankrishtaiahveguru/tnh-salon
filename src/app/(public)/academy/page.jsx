"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "lucide-react";
import { Fraunces, Karla } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

const WHATSAPP_NUMBER = "919177185103";

const whatsappMessage = (message) => {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!number) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

// Hero media carousel — swap these placeholders for the final Cloudinary URLs.
const academyHeroImages = [
  "/academy/academy-005.jpg",
  "/academy/academy-001.jpg",
  "/academy/academy-002.jpg",
  "/academy/academy-004.jpg",
  "/academy/academy-003.jpg",
];

const HERO_SLIDE_INTERVAL_MS = 2500;

const nailLevels = [
  {
    level: "LEVEL 1",
    title: "Nail essentials",
    description: "For professionals tightening their fundamentals.",
    tags: ["3 Days", "10000 INR", "CERTIFICATION"],
    points: [
      "Natural nail assessment and diagnosis",
      "Preparation and structure",
      "Gel polish application and finish",
      "Hygiene and sanitation protocols",
      "Client consultation and aftercare",
    ],
    message:
      "Hi The Nail Hue Academy, I am interested in Nail Level 1 (Nail Essentials). Here is what I do now:",
  },
  {
    level: "LEVEL 2",
    title: "Nail extensions",
    description: "For technicians building extension work.",
    tags: ["10 days", "20000 INR", "CERTIFICATION"],
    points: [
      "Gel, acrylic and BIAB systems",
      "Structural design and apex control",
      "Application precision and shaping",
      "Refills, maintenance and repair",
      "Managing difficult nail conditions",
    ],
    message:
      "Hi The Nail Hue Academy, I am interested in Nail Level 2 (Extensions). Here is what I do now:",
  },
  {
    level: "LEVEL 3",
    title: "Advanced nail art",
    description: "For technicians building a signature style.",
    tags: ["5 days", "15000 INR", "CERTIFICATION"],
    points: [
      "Hand-painted work and detailing",
      "Chrome, cat-eye and texture effects",
      "3D elements and bridal design",
      "Design composition and colour",
      "Client communication and pricing your work",
    ],
    message:
      "Hi The Nail Hue Academy, I am interested in Nail Level 3 (Advanced Nail Art). Here is what I do now:",
  },
];

const hairLevels = [
  {
    level: "LEVEL 1",
    title: "Precision cutting & styling",
    description: "For stylists sharpening technical cutting.",
    tags: ["8 Days", "10000 INR", "CERTIFICATION"],
    points: [
      "Hair and scalp assessment",
      "Sectioning and precision cutting",
      "Face shape and texture considerations",
      "Blow-dry, styling and finishing",
      "Consultation and honest advice",
    ],
    message:
      "Hi The Nail Hue Academy, I am interested in Hair Level 1 (Precision Cutting & Styling). Here is what I do now:",
    type: "hair",
  },
  {
    level: "LEVEL 2",
    title: "Colour",
    description: "For stylists working with confidence.",
    tags: ["10 days", "35000 INR", "CERTIFICATION"],
    points: [
      "Colour theory and formulation logic",
      "Balayage and placement",
      "Grey blending",
      "Toning",
      "Diagnosis, expectations and aftercare",
    ],
    message:
      "Hi The Nail Hue Academy, I am interested in Hair Level 2 (Colour). Here is what I do now:",
    type: "hair",
  },
  {
    level: "LEVEL 3",
    title: "Correction & chemical services",
    description: "For the most technical work on the floor.",
    tags: ["5 days", "25000 INR", "CERTIFICATION"],
    points: [
      "Colour correction",
      "Keratin and smoothing",
      "Damage-conscious protocols",
      "Reading colour history and hair integrity",
      "Knowing when to say no to a service",
    ],
    message:
      "Hi The Nail Hue Academy, I am interested in Hair Level 3 (Correction & Chemical Services). Here is what I do now:",
    type: "hair",
  },
];

const faqs = [
  {
    question: "Do you train complete beginners?",
    answer:
      "No. The levels are built for people already working in beauty — salon staff, freelancers and independent practitioners who want to specialise.",
  },
  {
    question: "Which level should I start at?",
    answer:
      "Tell us what you do now and what you want to specialise in. We will tell you honestly which level fits, and you can start there rather than repeating work you already do well.",
  },
  {
    question: "Do I have to complete the levels in order?",
    answer:
      "No. Programmes are customised. If your cutting is strong but your colour work isn't, you can go straight into the colour levels.",
  },
  {
    question: "Do you train on live clients or practice heads?",
    answer:
      "Live clients. Every level includes real salon work with actual clients, real concerns and real hair and nail conditions.",
  },
  {
    question: "How big are the batches?",
    answer:
      "Small group or one-on-one, so technique is corrected in real time.",
  },
  {
    question: "What are the fees and duration?",
    answer:
      "Fees and duration vary by level and by how the programme is customised for you. Message us on WhatsApp with your current experience and we will send the details.",
  },
];

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.3 1.3-1.9 1.3-.5 0-1.1.2-3.6-.8-3-1.3-5-4.4-5.1-4.6-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5l1 2.4c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.3 1.2 1.1 2.2 1.4 2.5 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.3 1.1c.2.1.3.2.6.4.1.1.1.6-.1 1.3Z" />
    </svg>
  );
}

function AcademyLevelCard({ item }) {
  return (
    <article
      className={[
        "group flex h-full flex-col rounded-[10px] border bg-white p-5",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        item.type === "hair"
          ? "border-[#BC8446] border-t-[2px]"
          : "border-[#28A499] border-t-[2px]",
      ].join(" ")}
    >
      <p
        className={[
          "mb-2 text-xs font-bold tracking-[0.16em]",
          item.type === "hair" ? "text-[#BC8446]" : "text-[#14766D]",
        ].join(" ")}
      >
        {item.level}
      </p>

      <h4 className="font-[var(--font-fraunces)] text-2xl font-normal leading-tight text-[#04302C]">
        {item.title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-[#04302C]/65">
        {item.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className={[
              "rounded-[3px] border px-2 py-1 text-[10px] font-bold",
              "tracking-[0.08em]",
              item.type === "hair"
                ? "border-[#BC8446]/30 bg-[#BC8446]/5 text-[#8d6336]"
                : "border-[#28A499]/30 bg-[#28A499]/5 text-[#14766D]",
            ].join(" ")}
          >
            {tag}
          </span>
        ))}
      </div>

      <ul className="mt-4 flex-1 space-y-2">
        {item.points.map((point) => (
          <li
            key={point}
            className="flex gap-2 text-sm leading-6 text-[#04302C]/75"
          >
            <span
              className={[
                "mt-[5px] h-1 w-1 shrink-0 rounded-full",
                item.type === "hair" ? "bg-[#BC8446]" : "bg-[#28A499]",
              ].join(" ")}
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <a
        href={whatsappMessage(item.message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-fit items-center gap-1.5 border-b border-[#14766D] pb-0.5 text-sm font-semibold text-[#14766D] transition-colors hover:text-[#28A499]"
      >
        Ask on WhatsApp
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

function TrackHeading({ title, description }) {
  return (
    <div className="mb-4 mt-10 flex items-end gap-3">
      <h3 className="font-[var(--font-fraunces)] text-2xl font-normal text-[#04302C]">
        {title}
      </h3>

      <em className="mb-[3px] text-xs not-italic text-[#04302C]/50">
        {description}
      </em>

      <div className="mb-[5px] h-px flex-1 bg-[#04302C]/15" />
    </div>
  );
}

export default function AcademyPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // Auto-rotate the hero carousel every 4s. The interval restarts on every
  // image change, so a manual indicator click resets the countdown before
  // rotation resumes. Paused while the customer hovers/focuses the hero.
  useEffect(() => {
    if (isHeroPaused) return undefined;
    const id = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % academyHeroImages.length);
    }, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isHeroPaused, currentImage]);

  const generalWhatsApp = whatsappMessage(
    "Hi The Nail Hue Academy, I would like to discuss which level fits my experience. Here is what I do now:",
  );

  const datesWhatsApp = whatsappMessage(
    "Hi The Nail Hue Academy, I am a working professional and would like to know about upcoming training dates in Indiranagar.",
  );

  const directionsWhatsApp = whatsappMessage(
    "Hi The Nail Hue Academy, I would like to visit the academy in Indiranagar. Please share directions and timings.",
  );

  return (
    <main
      className={`${fraunces.variable} ${karla.variable} min-h-screen bg-[#F1F2EF] font-[var(--font-karla)] text-[#04302C]`}
    >
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="bg-[#04302C] text-white pt-20">
        <div className="mx-auto max-w-[1120px] px-5 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.72fr] lg:gap-16">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
                <span className="mr-1.5">●</span>
                Indiranagar, Bangalore
              </div>

              <h1 className="max-w-[680px] font-[var(--font-fraunces)] text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Advanced hair and nail
                <br />
                training for working
                <br />
                professionals
              </h1>

              <p className="mt-6 max-w-[590px] text-base leading-7 text-white/80 sm:text-lg">
                Level up beyond the salon floor, taught with the science behind
                each technique and practised on real clients inside a working
                Bangalore salon.
              </p>

              <div className="mt-5 border-l border-[#28A499] pl-4">
                <p className="max-w-[560px] text-sm leading-6 text-white/70">
                  Led by The Nail Hue Professional technical trainers with over
                  10 years training salon professionals across India.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={generalWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#28A499] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#39b8ac]"
                >
                  <WhatsAppIcon />
                  Find your level
                </a>

                <a
                  href="#nail"
                  className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
                >
                  See the levels
                </a>
              </div>
            </div>

            {/* Hero media */}
            <div className="mx-auto w-full max-w-[360px] lg:max-w-[380px]">
              <div
                className="relative aspect-[0.78] overflow-hidden rounded-[48px] border border-white/15 bg-gradient-to-br from-[#174c47] via-[#14524d] to-[#0b3935] shadow-2xl"
                onMouseEnter={() => setIsHeroPaused(true)}
                onMouseLeave={() => setIsHeroPaused(false)}
                onFocus={() => setIsHeroPaused(true)}
                onBlur={() => setIsHeroPaused(false)}
              >
                {/* Auto-rotating images — stacked crossfade, 4s per image */}
                {academyHeroImages.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt="The Nail Hue Academy training"
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1023px) calc(100vw - 40px), 380px"
                    className={`object-cover transition-opacity duration-1000 ease-in-out ${
                      index === currentImage ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(40,164,153,.2),transparent_55%)]" />

                {/* Subtle bottom gradient so the label stays readable on any image */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04302C]/60 via-[#04302C]/25 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  {/* <p className="text-xs font-bold tracking-[0.08em] text-white">
                    HERO IMAGE / VIDEO — training on a live client
                  </p>

                  <p className="mt-1 text-[10px] text-white/50">
                    Advanced hair and nail training
                  </p> */}

                  {/* Carousel indicators */}
                  <div className="mt-2.5 flex justify-end gap-1.5">
                    {academyHeroImages.map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        aria-label={`Show training image ${index + 1}`}
                        aria-current={index === currentImage}
                        onClick={() => setCurrentImage(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentImage
                            ? "w-5 bg-white"
                            : "w-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 border-t border-white/20 pt-5">
            <div>
              <strong className="block font-[var(--font-fraunces)] text-2xl font-normal leading-none sm:text-3xl">
                4,000+
              </strong>
              <span className="mt-1 block text-[10px] text-white/55 sm:text-xs">
                hairdressers trained
              </span>
            </div>

            <div>
              <strong className="block font-[var(--font-fraunces)] text-2xl font-normal leading-none sm:text-3xl">
                4
              </strong>
              <span className="mt-1 block text-[10px] text-white/55 sm:text-xs">
                states covered
              </span>
            </div>

            <div>
              <strong className="block font-[var(--font-fraunces)] text-2xl font-normal leading-none sm:text-3xl">
                10+
              </strong>
              <span className="mt-1 block text-[10px] text-white/55 sm:text-xs">
                years training beauty professionals
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHO WE TRAIN
      ========================================================= */}
      <section className="bg-[#F1F2EF]">
        <div className="mx-auto grid max-w-[1120px] gap-8 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-20">
          <h2 className="font-[var(--font-fraunces)] text-3xl font-normal leading-tight sm:text-4xl">
            Who we train
          </h2>

          <div>
            <p className="text-sm leading-7 text-[#04302C]/75 sm:text-base">
              Salon staff looking to specialise, independent practitioners
              building their own businesses, and professionals upgrading their
              technical skills.
            </p>

            <p className="mt-6 border-l-2 border-[#28A499] pl-4 text-sm leading-7 text-[#04302C]/65">
              This is not beginner training. It is advanced technical training
              for people already working in beauty who want real specialisation.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          LEVELS
      ========================================================= */}
      <section id="nail" className="scroll-mt-20 bg-[#F1F2EF]">
        <div className="mx-auto max-w-[1120px] px-5 pb-20 sm:px-6 lg:px-8">
          <h2 className="font-[var(--font-fraunces)] text-3xl font-normal leading-tight sm:text-4xl">
            The levels
          </h2>

          <p className="mt-4 max-w-[600px] text-sm leading-7 text-[#04302C]/65">
            Three levels in each specialisation. Start where your current skill
            sits — we will tell you honestly which level fits.
          </p>

          <TrackHeading title="Nail" description="extensions and nail art" />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nailLevels.map((item) => (
              <AcademyLevelCard key={item.level + item.title} item={item} />
            ))}
          </div>

          <div id="hair" className="scroll-mt-20">
            <TrackHeading
              title="Hair"
              description="cutting, colour and chemical services"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hairLevels.map((item) => (
                <AcademyLevelCard key={item.level + item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW TRAINING WORKS
      ========================================================= */}
      <section id="how" className="scroll-mt-20 bg-[#04302C] text-white">
        <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="font-[var(--font-fraunces)] text-3xl font-normal leading-tight sm:text-4xl">
            How the training works
          </h2>

          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
            <div className="border-t border-white/20 pt-5">
              <h3 className="font-[var(--font-fraunces)] text-xl font-normal sm:text-2xl">
                Real salon work
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/65">
                You work on actual clients with real hair and nail conditions —
                managing expectations, diagnosing problems, adjusting your
                approach. Not practice heads.
              </p>
            </div>

            <div className="border-t border-white/20 pt-5">
              <h3 className="font-[var(--font-fraunces)] text-xl font-normal sm:text-2xl">
                Small group or one-on-one
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/65">
                Not assembly-line batches. Technique is corrected in the moment,
                and you learn why something works, not only how to do it.
              </p>
            </div>

            <div className="border-t border-white/20 pt-5">
              <h3 className="font-[var(--font-fraunces)] text-xl font-normal sm:text-2xl">
                Taught from the floor
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/65">
                Your trainer runs two working salons in Bangalore and sees
                clients daily, so what you learn is current practice, not
                textbook theory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHAT YOU LEAVE WITH
      ========================================================= */}
      <section className="bg-[#F1F2EF]">
        <div className="mx-auto grid max-w-[1120px] gap-8 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-20">
          <h2 className="font-[var(--font-fraunces)] text-3xl font-normal leading-tight sm:text-4xl">
            What you leave with
          </h2>

          <p className="text-sm leading-7 text-[#04302C]/70 sm:text-base">
            A skill that sets you apart, not just a certificate. If you want to
            work in a salon, you are the specialist they want to hire. If you
            are building your own practice or freelancing, you have the
            foundation to do it confidently — you know how to assess clients,
            communicate clearly and deliver consistent results.
          </p>
        </div>
      </section>

      {/* =========================================================
          LOCATION
      ========================================================= */}
      <section id="location" className="scroll-mt-20 bg-[#F1F2EF]">
        <div className="mx-auto max-w-[1120px] px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <h2 className="font-[var(--font-fraunces)] text-3xl font-normal leading-tight sm:text-4xl">
            Where we train
          </h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <address className="not-italic text-sm leading-7 text-[#04302C]/75 sm:text-base">
                The Nail Hue, 787, 1st Floor, 1st Cross,
                <br />
                12th Main Road, HAL 2nd Stage, Indiranagar,
                <br />
                Bengaluru, Karnataka 560008
              </address>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={directionsWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#28A499] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#14766D]"
                >
                  <WhatsAppIcon />
                  WhatsApp for directions
                </a>

                <a
                  href="https://www.instagram.com/thenailhue/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#04302C] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#14766D]"
                >
                  See our work on Instagram
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-[#04302C]/10 bg-white">
              <iframe
                title="The Nail Hue Academy - Indiranagar"
                src="https://www.google.com/maps?q=The%20Nail%20Hue%2C%20787%2C%201st%20Floor%2C%201st%20Cross%2C%2012th%20Main%20Road%2C%20HAL%202nd%20Stage%2C%20Indiranagar%2C%20Bengaluru&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section id="faq" className="scroll-mt-20 bg-[#F1F2EF]">
        <div className="mx-auto max-w-[1120px] px-5 pb-20 sm:px-6 lg:px-8">
          <h2 className="font-[var(--font-fraunces)] text-3xl font-normal leading-tight sm:text-4xl">
            FAQs
          </h2>

          <div className="mt-7 max-w-[820px]">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group border-b border-[#04302C]/15"
              >
                <summary className="relative cursor-pointer list-none py-5 pr-10 font-[var(--font-fraunces)] text-lg font-normal text-[#04302C] marker:hidden">
                  {faq.question}

                  <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-[#14766D] transition-transform duration-200 group-open:-rotate-[135deg]" />
                </summary>

                <p className="max-w-[680px] pb-5 pr-6 text-sm leading-7 text-[#04302C]/65">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="bg-[#28A499] text-center text-white">
        <div className="mx-auto max-w-[760px] px-5 py-16 sm:px-6 lg:py-20">
          <h2 className="font-[var(--font-fraunces)] text-4xl font-normal leading-tight sm:text-5xl">
            Find the level that fits you
          </h2>

          <p className="mx-auto mt-4 max-w-[560px] text-sm leading-7 text-white/90">
            Tell us what you do now and what you want to specialise in. We will
            come back with a level, schedule and fees.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={generalWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#14766D] transition hover:bg-[#F1F2EF]"
            >
              <WhatsAppIcon />
              Start on WhatsApp
            </a>

            <a
              href={datesWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/60 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ask about upcoming dates
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
