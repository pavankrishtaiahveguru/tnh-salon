import { notFound } from "next/navigation";
import BranchHero from "@/components/branches/BranchHero";
import BranchAbout from "@/components/branches/BranchAbout";
import BranchLocation from "@/components/branches/BranchLocation";
import BranchCTA from "@/components/branches/BranchCTA";
import { branches } from "@/data/branches";
import BranchStats from "@/components/branches/BranchStats";

export default function SarjapurPage() {
  const branch = branches["sarjapur-road"];

  if (!branch) {
    notFound();
  }

  return (
    <main>
      <BranchHero branch={branch} />
      <BranchAbout branch={branch} />
      <BranchStats />
      <BranchLocation branch={branch} />
      <BranchCTA branch={branch} />
    </main>
  );
}
