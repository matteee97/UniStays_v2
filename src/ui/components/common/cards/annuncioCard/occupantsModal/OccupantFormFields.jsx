import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashCan, faUser } from "@fortawesome/free-solid-svg-icons";
import TextAreaEditor from "../../../form/TextAreaEditor";
import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";

export function SectionPanel({ icon, title, subtitle, children }) {
  return (
    <section className="space-y-4 rounded-2xl border-2 border-[#d4f1ef] bg-[#d4f1ef] p-4">
      <header className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#228E8D]/15 text-[#228E8D]">
          <FontAwesomeIcon icon={icon} className="text-sm" />
        </span>
        <div>
          <h5 className="text-sm font-semibold text-gray-800">{title}</h5>
          {subtitle ? (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function TagSelector({
  label,
  subtitle,
  options,
  selected = [],
  onToggle,
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        {label}
        {selected.length > 0 ? (
          <span className="ml-2 rounded-full bg-[#228E8D]/10 px-2 py-0.5 text-[11px] font-semibold text-[#228E8D]">
            {selected.length}
          </span>
        ) : null}
      </p>
      {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-[#228E8D] bg-[#228E8D] text-white"
                  : "border-[#d4f1ef] bg-white text-[#228E8D] hover:border-[#228E8D]/60"
              }`}
            >
              <FontAwesomeIcon icon={option.icon} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SingleChoiceSelector({
  label,
  subtitle,
  options = [],
  value = "",
  onSelect,
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-[#228E8D] bg-[#228E8D] text-white"
                  : "border-[#d4f1ef] bg-white text-[#228E8D] hover:border-[#228E8D]/60"
              }`}
            >
              {option.icon ? <FontAwesomeIcon icon={option.icon} /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LabeledTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder = "",
  helper = "",
}) {
  return (
    <TextAreaEditor
      label={label}
      helper={helper}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      expandedRows={rows}
      showPreview={false}
      showCounter={false}
      showExpandToggle={false}
      className="border-2 border-[#D4F1EF] bg-white p-2"
    />
  );
}

export function OccupantAvatarField({ draft, onSelectFile, onRemove }) {
  const previewUrl = draft.avatarPreviewUrl || draft.avatarUrl || "";
  const inputId = `occupant-avatar-${draft.localId}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="h-32 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-[#d4f1ef] bg-[#f6fbfb]">
          {previewUrl ? (
            <ImageWithSkeleton
              src={previewUrl}
              alt={`Foto profilo di ${draft.displayName || "coinquilino"}`}
              rounded="rounded-none"
              containerClassName="h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top,_rgba(34,142,141,0.16),_transparent_60%)] px-3 text-center text-[#228E8D]">
              <FontAwesomeIcon icon={faUser} className="text-3xl" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Nessuna foto
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Foto profilo</p>
            <p className="text-xs text-gray-500">
              Una sola immagine, usata nelle card e nel dettaglio pubblico del
              coinquilino.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#d4f1ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#228E8D] transition hover:border-[#228E8D]/60"
            >
              <FontAwesomeIcon icon={faPlus} />
              {previewUrl ? "Sostituisci foto" : "Carica foto"}
            </label>

            {previewUrl ? (
              <button
                type="button"
                onClick={() => onRemove(draft.localId)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:border-red-400"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Rimuovi foto
              </button>
            ) : null}
          </div>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              onSelectFile(draft.localId, event.target.files?.[0] || null);
              event.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}
