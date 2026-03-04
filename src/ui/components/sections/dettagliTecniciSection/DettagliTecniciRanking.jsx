import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BarChartComponent from "@/ui/components/common/charts/BarChartComponent";
import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";
import { formatNumber, resolveModeMetric } from "./DettagliTecniciUtils";
import { MODE_OPTIONS } from "./DettagliTecniciConstants";

const TopRanking = ({
  annunci,
  metricKey = "totalViews",
  metricLabel = "visualizzazioni",
  onBarClick,
}) => {
  if (!annunci?.length) {
    return (
      <p className="text-sm text-gray-500">
        Nessun annuncio disponibile per la classifica.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {annunci.slice(0, 5).map((annuncio, index) => (
        <div
          key={annuncio.id || annuncio.title}
          type="button"
          aria-label="naviga all'annuncio"
          className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#d4f1ef] shadow-[0_10px_25px_rgba(0,0,0,0.05)] cursor-pointer"
          onClick={onBarClick ? () => onBarClick(annuncio) : undefined}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#228E8D] to-[#62C1BA] text-white font-bold">
            {index + 1}
          </div>
          <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-[#f0fafa] border border-[#d4f1ef] flex-shrink-0">
            <ImageWithSkeleton
              src={annuncio.apartmentPhotoUrls?.[0]}
              alt={annuncio.title}
              className=""
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {annuncio.title || "Annuncio"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {annuncio.address?.city || "Localita non indicata"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#228E8D]">
              {formatNumber(annuncio?.[metricKey] ?? 0)}
            </p>
            <p className="text-[11px] text-gray-500">{metricLabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DettagliTecniciRanking({
  annunci = [],
  mode = MODE_OPTIONS[0],
  onBarClick,
}) {
  const modeConfig = resolveModeMetric(mode);
  const valueLabel = modeConfig.label;
  const safeAnnunci = Array.isArray(annunci) ? annunci : [];

  if (safeAnnunci.length <= 1) return null;

  return (
    <div className="xl:col-span-2 h-full bg-white border border-[#d4f1ef] rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={modeConfig.icon} className="text-[#228E8D]" />
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Classifica annunci
            <p
              className={`hidden sm:inline ${
                mode === "score"
                  ? "text-[#228E8D] text-sm"
                  : "text-[#a3a3a3cf] dark:text-[#a3a3a373] text-sm"
              }`}
            >
              ({valueLabel})
            </p>
          </h3>
        </div>
        <span className="text-xs text-gray-500">
          Clicca per aprire l&apos;annuncio
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="h-72 md:h-[500px] 3xl:h-[600px]">
          <BarChartComponent
            data={safeAnnunci}
            onBarClick={onBarClick}
            dataKey={modeConfig.key}
            valueLabel={valueLabel}
          />
        </div>
        <TopRanking
          annunci={safeAnnunci}
          metricKey={modeConfig.key}
          metricLabel={modeConfig.unitLabel}
          onBarClick={onBarClick}
        />
      </div>
    </div>
  );
}
