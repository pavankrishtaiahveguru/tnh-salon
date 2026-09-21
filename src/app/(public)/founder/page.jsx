export const metadata = {
  title: {
    absolute: "Meet the Founder | The Nail Hue Bangalore",
  },
  description:
    "The story behind The Nail Hue — Bangalore's vegan-friendly nail, hair and skin salon in Indiranagar and Sarjapur Road.",
};

import Image from "next/image";

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF9]">
      {/* Hero */}
      <section className="bg-[#173B38] px-5 pb-16 pt-32 sm:px-8 sm:pb-20 lg:px-10 lg:pt-36">
        <div className="mx-auto max-w-7xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8FD3CC]">
            Our Story
          </span>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Meet the Founder
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            The vision, expertise, and science behind The Nail Hue.
          </p>
        </div>
      </section>

      {/* Founder Introduction */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Founder Image */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl border border-[#218F87]/15 bg-[#EAF6F4]" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#E8EFED] shadow-[0_20px_50px_rgba(23,59,56,0.12)]">
              <Image
                src="/founder/founder.jpg"
                alt="Prashuna Reddy - Founder & CEO of The Nail Hue"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Founder Content */}
          <div className="lg:pt-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#218F87]">
              The Person Behind TNH
            </span>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#173B38] sm:text-4xl">
              Prashuna Reddy
            </h2>

            <p className="mt-2 text-sm font-semibold text-[#218F87]">
              Founder & CEO, The Nail Hue — The Salon Chemist
            </p>

            <div className="mt-5 h-px w-12 bg-[#218F87]" />

            <div className="mt-7 space-y-5 text-sm leading-7 text-[#647572] sm:text-base">
              <p>
                There is a version of the beauty industry that runs on instinct
                alone - a trained eye, a steady hand, a good guess. Prashuna
                Reddy was never satisfied with that version.
              </p>

              <p>
                She trained as a pharmacist first. Before she ever picked up a
                colour brush professionally, she understood formulation - how an
                active behaves on skin, how pH determines what a product can and
                cannot do, why two clients with the same request can need two
                entirely different treatments. That training didn't stay in a
                classroom. It became the lens she has run her career through
                ever since: diagnose first, then execute.
              </p>

              <p>
                That lens found its proving ground at L'Oréal India, where she
                spent eight years in technical and education roles - not on the
                salon floor as a stylist, but behind it, training the stylists
                themselves. She taught colourists across the country how to read
                hair the way a chemist reads a formula: condition, porosity,
                prior chemical history, before a single decision on tone. That
                discipline earned her Best Educator — India, an award presented
                in Moscow, and Best Colourist — South India! recognitions given
                for teaching a standard, not just performing one. A seat at the
                L'Oréal Colour Trophy in London followed.
              </p>

              <p>
                Hair colour remains where her expertise is sharpest. Grey
                blending. Dimensional colour. Correction work — the category
                where a wrong prior treatment has to be read, understood, and
                undone before anything new can be built. It is technical work
                disguised as artistic work, and it's the discipline she is most
                recognised for.
              </p>

              <p>
                She has never treated her education as finished. Alongside her
                pharmacy background and L'Oréal training, she holds
                certifications in makeup artistry and in advanced nail extenions
                from Bluesky — and more recently completed an executive
                programme in business growth at IIM Bangalore (NSRCEL),
                delivered under the Goldman Sachs 10,000 Women initiative. Few
                professionals in Indian beauty hold competence across this many
                disciplines — chemistry, colour, nails, makeup, and now business
                strategy — which is precisely why she is sought out for a
                perspective that spans the industry rather than a single corner
                of it.
              </p>

              <p>
                In 2021, she founded The Nail Hue on a conviction sharpened by
                everything before it: beauty services in India don't need
                reinventing. The operating standards behind them do. Every
                service now runs to a documented protocol. Every client
                interaction begins with consultation, not assumption. Every
                result is owed to the system — not to which technician happened
                to be free that day. Two Bangalore salons operate on that
                standard today.
              </p>

              <p>
                Her work now extends beyond the chair. She designs and delivers
                brand experiences for leading Indian jewellery houses — bringing
                salon-grade craft into live, high-touch moments for brand
                launches and campaigns. It is the same principle applied at a
                different scale: precision, translated into experience.
              </p>

              <p>
                Within the industry, she is known simply as the Salon Chemist —
                the person the market turns to for the science behind the
                service, not just the service itself. It's a name she has built
                deliberately, and one she intends to be the benchmark for.
              </p>
            </div>

            {/* Founder Quote */}
            <div className="mt-8 rounded-r-2xl border-l-2 border-[#218F87] bg-white px-6 py-5 shadow-[0_8px_30px_rgba(23,59,56,0.06)]">
              <p className="text-base font-medium italic leading-7 text-[#173B38] sm:text-lg">
                “Beauty services don't need reinventing. The operating standards
                behind them do.”
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
