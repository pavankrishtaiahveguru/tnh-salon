// The /services page is a client component ("use client") and cannot export
// metadata itself, so the route's SEO metadata lives in this server layout.
export const metadata = {
  title: {
    absolute: "Hair, Nail & Skin Services in Bangalore | Price List | The Nail Hue",
  },
  description:
    "Explore nail extensions, BIAB, Russian manicure, hair colour, keratin treatment, hydrafacial, waxing & bridal services at The Nail Hue. Two Bangalore locations, book on WhatsApp.",
};

export default function ServicesLayout({ children }) {
  return children;
}
