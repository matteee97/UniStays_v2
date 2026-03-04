import NavigationButtons from "@/ui/components/common/buttons/NavigationButtons.jsx";
import { use, useMemo } from "react";
import { useFetchAppartamenti, useScroll } from "@/ui/hooks";
import FeaturedApartmentCard from "@/ui/components/common/cards/FeaturedApartmentCard";
import LoadingIcon from "@/ui/components/common/shared/icons/LoadingIcon.jsx";
import Alert from "@/ui/components/common/messages/Alert";
import { buildFeaturedApartmentsQuery } from "@/infrastructure/firebase/queries/apartmentQueries";

const MAX_ANNOUNCEMENTS = 40;

export default function FeaturedApartmentsSection() {
  const queryFilters = useMemo(() => buildFeaturedApartmentsQuery(), []);

  const { appartamenti, loading, error, allLoaded, loadMore } =
    useFetchAppartamenti(queryFilters, 5, {
      queryScope: "featured-apartments-section",
    });

  const canLoadMore = useMemo(() => {
    return appartamenti.length < MAX_ANNOUNCEMENTS;
  }, [appartamenti]);

  const { scrollRef, atStart, atEnd } = useScroll(
    allLoaded,
    loadMore,
    220,
    "horizontal",
    canLoadMore,
  );

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#F0FAF9] via-white to-[#F0FAF9] dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#0F172A] pt-4"
      id="in-evidenza"
    >
      <div className="relative flex flex-col ">
        <div className="relative mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.4em] text-white/60 px-6">
            <span></span>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="h-1 w-10 rounded-full bg-gradient-to-l from-[#228E8D] via-[#35a3a1] to-[#228E8D]"></span>
              Scorri per scoprire altri alloggi
            </div>
          </div>

          {appartamenti.length > 1 && (
            <NavigationButtons
              scrollRef={scrollRef}
              atStart={atStart}
              atEnd={atEnd}
            />
          )}

          <div className="relative mt-4">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto border-y-2 border-[#d4f1ef] gap-6 py-10 px-4 scroll-smooth snap-x snap-mandatory"
            >
              {appartamenti.map((app) => (
                <div key={app.id} className="transition-all duration-500">
                  <FeaturedApartmentCard app={app} />
                </div>
              ))}

              {loading && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <LoadingIcon />
                </div>
              )}

              {!loading && appartamenti.length === 0 && !error && (
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/20 bg-white/5 p-8 text-center text-white/70">
                  <p className="text-2xl font-semibold text-white">
                    Nessun alloggio in evidenza
                  </p>
                  <p>
                    Torna presto: il nostro team seleziona continuamente nuovi
                    alloggi premium per offrirti solo il meglio.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-8">
                  <Alert
                    title={"Errore, qualcosa è andato storto:"}
                    message={error}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
