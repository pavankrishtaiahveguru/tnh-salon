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
      <About />
      <Testimonials />
      <BranchLocations />
      <FAQs />
    </>
  );
}
