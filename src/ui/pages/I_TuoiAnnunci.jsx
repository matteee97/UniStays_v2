import { useAuth } from "@clerk/clerk-react";
import { createContext, useContext, useMemo, useEffect, useState } from "react";
import { useFetchAppartamenti, useReceivedLikes } from "@/ui/hooks";
import { LoadingIcon } from "@/ui/components/common";
import EmptyState from "@/ui/components/sections/I_TuoiAnnunciSection/EmptyState";
import { Navigate, Outlet } from "react-router-dom";
import SideMenu from "@/ui/components/common/navigation/SideMenu";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import AnalyticsListener from "@/ui/components/common/AnalyticsListener";
import { Alert } from "@/ui/components/common";
import FilterBar from "@/ui/components/sections/I_TuoiAnnunciSection/FilterBar";
import { MODE_ORDER } from "@/ui/components/sections/dettagliTecniciSection/DettagliTecniciConstants";
import { APARTMENT_STATUS } from "@/shared/types";
import { buildHostApartmentsQuery } from "@/infrastructure/firebase/queries/apartmentQueries";

// Context con shape esplicito
const AppartamentiContext = createContext({
  filteredAppartamenti: [],
  allLoaded: true,
  loadMore: () => {},
  receivedLikes: [],
  receivedLikesLoading: false,
  receivedLikesError: null,
  refreshReceivedLikes: () => {},
});

export function useAppartamentiContext() {
  return useContext(AppartamentiContext);
}

function useAnnunciFilters(appartamenti) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recenti");
  const [statusFilter, setStatusFilter] = useState("tutti");

  const filteredAppartamenti = useMemo(() => {
    let filtered = [...appartamenti];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (annuncio) =>
          annuncio.title?.toLowerCase().includes(term) ||
          annuncio.address?.city?.toLowerCase().includes(term) ||
          annuncio.description?.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "tutti") {
      filtered = filtered.filter((annuncio) => {
        if (statusFilter === "attivi")
          return annuncio.status === APARTMENT_STATUS.PUBLISHED;
        if (statusFilter === "inattivi")
          return annuncio.status !== APARTMENT_STATUS.PUBLISHED;
        return true;
      });
    }

    switch (sortBy) {
      case "popolari":
        filtered.sort(
          (a, b) => (b.metrics?.totalViews || 0) - (a.metrics?.totalViews || 0),
        );
        break;
      case "prezzo_crescente":
        filtered.sort(
          (a, b) =>
            (Number(a.aggregates?.minRoomPrice) || 0) -
            (Number(b.aggregates?.minRoomPrice) || 0),
        );
        break;
      case "prezzo_decrescente":
        filtered.sort(
          (a, b) =>
            (Number(b.aggregates?.minRoomPrice) || 0) -
            (Number(a.aggregates?.minRoomPrice) || 0),
        );
        break;
      case "recenti":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  }, [appartamenti, searchTerm, sortBy, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    filteredAppartamenti,
  };
}

export default function I_TuoiAnnunci() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [analyticsMode, setAnalyticsMode] = useState(MODE_ORDER[0]);
  const [filterMode, setFilterMode] = useState("default");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const query = useMemo(() => {
    if (!userId) return null;
    return buildHostApartmentsQuery(userId);
  }, [userId]);

  const {
    appartamenti,
    error,
    loading: showLoading,
    loadMore,
    refetch,
    allLoaded,
  } = useFetchAppartamenti(query, 40, {
    queryScope: {
      screen: "my-apartments-page",
      ownerId: userId || "",
    },
  });

  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    filteredAppartamenti,
  } = useAnnunciFilters(appartamenti);

  const {
    likes: receivedLikes,
    loading: receivedLikesLoading,
    error: receivedLikesError,
    refreshLikes: refreshReceivedLikes,
  } = useReceivedLikes({
    enabled: isLoaded && isSignedIn && Boolean(userId),
    limit: 80,
    refreshIntervalMs: 45_000,
  });

  if (!isLoaded) {
    return <LoadingIcon />;
  }

  if (!isSignedIn) {
    return <Navigate to="/accedi" replace />;
  }

  return (
    <>
      <AnalyticsListener />

      {showLoading && <LoadingIcon />}

      <MetaManager />

      <div className="flex min-h-screen">
        <button
          className={`${
            mobileOpen ? "hidden" : "fixed"
          } top-4 left-4 bg-white border border-[#d4f1ef] px-2 py-1 rounded-xl sm:hidden z-50`}
          onClick={() => setMobileOpen(true)}
        >
          <span className="block w-7 h-[2px] my-[6.5px] bg-[#228E8D]"></span>
          <span className="block w-7 h-[2px] my-[6.5px] bg-[#228E8D]"></span>
          <span className="block w-7 h-[2px] my-[6.5px] bg-[#228E8D]"></span>
        </button>

        <SideMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {!showLoading && appartamenti.length === 0 && !error ? (
          <EmptyState />
        ) : (
          <div className="dark:bg-[#0B1220] space-y-10 w-full max-w-[2500px] mx-auto relative pt-[148px] sm:pt-[188px] lg:pt-[116px] pb-10 px-2 sm:px-10">
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              filteredAppartamentiLength={filteredAppartamenti.length}
              mode={filterMode}
              onAnalyticsModeChange={setAnalyticsMode}
              analyticsMode={analyticsMode}
              refetchApartments={refetch}
            />
            {error && (
              <div className="max-w-4xl mx-auto">
                <Alert
                  title="Errore nel caricamento degli annunci"
                  message={error}
                  className=""
                />
              </div>
            )}

            <AppartamentiContext.Provider
              value={{
                filteredAppartamenti,
                allLoaded,
                loadMore,
                setFilterMode,
                analyticsMode,
                receivedLikes,
                receivedLikesLoading,
                receivedLikesError,
                refreshReceivedLikes,
              }}
            >
              <Outlet />
            </AppartamentiContext.Provider>
          </div>
        )}
      </div>
    </>
  );
}
