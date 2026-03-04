import { ArrowIcon } from "@/ui/components/common";
import React from "react";

const FiltersSection = ({
  sectionKey,
  title,
  subtitle,
  isOpen = false,
  onToggle = () => {},
  children,
}) => {
  return (
    <section className="rounded-2xl border border-[#d4f1ef] bg-white p-4 transition-all duration-500">
      <button
        type="button"
        onClick={() => onToggle(sectionKey, !isOpen)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <ArrowIcon
          className={`h-5 w-5 text-[#228E8D] transition-transform duration-500 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* CONTENT */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100 mt-2"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`py-2 px-1 transition-all duration-500 ${
              isOpen ? "translate-y-0 blur-0" : "-translate-y-2 blur-[4px]"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiltersSection;
