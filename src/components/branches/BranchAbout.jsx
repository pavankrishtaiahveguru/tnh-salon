import Image from "next/image";

export default function BranchAbout({ branch }) {
  const isIndiranagar = branch.name === "Indiranagar";

  return (
    <section className="bg-[#294946] px-6 py-20 text-white sm:px-10 md:py-24 lg:px-16 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        {/* =========================
            CONTENT
        ========================== */}
        <div className="min-w-0">
          {/* Heading */}
          <h2 className="max-w-2xl font-serif text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-[#20C4B7] sm:text-5xl md:text-[54px] lg:text-[60px]">
            {isIndiranagar
              ? "Hair, Nails & Skin Salon in Indiranagar, Bengaluru"
              : "Nail, Hair & Skin Salon in Sarjapur Road, Bengaluru"}
          </h2>

          {isIndiranagar ? (
            /* =========================
               INDIRANAGAR
            ========================== */
            <div className="mt-10 max-w-2xl space-y-10 text-base font-normal leading-8 tracking-[-0.01em] text-white/85 sm:text-lg lg:text-[18px]">
              {/* Introduction */}
              <div>
                <p className="text-justify">
                  The Nail Hue is a hair, nail, and skin salon serving
                  Indiranagar and the surrounding East Bengaluru neighbourhoods,
                  including areas around 100 Feet Road, HAL 2nd Stage, Domlur,
                  and Ulsoor. Whether you're looking for a quick manicure
                  between meetings or a full hair appointment on the weekend,
                  our Indiranagar salon is built around convenience,
                  consistency, and genuine care for what each client actually
                  wants.
                </p>
              </div>

              {/* Hair */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Hair Salon in Indiranagar
                </h3>

                <p className="mb-4 text-justify">
                  Our hair services cover the everyday and the occasion-worthy,
                  including:
                </p>

                <ul className="list-disc space-y-1.5 pl-6 text-left">
                  <li>Haircuts</li>
                  <li>Hair styling</li>
                  <li>Hair colouring</li>
                  <li>Hair treatments</li>
                  <li>Hair spa</li>
                </ul>

                <p className="mt-5 text-justify">
                  Our stylists take the time to understand your hair texture and
                  goals before recommending a service, rather than pushing a
                  one-size-fits-all approach.
                </p>
              </div>

              {/* Nails */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Nail Salon in Indiranagar
                </h3>

                <p className="mb-4 text-justify">
                  Nails remain one of the things The Nail Hue is best known for
                  in Indiranagar. Our nail menu includes:
                </p>

                <ul className="list-disc space-y-1.5 pl-6 text-left">
                  <li>Manicure</li>
                  <li>Pedicure</li>
                  <li>Nail extensions</li>
                  <li>Gel nails</li>
                  <li>Nail art</li>
                </ul>

                <p className="mt-5 text-justify">
                  Each appointment is approached with attention to hygiene and
                  finish, whether you're coming in for a simple polish change or
                  a more elaborate nail art design ahead of an event.
                </p>
              </div>

              {/* Skin */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Skin Cleanups in Indiranagar
                </h3>

                <p className="text-justify">
                  For skin, we keep things simple and focused with professional
                  cleanups, a straightforward way to refresh your skin without
                  committing to a longer facial appointment. It's a popular
                  add-on for clients looking to fit basic skincare into a quick
                  visit alongside a haircut or manicure.
                </p>
              </div>

              {/* Experience */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Your Beauty Destination in Indiranagar
                </h3>

                <p className="text-justify">
                  What brings hair, nails, and skin together at The Nail Hue is
                  a consistent standard of care across every service. Our team
                  is trained across all three categories, so a single visit can
                  cover more than one need — a haircut and manicure, or a
                  cleanup and pedicure, for instance — without compromising on
                  attention to detail. The salon is designed to feel relaxed
                  rather than rushed, whether you're a first-time visitor or a
                  regular.
                </p>
              </div>

              {/* Visit */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Visit The Nail Hue in Indiranagar, Bengaluru
                </h3>

                <p className="text-justify">
                  The Nail Hue offers hair, nail, and skin services from its
                  Indiranagar salon in Bengaluru, conveniently placed for
                  clients across Indiranagar, Domlur, Ulsoor, and Jeevan Bima
                  Nagar. If you're searching for a salon in Indiranagar that
                  handles hair, nails, and skin under one roof, we'd be glad to
                  have you visit — book an appointment online or call ahead to
                  check availability.
                </p>
              </div>
            </div>
          ) : (
            /* =========================
               SARJAPUR ROAD
            ========================== */
            <div className="mt-10 max-w-2xl space-y-10 text-base font-normal leading-8 tracking-[-0.01em] text-white/85 sm:text-lg lg:text-[18px]">
              {/* Introduction */}
              <div>
                <p className="text-justify">
                  The Nail Hue on Sarjapur Road is a full-service salon for
                  hair, nails, and skin, located at PNR Pride on
                  Sarjapur–Marathahalli Road, just behind Indriya (Aditya Birla
                  Jewellery) in Doddakannelli. If you're looking for a reliable
                  beauty salon in Sarjapur or a nail salon near Sarjapur Road,
                  our team blends technical skill with a relaxed, welcoming
                  atmosphere — whether you're popping in for a quick manicure or
                  settling in for a full hair transformation.
                </p>
              </div>

              {/* Hair */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Hair Services at The Nail Hue Sarjapur Road
                </h3>

                <p className="mb-4 text-justify">
                  Our stylists offer a complete range of hair services for
                  everyday maintenance and special occasions alike, including:
                </p>

                <ul className="list-disc space-y-1.5 pl-6 text-left">
                  <li>Haircuts</li>
                  <li>Hair styling</li>
                  <li>Hair colouring</li>
                  <li>Hair treatments</li>
                  <li>Hair spa</li>
                </ul>

                <p className="mt-5 text-justify">
                  Whether you're after a subtle trim or a bolder colour change,
                  our team takes the time to understand what works for your hair
                  type and lifestyle before recommending a service.
                </p>
              </div>

              {/* Nails */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Nail Services in Sarjapur Road
                </h3>

                <p className="mb-4 text-justify">
                  Nails are at the heart of what we do, and our Sarjapur Road
                  branch offers the full spectrum of nail care, including:
                </p>

                <ul className="list-disc space-y-1.5 pl-6 text-left">
                  <li>Manicure</li>
                  <li>Pedicure</li>
                  <li>Nail extensions</li>
                  <li>Gel nails</li>
                  <li>Nail art</li>
                </ul>

                <p className="mt-5 text-justify">
                  Our technicians work with clean tools and quality products, so
                  whether you're coming in for routine upkeep or a more detailed
                  nail art design, you can expect careful, hygienic service
                  every time.
                </p>
              </div>

              {/* Skin */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Skin & Facial Services in Sarjapur
                </h3>

                <p className="mb-4 text-justify">
                  Alongside hair and nails, we offer a range of skin and facial
                  treatments aimed at helping your skin look and feel healthier,
                  including:
                </p>

                <ul className="list-disc space-y-1.5 pl-6 text-left">
                  <li>Facials</li>
                  <li>Skin treatments</li>
                  <li>Vegan facials</li>
                </ul>

                <p className="mt-5 text-justify">
                  These treatments are a popular add-on for clients in Sarjapur
                  and Doddakannelli looking for a proper self-care break without
                  having to travel far from home.
                </p>
              </div>

              {/* Experience */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  The TNH Experience
                </h3>

                <p className="text-justify">
                  What ties our hair, nail, and skin services together is a
                  consistent focus on hygiene, comfort, and genuinely listening
                  to what our clients want. Our Sarjapur Road space is designed
                  to feel calm and unhurried, so you can relax whether you're
                  here for a 30-minute pedicure or a longer hair and skin
                  combination appointment. We keep our tools sanitised and our
                  processes consistent, so every visit — first-time or regular —
                  feels dependable.
                </p>
              </div>

              {/* Visit */}
              <div>
                <h3 className="mb-4 text-xl font-medium text-[#20C4B7] sm:text-2xl">
                  Visit Us in Sarjapur Road, Bengaluru
                </h3>

                <p className="text-justify">
                  Conveniently located on Sarjapur–Marathahalli Road, The Nail
                  Hue is an easy stop for residents around Doddakannelli,
                  Sarjapur, and the wider Sarjapur Road stretch of Bengaluru.
                  We're open seven days a week, making it simple to fit a
                  haircut, manicure, pedicure, or facial into a busy schedule.
                  If you're searching for a hair, nail, and skin salon near
                  Sarjapur Road, we'd love to have you visit — book your
                  appointment online or give us a call to get started.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =========================
            BRANCH IMAGE
        ========================== */}
        <div className="relative lg:sticky lg:top-28">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden">
            <Image
              src={
                isIndiranagar
                  ? "/images/branches/indiranagar-about.jpg"
                  : "/images/branches/sarjapur-about.jpg"
              }
              alt={`${branch.name} Nail Hue salon interior`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>

          {/* Decorative Accent */}
          <div className="absolute -bottom-4 -left-4 h-20 w-20 border-b border-l border-[#20C4B7]/60" />
        </div>
      </div>
    </section>
  );
}
