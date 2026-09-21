// The /academy page is a client component ("use client") and cannot export
// metadata itself, so the route's SEO metadata lives in this server layout.
export const metadata = {
  title: {
    absolute: "The Nail Hue Academy | Nail & Hair Courses in Bangalore",
  },
  description:
    "Learn nail extensions, BIAB, Russian manicure and hair styling at The Nail Hue Academy, Bangalore. Hands-on training from working salon professionals.",
};

export default function AcademyLayout({ children }) {
  return children;
}
