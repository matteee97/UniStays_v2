import { Link } from "react-router-dom";
import { CURRENCY } from "@/shared/types";

const PlatformMessagePreview = ({
  shouldLoadPreview,
  previewStatus,
  preview,
  previewUrl,
  isCompact,
  previewBorder,
  previewAccent,
  previewMuted,
  hasPrice,
  priceLabel,
}) => {
  if (!shouldLoadPreview) return null;

  return (
    <div className="mt-4">
      {previewStatus === "loading" && (
        <div
          className={`rounded-xl border ${previewBorder} bg-white/70 dark:bg-white/5 p-3 animate-pulse`}
        >
          <div className="flex gap-3 items-center">
            <div
              className={`rounded-lg bg-emerald-100 dark:bg-gray-600 ${
                isCompact ? "h-14 w-20" : "h-16 w-24"
              }`}
            />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-emerald-100 dark:bg-gray-600" />
              <div className="h-3 w-1/2 rounded bg-emerald-100 dark:bg-gray-600" />
              <div className="h-3 w-1/3 rounded bg-emerald-100 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      )}

      {previewStatus === "ready" && preview && previewUrl && (
        <Link
          to={previewUrl}
          className="group block"
          aria-label={`Apri annuncio ${preview.title}`}
        >
          <div
            className={`flex ${
              isCompact
                ? "flex-row items-center"
                : "flex-col sm:flex-row items-start sm:items-center"
            } gap-3 rounded-xl border ${previewBorder} bg-white/80 p-1 shadow-sm`}
          >
            <div
              className={`overflow-hidden rounded-lg bg-gray-100 ${
                isCompact ? "w-20 h-[68px]" : "w-full sm:w-28 h-20"
              }`}
            >
              <img
                src={preview.imageUrl}
                alt={preview.title || "Alloggio"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {preview.title}
              </p>
              {preview.address?.city && (
                <p className="text-xs text-gray-500 mt-1">
                  {preview.address.city}
                </p>
              )}
              {hasPrice && (
                <p className={`text-sm font-semibold ${previewAccent} mt-2`}>
                  {priceLabel} /mese
                </p>
              )}
            </div>
            {!isCompact && (
              <div className="text-xs font-semibold text-left sm:text-right">
                <span className={`${previewAccent} group-hover:underline`}>
                  Apri annuncio
                </span>
                <div className={`${previewMuted} mt-1`}>Dettagli completi</div>
              </div>
            )}
          </div>
        </Link>
      )}
      {previewStatus === "error" && (
        <div className={`text-xs ${previewMuted}`}>
          Anteprima non disponibile al momento.
        </div>
      )}
    </div>
  );
};

export default PlatformMessagePreview;
