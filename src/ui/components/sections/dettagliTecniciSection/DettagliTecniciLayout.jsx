import DettagliTecniciAnalyticsPanel from "./DettagliTecniciAnalyticsPanel";
import DettagliTecniciCityDistribution from "./DettagliTecniciCityDistribution";
import DettagliTecniciAlerts from "./DettagliTecniciAlerts";
import DettagliTecniciMapPanel from "./DettagliTecniciMapPanel";
import DettagliTecniciOverview from "./DettagliTecniciOverview";
import DettagliTecniciRanking from "./DettagliTecniciRanking";
import { useAnalyticsAlerts } from "@/ui/hooks/analytics/useAnalyticsAlerts";
import ReceivedLikesSection from "../I_TuoiAnnunciSection/ReceivedLikesSection";

export default function DettagliTecniciLayout({
  app,
  range,
  onRangeChange,
  topApartment,
  totalValue,
  annunciWithStats = [],
  cityStats = [],
  onBarClick,
  analyticsMode = "views",
  analyticsApartmentOptions = [],
  analyticsApartmentId,
  onAnalyticsApartmentChange,
  selectedApartment,
  analyticsSeries = [],
  analyticsKpis = null,
  analyticsDailyRows = [],
  analyticsWarnings = [],
  analyticsLoading = false,
  analyticsError = null,
  receivedLikes = [],
  receivedLikesLoading,
  receivedLikesError = null,
}) {
  const appartamenti = Array.isArray(app)
    ? app
    : Array.isArray(app?.filteredAppartamenti)
      ? app.filteredAppartamenti
      : [];

  const bestAnnuncio = topApartment || annunciWithStats?.[0] || null;
  const alerts = useAnalyticsAlerts({
    apartments: appartamenti,
    receivedLikes,
  });

  return (
    <div className="space-y-10">
      <DettagliTecniciOverview
        totalValue={totalValue || 0}
        apartmentsCount={appartamenti.length}
        cityCount={cityStats.length}
        topApartment={bestAnnuncio}
        mode={analyticsMode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <DettagliTecniciAlerts
          alerts={alerts}
          isLoading={analyticsLoading}
          error={analyticsError}
        />
        <div className="lg:col-span-2">
          <DettagliTecniciCityDistribution cityStats={cityStats} />
        </div>
      </div>

      {analyticsMode === "likes" && (
        <ReceivedLikesSection
          likes={receivedLikes}
          isLoading={receivedLikesLoading}
          error={receivedLikesError}
        />
      )}

      <DettagliTecniciRanking
        annunci={annunciWithStats}
        mode={analyticsMode}
        onBarClick={onBarClick}
      />

      <div className="flex flex-col gap-10 3xl:grid 3xl:grid-cols-3 3xl:items-stretch">
        <DettagliTecniciAnalyticsPanel
          range={range}
          onRangeChange={onRangeChange}
          analyticsMode={analyticsMode}
          analyticsApartmentOptions={analyticsApartmentOptions}
          analyticsApartmentId={analyticsApartmentId}
          onAnalyticsApartmentChange={onAnalyticsApartmentChange}
          selectedApartment={selectedApartment}
          analyticsSeries={analyticsSeries}
          analyticsKpis={analyticsKpis}
          analyticsDailyRows={analyticsDailyRows}
          analyticsWarnings={analyticsWarnings}
          analyticsLoading={analyticsLoading}
          analyticsError={analyticsError}
          containerclass="3xl:col-span-2"
        />
        <DettagliTecniciMapPanel
          appartamenti={appartamenti}
          cityStats={cityStats}
        />
      </div>
    </div>
  );
}
