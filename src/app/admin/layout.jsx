"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import {
  getSession,
  logout,
  subscribeToSession,
  verifySession,
} from "@/lib/admin/auth";

// The login page renders without the dashboard chrome.
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

// Session is read through an external store: the server snapshot is always
// null (spinner), and after hydration the client snapshot reflects the real
// session. This avoids hydration mismatches without setState-in-effect.
const getServerSession = () => null;
const emptySubscribe = () => () => {};
const getClientReady = () => true;

// Verification states: "loading" (checking the token against the backend),
// "authenticated" (valid session), "unauthenticated" (redirect to login).
const VERIFICATION = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authInitialized = useSyncExternalStore(
    emptySubscribe,
    getClientReady,
    () => false,
  );
  const [verification, setVerification] = useState(VERIFICATION.LOADING);
  const verifiedTokenRef = useRef(null);

  // Subscribe to the session store.
  const session = useSyncExternalStore(
    subscribeToSession,
    getSession,
    getServerSession,
  );

  const isLoginPage = PUBLIC_ADMIN_PATHS.includes(pathname);

  // Auth guard: a stored token is verified against the backend (GET
  // /api/auth/me) before any protected admin page renders. Expired or
  // revoked tokens clear the session (handled inside the auth module) and
  // send the admin back to the login page.
  useEffect(() => {
    if (!authInitialized) return;

    if (isLoginPage) {
      return;
    }

    const token = session?.token ?? null;

    if (!token) {
      verifiedTokenRef.current = null;
      router.replace("/admin/login");
      return;
    }

    // Skip re-verification when navigating between admin pages with the
    // same token; re-verify when the token changes (login/logout).
    if (verifiedTokenRef.current === token) {
      setVerification(VERIFICATION.AUTHENTICATED);
      return;
    }

    verifiedTokenRef.current = token;
    setVerification(VERIFICATION.LOADING);

    let active = true;
    verifySession().then((admin) => {
      if (!active) return;
      if (admin) {
        setVerification(VERIFICATION.AUTHENTICATED);
      } else {
        // Expired/invalid token — session already cleared by the 401
        // handler in the auth module.
        verifiedTokenRef.current = null;
        setVerification(VERIFICATION.UNAUTHENTICATED);
        router.replace("/admin/login");
      }
    });

    return () => {
      active = false;
    };
  }, [authInitialized, session, isLoginPage, router]);

  // While unauthenticated, render nothing (the redirect is in flight) so
  // protected UI never flashes.
  if (
    !isLoginPage &&
    (!authInitialized || verification === VERIFICATION.UNAUTHENTICATED)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F8F6]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D7EAE7] border-t-[#218F87]" />
      </div>
    );
  }

  if (isLoginPage) {
    return <AdminToastProvider>{children}</AdminToastProvider>;
  }

  // Spinner while the token is being verified against the backend.
  if (!isLoginPage && verification === VERIFICATION.LOADING) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F8F6]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D7EAE7] border-t-[#218F87]" />
      </div>
    );
  }

  const handleSignOut = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#F3F8F6]">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen flex-col lg:pl-64">
          <AdminHeader
            title={pageTitle(pathname)}
            onMenuClick={() => setSidebarOpen(true)}
            userEmail={session?.admin?.email ?? session?.email ?? ""}
            onSignOut={handleSignOut}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminToastProvider>
  );
}

function pageTitle(pathname) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname?.startsWith("/admin/services")) return "Services";
  if (pathname?.startsWith("/admin/categories")) return "Categories";
  if (pathname?.startsWith("/admin/branches")) return "Branches";
  if (pathname?.startsWith("/admin/import-export")) return "Import & Export";
  return "TNH Admin";
}
