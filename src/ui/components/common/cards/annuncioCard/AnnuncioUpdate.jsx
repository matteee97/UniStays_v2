import { useState } from "react";
import TextAreaEditor from "../../form/TextAreaEditor";
import { toast } from "sonner";
import { VALIDATION } from "@/shared/types";
import AnnuncioRoomsModal from "./AnnuncioRoomsModal";
import AnnuncioApartmentModal from "./AnnuncioApartmentModal";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";

export default function AnnuncioUpdate({
  annuncio,
  setUpdateMode,
  aggiornaAnnuncio,
  setRoomsModalOpen,
  roomsModalOpen,
  apartmentModalOpen,
  setApartmentModalOpen,
}) {
  const [descrizione, setDescrizione] = useState(annuncio.description || "");
  const [loading, setLoading] = useState(false);

  const saveChanges = async () => {
    try {
      setLoading(true);
      await FirestoreApartmentRepository.updateDescription(
        annuncio.id,
        descrizione
      );
      aggiornaAnnuncio({
        ...annuncio,
        description: descrizione,
      });
      setLoading(false);
      setUpdateMode(false);
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
      toast.error("Errore durante il salvataggio. Riprova.");
    }
  };

  return (
    <>
      <div className="absolute top-0 left-0 flex flex-col w-full h-full p-4 gap-5 text-sm overflow-y-auto">
        <TextAreaEditor
          label="Descrizione"
          helper="Mantieni le righe separate, verranno salvate con gli a capo."
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Aggiungi dettagli, servizi, trasporti, regole..."
          rows={4}
          expandedRows={8}
          maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
        />

        <div className="flex gap-4 items-center">
          <button
            onClick={() => setRoomsModalOpen(true)}
            aria-label="Modifica stanze"
            type="button"
            className="border max-w-48 text-[#228E8D] border-[#228E8D] hover:bg-[#228E8D] hover:text-white font-semibold px-4 py-2 rounded-full transition-colors duration-200"
          >
            Modifica stanze
          </button>

          <button
            onClick={() => setApartmentModalOpen(true)}
            aria-label="Modifica informazioni appartamento"
            type="button"
            className="border max-w-64 text-[#228E8D] border-[#228E8D] hover:bg-[#228E8D] hover:text-white font-semibold px-4 py-2 rounded-full transition-colors duration-200"
          >
            Modifica info appartamento
          </button>
        </div>

        <button
          onClick={saveChanges}
          aria-label="Salva Modifiche"
          type="button"
          className="bg-[#228E8D] text-white px-4 py-2 rounded-full"
          disabled={loading}
        >
          {loading ? "Salvataggio in corso..." : "Salva Modifiche"}
        </button>
      </div>
      <AnnuncioRoomsModal
        annuncioId={annuncio?.id}
        totalAreaMq={annuncio?.features?.totalAreaMq}
        isOpen={roomsModalOpen}
        onClose={() => setRoomsModalOpen(false)}
        onRoomsUpdated={(aggregates) =>
          aggiornaAnnuncio({ ...annuncio, aggregates })
        }
      />
      <AnnuncioApartmentModal
        annuncio={annuncio}
        isOpen={apartmentModalOpen}
        onClose={() => setApartmentModalOpen(false)}
        onApartmentUpdated={(updated) =>
          aggiornaAnnuncio({ ...annuncio, ...updated })
        }
      />
    </>
  );
}
