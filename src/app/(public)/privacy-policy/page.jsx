import PrivacyPolicy from "@/components/privacy/PrivacyPolicy";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thenailhue.com";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How The Nail Hue collects, uses and protects your personal data across our Indiranagar and Sarjapur Road salons in Bengaluru and this website.",
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
