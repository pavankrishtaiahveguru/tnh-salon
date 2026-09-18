"use client";

import { useMemo, useState } from "react";
import {ChevronDown} from "lucide-react";

const faqSections = [
  {
    title: "Nail Extensions in Bangalore",
    faqs: [
      {
        question: "What do nail extensions actually do?",
        answer:
          "Three things: add length, improve the shape of your nail, and build structure so it holds up to daily use. The length is the part clients see. The structure is the part that decides whether the set lasts three days or three weeks.",
      },
      {
        question: "Which nail extension system is right for me?",
        answer:
          "Short version: soft gel is flexible and natural, hard gel is strong and structured, poly gel is the easy-wearing hybrid, acrylic is the strongest, and full cover tips are the quickest. Add 30 minutes to any of these for solid gel polish.",
      },
      {
        question: "Soak-off or file-off — how will my set be removed?",
        answer:
          'It depends on the system, and it\'s worth knowing before you choose one. Soft gel and full cover tips are soaked off, which is gentler and quicker. Hard gel, acrylic and poly gel cannot be soaked off — they have to be filed down carefully by hand. Filing off a set is a skill, not a shortcut: done badly it thins the natural nail, which is where most stories about extensions "ruining" nails come from. We remove every set in the salon rather than letting it be picked off at home, and removal booked with a new set is done as part of the same appointment.',
      },
      {
        question:
          "What is an apex, and why does my technician keep mentioning it?",
        answer:
          "The apex is the slightly raised point in the middle of the nail where the product is thickest. It is the arch that carries the load — thin near the cuticle, thickest at the centre, medium at the free edge. A nail with no apex is flat, and a flat nail snaps at the stress point no matter which product was used. It is the single most common reason a set fails, and it is entirely down to how the technician builds it. If your nails have broken repeatedly at the same spot, structure is usually the reason rather than the product.",
      },
      {
        question: "Why do extensions lift or pop off?",
        answer:
          "Almost never because of product quality. In our experience it comes down to preparation and technique. Every one of those is a preparation and technique issue. That's why our prep takes longer than you might expect at the start of an appointment — retention is decided before any colour goes on.",
      },
      {
        question: "Will nail extensions damage my natural nails?",
        answer:
          "Worn and removed properly, no. Damage comes from three things: picking a set off at home, over-filing during removal, and leaving a grown-out set on far too long. We soak or file off in the salon, and if your nails need a break we will say so and suggest a BIAB overlay instead, which strengthens your own nails while they grow.",
      },
      {
        question: "How often do I need a refill?",
        answer:
          "Every three to four weeks. Your natural nail grows and moves the apex forward, so the balance of the nail shifts and the stress point changes — that's when sets crack. A refill fills the regrowth at the cuticle and rebuilds the apex in the right place, taking 60 to 75 minutes, and can be finished with fresh gel polish.",
      },
      {
        question: "Does acrylic smell, and is there an option without it?",
        answer:
          "Acrylic does have a distinct chemical smell — it's the liquid monomer, and it air-dries rather than curing under a lamp. If the smell bothers you, poly gel is the closest alternative: similar strength, no odour, and cured under a lamp instead. Soft gel and hard gel are also odour-free.",
      },
      {
        question: "How long does a full set take?",
        answer:
          "60 minutes for soft gel or full cover tips, 60 to 75 for poly gel, 90 for hard gel or acrylic. Add about 30 minutes for solid gel polish, 10 to 15 minutes for simple nail art, and up to two hours for bridal or 3D work. We would rather block the right amount of time than rush structure.",
      },
      {
        question: "Can I get one broken nail repaired?",
        answer:
          "Yes. Extensions, overlays, nail art and gel polish are all priced per finger as well as per hand, so a single repair takes about 20 minutes. Come in rather than leaving a broken nail — a cracked extension catches and can tear the natural nail underneath.",
      },
      {
        question: "Can I get extensions on my toes?",
        answer:
          "Yes — soft gel, gum gel, classic full cover and acrylic or hard gel extensions are all available for toenails, taking 45 to 60 minutes for a full set. We also rebuild a single big toe, which is the usual fix for one damaged or lifting toenail before a holiday or a wedding.",
      },
    ],
  },

  {
    title: "Manicures, BIAB and Overlays",
    faqs: [
      {
        question:
          "What is a Russian manicure, and how is it different from a normal one?",
        answer:
          "A normal manicure makes nails look clean. A Russian manicure makes them look finished. The reason it holds longer is that the pterygium — the fine dead skin that grows onto the nail plate — is removed properly, so gel bonds to clean nail rather than to skin.",
      },
      {
        question: "Is a Russian manicure safe?",
        answer:
          "In trained hands, yes. Done badly it isn't, and it's worth knowing what to look for: live skin being cut, the drill run at too high a speed, the bit held flat against the nail plate, or held in one spot long enough to generate heat. Any of those can thin or damage the nail. Our technicians are trained on bit selection, angle and speed control before they are allowed to do this service on a client. If it ever feels hot or sharp, say so immediately — it should feel like nothing at all.",
      },
      {
        question: "Why does my gel polish lift within a week?",
        answer:
          "Usually because it was applied over skin rather than nail. If the pterygium isn't removed at the cuticle, the gel bonds to dead skin that lifts away within days, and the whole edge peels. Natural oil left on the nail plate and gel touching the cuticle do the same thing. A Russian manicure fixes this at the source, which is why it is our recommended base under gel polish and under extensions.",
      },
      {
        question: "What is BIAB, and do I need length to have it?",
        answer:
          "No length needed. BIAB — Builder In A Bottle — is a builder gel applied over your own nails as an overlay. It adds an apex and strength so weak nails can grow out without splitting or breaking, and it can be worn plain or with solid, glitter or neon gel colour. It's the right answer if you want your own nails to get longer rather than wearing extensions, and a full set takes 60 to 90 minutes.",
      },
      {
        question: "What is an overlay, and is it the same as an extension?",
        answer:
          "An overlay is a protective layer of builder gel with a small apex built in. No length is added. An extension adds length. They're often confused, but they solve different problems.",
      },
      {
        question: "BIAB, builder gel or hard gel — which should I have?",
        answer:
          "Builder gel flexes slightly with your natural nail, which is why it's more comfortable over the long run and easier to refill. Hard gel is rigid — stronger, but better suited to length than to everyday overlays.",
      },
      {
        question: "Can builder gel fix bitten or uneven nails?",
        answer:
          "Yes, and it's one of the things we're asked for most. A length-correction overlay rebuilds the shape of short, bitten or uneven nails and gives the natural nail a protected surface to grow under. Most clients see a real difference over two or three appointments — it isn't instant, but it works, and it breaks the biting habit for many people because there's nothing left to bite.",
      },
      {
        question: "Which pedicure should I book?",
        answer:
          "For cracked heels or hard skin specifically, Heel Peel or Pedi Smooth target that without a full pedicure.",
      },
      {
        question: "Is there a pedicure that is safe during pregnancy?",
        answer:
          "Yes. Our Footlogix pedicure uses pharmaceutical-grade foot care formulated to be safe during pregnancy and for delicate or mature skin, and it is the one we recommend for swollen, dry or cracked feet in later pregnancy. Tell us when you book so we can seat you comfortably and keep the session unhurried.",
      },
      {
        question: "Do you treat very dry hands or cracked heels?",
        answer:
          "Yes. Heel Peel exfoliates cracked, hardened heels in about 30 minutes. Foot and hand moisture gloves are intensive treatment masks for skin ordinary creams no longer help. The Footlogix manicure does the same for very dry, rough hands, and our nail strength manicure targets weak, peeling or brittle nails.",
      },
      {
        question: "How long does gel polish last?",
        answer:
          "Two to three weeks, glossy and chip-free — longer over a Russian manicure, because the base is cleaner. Gel polish is cured under lamp rather than air-dried, so you leave with nails that are completely dry. When you want a change we soak it off.",
      },
    ],
  },

  {
    title: "Nail Art",
    faqs: [
      {
        question: "What nail art do you do at The Nail Hue?",
        answer:
          "We offer a wide range of nail art, from simple French and chrome finishes through to cat eye, ombre, 3D and bridal nail art.",
      },
      {
        question: "Can I bring a design I have seen on Instagram or Pinterest?",
        answer:
          "Yes. You can bring a reference image and our technician can discuss how closely it can be recreated based on your nail shape, length and the products required.",
      },
      {
        question: "Do you do bridal nail art in Bangalore?",
        answer:
          "Yes. Bridal nail art is available and can include detailed, embellished and 3D designs. For wedding appointments, we recommend booking in advance so enough time can be reserved.",
      },
    ],
  },

  {
    title: "Hair Colour, Cutting and Treatments",
    faqs: [
      {
        question: "Do you do balayage and highlights in Indiranagar?",
        answer:
          "Yes. We offer highlights, balayage, global colour and root touch-ups, with colour options with or without ammonia.",
      },
      {
        question: "Should I choose hair colour with or without ammonia?",
        answer:
          "The right choice depends on your hair condition, previous colour and the result you want. Our team can assess your hair and recommend the appropriate option during consultation.",
      },
      {
        question: "Can you fix hair colour that has gone wrong?",
        answer:
          "Yes. We offer colour correction for brassy, orange, patchy or banded colour, including colour caused by previous box colour or work done elsewhere. Depending on the condition of the hair, correction can take several hours.",
      },
      {
        question:
          "What is the difference between keratin, smoothening and hair botox?",
        answer:
          "These are different chemical or conditioning treatments designed to improve manageability, smoothness and the appearance of the hair. The appropriate treatment depends on your existing hair condition and the result you want.",
      },
      {
        question: "Will colour or chemical treatment damage my hair?",
        answer:
          "Chemical services can affect the condition of hair, particularly when the hair has already been coloured or processed. Your hair should be assessed before treatment so the service can be chosen appropriately.",
      },
      {
        question: "Which hair spa should I pick?",
        answer:
          "The right hair spa depends on your scalp and hair concerns. Tell the team what you want to address during consultation and they can guide you to the suitable treatment.",
      },
      {
        question: "Why are hair services priced by S, M and L?",
        answer:
          "Hair services are priced according to hair length because the amount of product and time required can vary significantly between short, medium and long hair.",
      },
      {
        question: "Do you do men's haircuts, beard styling and hair colour?",
        answer:
          "Yes. The Nail Hue is a unisex salon offering men's haircuts, beard work, colour, spas, waxing, threading, pedicures and manicures.",
      },
    ],
  },

  {
    title: "Skin, Facials and Waxing",
    faqs: [
      {
        question:
          "What is the difference between strip-less wax and roll-on waxing?",
        answer:
          "Strip-less waxing uses hard wax that grips the hair rather than the skin, so it lifts even short hair with far less pulling — we use it on the face, underarms, bikini area and anywhere sensitive. Roll-on waxing uses a fresh single-use cartridge per client and is our choice for arms, legs, midriff and back, where speed and even coverage matter more. Both leave skin smooth for weeks.",
      },
      {
        question: "Do you do bikini waxing in Bangalore?",
        answer:
          "Yes, at our Sarjapur Road branch. It is done with hard wax for a careful, hygienic finish, in a private room, by a female therapist. A bikini jelly pack afterwards calms irritation and helps even the skin tone.",
      },
      {
        question: "What is D-Tan, and how is it different from bleach?",
        answer:
          "D-Tan lifts sun tan and evens out skin tone; bleach lightens the appearance of hair and dullness on the skin. We offer both across the face, neck, arms, legs, underarms, midriff, back and full body. The face, neck and blouse line combination is the one most clients book before a saree or lehenga event, so there is no visible line where the tan stops.",
      },
      {
        question: "Which facial should I book?",
        answer:
          "Our facials run at Sarjapur Road and are chosen by skin concern. For a quicker refresh, our classic, marine mud and advanced clean-ups run 30 to 45 minutes at both branches.",
      },
      {
        question: "Do you do HydraFacial in Bangalore?",
        answer:
          "Yes. Our Hydra Facial Boost is a multi-step cleanse, exfoliate and hydrate treatment that leaves skin visibly plumper and glowing, running 60 to 75 minutes at Sarjapur Road. It is our most-booked treatment before an event because there is no downtime.",
      },
      {
        question: "Do you do threading and body polishing?",
        answer:
          "Yes. Threading covers eyebrows, upper and lower lip, chin, forehead, sidelocks, neckline and full face at both branches. Body scrubs exfoliate; body polishing goes further, exfoliating and then nourishing with a pack for a visible glow — the full-body version is a pre-wedding favourite at 90 minutes.",
      },
    ],
  },

  {
    title: "Bridal and Events",
    faqs: [
      {
        question: "How far in advance should I book for a wedding or event?",
        answer:
          "At least two weeks for events, and as early as possible for wedding dates. Colour and chemical services should be done two to three weeks before the event rather than the week of it, so the hair settles. Nails, makeup and body polishing are best done in the two or three days before.",
      },
      {
        question: "Do you do bridal makeup and saree draping?",
        answer:
          "Yes. Basic makeup with saree draping takes about an hour; HD finish makeup uses high-definition products built for photography; party makeup is bolder and longer-wearing; and luxury glam up is our most complete service at two hours, designed around your outfit.",
      },
      {
        question: "Can I book several services in one visit?",
        answer:
          "Yes, and for events we recommend it. Tell us everything you want on WhatsApp and we will sequence it properly — colour before cut, waxing and D-Tan before makeup, nails last so nothing smudges — and block the right amount of time at one branch.",
      },
    ],
  },

  {
    title: "Choosing the Right Salon and Service",
    faqs: [
      {
        question: "Where can I get hair colour correction done in Bangalore?",
        answer:
          "We do colour correction at both our Indiranagar and Sarjapur Road branches. It neutralises brassy, orange, patchy or banded tone left by previous colour — including box colour and work done elsewhere — and rebuilds an even shade, taking three to five hours depending on what is already on the hair. If the problem is only faded or slightly warm tone, a gloss toner fixes it in 30 to 45 minutes for far less. Send a photo in daylight on WhatsApp and we will tell you which one you actually need before you book.",
      },
      {
        question:
          "Which nail salon near Indiranagar does gel extensions and nail art?",
        answer:
          "Our Indiranagar studio is on 12th Main Road in HAL 2nd Stage, a few minutes from Domlur, Ulsoor, CV Raman Nagar, Jeevan Bhima Nagar and Old Airport Road. We do all five extension systems — soft gel, hard gel, acrylic, poly gel and full cover tips — plus BIAB, Russian manicures and nail art from simple French through to 3D and bridal work. Open 10:30 am to 9:00 pm, seven days.",
      },
      {
        question:
          "Is there a good nail and hair salon near Sarjapur Road or Bellandur?",
        answer:
          "Our Sarjapur Road branch is at PNR Pride on Sarjapur–Marathahalli Road in Doddakannelli, behind Indriya Aditya Birla Jewellery — convenient from Bellandur, Kasavanahalli, Haralur, HSR Layout, Carmelaram and Whitefield. It carries the full nail and hair menu plus facials, bikini waxing, full-body waxing and D-Tan, which are available at this branch only. Open 10:30 am to 9:00 pm, seven days.",
      },
      {
        question:
          "How much do nail extensions and salon services cost in Bangalore?",
        answer:
          "Our starting prices, so you can plan before you book. Hair services are priced by length, and nail services per finger or per hand, so your final price is confirmed at consultation before we begin.",
      },
      {
        question:
          "Which facial should I book for tan, oily skin or sensitive skin?",
        answer:
          "Facials run at our Sarjapur Road branch. If you are unsure, tell us your skin concern on WhatsApp and we will recommend one rather than upsell you the longest.",
      },
      {
        question:
          "I have a wedding or event coming up — what should I book, and when?",
        answer:
          "For an event, tell us all the services you need on WhatsApp and we can help sequence them appropriately and reserve enough time. Colour and chemical services are generally planned earlier, while nails, makeup and body polishing can be scheduled closer to the event.",
      },
      {
        question: "Can I get an appointment today, or on a Sunday?",
        answer:
          "Both branches are open seven days a week including Sundays, 10:30 am to 9:00 pm. Same-day slots are often available for shorter services such as gel polish, threading, a blow-dry or a repair. Longer services — extensions, colour, chemical treatments and facials — need one to five hours, so those depend on what is free. Message us on WhatsApp and we will tell you the earliest slot we can hold.",
      },
      {
        question:
          "What makes The Nail Hue different from other salons in Bangalore?",
        answer:
          "Three things clients tell us they notice. Our technicians are trained in-house on structure and nail health before they work on a client, which is why we talk about apex and preparation rather than just colour. We assess your hair or nail condition first and will tell you honestly when something will not work — a service we decline is cheaper for you than one that fails. And we use vegan nail and beauty products chosen for what they do to your hair, nails and skin rather than for how they photograph.",
      },
    ],
  },

  {
    title: "Booking, Branches, Products and Hygiene",
    faqs: [
      {
        question: "How do I book an appointment at The Nail Hue?",
        answer:
          "Message us on WhatsApp with the service you want and your preferred day, and we will confirm a slot. Walk-ins are welcome when a station is free, but nail extensions, colour, chemical treatments and facials run one to five hours, so those are worth booking ahead.",
      },
      {
        question: "Where are your salons in Bangalore?",
        answer:
          "Indiranagar — 787, 1st Floor, 1st Cross, 12th Main Road, HAL 2nd Stage, Doopanahalli, Indiranagar, Bengaluru 560008. Easy to reach from Domlur, CV Raman Nagar and Old Airport Road. Open 10:30 am to 9:00 pm, seven days. Sarjapur Road — 1, Ground Floor, PNR Pride, No. 78, Sarjapur–Marathahalli Road, behind Indriya Aditya Birla Jewellery, Doddakannelli, Bengaluru 560035. Open 10:30 am to 9:00 pm, seven days.",
      },
      {
        question: "What are your opening hours?",
        answer:
          "Both branches are open 10:30 am to 9:00 pm, seven days a week. Long services — extensions, colour, chemical treatments and facials — need to start well before closing, so message us on WhatsApp and we will tell you the latest slot we can take you for what you want.",
      },
      {
        question: "Are all services available at both branches?",
        answer:
          "Most are. Facials, bikini waxing, full-body waxing, full-body bleach and D-Tan, and back massage currently run at Sarjapur Road only. Everything in nails — extensions, gel polish, nail art, BIAB, Russian manicures, refills and removals — runs at both. Tell us what you want when you book and we will point you to the right branch.",
      },
      {
        question: "Are your products vegan?",
        answer:
          "We use vegan nail and beauty products in our salon, and our anti-dandruff spa is a fully plant-based scalp treatment. Product choice matters to us — every product on our shelf is selected for what it does to your hair, nails and skin rather than for how it photographs. If you are avoiding a specific ingredient, tell us at consultation and we will confirm what is in the product before we start.",
      },
      {
        question: "How do you maintain hygiene at the salon?",
        answer:
          "Tools are sterilised between every client, disposable items are single-use, and roll-on waxing uses a fresh cartridge per client. Stations are reset between appointments. If you would like to see how anything is prepared before we start, ask us — we would rather show you.",
      },
      {
        question: "Do you do a patch test before hair colour?",
        answer:
          "If you have a sensitive scalp, a history of reaction to colour, or you have never coloured before, we will arrange a patch test before your appointment. Tell us when you book so we can schedule it with enough time before your colour date. [Confirm your patch test policy and lead time.]",
      },
      {
        question: "Do you take men's and children's appointments?",
        answer:
          "Yes. We are a unisex salon — men's haircuts, beard work, colour, spas, waxing, threading, pedicures and manicures are all available, and we do children's haircuts for boys and girls under seven.",
      },
    ],
  },
];

