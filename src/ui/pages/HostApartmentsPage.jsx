import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import MetaManager from "@/ui/components/common/seo/MetaManager";
import {
  fetchUserData,
  useFetchAppartamenti,
  usePaginationSlice,
  useIsVerifiedHost,
} from "@/ui/hooks";
import { Alert, LoadingIcon } from "@/ui/components/common";
import ApartmentsListSection from "@/ui/components/sections/apartmentsSection/ApartmentsListSection";
import EmptyResults from "@/ui/components/common/messages/EmptyResults";
import HostCard from "@/ui/components/common/cards/HostCard";
import HostStats from "@/ui/components/sections/apartmentSection/HostStats";
import HostBio from "@/ui/components/sections/apartmentSection/HostBio";

import { useHostReviews } from "@/ui/hooks";
import { ApartmentFeedbackSection } from "@/ui/components/sections/apartmentSection";
import { parseHostParams } from "@/ui/helpers/validation";
import { buildHostPageApartmentsQuery } from "@/infrastructure/firebase/queries/apartmentQueries";
import { FALLBACK_IMAGE } from "../shared/constants";
import useFavoriteIds from "../hooks/favorites/useFavoriteIds";
import { USER_ROLES } from "@/shared/types";

export default function HostApartmentsPage() {
  const { userParams: param } = useParams();
  const parsedHostParams = useMemo(() => parseHostParams(param), [param]);
  const userID = parsedHostParams?.userId || null;
  const [proprietario, setProprietario] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const { favorites, loading: favoriteLoading } = useFavoriteIds();
  const fetchLimit = 12;

  // Scroll all'apertura
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pagina]);

  const invalidHostParam = Boolean(param && !userID);

  // Fetch user data (proprietario)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserData(userID);
        setProprietario(data);
      } catch (error) {
        console.error("Errore nel recupero utente:", error);
        toast.error("Utente non trovato.");
      } finally {
        setUserLoading(false);
      }
    };

    if (userID) loadUser();
  }, [userID]);

  // Query per appartamenti del proprietario
  const query = useMemo(() => {
    if (!userID) return [];
    return buildHostPageApartmentsQuery(userID);
  }, [userID]);

  const {
    appartamenti,
    error: appartamentiError,
    loading: showLoading,
    loadMore,
  } = useFetchAppartamenti(query, fetchLimit, {
    queryScope: {
      screen: "host-apartments-page",
      hostId: userID || "",
    },
  });

  useEffect(() => {
    if (appartamentiError) {
      toast.error("Errore nel recupero annunci.");
    }
  }, [appartamentiError]);

  useEffect(() => {
    if (invalidHostParam) {
      toast.error(`Parametro ${USER_ROLES.HOST} non valido.`);
    }
  }, [invalidHostParam]);

  const isVerified = useIsVerifiedHost(proprietario);
  const displayName =
    proprietario?.displayName ||
    [proprietario?.firstName, proprietario?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "(proprietario non trovato)";
  const annunciCount = proprietario?.publicStats?.apartmentsCount;

  // Fetch host reviews
  const { reviews: hostReviews, loading: reviewsLoading } = useHostReviews(
    userID,
    appartamenti,
    !userLoading && !showLoading,
  );
  const { pageItems: currentPageApartments } = usePaginationSlice({
    items: appartamenti,
    page: pagina,
    pageSize: fetchLimit,
  });
  const totalApartmentsCount = annunciCount ?? appartamenti.length;

  if (userLoading || showLoading || reviewsLoading || favoriteLoading) {
    return (
      <>
        <MetaManager title="Annunci in caricamento..." />
        <LoadingIcon />
      </>
    );
  }

  if (invalidHostParam) {
    return (
      <>
        <MetaManager title="Host non valido" />
        <EmptyResults />
      </>
    );
  }

  if (appartamentiError) {
    return (
      <>
        <MetaManager title="Errore nel caricamento annunci" />
        <Alert
          title={"Errore nel caricamento annunci"}
          message={"Qualcosa è andato storto, riprova più tardi."}
        />
      </>
    );
  }

  return (
    <div>
      <MetaManager
        title={`Annunci di ${displayName}`}
        preloadImages={[proprietario?.photoUrl].filter(Boolean)}
      />
      <div className="w-full h-[400px] fixed top-0 left-0 z-[-1] bg-white">
        <img
          src={proprietario?.photoUrl ?? FALLBACK_IMAGE}
          className="w-full h-full blur-xl object-cover opacity-80 dark:opacity-30"
          alt="Hero background"
        />
      </div>
      <div className="relative grid grid-cols-1 py-8 px-4 max-w-[470px] mx-auto">
        <HostCard
          roleLabel={
            proprietario?.isAgency ? "Agenzia Immobiliare" : "Proprietario"
          }
          photoUrl={proprietario?.photoUrl}
          displayName={displayName}
          date={proprietario?.createdAt}
          isVerified={isVerified}
          bgImg={false}
        />
      </div>
      <div className="bg-[#F0FAFA] min-h-[calc(100vh-250px)] border dark:border-gray-800 rounded-t-2xl">
        <div className="max-w-7xl 2xl:max-w-[1540px] mx-auto pt-8 sm:py-8 space-y-6">
          {/* Host Stats */}
          <HostStats
            host={proprietario}
            apartments={appartamenti}
            apartmentsCount={annunciCount}
            favorites={favorites}
          />

          {/* Host Bio */}
          <HostBio host={proprietario} />

          {/* Apartments List */}
          {appartamenti?.length > 0 ? (
            <ApartmentsListSection
              app={currentPageApartments}
              error={appartamentiError}
              limit={fetchLimit}
              totalCount={totalApartmentsCount}
              loadMore={loadMore}
              paginaCorrente={pagina}
              setPaginaCorrente={setPagina}
              favoritesIds={favorites}
              alwaysStickyNavigation
              showSearchModeSwitch={false}
            />
          ) : (
            <EmptyResults />
          )}

          {/* Host Reviews Section */}
          <ApartmentFeedbackSection
            mode="host"
            host={proprietario}
            apartments={appartamenti}
            reviews={hostReviews}
            loading={reviewsLoading}
            title="Recensioni ricevute"
            subtitle="Feedback degli studenti sui suoi alloggi"
            showReviewForm={false}
            showStats={true}
            showFilters={true}
            initialVisibleCount={6}
            loadMoreCount={6}
            containerClassName="my-6"
          />
        </div>
      </div>
    </div>
  );
}
