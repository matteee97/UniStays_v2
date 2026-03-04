import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";

import { ChatInput } from "@/ui/components/common/chat";
import { createGuidedSearchFilterPlan } from "@/application/useCases/createGuidedSearchFilterPlan";
import { Badge } from "@/ui/components/common";
import StarBorder from "@/ui/components/common/buttons/buttonsEffects/StarBorder.jsx";

/**
 * Natural-language input for apartment filters.
 * Single input, deterministic parsing, and automatic filter application.
 */
export default function QuickFiltersInputPanel({
  cityName,
  currentUiFilters,
  onApplyPlan,
}) {
  const [lastResult, setLastResult] = useState(null);

  const cityLabel = useMemo(
    () => cityName || "Citta non selezionata",
    [cityName],
  );

  const handleQuickFilterInput = ({ content }) => {
    const prompt = typeof content === "string" ? content.trim() : "";
    if (!prompt) return;

    if (!cityName) {
      toast.error("Seleziona prima una citta.");
      return;
    }

    const plan = createGuidedSearchFilterPlan({
      prompt,
      baseFilters: currentUiFilters,
    });

    if (!plan.hasSignals) {
      setLastResult(plan);
      return;
    }

    onApplyPlan?.(plan);
    setLastResult(plan);
  };

  return (
    <section className="rounded-2xl border border-[#d4f1ef] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
            <FontAwesomeIcon
              icon={faWandMagicSparkles}
              className="text-[#228E8D]"
            />
            Input smart filtri
          </h3>
          <p className="text-xs text-slate-600 opacity-70">
            Scrivi cosa cerchi e i filtri vengono applicati automaticamente.
          </p>
        </div>

        <Badge
          variant="new"
          size="xs"
          icon={"position"}
          className="hidden md:inline-flex"
        >
          {cityLabel}
        </Badge>
      </div>

      <div className="mt-3 search-wrap relative">
          <StarBorder as="button"
                      className="w-full"
                      color="cyan"
                      speed="5s">
        <ChatInput
          onSendMessage={handleQuickFilterInput}
          placeholder="Es: stanza singola sotto 500 euro con Wi-Fi"
          containerClassName="!p-1 !bg-white"
          textAreaClassName="text-sm !px-2 z-10"
          maxLength={280}
        />
          </StarBorder>
      </div>

      {lastResult?.summary && (
        <div className="mt-3 space-y-2">
          {lastResult.criteria?.length > 0 && (
            <>
              <p className="text-xs text-slate-600 opacity-70">
                Filtri applicati:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {lastResult.criteria.map((criterion) => (
                  <div
                    key={`${criterion.key}-${criterion.value}`}
                    className="rounded-full border border-[#d4f1ef] bg-white py-1 px-2  flex items-center gap-1"
                  >
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      className="text-[#228E8D] text-xs"
                    />
                    <span className="text-[11px] text-slate-700">
                      {criterion.label}: {criterion.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
