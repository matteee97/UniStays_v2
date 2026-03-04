import { useMemo, useState } from "react";
import {
  InfoSectionCard,
  InfoSectionHeader,
} from "@/ui/components/sections/apartmentSection/InfoSection";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TextAreaEditor({
  id,
  name,
  label,
  helper,
  value,
  disabled = false,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  expandedRows = 8,
  maxLength,
  showPreview = true,
  showCounter = true,
  hasError = false,
  errorMessage = "",
  className = "",
  toggleExpandLabel = "Espandi editor",
  toggleCollapseLabel = "Riduci editor",
  previewLabel = "Anteprima",
  previewTitle = "Anteprima contenuto",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const safeValue = typeof value === "string" ? value : "";
  const currentRows = isExpanded ? expandedRows : rows;
  const counterLabel = useMemo(() => {
    if (!showCounter) return "";
    if (maxLength) return `${safeValue.length}/${maxLength}`;
    return `${safeValue.length} caratteri`;
  }, [maxLength, safeValue.length, showCounter]);

  return (
    <div
      className={`rounded-xl border ${
        hasError ? "border-red-300" : "border-[#D4F1EF]"
      } p-3 bg-white/70 dark:bg-[#0F172A]/60 dark:border-[#1F2937] ${
        disabled && "opacity-80"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          {label && (
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {label}
            </p>
          )}
          {helper && (
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {helper}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showCounter && (
            <span className="text-[11px] text-gray-400">{counterLabel}</span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[11px] px-2 py-1 rounded-full border border-[#228E8D] text-[#228E8D] hover:bg-[#228E8D] hover:text-white transition"
          >
            {isExpanded ? toggleCollapseLabel : toggleExpandLabel}
          </button>
        </div>
      </div>

      <textarea
        id={id}
        name={name}
        rows={currentRows}
        className={`w-full min-h-fit px-3 py-2 text-gray-700 rounded-lg border ${
          hasError ? "border-red-300" : "border-[#D4F1EF]"
        } ${disabled && "cursor-not-allowed opacity-60"} focus:outline-none focus:ring-2 focus:ring-[#228E8D] bg-white/80 dark:bg-[#0F172A]/60 dark:text-gray-200 dark:border-[#1F2937]`}
        value={safeValue}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
      />

      {hasError && errorMessage ? (
        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
      ) : null}

      {showPreview && isExpanded ? (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            {previewLabel}
          </p>
          <div className="mt-1 ">
            {safeValue ? (
              <InfoSectionCard variant="gradient">
                <InfoSectionHeader
                  title={
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faInfo}
                        className="text-[#228E8D] w-4 h-4 rounded-full p-2 border-2 border-[#228E8D]/20"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#228E8D] uppercase tracking-[0.08em]">
                          {previewTitle}
                        </p>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {previewLabel}
                        </h2>
                      </div>
                    </div>
                  }
                />
                <pre className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed mt-5">
                  {safeValue}
                </pre>
              </InfoSectionCard>
            ) : (
              <p className="rounded-lg border border-dashed border-[#D4F1EF] p-3 text-xs text-gray-600 bg-[#f8fffd] dark:bg-[#0F172A] dark:border-[#1F2937] dark:text-gray-100">
                Scrivi il testo per vedere l&apos;anteprima.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
