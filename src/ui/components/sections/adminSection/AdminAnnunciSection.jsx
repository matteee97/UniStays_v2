import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { removeAnnuncio } from "@/infrastructure/firebase/adapters/annunci";
import { AdminAnnuncioCard } from "./index";
import AdminAnnunciFilters from "./AdminAnnunciFilters";
import AdminAnnunciBulkActions from "./AdminAnnunciBulkActions";
import { formatDate } from "@/ui/helpers/formatDate";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";

export default function AdminAnnunciSection({ annunci, onRefresh, updatedAt }) {
  const navigate = useNavigate();
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [annunciList, setAnnunciList] = useState(annunci || []);
  const [filters, setFilters] = useState({
    search: "",
    city: "all",
    sort: "recent",
    onlyHighRisk: false,
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    setAnnunciList(annunci || []);
    setSelectedIds(new Set());
  }, [annunci]);

  const getOwnerId = useCallback(
    (annuncio) => annuncio?.owner?.ownerId || null,
    []
  );

  const computeFlags = useCallback(
    (annuncio) => {
      const flags = [];
      const ownerId = getOwnerId(annuncio);
      if (!ownerId) {
        flags.push({ label: "Owner mancante", tone: "text-red-700 bg-red-50" });
      }
      if (!annuncio?.apartmentPhotoUrls?.length) {
        flags.push({
          label: "Nessuna foto",
          tone: "text-amber-700 bg-amber-50",
        });
      }
      if (!annuncio?.description || annuncio.description.length < 40) {
        flags.push({
          label: "Descrizione breve",
          tone: "text-amber-700 bg-amber-50",
        });
      }
      if (
        annuncio?.aggregates?.minRoomPrice === undefined ||
        annuncio?.aggregates?.minRoomPrice === null
      ) {
        flags.push({
          label: "Prezzo mancante",
          tone: "text-amber-700 bg-amber-50",
        });
      }
      return flags;
    },
    [getOwnerId]
  );

  const cityOptions = useMemo(() => {
    const list = new Set();
    annunciList.forEach((item) => {
      const city = item.address?.city || item.city;
      if (city) {
        list.add(city);
      }
    });
    return Array.from(list).sort((a, b) =>
      a.localeCompare(b, "it", { sensitivity: "base" })
    );
  }, [annunciList]);

  const filteredAnnunci = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    let result = [...annunciList];

    if (searchTerm) {
      result = result.filter((item) => {
        const city = item.address?.city || item.city || "";
        const titolo = item.title || "";
        const descrizione = item.description || "";
        const ownerId = getOwnerId(item) || "";
        return (
          city.toLowerCase().includes(searchTerm) ||
          titolo.toLowerCase().includes(searchTerm) ||
          descrizione.toLowerCase().includes(searchTerm) ||
          ownerId.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (filters.city !== "all") {
      result = result.filter(
        (item) =>
          (item.address?.city || item.city || "").toLowerCase() ===
          filters.city.toLowerCase()
      );
    }

    if (filters.onlyHighRisk) {
      result = result.filter((item) => computeFlags(item).length > 0);
    }

    const getDateValue = (item) => {
      const value = item.createdAt;
      if (!value) return 0;
      if (typeof value.toDate === "function") {
        return value.toDate().getTime();
      }
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    result.sort((a, b) => {
      if (filters.sort === "oldest") {
        return getDateValue(a) - getDateValue(b);
      }
      if (filters.sort === "risk") {
        return computeFlags(b).length - computeFlags(a).length;
      }
      return getDateValue(b) - getDateValue(a);
    });

    return result;
  }, [annunciList, filters, computeFlags, getOwnerId]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === filteredAnnunci.length) return new Set();
      return new Set(filteredAnnunci.map((item) => item.id));
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      city: "all",
      sort: "recent",
      onlyHighRisk: false,
    });
  };

  const handleMarkAsChecked = async (annuncio, { skipConfirm } = {}) => {
    const annuncioId = annuncio.id;

    if (!skipConfirm) {
      const confirmed = window.confirm(
        `Segnare come verificato l'annuncio "${annuncio.title || annuncio.id}"?`
      );
      if (!confirmed) return;
    }

    try {
      setUpdatingIds((prev) => new Set(prev).add(annuncioId));
      await FirestoreApartmentRepository.publishApartment(annuncioId);
      setAnnunciList((prev) => prev.filter((item) => item.id !== annuncioId));
      toast.success("Annuncio contrassegnato come verificato");
    } catch (error) {
      console.error("Errore nel contrassegnare l'annuncio:", error);
      toast.error("Errore nel contrassegnare l'annuncio");
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(annuncioId);
        return newSet;
      });
    }
  };

  const handleRemoveAnnuncio = async (annuncio, { skipConfirm } = {}) => {
    const annuncioId = annuncio.id;
    const ownerId = getOwnerId(annuncio);

    if (!ownerId) {
      toast.error("ID proprietario mancante, impossibile rimuovere l'annuncio");
      return;
    }

    if (!skipConfirm) {
      const confirmed = window.confirm(
        `Vuoi rifiutare definitivamente l'annuncio "${
          annuncio.title || annuncio.id
        }"?`
      );
      if (!confirmed) return;
    }

    try {
      setUpdatingIds((prev) => new Set(prev).add(annuncioId));
      await removeAnnuncio(annuncioId, ownerId);
      setAnnunciList((prev) => prev.filter((item) => item.id !== annuncioId));
      toast.success("Annuncio rimosso correttamente");
    } catch (error) {
      console.error("Errore nella rimozione dell'annuncio:", error);
      toast.error("Errore durante la rimozione dell'annuncio");
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(annuncioId);
        return newSet;
      });
    }
  };

  const handleViewAnnuncio = (annuncio) => {
    if (!annuncio || !annuncio.id) return;
    const cityName = annuncio.address?.city || annuncio.city || "";
    if (cityName) {
      navigate(`/alloggi/${cityName}/${annuncio.id}`);
    } else {
      // Fallback: naviga direttamente all'annuncio se non abbiamo la città
      navigate(`/alloggi/${annuncio.id}`);
    }
  };

  const handleBulkAction = async (action) => {
    const selected = annunciList.filter((item) => selectedIds.has(item.id));
    if (!selected.length) {
      toast.info("Seleziona almeno un annuncio da processare");
      return;
    }

    const confirmMessage =
      action === "verify"
        ? "Confermi la verifica multipla degli annunci selezionati?"
        : "Confermi la rimozione definitiva degli annunci selezionati?";

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setBulkProcessing(true);

    try {
      for (const item of selected) {
        if (action === "verify") {
          // skipConfirm evita doppi prompt
          await handleMarkAsChecked(item, { skipConfirm: true });
        } else if (action === "reject") {
          const ownerId = getOwnerId(item);
          if (!ownerId) {
            toast.error(`Owner mancante per l'annuncio ${item.id}`);
            continue;
          }
          await handleRemoveAnnuncio(item, { skipConfirm: true });
        }
      }
    } finally {
      setSelectedIds(new Set());
      setBulkProcessing(false);
    }
  };

  if (annunciList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">Nessun annuncio da verificare</p>
        <p className="text-gray-400 text-sm mt-2">
          Tutti gli annunci sono stati verificati
        </p>
      </div>
    );
  }

  if (!filteredAnnunci.length) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-500 text-lg">
            Nessun annuncio corrisponde ai filtri correnti
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-sm text-[#228E8D] underline"
          >
            Azzera filtri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-[#228E8D]/20 text-[#228E8D] text-xs font-semibold">
            {annunciList.length} annunci in verifica
          </span>
          <span className="px-3 py-1 rounded-full text-[#b7b7b768] text-xs font-semibold">
            Aggiornato:{" "}
            {formatDate(updatedAt, "it-IT", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50/5"
            >
              Sincronizza dati
            </button>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50/5"
          >
            Reset filtri
          </button>
        </div>
      </div>

      <AdminAnnunciFilters
        filters={filters}
        cityOptions={cityOptions}
        setFilters={setFilters}
      />

      <AdminAnnunciBulkActions
        selectedIds={selectedIds}
        filteredAnnunci={filteredAnnunci}
        toggleSelectAll={toggleSelectAll}
        handleBulkAction={handleBulkAction}
        bulkProcessing={bulkProcessing}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnnunci.map((annuncio) => {
          const isUpdating = updatingIds.has(annuncio.id);
          const isSelected = selectedIds.has(annuncio.id);
          const flags = computeFlags(annuncio);
          return (
            <AdminAnnuncioCard
              key={annuncio.id}
              annuncio={annuncio}
              flags={flags}
              selected={isSelected}
              isUpdating={isUpdating}
              ownerId={annuncio.ownerId || null}
              onSelect={() => toggleSelect(annuncio.id)}
              onVerify={() =>
                handleMarkAsChecked(annuncio, { skipConfirm: true })
              }
              onReject={() => handleRemoveAnnuncio(annuncio)}
              onView={() => handleViewAnnuncio(annuncio)}
              formatDateTime={(value) =>
                formatDate(value, "it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
          );
        })}
      </div>
    </div>
  );
}
