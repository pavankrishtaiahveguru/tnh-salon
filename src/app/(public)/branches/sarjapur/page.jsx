export const metadata = {
  title: {
    absolute:
      "Nail, Hair & Facial Salon in Sarjapur Road, Bangalore | The Nail Hue",
  },
  description:
    "The Nail Hue Sarjapur Road — facials, hydrafacial, bikini waxing, nail extensions & hair colour at PNR Pride, Doddakannelli. Near Bellandur, HSR Layout & Whitefield. Open 7 days.",
};

import { notFound } from "next/navigation";
import BranchHero from "@/components/branches/BranchHero";
import BranchAbout from "@/components/branches/BranchAbout";
import BranchLocation from "@/components/branches/BranchLocation";
import BranchCTA from "@/components/branches/BranchCTA";
import { branches } from "@/data/branches";

export default function SarjapurPage() {
  const branch = branches["sarjapur-road"];

  if (!branch) {
    notFound();
  }

  return (
    <main>
      <BranchHero branch={branch} />
      <BranchAbout branch={branch} />
      <BranchLocation branch={branch} />
      <BranchCTA branch={branch} />
    </main>
  );
}