export default function FAQs() {
  const [openItem, setOpenItem] = useState(null);

  const totalFAQs = useMemo(
    () =>
      faqSections.reduce((total, section) => total + section.faqs.length, 0),
    [],
  );

  const toggleFAQ = (sectionIndex, faqIndex) => {
    const key = `${sectionIndex}-${faqIndex}`;

    setOpenItem((current) => (current === key ? null : key));
  };

  return (
    <section className="bg-[#F1F2EF] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#14766D] sm:text-xs">
            Frequently Asked Questions
          </span>

          <h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-tight text-[#04302C] sm:text-5xl lg:text-6xl">
            Your questions about nails, hair and skin
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#526966] sm:text-base">
            Everything people ask us before booking at The Nail Hue — nail
            extensions, gel polish, nail art, hair colour, keratin, waxing and
            facials.
          </p>

          <p className="mt-3 text-xs font-medium text-[#14766D]">
            {totalFAQs} questions answered
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {faqSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <h3 className="mb-4 font-serif text-2xl font-medium text-[#04302C] sm:text-3xl">
                {section.title}
              </h3>

              <div className="overflow-hidden rounded-2xl border border-[#04302C]/10 bg-white">
                {section.faqs.map((faq, faqIndex) => {
                  const key = `${sectionIndex}-${faqIndex}`;
                  const isOpen = openItem === key;

                  return (
                    <div
                      key={faq.question}
                      className="border-b border-[#04302C]/10 last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFAQ(sectionIndex, faqIndex)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors duration-200 hover:bg-[#F8FAF8] sm:px-7 sm:py-6"
                      >
                        <span className="font-serif text-base font-medium leading-snug text-[#04302C] sm:text-lg">
                          {faq.question}
                        </span>

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl font-light text-[#14766D] transition-transform duration-300 ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                          aria-hidden="true"
                        >
                          <ChevronDown size={20} />
                        </span>
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 pb-6 pr-14 text-sm leading-7 text-[#526966] sm:px-7 sm:pb-7 sm:pr-20 sm:text-[15px]">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
