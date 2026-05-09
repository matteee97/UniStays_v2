import { lazy, Suspense } from "react";
import FooterSection from "@/ui/components/sections/footerSection/FooterSection";
import ChatButton from "@/ui/components/common/chat/ChatButton";
import { Outlet, useLocation } from "react-router-dom";
import AnalyticsListener from "@/ui/components/common/AnalyticsListener";
import { useIsAdmin } from "@/ui/hooks";
import { ROUTES } from "@/app/routes";

const Navbar = lazy(
  () => import("@/ui/components/common/navigation/Navbar/Navbar"),
);

const MainLayout = ({ showNavbar = true }) => {
  const location = useLocation();

  // Nascondi ChatButton su mobile nella pagina appartamento
  const isApartmentPage =
    location.pathname.includes("/alloggi/") &&
    location.pathname.split("/").length > 3;

  const { isAdmin, loading } = useIsAdmin();

  return (
    <>
      {showNavbar && (
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      )}
      <main className="relative min-h-screen w-screen">
        <AnalyticsListener />
        <Outlet /> {/* le pagine si renderizzano qui */}
      </main>
      {!loading && isAdmin && (
        <>
          <a
            href={ROUTES.DEBUG}
            className="px-4 py-2 rounded-full bg-orange-500 text-white font-semibold fixed bottom-4 left-16 -translate-x-1/2 border-2 border-red-800 z-50"
          >
            DEBUG
          </a>
          <a
            href={ROUTES.ADMIN}
            className="px-4 py-2 rounded-full bg-orange-800 text-white font-semibold fixed bottom-16 left-16 -translate-x-1/2 border-2 border-red-800 z-50"
          >
            ADMIN
          </a>
        </>
      )}

      {/* FOOTER */}
      <FooterSection />
      {/* CHAT BUTTON - nascosto su mobile nella pagina appartamento */}
      <div className="hidden sm:block">
        {!isApartmentPage && <ChatButton />}
      </div>
    </>
  );
};

export default MainLayout;
