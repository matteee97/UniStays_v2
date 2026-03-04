import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faChartLine,
  faClock,
  faEye,
  faEyeSlash,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import FormSelectDropdown from "@/ui/components/common/form/FormSelect";
import RangeSlider from "@/ui/components/common/form/RangeSlider";
import { CustomTooltip } from "@/ui/components/common/charts/BarChartComponent";
import { formatDate } from "@/ui/helpers/formatDate";
import {
  clampRangeDays,
  formatRomeDateKeyLabel,
} from "@/core/services/analytics/ApartmentAnalyticsDomain";
import { ANALYTICS_RANGES } from "./DettagliTecniciConstants";
import { formatNumber, resolveModeMetric } from "./DettagliTecniciUtils";

const AnalyticsHeader = ({
  analyticsApartmentOptions,
  analyticsApartmentId,
  onAnalyticsApartmentChange,
}) => {
  const selectedLabel =
    analyticsApartmentOptions.find((opt) => opt.value === analyticsApartmentId)
      ?.label || "Seleziona annuncio";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">Analytics annuncio</p>
        <p className="text-xl font-semibold text-[#228E8D]">{selectedLabel}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {analyticsApartmentOptions.length > 1 && (
          <div className="w-full sm:w-64">
            <FormSelectDropdown
              name="apartmentId"
              value={analyticsApartmentId || ""}
              onChange={(event) =>
                onAnalyticsApartmentChange?.(event.target.value)
              }
              options={analyticsApartmentOptions}
              placeholder="Seleziona annuncio"
              minWidth="min-w-48"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsRange = ({ range, onRangeChange }) => {
  const handleRangeChange = (value) => {
    if (typeof onRangeChange === "function") {
      onRangeChange(
        clampRangeDays(value, {
          min: ANALYTICS_RANGES.MIN,
          max: ANALYTICS_RANGES.MAX,
        })
      );
    }
  };

  return (
    <div className="bg-[#f0fafa] border border-[#d4f1ef] rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Periodo analizzato</p>
          <p className="text-xl font-semibold text-[#228E8D]">{range} giorni</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
          <RangeSlider
            minValue={ANALYTICS_RANGES.MIN}
            maxValue={ANALYTICS_RANGES.MAX}
            step={1}
            value={range}
            onChange={(e) => handleRangeChange(Number(e.target.value))}
            className="w-full mt-4 sm:mt-0 sm:min-w-[250px]"
          />
          <div className="flex items-center gap-2">
            {[
              ANALYTICS_RANGES.MIN,
              ANALYTICS_RANGES.MID,
              ANALYTICS_RANGES.MAX,
            ].map((value) => (
              <button
                key={value}
                onClick={() => handleRangeChange(value)}
                className={`px-3 py-1 rounded-full border-2 text-xs font-semibold transition-colors ${
                  range === value
                    ? "bg-[#228E8D] text-white border-[#228E8D]"
                    : "border-[#d4f1ef] bg-white text-gray-600 hover:border-[#228E8D]"
                }`}
                type="button"
              >
                {value}g
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsKpiCard = ({ title, value, icon }) => (
  <div className="bg-[#f0fafa] border border-[#d4f1ef] rounded-2xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-white border border-[#d4f1ef] flex items-center justify-center text-[#228E8D]">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const AnalyticsKpis = ({
  totalLabel,
  totalValue,
  avgPerDay,
  lastEventLabel,
  avgRating,
}) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-3 ${
      avgRating !== null && "xl:grid-cols-4"
    } gap-6`}
  >
    <AnalyticsKpiCard
      title={totalLabel}
      value={totalValue}
      icon={faChartLine}
    />
    <AnalyticsKpiCard
      title="Media giornaliera"
      value={avgPerDay}
      icon={faCalculator}
    />
    <AnalyticsKpiCard
      title="Ultimo evento"
      value={lastEventLabel}
      icon={faClock}
    />
    {avgRating !== null && (
      <AnalyticsKpiCard
        title="Rating medio nel range"
        value={avgRating}
        icon={faStar}
      />
    )}
  </div>
);

const ModeLineChart = ({ data, valueLabel }) => {
  if (!data?.length) {
    return (
      <p className="text-sm text-gray-500">
        Nessun dato disponibile per il periodo selezionato.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e6f4f2" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip valueLabel={valueLabel} />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#228E8D"
          strokeWidth={3}
          dot={{ r: 3, strokeWidth: 1.5, stroke: "#228E8D" }}
          activeDot={{ r: 5, stroke: "#62C1BA", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const AnalyticsTable = ({ rows = [] }) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowTable((prev) => !prev)}
        className="text-[#228E8D] text-xs flex items-center gap-2 hover:underline"
      >
        <FontAwesomeIcon
          icon={!showTable ? faEye : faEyeSlash}
          className="w-3 h-3"
        />
        {!showTable ? "Mostra tabella" : "Nascondi tabella"}
      </button>

      {showTable && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-[#d4f1ef] py-2 px-4 rounded-xl text-sm border-separate border-spacing-y-2 relative">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-3">Data</th>
                <th className="px-3">Visualizzazioni</th>
                <th className="px-3">Numero recensioni</th>
                <th className="px-3">Media recensioni</th>
                <th className="px-3">Mi piace</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.dateKey}
                  className="bg-[#F0FAFA] border border-[#d4f1ef] text-gray-600"
                >
                  <td className="px-3 py-2 font-semibold text-[#228E8D]/80">
                    {formatRomeDateKeyLabel(row.dateKey)}
                  </td>
                  <td className="px-3 py-2">{row.views || "-"}</td>
                  <td className="px-3 py-2">{row.reviewsAdded || "-"}</td>
                  <td className="px-3 py-2">
                    {row.ratingAvg.toFixed(1) == 0
                      ? "-"
                      : row.ratingAvg.toFixed(1)}
                  </td>
                  <td className="px-3 py-2">{row.likesDelta || "-"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="px-3 py-2 text-gray-500" colSpan={5}>
                    Nessun dato disponibile nel range selezionato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function DettagliTecniciAnalyticsPanel({
  range,
  onRangeChange,
  analyticsMode = "views",
  analyticsApartmentOptions = [],
  analyticsApartmentId,
  onAnalyticsApartmentChange,
  selectedApartment = null,
  analyticsSeries = [],
  analyticsKpis = null,
  analyticsDailyRows = [],
  analyticsWarnings = [],
  analyticsLoading = false,
  analyticsError = null,
  containerclass = "",
}) {
  const modeConfig = resolveModeMetric(analyticsMode);
  const isScoreMode = analyticsMode === "score";
  const modeLabel = modeConfig.label;
  const totalLabel = modeConfig.totalLabel;
  const kpis = analyticsKpis || {};
  const totalValue = formatNumber(kpis.total ?? 0);
  const avgPerDay = Number.isFinite(kpis.avgPerDay)
    ? kpis.avgPerDay.toFixed(2)
    : "0.00";
  const lastEventLabel = kpis.lastEventAt
    ? formatDate(kpis.lastEventAt, "it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Rome",
      })
    : "Data non disponibile";
  const avgRating =
    analyticsMode === "reviews" && Number.isFinite(kpis.avgRating)
      ? kpis.avgRating.toFixed(2)
      : null;
  const scoreValue = formatNumber(selectedApartment?.score ?? 0);
  const scoreUpdatedAt =
    selectedApartment?.metrics?.updatedAt ||
    selectedApartment?.updatedAt ||
    null;

  const analyticsChartData = useMemo(
    () =>
      analyticsSeries.map(({ dateKey, value }) => ({
        dateKey,
        label: formatRomeDateKeyLabel(dateKey),
        value,
      })),
    [analyticsSeries]
  );

  return (
    <div
      className={
        "bg-white border border-[#d4f1ef] rounded-3xl p-5 shadow-sm space-y-6 " +
        containerclass
      }
    >
      <div className="space-y-6">
        <AnalyticsHeader
          analyticsApartmentOptions={analyticsApartmentOptions}
          analyticsApartmentId={analyticsApartmentId}
          onAnalyticsApartmentChange={onAnalyticsApartmentChange}
          analyticsMode={analyticsMode}
        />

        {!isScoreMode && analyticsError && (
          <p className="text-sm text-red-600">{analyticsError}</p>
        )}
        {!isScoreMode && analyticsLoading && (
          <p className="text-sm text-gray-500">Caricamento analytics...</p>
        )}

        {!isScoreMode && (
          <AnalyticsRange range={range} onRangeChange={onRangeChange} />
        )}

        {isScoreMode && (
          <div className="bg-white space-y-3 sm:p-3">
            <AnalyticsKpiCard
              title="Score attuale"
              value={scoreValue}
              icon={faChartLine}
            />
            {scoreUpdatedAt && (
              <p className="text-xs text-gray-500">
                Ultimo aggiornamento:{" "}
                {formatDate(scoreUpdatedAt, "it-IT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Rome",
                })}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Lo score è un indice complessivo e non ha andamento giornaliero.
            </p>
          </div>
        )}

        {!isScoreMode && !analyticsLoading && !analyticsError && (
          <>
            <AnalyticsKpis
              totalLabel={totalLabel}
              totalValue={totalValue}
              avgPerDay={avgPerDay}
              lastEventLabel={lastEventLabel}
              avgRating={avgRating}
            />

            <div className="h-72">
              <ModeLineChart data={analyticsChartData} valueLabel={modeLabel} />
            </div>

            <AnalyticsTable rows={analyticsDailyRows} />

            {analyticsWarnings.length > 0 && (
              <div className="text-xs text-amber-600">
                {analyticsWarnings.join(" ")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
