import FooterSection from "@/ui/components/sections/footerSection/FooterSection";
import ChatButton from "@/ui/components/common/chat/ChatButton";
import { Link, Outlet, useLocation } from "react-router-dom";
import AnalyticsListener from "@/ui/components/common/AnalyticsListener";
import { useIsAdmin } from "@/ui/hooks";
import { ROUTES } from "@/app/routes";

/**
 * Shared page chrome that does not import or reference the navigation bar.
 *
 * This keeps detail-only layouts free from Navbar loading while preserving the
 * common outlet, footer, analytics, chat and admin shortcuts.
 */
export default function LayoutShell({ children }) {
  const location = useLocation();
  const { isAdmin, loading } = useIsAdmin();
  const isApartmentPage =
    location.pathname.includes("/alloggi/") &&
    location.pathname.split("/").length > 3;

  return (
    <>
      {children}
      <main className="relative min-h-screen w-screen">
        <AnalyticsListener />
        <Outlet />
      </main>
      {!loading && isAdmin && (
        <>
          <Link
            to={ROUTES.DEBUG}
            className="px-4 py-2 rounded-full bg-orange-500 text-white font-semibold fixed bottom-4 left-16 -translate-x-1/2 border-2 border-red-800 z-50"
          >
            DEBUG
          </Link>
          <Link
            to={ROUTES.ADMIN}
            className="px-4 py-2 rounded-full bg-orange-800 text-white font-semibold fixed bottom-16 left-16 -translate-x-1/2 border-2 border-red-800 z-50"
          >
            ADMIN
          </Link>
        </>
      )}
      <FooterSection />
      <div className="hidden sm:block">
        {!isApartmentPage && <ChatButton />}
      </div>
    </>
  );
}
