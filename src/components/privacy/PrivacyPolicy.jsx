"use client";

const sections = [
  { id: "who-we-are", label: "Who we are" },
  { id: "data-we-collect", label: "The data we collect" },
  { id: "health-information", label: "Health and suitability information" },
  { id: "why-we-use", label: "Why we use your data" },
  { id: "consent", label: "Consent and choices" },
  { id: "photographs", label: "Photographs and social media" },
  { id: "whatsapp-meta", label: "WhatsApp, Meta and marketing" },
  { id: "sharing", label: "Who we share data with" },
  { id: "protection", label: "How we protect your data" },
  { id: "children", label: "Children's data" },
  { id: "cctv", label: "CCTV at our salons" },
  { id: "cookies", label: "Cookies and website data" },
  { id: "applicants", label: "Job applicants and trainees" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Get in Touch" },
];

const bulletClass =
  "relative pl-5 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]";

function BulletList({ children }) {
  return <ul className="mb-5 grid gap-2.5">{children}</ul>;
}

function Bullet({ children }) {
  return (
    <li className={bulletClass}>
      <span className="absolute left-0 top-[10px] h-[7px] w-[6px] rounded-[3px_3px_1px_1px] bg-[#28A499]" />
      {children}
    </li>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F1F2EF] text-[#04302C]">
      {/* Hero — pt-20 clears the fixed 80px navbar */}
      <section className="bg-[#04302C] pt-[104px] pb-12 text-white sm:pb-14 sm:pt-[112px] lg:pb-[52px] lg:pt-[116px]">
        <div className="mx-auto w-[calc(100%-36px)] max-w-[1000px]">
          <h1 className="font-serif text-[34px] font-light leading-[1.14] tracking-[-0.015em] sm:text-[40px] lg:text-[46px]">
            Privacy Policy
          </h1>

          <p className="mt-3.5 max-w-[62ch] text-[15px] leading-[1.65] text-white/80 sm:text-[16px]">
            This policy explains what personal data The Nail Hue collects when
            you book, visit or contact us, why we collect it, who we share it
            with, and the choices you have over it.
          </p>

          <div className="mt-[22px] border-t border-white/20 pt-[18px] text-[13px] text-white/70 sm:text-[14.5px]">
            Last updated: [18-September 2026]
            <span className="mx-2">·</span>
            Applies to our Indiranagar and Sarjapur Road salons in Bengaluru and
            to this website
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto grid w-[calc(100%-36px)] max-w-[1000px] grid-cols-1 gap-7 py-9 sm:py-12 lg:grid-cols-[230px_1fr] lg:gap-12">
        {/* Table of Contents */}
        <aside className="rounded-xl border border-[rgba(4,48,44,0.15)] bg-white p-5 lg:sticky lg:top-[92px] lg:h-fit lg:border-0 lg:bg-transparent lg:p-0">
          <h2 className="mb-3 font-sans text-[13px] font-bold tracking-[0.04em] text-[#14766D]">
            ON THIS PAGE
          </h2>

          <nav>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block border-l-2 border-[rgba(4,48,44,0.15)] py-1.5 pl-3 text-[13.5px] leading-[1.45] text-[rgba(4,48,44,0.72)] transition-colors hover:border-[#28A499] hover:text-[#04302C] sm:text-[14.5px]"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Policy Article */}
        <article className="min-w-0">
          {/* Who we are */}
          <section id="who-we-are" className="scroll-mt-[92px]">
            <h2 className="font-serif text-[25px] font-normal leading-[1.14] tracking-[-0.015em] sm:text-[27px] lg:text-[29px]">
              Who we are
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              The Nail Hue (TNH) is a hair, nail and skin salon operating two
              branches in Bengaluru, Karnataka, India. In this policy, "we",
              "us" and "our" mean [REGISTERED ENTITY NAME], the business that
              operates The Nail Hue. We are the data fiduciary responsible for
              the personal data described here.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We operate under the laws of India, including the Digital Personal
              Data Protection Act, 2023 and the rules made under it, and the
              Information Technology Act, 2000 and its rules, as applicable to
              us.
            </p>

            <div className="my-5 rounded-xl border border-[rgba(4,48,44,0.15)] border-l-4 border-l-[#28A499] bg-white px-5 py-5 sm:px-6">
              <p className="m-0 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]">
                <strong>The Nail Hue — Indiranagar</strong>
                <br />
                787, 1st Floor, 1st Cross, 12th Main Road, HAL 2nd Stage,
                Doopanahalli, Indiranagar, Bengaluru, Karnataka 560008
                <br />
                Phone:{" "}
                <a
                  href="tel:+919177185103"
                  className="text-[#14766D] underline underline-offset-2"
                >
                  +91 91771 85103
                </a>
              </p>

              <p className="mt-3 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]">
                <strong>The Nail Hue — Sarjapur Road</strong>
                <br />
                1, Ground Floor, PNR Pride, No. 78, Sarjapur–Marathahalli Road,
                Doddakannelli, Bengaluru, Karnataka 560035
                <br />
                Phone:{" "}
                <a
                  href="tel:+919740355663"
                  className="text-[#14766D] underline underline-offset-2"
                >
                  +91 97403 55663
                </a>
              </p>

              <p className="mt-3 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:thenailhue@gmail.com"
                  className="text-[#14766D] underline underline-offset-2"
                >
                  thenailhue@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Data We Collect */}
          <section id="data-we-collect" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal leading-[1.14] sm:text-[27px] lg:text-[29px]">
              The data we collect
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We only collect what we need to book you in, carry out your
              service safely, take payment and stay in touch with you. Depending
              on how you interact with us, this may include:
            </p>

            <h3 className="mt-6 font-serif text-[18px] font-normal sm:text-[19px]">
              When you book or enquire
            </h3>

            <BulletList>
              <Bullet>
                Your name, mobile number and, if you give it, your email address
              </Bullet>
              <Bullet>The branch, service, date and time you ask for</Bullet>
              <Bullet>
                The content of your WhatsApp messages, calls, emails or website
                enquiry forms, including any photographs you send us of your
                hair or nails
              </Bullet>
              <Bullet>
                Your preferred stylist or technician, where you tell us
              </Bullet>
            </BulletList>

            <h3 className="mt-6 font-serif text-[18px] font-normal sm:text-[19px]">
              When you visit the salon
            </h3>

            <BulletList>
              <Bullet>
                A record of the services you have taken, dates, the team member
                who served you and the price charged
              </Bullet>
              <Bullet>
                Service notes — for example the colour formulation used on your
                hair, the shade or shape of a nail set, the products applied,
                and what worked or did not work last time
              </Bullet>
              <Bullet>
                Photographs of the work done, where you agree to them being
                taken
              </Bullet>
              <Bullet>
                Health and suitability information, as described in the next
                section
              </Bullet>
              <Bullet>
                Your feedback, complaints and any review you share with us
              </Bullet>
            </BulletList>

            <h3 className="mt-6 font-serif text-[18px] font-normal sm:text-[19px]">
              When you pay
            </h3>

            <BulletList>
              <Bullet>
                Transaction details such as amount, date, mode of payment and
                reference number
              </Bullet>
              <Bullet>
                Details of memberships, packages, prepaid balances, gift cards
                or loyalty points, where you hold them
              </Bullet>
            </BulletList>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We do not store your full card number, CVV or UPI PIN. Card and
              UPI payments are processed by our payment provider, and we only
              receive confirmation of the transaction.
            </p>

            <h3 className="mt-6 font-serif text-[18px] font-normal sm:text-[19px]">
              When you use our website
            </h3>

            <BulletList>
              <Bullet>
                Technical data such as your IP address, browser type, device
                type and the pages you view
              </Bullet>
              <Bullet>
                Cookie data, as described under Cookies and website data
              </Bullet>
            </BulletList>
          </section>

          {/* Health */}
          <section id="health-information" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal leading-[1.14] sm:text-[27px] lg:text-[29px]">
              Health and suitability information
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              Some of our services cannot be performed safely without knowing a
              little about your health. Before a colour, chemical, nail or skin
              service we may ask about:
            </p>

            <BulletList>
              <Bullet>
                Allergies and past reactions to hair colour, products or
                adhesives
              </Bullet>
              <Bullet>
                Skin sensitivity, scalp conditions, nail infections or damage to
                the natural nail
              </Bullet>
              <Bullet>
                Pregnancy, where it affects which products and positions are
                appropriate
              </Bullet>
              <Bullet>
                Recent treatments, medication or conditions that can change how
                colour or chemical services behave
              </Bullet>
              <Bullet>
                The result of a patch test, where one is carried out
              </Bullet>
            </BulletList>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We collect this only to decide whether a service is safe and
              appropriate for you, to choose the right products, and to keep a
              record so we do not have to ask again at every visit. We do not
              use it for marketing, and we do not share it outside the team
              performing your service — except where we are required by law to
              do so.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              You can decline to share this information. If you do, we may not
              be able to carry out a particular service, because we would be
              working without knowing whether it is safe for you.
            </p>
          </section>

          {/* Why */}
          <section id="why-we-use" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal leading-[1.14] sm:text-[27px] lg:text-[29px]">
              Why we use your data
            </h2>

            <div className="my-2 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-[14px] sm:text-[15px]">
                <thead>
                  <tr>
                    <th className="bg-[#DCEDEA] px-3 py-2.5 font-bold text-[#14766D]">
                      Purpose
                    </th>
                    <th className="bg-[#DCEDEA] px-3 py-2.5 font-bold text-[#14766D]">
                      What this means in practice
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5 font-bold">
                      Booking and service delivery
                    </td>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5">
                      Confirming your appointment, reminding you of it,
                      preparing for your service and carrying it out
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5 font-bold">
                      Safety and suitability
                    </td>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5">
                      Assessing whether a service is appropriate for your hair,
                      nails or skin, and recording patch test results
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5 font-bold">
                      Consistency between visits
                    </td>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5">
                      Recalling your colour formulation, nail shape, preferred
                      technician and what you liked or disliked, so you do not
                      have to explain it again
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5 font-bold">
                      Payments and accounts
                    </td>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5">
                      Taking payment, issuing bills, managing memberships,
                      packages and loyalty balances, and meeting tax and
                      accounting obligations
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5 font-bold">
                      Communication
                    </td>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5">
                      Answering your questions on WhatsApp, phone or email, and
                      responding to feedback or complaints
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5 font-bold">
                      Marketing, where you have agreed
                    </td>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5">
                      Sending offers, new service announcements and appointment
                      reminders
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5 font-bold">
                      Improving our salons
                    </td>
                    <td className="border-b border-[rgba(4,48,44,0.15)] px-3 py-2.5">
                      Understanding which services are in demand, training our
                      team and improving quality, using aggregated information
                      wherever possible
                    </td>
                  </tr>

                  <tr>
                    <td className="px-3 py-2.5 font-bold">
                      Legal and security
                    </td>
                    <td className="px-3 py-2.5">
                      Meeting our legal obligations, keeping our premises and
                      team safe, and dealing with disputes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Consent */}
          <section id="consent" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Consent and your choices
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              Where we rely on your consent — for marketing messages, for
              photographs of your work, and for health information — you can
              withdraw it at any time by telling us at either branch or
              messaging us on WhatsApp. Withdrawing consent does not affect
              anything we did lawfully before you withdrew it.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              Where we process your data because it is necessary to provide a
              service you have asked for, or because the law requires us to, we
              will tell you at the time.
            </p>
          </section>

          {/* Photographs */}
          <section id="photographs" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Photographs and social media
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We often photograph nail sets, hair colour and makeovers — it is
              how a salon shows its work. We will always ask before
              photographing your hair, nails or face, and you are free to say
              no. Saying no will never affect your service or the way you are
              treated.
            </p>

            <BulletList>
              <Bullet>
                If you agree, your photograph may be used on our Instagram, our
                website, in our salons and in our advertising
              </Bullet>

              <Bullet>
                You can withdraw your permission at any time. Tell us and we
                will remove the image from anything we control, though we cannot
                always recall content that others have already shared or
                reposted
              </Bullet>

              <Bullet>
                If you send us reference pictures of yourself, we treat them as
                part of your service record and use them only to plan your
                service
              </Bullet>
            </BulletList>
          </section>

          {/* WhatsApp */}
          <section id="whatsapp-meta" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              WhatsApp, Meta and marketing messages
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              Most of our bookings and enquiries happen on WhatsApp. We use it
              to confirm bookings, send appointment reminders, share offers and
              chat with you directly. We keep the conversation so we have a
              record of what you asked for and what we agreed.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              WhatsApp is owned and operated by Meta Platforms, Inc. When you
              message us there, your message is also subject to WhatsApp's own
              Privacy Policy and, more broadly, Meta's Privacy Policy. Meta may
              process certain metadata — such as timestamps and device
              information — to operate, secure and improve the WhatsApp Business
              Platform. This happens independently of us, and we do not control
              it.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We also use WhatsApp's broadcast tools, provided by Meta, to send
              offers, reminders and updates in bulk. These broadcasts are
              subject to the same WhatsApp Business Platform terms — Meta
              processes the delivery data it needs to operate broadcast
              messaging, such as timestamps and delivery or read status,
              separately from our own record of what we sent you.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              If we run ads or track engagement on Facebook or Instagram, we may
              use Meta's business tools — such as the Meta Pixel or Custom
              Audiences — to measure ad performance or reach people who have
              interacted with us. These tools use cookies and device identifiers
              governed by Meta's own data policies, separate from this policy.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              In short: once your data reaches WhatsApp or Meta's ad tools, Meta
              acts as an independent controller for that layer. If you have
              concerns about how Meta handles it, we recommend reading Meta's
              policies directly.
            </p>

            <div className="my-5 rounded-xl border border-[rgba(4,48,44,0.15)] border-l-4 border-l-[#28A499] bg-white px-5 py-5 sm:px-6">
              <p className="m-0 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]">
                Appointment confirmations and reminders are part of the service
                you have booked. Offers, promotions and broadcast marketing are
                sent only if you have agreed to receive them. You can opt out at
                any time by replying STOP on WhatsApp, telling the team at
                either branch, or using the contact details in Get in Touch. You
                will still receive messages about appointments you have booked.
              </p>
            </div>
          </section>

          {/* Sharing */}
          <section id="sharing" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Who we share your data with
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We do not sell your personal data. We share it only where it is
              necessary, and only with parties who are required to protect it:
            </p>

            <BulletList>
              <Bullet>
                Our salon software provider — which holds our appointment and
                client records
              </Bullet>
              <Bullet>
                Our payment provider — which processes card and UPI transactions
              </Bullet>
              <Bullet>
                Messaging and communication platforms — including WhatsApp, for
                the conversations you have with us
              </Bullet>
              <Bullet>
                Government or regulatory authorities — where we are required to
                disclose information by law
              </Bullet>
            </BulletList>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              Some of these providers may store data on servers outside India.
              Where that happens, we take reasonable steps to ensure your data
              continues to be protected, and we comply with applicable Indian
              law on transfers of personal data outside the country.
            </p>
          </section>

          {/* Protection */}
          <section id="protection" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              How we protect your data
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We take reasonable security safeguards to protect your personal
              data from loss, misuse and unauthorised access. These include
              restricting access to client records to team members who need
              them, protecting our systems with passwords and access controls,
              relying on reputable software and payment providers, and training
              our team on client confidentiality.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              No system is completely secure. If a personal data breach occurs
              that affects you, we will notify you and the Data Protection Board
              of India as required under Indian law.
            </p>
          </section>

          {/* Children */}
          <section id="children" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Children's data
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We provide services to children, including haircuts. Where a
              client is under 18, we collect their personal data only with the
              consent of a parent or guardian, who must be present at the
              appointment. We do not knowingly collect personal data from anyone
              under 18 through our website or WhatsApp without that consent, and
              we do not use children's data for behavioural advertising or
              tracking. If you believe a child's data has been provided to us
              without proper consent, contact us and we will delete it.
            </p>
          </section>

          {/* CCTV */}
          <section id="cctv" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              CCTV at our salons
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              For the safety of our clients, our team and our premises, CCTV
              cameras operate in the common areas of our salons. Footage is
              accessed only by authorised personnel, kept for a limited period
              and then overwritten, unless it is required for a security or
              legal investigation.
            </p>
          </section>

          {/* Cookies */}
          <section id="cookies" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Cookies and website data
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              Our website uses cookies and similar technologies to make the site
              work, remember your preferences and understand how visitors use
              it. Essential cookies are needed for the site to function.
              Analytics cookies help us see which pages are useful. You can
              block or delete cookies through your browser settings, though some
              parts of the site may not work as intended if you do.
            </p>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              Our website and social media may link to other websites — Google
              Maps, Instagram and WhatsApp among them. We are not responsible
              for their privacy practices, and we encourage you to read their
              policies.
            </p>
          </section>

          {/* Applicants */}
          <section id="applicants" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Job applicants and trainees
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              If you apply to work with us or enrol at our academy, we collect
              the information in your application — your name, contact details,
              CV, qualifications, work history and any references. We use it
              only to assess your application and, if you join us, to manage
              your employment or training. Unsuccessful applications are kept
              for a reasonable period in case another role arises, and deleted
              after that.
            </p>
          </section>

          {/* Changes */}
          <section id="changes" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Changes to this policy
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We may update this policy as our services, our systems or the law
              change. The current version is always on this page, with the date
              it was last updated shown at the top. Where a change materially
              affects how we use your data, we will tell you.
            </p>
          </section>

          {/* Contact */}
          <section id="contact" className="scroll-mt-[92px]">
            <h2 className="mt-11 font-serif text-[25px] font-normal sm:text-[27px] lg:text-[29px]">
              Get in Touch
            </h2>

            <p className="mt-3 text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              To access, correct or delete your information, to withdraw
              consent, or to raise a concern about how we have handled your
              personal data, reach us at:
            </p>

            <div className="my-5 rounded-xl border border-[rgba(4,48,44,0.15)] border-l-4 border-l-[#28A499] bg-white px-5 py-5 sm:px-6">
              <p className="m-0 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]">
                <strong>The Nail Hue</strong>
                <br />
                The Nail Hue, 787, 1st Floor, 1st Cross, 12th Main Rd, HAL 2nd
                Stage, Indiranagar, Bengaluru, Karnataka 560008
              </p>

              <p className="mt-3 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]">
                <strong>Phone / WhatsApp</strong>{" "}
                <a
                  href="tel:+919177185103"
                  className="text-[#14766D] underline underline-offset-2"
                >
                  +91 91771 85103
                </a>
              </p>

              <p className="mt-3 text-[15px] leading-[1.6] text-[#365552] sm:text-[16px]">
                <strong>Email</strong>{" "}
                <a
                  href="mailto:thenailhue@gmail.com"
                  className="text-[#14766D] underline underline-offset-2"
                >
                  thenailhue@gmail.com
                </a>
              </p>
            </div>

            <p className="text-[15px] leading-[1.66] text-[rgba(4,48,44,0.85)] sm:text-[16px]">
              We will acknowledge your request and respond within the timelines
              required under Indian law.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
