import SmallCard from "@/ui/components/common/cards/SmallCard";
import Checkbox from "@/ui/components/common/form/Checkbox";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";

export default function AdminAnnuncioCard({
  annuncio,
  flags,
  selected,
  isUpdating,
  ownerId,
  onSelect,
  onVerify,
  onReject,
  onView,
  formatDateTime,
}) {
  const prezzo = getPriceRangeLabel(annuncio.aggregates);
  const photoCount = annuncio.apartmentPhotoUrls?.length || 0;

  return (
    <div className="bg-[#f0fafa] border-2 border-[#d4f1ef] rounded-xl p-2 shadow-md sm:p-4 space-y-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between w-full">
          <Checkbox
            checked={selected}
            onChange={onSelect}
            disabled={isUpdating}
          />
          <div className="font-semibold text-xs text-[#b7b7b768] text-right">
            <p className=" tracking-wide uppercase">
              ID: <span className="admin-mono">{annuncio.id}</span>
            </p>
            <p className="admin-muted">
              Owner:{" "}
              <span className={ownerId ? "" : "text-[#c1646484] line-through"}>
                {ownerId || "Non indicato"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="admin-chip" data-tone="emerald">
            {prezzo ? `€${prezzo}/mese` : "Prezzo non indicato"}
          </span>
          <span className="admin-chip" data-tone="sky">
            Foto: {photoCount}
          </span>
        </div>
      </div>

      {flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {flags.map((flag) => (
            <span
              key={`${annuncio.id}-${flag.label}`}
              className={`admin-flag ${flag.tone}`}
            >
              {flag.label}
            </span>
          ))}
        </div>
      )}

      <SmallCard app={annuncio} handleClick={onView} showCity={true} />

      <div className="space-y-3 tracking-wide">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onVerify}
            disabled={isUpdating}
            className="px-3 py-1 text-[#0e4544] dark:text-white rounded-xl flex items-center justify-center bg-[#228e8c8f] border border-[#228E8D] w-full flex-1"
            data-variant="primary"
          >
            {isUpdating ? "Caricamento..." : "Segna come Verificato"}
          </button>
          <button
            onClick={onReject}
            disabled={isUpdating}
            className="px-3 py-1 text-red-600 dark:text-white rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900 border border-red-500 w-full flex-1"
            data-variant="danger"
          >
            {isUpdating ? "Caricamento..." : "Rifiuta"}
          </button>
        </div>
        <button
          onClick={onView}
          className="px-3 py-1 rounded-xl flex items-center justify-center bg-white border border-[#D4F1EF] w-full"
          data-variant="soft"
        >
          Visualizza annuncio
        </button>
      </div>

      <div className="flex justify-between items-center text-xs text-[#b7b7b768] admin-muted space-y-1">
        <p>Creato: {formatDateTime(annuncio.createdAt)}</p>
        <p>Ultima modifica: {formatDateTime(annuncio.updatedAt)}</p>
      </div>
    </div>
  );
}
