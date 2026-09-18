import Image from "next/image";

export default function BranchAbout({ branch }) {
  const isIndiranagar = branch.name === "Indiranagar";

  return (
    <section className="bg-[#294946] px-6 py-20 text-white sm:px-10 md:py-24 lg:px-16 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        {/* Content */}
        <div>
          {/* Heading - Same elegant serif style as Hero */}
          <h2 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-[#20C4B7] sm:text-5xl md:text-[54px] lg:text-[60px]">
            {branch.aboutTitle}
          </h2>

          {/* About Content */}
          {isIndiranagar ? (
            <div className="mt-10 max-w-3xl space-y-7 text-base font-normal leading-8 tracking-[-0.01em] text-white/85 sm:text-lg lg:text-[18px]">
              <p>
                Welcome to Nail Hue Salon, the best nail salon in Indiranagar
                and the ultimate destination for beauty and self-care. Our salon
                is committed to transforming your beauty experience into
                something truly extraordinary. At Nail Hue, we seamlessly blend
                elegance with expertise, offering a sanctuary where you can
                escape from the everyday and indulge in top-quality hair and
                nail services.
              </p>

              <p>
                As you step into our chic and modern space, you’ll immediately
                feel the ambiance of sophistication and warmth. Our team of
                skilled professionals is passionate about their craft and
                dedicated to delivering results that exceed your expectations.
                Whether you’re in for a stylish haircut, a bold new hair color,
                or a complete hair makeover, we tailor our services to match
                your unique style and personality. We also take pride in
                offering the best haircuts for kids, ensuring that even the
                youngest members of your family receive exceptional care.
              </p>

              <p>
                When it comes to nails, Nail Hue Salon is your go-to destination
                for creativity and precision. Our nail studio is renowned for
                its mastery in delivering everything from intricate nail art and
                vibrant gel polish to elegant extensions. We use only the finest
                products to ensure that your nails not only look stunning but
                also remain healthy and strong. Whether you’re preparing for a
                special occasion or simply treating yourself, our manicure and
                pedicure services are designed to make you feel fabulous. Our
                dedicated team is here to provide you with a luxurious and
                personalized experience, ensuring that you leave our salon
                looking and feeling your absolute best.
              </p>
            </div>
          ) : (
            <div className="mt-10 max-w-3xl space-y-7 text-base font-normal leading-8 tracking-[-0.01em] text-white/85 sm:text-lg lg:text-[18px]">
              <p>
                Hey there! Welcome to Nail Hue, best Salon in Sarjapur—
                <strong className="font-semibold text-white">
                  your go-to spot for all things beauty and relaxation.
                </strong>{" "}
                At our vibrant and friendly salon, we’re all about making you
                look and feel fantastic. Whether you’re in the mood for a fresh
                haircut, a bold new color, or stunning nails that turn heads,
                our talented team is here to deliver.
              </p>

              <p>
                Our extensive range of services is designed to cater to every
                aspect of your beauty routine. From the moment you step into our
                chic and welcoming space, you’ll experience the artistry and
                precision of our expert team. We offer a full spectrum of hair
                services, from trendy cuts and vibrant color transformations to
                sophisticated styling that’s perfect for any occasion. Our
                stylists are skilled in the latest techniques and trends,
                ensuring you leave looking and feeling your absolute best.
              </p>

              <p>
                In addition to our exceptional hair and nail services, we offer
                a range of vegan facials and hair spa treatments that emphasize
                relaxation and rejuvenation. Our facials are designed to be both
                effective and gentle, using only vegan and cruelty-free products
                that cater to all skin types. Our hair spa services are crafted
                to provide a tranquil escape, helping you unwind and revitalize
                in a serene environment.
              </p>
            </div>
          )}
        </div>

        {/* Branch Image */}
        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={
                isIndiranagar
                  ? "/images/branches/indiranagar-about.jpg"
                  : "/images/branches/sarjapur-about.jpg"
              }
              alt={`${branch.name} Nail Hue salon interior`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>

          {/* Decorative Accent */}
          <div className="absolute -bottom-3 -left-3 h-16 w-16 border-b border-l border-[#20C4B7]/60 sm:-bottom-4 sm:-left-4 sm:h-20 sm:w-20" />
        </div>
      </div>
    </section>
  );
}
