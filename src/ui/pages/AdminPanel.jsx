import { useState } from "react";
import { useFetchUncheckedAnnunci, useFetchSegnalazioni } from "@/ui/hooks";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import Breadcrumb from "@/ui/components/common/navigation/Breadcrumb";
import LoadingIcon from "@/ui/components/common/shared/icons/LoadingIcon";
import AdminAnnunciSection from "@/ui/components/sections/adminSection/AdminAnnunciSection";
import AdminSegnalazioniSection from "@/ui/components/sections/adminSection/AdminSegnalazioniSection";
import AdminCitiesSection from "@/ui/components/sections/adminSection/AdminCitiesSection";
import AdminUserLookupSection from "@/ui/components/sections/adminSection/AdminUserLookupSection";

const ErrorState = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between gap-4">
    <p className="text-red-800 text-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm font-semibold text-red-700 underline"
      >
        Riprova
      </button>
    )}
  </div>
);

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("annunci");
  const [refreshingAll, setRefreshingAll] = useState(false);
  const {
    annunci,
    loading: annunciLoading,
    error: annunciError,
    refresh: refreshAnnunci,
    lastUpdated: annunciUpdatedAt,
  } = useFetchUncheckedAnnunci();
  const {
    segnalazioni,
    loading: segnalazioniLoading,
    error: segnalazioniError,
    refresh: refreshSegnalazioni,
    lastUpdated: segnalazioniUpdatedAt,
  } = useFetchSegnalazioni();

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    await Promise.allSettled([refreshAnnunci(), refreshSegnalazioni()]);
    setRefreshingAll(false);
  };

  const handleDownloadSnapshot = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      counters: {
        pendingAnnunci: annunci.length,
        segnalazioniAperte: segnalazioni.length,
      },
      lastUpdated: {
        annunci: annunciUpdatedAt,
        segnalazioni: segnalazioniUpdatedAt,
      },
      sample: {
        annunci: annunci.slice(0, 10).map((a) => ({
          id: a.id,
          title: a.title || null,
          city: a.address?.city || a.city || null,
        })),
        segnalazioni: segnalazioni.slice(0, 10).map((s) => ({
          id: s.id,
          target: s.target || null,
          reporterId: s.reporterId || null,
        })),
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `unistays-admin-snapshot-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderAnnunciContent = () => {
    if (annunciLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingIcon />
        </div>
      );
    }

    if (annunciError) {
      return (
        <ErrorState
          message={`Errore: ${annunciError}`}
          onRetry={refreshAnnunci}
        />
      );
    }

    return (
      <AdminAnnunciSection
        annunci={annunci}
        onRefresh={refreshAnnunci}
        updatedAt={annunciUpdatedAt}
      />
    );
  };

  const renderSegnalazioniContent = () => {
    if (segnalazioniLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingIcon />
        </div>
      );
    }

    if (segnalazioniError) {
      return (
        <ErrorState
          message={`Errore: ${segnalazioniError}`}
          onRetry={refreshSegnalazioni}
        />
      );
    }

    return (
      <AdminSegnalazioniSection
        segnalazioni={segnalazioni}
        onRefresh={refreshSegnalazioni}
        updatedAt={segnalazioniUpdatedAt}
      />
    );
  };

  return (
    <>
      <MetaManager
        title="Pannello Admin - UniStays"
        description="Pannello di amministrazione per la gestione degli annunci e segnalazioni"
      />
      <div className="min-h-screen bg-slate-50 space-y-8">
        <div className="bg-white border-b border-gray-200 p-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb
              crumbs={[
                { label: "Home", to: "/" },
                { label: "Admin Panel", to: "" },
              ]}
            />
          </div>
        </div>
        <div className="py-[3px] bg-gradient-to-bl from-[#228E8D] dark:from-slate-900/60 via-[#1a6f6e] dark:via-[#0f4544]/60 to-[#228E8D] dark:to-slate-800/60 shadow-sm">
          <div className="bg-gradient-to-br to-[#228E8D] dark:to-slate-900/60 via-[#1a6f6e] dark:via-[#0f4544]/60 from-[#228E8D] dark:from-slate-800/60 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-wide text-white/50 dark:text-[#228E8D]/80 font-medium">
                    Controllo piattaforma
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-bold leading-tight opacity-80">
                    Pannello di Amministrazione
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownloadSnapshot}
                    className="flex-1 px-4 py-2 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    Esporta snapshot
                  </button>
                  <button
                    onClick={handleRefreshAll}
                    disabled={refreshingAll}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#228E8D]/80 font-semibold hover:bg-[#228E8D] transition disabled:opacity-60"
                  >
                    {refreshingAll ? "Aggiornamento..." : "Aggiorna tutto"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-10 space-y-6 pb-10">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 dark:border-[#228e8c5f]">
            <div className="px-2 sm:px-6 pt-4">
              <nav className="flex flex-wrap gap-1" aria-label="Tabs">
                {[
                  {
                    id: "annunci",
                    label: "Annunci Non Verificati",
                    count: annunci.length,
                  },
                  {
                    id: "segnalazioni",
                    label: "Segnalazioni",
                    count: segnalazioni.length,
                  },
                  { id: "citta", label: "Città" },
                  { id: "utenti", label: "Utenti" },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#228E8D] text-white shadow"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {tab.label}
                      {typeof tab.count === "number" && tab.count > 0 && (
                        <span
                          className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="px-2 sm:px-6 pb-6 pt-4">
              {activeTab === "annunci" && renderAnnunciContent()}
              {activeTab === "segnalazioni" && renderSegnalazioniContent()}
              {activeTab === "citta" && <AdminCitiesSection />}
              {activeTab === "utenti" && <AdminUserLookupSection />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
