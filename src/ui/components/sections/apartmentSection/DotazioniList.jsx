import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import Modal from "@/ui/components/common/modals/Modal";
import { dotazioniConfig, DOTAZIONI_SECTIONS } from "@/ui/data/dotazioniConfig";
import GreenContainer from "@/ui/components/common/containers/GreenContainer";

export default function DotazioniList({
  app,
  showAllDotazioni,
  setShowAllDotazioni,
}) {
  // Mostra solo le dotazioni presenti
  const dotazioniPresenti = dotazioniConfig.filter((d) => {
    const val = app?.[d.key];
    return val !== undefined && val !== null && val !== false;
  });

  const dotazioniPerSezione = useMemo(() => {
    const assigned = new Set();
    const sections = DOTAZIONI_SECTIONS.map((section) => {
      const items = dotazioniPresenti.filter((d) =>
        section.keys.includes(d.key),
      );
      items.forEach((d) => assigned.add(d.key));
      return { title: section.title, items };
    });

    const remaining = dotazioniPresenti.filter((d) => !assigned.has(d.key));
    if (remaining.length > 0) {
      sections.push({ title: "Altro", items: remaining });
    }

    return sections.filter((section) => section.items.length > 0);
  }, [dotazioniPresenti]);

  return (
    <GreenContainer className="space-y-4">
      <ul className="text-sm mt-2 pl-2 grid grid-cols-1 md:grid-cols-2 gap-y-2">
        {dotazioniPresenti.slice(0, 6).map((d) => {
          const valore = app[d.key];
          return (
            <li key={d.key} className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={d.icon}
                className="w-4 h-4 text-[#228E8D]"
              />
              {typeof valore === "boolean" ? d.label : `${d.label}${valore}`}
            </li>
          );
        })}
      </ul>

      {dotazioniPresenti.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAllDotazioni(true)}
          className="group text-sm text-gray-600 hover:text-[#228E8D] bg-white/90 rounded-2xl py-1 px-3 flex items-center gap-2 hover:bg-[#228E8D]/10 text-left w-fit transition-colors"
        >
          Vedi tutte le dotazioni{" "}
          <span className="group-hover:text-white group-hover:bg-[#228E8D]/50 p-1 text-xs bg-[#228E8D]/10 text-[#228E8D] rounded-full transition-colors">
            +{dotazioniPresenti.length - 6}
          </span>
        </button>
      )}

      {showAllDotazioni && (
        <Modal onClose={() => setShowAllDotazioni(false)} title={"Dotazioni"}>
          <div className="space-y-8 max-h-[520px] min-w-80 sm:min-w-96 overflow-auto pr-4 py-2">
            {dotazioniPerSezione.map((section) => (
              <div key={section.title} className="space-y-3">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-lg font-semibold text-[#1f6f6e] uppercase tracking-wide">
                    {section.title}
                  </h3>
                  <div className="text-xs px-2 py-1 rounded-full border border-[#228E8D]/20 text-[#228E8D] bg-[#228E8D]/10">
                    {section.items.length}
                  </div>
                </div>
                <ul className="space-y-3 bg-white/90 rounded-lg p-4 border border-[#d4f1ef]">
                  {section.items.map((d) => {
                    const valore = app[d.key];
                    return (
                      <li
                        key={d.key}
                        className="flex items-center gap-3 text-base"
                      >
                        <FontAwesomeIcon
                          icon={d.icon}
                          className="w-[19px] h-[19px] text-[#228E8D]"
                        />
                        {typeof valore === "boolean"
                          ? d.label
                          : `${d.label}${valore}`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </GreenContainer>
  );
}
