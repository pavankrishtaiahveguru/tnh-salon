export const metadata = {
  title: {
    absolute:
      "Best Nail & Hair Salon in Indiranagar, Bangalore | The Nail Hue",
  },
  description:
    "The Nail Hue Indiranagar — nail extensions, hair colour, keratin & unisex salon services on 12th Main Road, HAL 2nd Stage. Near Domlur, Ulsoor & CV Raman Nagar. Open 7 days.",
};

import { notFound } from "next/navigation";
import BranchHero from "@/components/branches/BranchHero";
import BranchAbout from "@/components/branches/BranchAbout";
import BranchLocation from "@/components/branches/BranchLocation";
import BranchCTA from "@/components/branches/BranchCTA";
import { branches } from "@/data/branches";

export default function IndiranagarPage() {
  const branch = branches.indiranagar;

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
