import React from "react";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import Breadcrumb from "@/ui/components/common/navigation/Breadcrumb";
import { ROUTES } from "@/app/routes";

/**
 * Layout principale per la pagina dei preferiti.
 * Gestisce SEO e struttura di base lasciando il rendering del contenuto ai children.
 */
export default function FavoritesLayout({ children, title, description, url }) {
  const pageTitle = title || "Preferiti - UniStays";
  const pageDescription =
    description ||
    "Gestisci e confronta gli appartamenti che hai aggiunto ai preferiti.";

  return (
    <>
      <MetaManager title={pageTitle} description={pageDescription} url={url} />

      <section className="relative min-h-screen bg-gradient-to-br from-[#F0FAF9] via-white to-[#E8F7F6] dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#0F172A]">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-10 top-10 w-40 h-40 bg-[#228E8D]/10 rounded-full blur-3xl" />
          <div className="absolute right-10 -bottom-4 w-56 h-56 bg-[#62C1BA]/10 dark:opacity-10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto sm:px-6 pt-10 pb-12">
          <Breadcrumb
            crumbs={[
              { label: "Home", to: ROUTES.HOME },
              { label: "Preferiti", to: ROUTES.FAVORITES },
            ]}
            className="flex items-center gap-2 text-[#228E8D] px-6 sm:px-0"
          />

          <div className="space-y-8">{children}</div>
        </div>
      </section>
    </>
  );
}
