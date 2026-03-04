import FormInput from "@/ui/components/common/form/FormInput";
import FormSelectDropdown from "@/ui/components/common/form/FormSelect";
import Checkbox from "@/ui/components/common/form/Checkbox";

export default function AdminAnnunciFilters({
  filters,
  cityOptions,
  setFilters,
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Cerca per titolo, città, descrizione o owner ID
          </label>
          <FormInput
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Esempio: Milano, stanza singola, user_123"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Filtra per città
          </label>
          <FormSelectDropdown
            options={[
              { label: "Tutte", value: "all" },
              ...cityOptions.map((city) => ({
                label: city,
                value: city,
              })),
            ]}
            value={filters.city}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, city: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Ordina
          </label>
          <FormSelectDropdown
            options={[
              { label: "Più recenti", value: "recent" },
              { label: "Meno recenti", value: "oldest" },
              { label: "Criticità", value: "risk" },
            ]}
            value={filters.sort}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sort: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Checkbox
          label="Solo annunci con criticità"
          checked={filters.onlyHighRisk}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              onlyHighRisk: e.target.checked,
            }))
          }
        />
      </div>
    </div>
  );
}
