import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import ArrowIcon from "@/ui/components/common/shared/icons/ArrowIcon.jsx";
import { InfoSectionCard, InfoSectionHeader } from "../InfoSection";

export default function ApartmentDescriptionSection({
  description,
  isExpanded,
  onToggle,
}) {
  return (
    <InfoSectionCard variant="gradient">
      <InfoSectionHeader
        title={
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faInfo}
              className="h-4 w-4 rounded-full border-2 border-[#228E8D]/20 p-2 text-[#228E8D]"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                Informazioni sull&apos;alloggio
              </p>
              <h2 className="text-xl font-semibold text-gray-800">
                Vivi gli spazi come li ha descritti l&apos;host
              </h2>
            </div>
          </div>
        }
      />

      <pre
        className={[
          isExpanded ? "" : "line-clamp-5",
          "mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-600 text-muted-foreground",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {description}
      </pre>

      <button
        type="button"
        onClick={onToggle}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#228E8D] transition-colors hover:text-[#1b6f6e]"
      >
        {isExpanded ? "Mostra meno" : "Leggi di più"}
        <span className={isExpanded ? "transition-transform rotate-0" : "transition-transform rotate-180"}>
          <ArrowIcon className="h-4 w-4 rotate-180" />
        </span>
      </button>
    </InfoSectionCard>
  );
}
