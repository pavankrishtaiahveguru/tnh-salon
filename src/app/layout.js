import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Root layout: only global chrome shared by the whole app (html, body, fonts,
// metadata). The public Navbar/Footer live in the (public) route group layout,
// and the admin panel has its own layout in src/app/admin/layout.jsx — so
// /admin/* never receives the public website navigation.
export const metadata = {
  title: {
    default: "The Nail Hue | Nail, Hair & Skin Salon",
    template: "%s | The Nail Hue",
  },
  description:
    "The Nail Hue is a premium nail and hair salon offering professional beauty, hair, nail, skin, and self-care services in Bengaluru.",

  icons: {
    icon: "/logo/logo.jpg",
    shortcut: "/logo/logo.jpg",
    apple: "/logo/logo.jpg",
  },

  keywords: [
    // Hair
    "Hair Salon Bangalore",
    "Hair Salon Bengaluru",
    "Best Hair Salon Bangalore",
    "Hair Styling Bangalore",
    "Hair Cut Bangalore",
    "Hair Colour Bangalore",
    "Hair Coloring Bangalore",
    "Hair Highlights Bangalore",
    "Hair Balayage Bangalore",
    "Hair Treatment Bangalore",
    "Hair Spa Bangalore",
    "Hair Care Bangalore",
    "Hair Transformation Bangalore",
    "Professional Hair Salon Bangalore",
    "Hair Salon Indiranagar",
    "Hair Salon Sarjapur",
    "Hair Salon Sarjapur Road",

    // Nails
    "Nail Salon Bangalore",
    "Nail Salon Bengaluru",
    "Best Nail Salon Bangalore",
    "Nail Art Bangalore",
    "Nail Extensions Bangalore",
    "Gel Nails Bangalore",
    "Gel Nail Extensions Bangalore",
    "Manicure Bangalore",
    "Pedicure Bangalore",
    "Nail Care Bangalore",
    "Nail Treatment Bangalore",
    "Professional Nail Salon Bangalore",
    "Nail Salon Indiranagar",
    "Nail Salon Sarjapur",
    "Nail Salon Sarjapur Road",

    // Skin
    "Skin Care Bangalore",
    "Skin Care Bengaluru",
    "Skin Treatment Bangalore",
    "Skin Care Salon Bangalore",
    "Facial Bangalore",
    "Best Facial Bangalore",
    "Facial Treatment Bangalore",
    "Beauty Facial Bangalore",
    "Skin Facial Bangalore",
    "Face Treatment Bangalore",
    "Skin Rejuvenation Bangalore",
    "Skin Care Indiranagar",
    "Skin Care Sarjapur",
    "Facial Indiranagar",
    "Facial Sarjapur",
  ],
  authors: [{ name: "The Nail Hue" }],
  creator: "The Nail Hue",
  publisher: "The Nail Hue",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "The Nail Hue | Nail & Hair Salon",
    description:
      "Discover professional nail, hair, skin, and beauty services at The Nail Hue in Bengaluru.",
    type: "website",
    locale: "en_IN",
    siteName: "The Nail Hue",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
