import { Outlet, useLocation } from "react-router-dom";
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { LoadingIcon } from "@/ui/components/common";
import Breadcrumb from "@/ui/components/common/navigation/Breadcrumb";
import MetaManager from "@/ui/components/common/seo/MetaManager";

export default function AuthLayout() {
  const location = useLocation();
  const isSignIn = location.pathname.includes("/accedi");
  const pageTitle = isSignIn ? "Accedi" : "Registrati";
  const breadcrumbLabel = isSignIn ? "Accedi" : "Registrati";

  return (
    <>
      <MetaManager
        title={`${pageTitle} - UniStays`}
        description={`${pageTitle} al tuo account UniStays per accedere a tutti i servizi`}
      />
      <div className="relative min-h-screen bg-gradient-to-br from-[#228E8D] via-[#1A6B6A] to-[#0F4A49] overflow-hidden ">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-35 dark:opacity-45">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="hidden dark:block absolute inset-0 bg-black opacity-25 z-10"></div>

        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="/img/home/hero-img.webp"
            alt="Background"
            loading="eager"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#228E8D]/80 via-[#1A6B6A]/90 to-[#0F4A49]/95"></div>
        </div>

        {/* Breadcrumb */}
        <div className="relative z-30 p-4 md:p-6">
          <Breadcrumb
            crumbs={[
              { label: "Home", to: "/" },
              { label: breadcrumbLabel, to: "" },
            ]}
            textColor="white"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-20 min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {isSignIn ? "Bentornato!" : "Crea il tuo account"}
              </h1>
              <p className="text-white/80 text-lg">
                {isSignIn
                  ? "Accedi per continuare la tua ricerca"
                  : "Inizia a trovare il tuo alloggio ideale"}
              </p>
            </div>

            {/* Auth Component Container */}
            <div className="p-2 md:p-8">
              <ClerkLoading>
                <div className="flex justify-center items-center py-12">
                  <div className="border-b-2 border-[#fff] w-10 h-10 rounded-full animate-spin" />
                </div>
              </ClerkLoading>

              <ClerkLoaded>
                <Outlet />
              </ClerkLoaded>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#62C1BA]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#A4E0DB]/20 rounded-full blur-3xl"></div>
      </div>
    </>
  );
}
