import {
  faCity,
  faEye,
  faFire,
  faHouseChimney,
} from "@fortawesome/free-solid-svg-icons";
import StatsCard from "@/ui/components/common/charts/StatsCard";
import { resolveModeMetric } from "./DettagliTecniciUtils";

export default function DettagliTecniciOverview({
  totalValue = 0,
  apartmentsCount = 0,
  cityCount = 0,
  topApartment = null,
  mode = "views",
}) {
  const modeConfig = resolveModeMetric(mode);
  const topMetricValue = topApartment?.[modeConfig.key] ?? 0;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2  ${
        apartmentsCount <= 1 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      } gap-5 xl:gap-10`}
    >
      <StatsCard
        title={modeConfig.totalLabel}
        value={totalValue}
        icon={modeConfig.icon}
      />
      <StatsCard
        title="Annunci monitorati"
        value={apartmentsCount}
        icon={faHouseChimney}
      />
      <StatsCard title="Citta coperte" value={cityCount} icon={faCity} />
      {!(apartmentsCount <= 1) && (
        <StatsCard title="Top annuncio" value={topMetricValue} icon={faFire} />
      )}
    </div>
  );
}
