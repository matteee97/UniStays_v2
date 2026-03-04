import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import LoadingIcon from "@/ui/components/common/shared/icons/loadingIcon";
import { FirestoreCityRepository } from "@/infrastructure/firebase/repositories/FirestoreCityRepository";
import { useCities } from "@/ui/hooks/fetches/useCities";

const emptyForm = {
  city: "",
  provinceCode: "",
  university: "",
  imgUrl: "",
  lat: "",
  lng: "",
  slug: "",
  active: true,
};

const CityRow = ({ city, onEdit, onDelete }) => (
  <tr className="border-b border-gray-100 dark:border-gray-800">
    <td className="py-3 px-4 font-semibold text-gray-800">{city.city}</td>
    <td className="py-3 px-4 text-gray-600">{city.university}</td>
    <td className="py-3 px-4 text-gray-600">{city.provinceCode}</td>
    <td className="py-3 px-4 text-gray-600">{city.slug}</td>
    <td className="py-3 px-4 text-gray-600">
      {city?.stats?.listingsCount ?? "—"}
    </td>
    <td className="py-3 px-4 text-gray-600">
      {city.active ? (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
          Attiva
        </span>
      ) : (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
          Disattiva
        </span>
      )}
    </td>
    <td className="py-3 px-4 flex gap-2">
      <button
        type="button"
        onClick={() => onEdit(city)}
        className="px-3 py-1 text-sm rounded-lg border border-[#228E8D] text-[#228E8D] hover:bg-[#228E8D]/10 transition-colors"
      >
        Modifica
      </button>
      <button
        type="button"
        onClick={() => onDelete(city)}
        className="px-3 py-1 text-sm rounded-lg border border-red-400 text-red-600 hover:bg-red-50 transition-colors"
      >
        Elimina
      </button>
    </td>
  </tr>
);

export default function AdminCitiesSection() {
  const { cities, loading, error, refresh } = useCities({
    includeCounts: true,
  });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(`Errore nel caricamento città: ${error}`);
    }
  }, [error]);

  const orderedCities = useMemo(() => {
    return [...(cities || [])].sort((a, b) =>
      a.city.localeCompare(b.city, "it", { sensitivity: "base" })
    );
  }, [cities]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["lat", "lng"].includes(name)
          ? value
          : value,
    }));
  };

  const handleEdit = (city) => {
    setEditingId(city.id);
    setForm({
      city: city.city,
      provinceCode: city.provinceCode || "",
      university: city.university || "",
      imgUrl: city.imgUrl || "",
      lat: city.coords?.lat ?? city.lat ?? "",
      lng: city.coords?.lng ?? city.lng ?? "",
      slug: city.slug || "",
      active: city.active !== false,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
      };

      if (editingId) {
        await FirestoreCityRepository.updateCity(editingId, payload);
        toast.success("Città aggiornata con successo");
      } else {
        await FirestoreCityRepository.createCity(payload);
        toast.success("Città creata con successo");
      }
      resetForm();
      await refresh();
    } catch (err) {
      toast.error(err.message || "Errore durante il salvataggio della città");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (city) => {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare ${city.city}?`
    );
    if (!confirmed) return;
    try {
      await FirestoreCityRepository.deleteCity(city.id);
      toast.success("Città eliminata");
      await refresh();
      if (editingId === city.id) {
        resetForm();
      }
    } catch (err) {
      toast.error(err.message || "Errore durante l'eliminazione");
    }
  };

  const handleRecalculateCounts = async () => {
    setRecalculating(true);
    try {
      const updates =
        await FirestoreCityRepository.recomputeCitiesListingsCount();
      toast.success(`Conteggi aggiornati per ${updates.length} città.`, {
        duration: 3500,
      });
      await refresh();
    } catch (err) {
      toast.error(err.message || "Errore durante il ricalcolo dei conteggi");
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editingId ? "Modifica città" : "Aggiungi nuova città"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome città *
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#228E8D] focus:border-[#228E8D]"
              placeholder="Es. Roma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia (sigla) *
            </label>
            <input
              name="provinceCode"
              value={form.provinceCode}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#228E8D] focus:border-[#228E8D]"
              placeholder="Es. RM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Università principale
            </label>
            <input
              name="university"
              value={form.university}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#228E8D] focus:border-[#228E8D]"
              placeholder="Es. Sapienza"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (facoltativo)
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#228E8D] focus:border-[#228E8D]"
              placeholder="roma-rm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Immagine (URL)
            </label>
            <input
              name="imgUrl"
              value={form.imgUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#228E8D] focus:border-[#228E8D]"
              placeholder="/img/cities/roma.webp"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitudine
              </label>
              <input
                name="lat"
                value={form.lat}
                onChange={handleChange}
                type="number"
                step="0.000001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#228E8D] focus:border-[#228E8D]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitudine
              </label>
              <input
                name="lng"
                value={form.lng}
                onChange={handleChange}
                type="number"
                step="0.000001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#228E8D] focus:border-[#228E8D]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="city-active"
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 text-[#228E8D] border-gray-300 rounded"
            />
            <label htmlFor="city-active" className="text-sm text-gray-700">
              Città attiva
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 bg-[#228E8D] text-white rounded-lg shadow-sm hover:bg-[#1a6b6a] disabled:opacity-60"
            >
              {submitting ? "Salvataggio..." : editingId ? "Aggiorna" : "Crea"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-600 underline"
              >
                Annulla modifica
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Città (totale: {orderedCities.length})
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refresh}
              className="text-sm text-[#228E8D] underline"
            >
              Aggiorna
            </button>
            <button
              type="button"
              onClick={handleRecalculateCounts}
              disabled={recalculating}
              className="text-sm px-3 py-1 rounded-lg border border-[#228E8D] text-[#228E8D] hover:bg-[#228E8D]/10 disabled:opacity-60"
            >
              {recalculating ? "Ricalcolo..." : "Ricalcola conteggi"}
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingIcon />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600">
            Errore nel caricamento delle città: {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Città
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Università
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sigla
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Annunci
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-800">
                {orderedCities.map((city) => (
                  <CityRow
                    key={city.id}
                    city={city}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
            {!orderedCities.length && (
              <p className="p-4 text-sm text-gray-600">
                Nessuna città presente. Aggiungi la prima città per iniziare.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
