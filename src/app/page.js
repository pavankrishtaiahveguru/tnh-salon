import Testimonials from "@/components/common/Testimonials";
import About from "@/components/home/about";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <Testimonials />
    </>
  );
}
