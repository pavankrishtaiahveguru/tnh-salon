export const metadata = {
  title: {
    absolute: "The Nail Hue | Best Nail, Hair & Skin Salon in Bangalore",
  },
  description:
    "Unisex nail, hair & skin salon in Bangalore with branches in Indiranagar and Sarjapur Road. Nail extensions, BIAB, hair colour, keratin, facials, bridal — vegan products, 5+ years experience.",
};

import Testimonials from "@/components/common/Testimonials";
import About from "@/components/home/about";
import BranchLocations from "@/components/home/BranchLocations";
import FAQs from "@/components/home/FAQs";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <BranchLocations />
      <About />
      <Testimonials />
      <FAQs />
    </>
  );
}
