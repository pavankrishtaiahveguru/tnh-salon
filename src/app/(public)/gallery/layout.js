// The /gallery page is a client component ("use client") and cannot export
// metadata itself, so the route's SEO metadata lives in this server layout.
export const metadata = {
  title: {
    absolute: "Hair, Nail & Skin Transformations | The Nail Hue Bangalore",
  },
  description:
    "See real hair colour, nail art and skin treatment transformations from The Nail Hue's Indiranagar and Sarjapur Road studios.",
};

export default function GalleryLayout({ children }) {
  return children;
}
