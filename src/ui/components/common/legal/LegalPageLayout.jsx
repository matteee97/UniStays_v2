import Breadcrumb from "@/ui/components/common/navigation/Breadcrumb";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import { ROUTES } from "@/app/routes";

export default function LegalPageLayout({
  title,
  description,
  updatedAt,
  children,
}) {
  return (
    <>
      <MetaManager title={`${title} - UniStays`} description={description} />
      <section className="min-h-screen bg-gradient-to-br from-[#f0faf9] via-white to-[#e8f6f4] dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0b1220]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          <Breadcrumb
            crumbs={[
              { label: "Home", to: ROUTES.HOME },
              { label: title, to: "" },
            ]}
          />

          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#228E8D]">
              Documentazione Legale
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ultimo aggiornamento: {updatedAt}
            </p>
          </header>

          <article className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm border border-[#d4f1ef] dark:border-slate-700 rounded-2xl p-5 sm:p-7 space-y-7 text-slate-700 dark:text-slate-200">
            {children}
          </article>
        </div>
      </section>
    </>
  );
}
