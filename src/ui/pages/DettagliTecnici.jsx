import { useEffect, useMemo, useState } from "react";

import { useAppartamentiContext } from "./I_TuoiAnnunci";

// Componenti centralizzati
import { MetaManager } from "@/ui/components/common";
import DettagliTecniciLayout from "@/ui/components/sections/dettagliTecniciSection/DettagliTecniciLayout";

// Hook centralizzati
import {
  useAnalyticsData,
  useAnalyticsSuggestions,
  useAnalyticsNavigation,
  useApartmentAnalytics,
} from "@/ui/hooks";
import {
  ANALYTICS_RANGES,
  MODE_METRICS,
} from "@/ui/components/sections/dettagliTecniciSection/DettagliTecniciConstants";

export default function DettagliTecnici() {
  const {
    filteredAppartamenti = [],
    analyticsMode: mode,
    setFilterMode,
    receivedLikes = [],
    receivedLikesLoading,
    receivedLikesError,
  } = useAppartamentiContext();
  const [, setDummy] = useState(0); // forzo il rerender quando cambia la lunghezza degli appartamenti
  const [range, setRange] = useState(ANALYTICS_RANGES.MIN);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const modeConfig = MODE_METRICS[mode] || MODE_METRICS.views;
  const rankingMetric = modeConfig.key;

  useEffect(() => {
    setDummy((d) => d + 1);
  }, [filteredAppartamenti.length]);

  useEffect(() => {
    if (typeof setFilterMode !== "function") return;
    setFilterMode("analytics");
  }, [setFilterMode]);

  // Hook per gestire i dati delle analytics
  const {
    topApartment,
    totals,
    topApartments,
    cityStats,
    viewTrend,
    normalizedApartments,
  } = useAnalyticsData(filteredAppartamenti, {
    rankingMetric,
    limit: 10,
  });

  const totalValue = modeConfig.average
    ? totals?.scoreAvg
    : totals?.[modeConfig.key];
  const safeTotalValue = Number.isFinite(totalValue) ? totalValue : 0;

  // Hook per i suggerimenti personalizzati
  useAnalyticsSuggestions({
    totalAnnunci: filteredAppartamenti.length,
    mediaPerAnnuncio: filteredAppartamenti.length
      ? modeConfig.average
        ? safeTotalValue
        : Math.round(safeTotalValue / filteredAppartamenti.length)
      : 0,
    cityStats,
    viewTrend,
  });

  // Hook per la navigazione
  const { handleBarClick } = useAnalyticsNavigation();

  const apartmentOptions = useMemo(
    () =>
      filteredAppartamenti.map((annuncio) => ({
        value: annuncio.id,
        label: annuncio.title || annuncio.address?.city || "Annuncio",
      })),
    [filteredAppartamenti],
  );

  const selectedApartment = useMemo(
    () =>
      normalizedApartments?.find(
        (annuncio) => annuncio.id === selectedApartmentId,
      ) || null,
    [normalizedApartments, selectedApartmentId],
  );

  useEffect(() => {
    if (!filteredAppartamenti.length) {
      setSelectedApartmentId(null);
      return;
    }

    const hasSelection = filteredAppartamenti.some(
      (annuncio) => annuncio.id === selectedApartmentId,
    );
    if (!hasSelection) {
      setSelectedApartmentId(filteredAppartamenti[0].id);
    }
  }, [filteredAppartamenti, selectedApartmentId]);

  const {
    loading: analyticsLoading,
    error: analyticsError,
    series: apartmentSeries,
    kpis: apartmentKpis,
    dailyRows: apartmentDailyRows,
    debugWarnings: apartmentWarnings,
  } = useApartmentAnalytics(selectedApartmentId, range, mode);

  return (
    <>
      <MetaManager />
      <DettagliTecniciLayout
        app={filteredAppartamenti}
        range={range}
        onRangeChange={setRange}
        topApartment={topApartment}
        totalValue={safeTotalValue}
        annunciWithStats={topApartments}
        cityStats={cityStats}
        onBarClick={handleBarClick}
        analyticsMode={mode}
        analyticsApartmentOptions={apartmentOptions}
        analyticsApartmentId={selectedApartmentId}
        onAnalyticsApartmentChange={setSelectedApartmentId}
        selectedApartment={selectedApartment}
        analyticsSeries={apartmentSeries}
        analyticsKpis={apartmentKpis}
        analyticsDailyRows={apartmentDailyRows}
        analyticsWarnings={apartmentWarnings}
        analyticsLoading={analyticsLoading}
        analyticsError={analyticsError}
        receivedLikes={receivedLikes}
        receivedLikesLoading={receivedLikesLoading}
        receivedLikesError={receivedLikesError}
      />
    </>
  );
}
