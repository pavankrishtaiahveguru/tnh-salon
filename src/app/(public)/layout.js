// Public website chrome (Navbar / Footer / WhatsApp button) for every
// customer-facing route. Admin routes are intentionally outside this group, so
// /admin/* renders only the admin layout.
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/common/FloatingButtons";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />

      <FloatingButtons />
    </>
  );
}
