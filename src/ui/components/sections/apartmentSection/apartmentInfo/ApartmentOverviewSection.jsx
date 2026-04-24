import { InfoSectionCard, InfoSectionHeader } from "../InfoSection";

export default function ApartmentOverviewSection({ quickStats, availabilityLabel }) {
  return (
    <InfoSectionCard variant="muted">
      <InfoSectionHeader
        className="flex-wrap"
        title={
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
              Panoramica
            </p>
            <p className="text-lg font-semibold text-gray-700">
              Dati essenziali dell&apos;alloggio
            </p>
          </div>
        }
        badge={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#228E8D]/20 bg-[#228E8D]/10 px-3 py-1 text-xs font-semibold text-[#228E8D]">
            <span className="h-2 w-2 rounded-full bg-[#228E8D] animate-pulse"></span>
            {availabilityLabel}
          </span>
        }
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {stat.label}
            </p>
            <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.helper}</p>
          </div>
        ))}
      </div>
    </InfoSectionCard>
  );
}
