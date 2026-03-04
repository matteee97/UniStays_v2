import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import PDFGenerator from "../../PdfGenerator/PDFGenerator";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmModal from "../../modals/ConfirmModal";
import { useUser } from "@clerk/clerk-react";
import { removeAnnuncio } from "@/infrastructure/firebase/adapters/annunci";
import { canUpdateApartment } from "@/core/policies/canUpdateApartment.policy";
import { showCannotUpdateApartmentToast } from "@/ui/helpers/apartmentUpdateToast";
import ActionLabel from "../../indicators/ActionLabel";

export default function AnnuncioActions({
  annuncio,
  setUpdateMode,
  updateMode,
  onDeleteAnnuncio,
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await removeAnnuncio(annuncio.id, user.id);
      onDeleteAnnuncio(annuncio.id);
      toast.success("Annuncio cancellato con successo.");
      setModalOpen(false);
    } catch (e) {
      console.error("Errore cancellazione:", e);
      toast.error("Errore durante la cancellazione, riprova.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="lg:absolute right-4 top-0 lg:h-[286px] w-full lg:w-24 flex flex-row justify-center items-center gap-3 px-2 z-0">
        <PDFGenerator app={annuncio} />
        <button
          aria-label="Modifica annuncio"
          type="button"
          title="Modifica annuncio"
          className="border text-[#228E8D] border-[#228E8D] hover:bg-[#228E8D] hover:text-white font-semibold px-2 rounded-xl w-full transition-colors duration-200 h-full shadow-sm"
          onClick={() => {
            if (
              canUpdateApartment({
                createdAt: annuncio.createdAt,
                updatedAt: annuncio.updatedAt,
              })
            ) {
              setUpdateMode(!updateMode);
            } else {
              showCannotUpdateApartmentToast({
                createdAt: annuncio.createdAt,
                updatedAt: annuncio.updatedAt,
              });
            }
          }}
        >
          <FontAwesomeIcon icon={faPencil} />
        </button>

        <button
          aria-label="Elimina annuncio"
          type="button"
          title="Elimina annuncio"
          className="border text-red-400 dark:text-red-800 border-red-400 dark:border-red-900 hover:bg-red-500 dark:hover:bg-red-800 hover:text-white dark:hover:text-white font-semibold px-2 rounded-xl w-full transition-colors duration-200 h-full shadow-sm"
          onClick={() => setModalOpen(true)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        title={`Sei sicuro di voler cancellare l'annuncio "${annuncio.title}"?`}
        cancelText="No, annulla"
        loading={loading}
      />
    </>
  );
}
