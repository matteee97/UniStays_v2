import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import LoadingIcon from "../shared/icons/LoadingIcon";
import Modal from "../modals/Modal";
import { toast } from "sonner";
import CoolButton from "../buttons/CoolButton";
import { generatePdf } from "@/ui/helpers/generatePdf";
import { PdfDoc } from "./PdfDoc";

function PDFGenerator({ app }) {
  const ref = useRef();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleGeneratePdf = async () => {
    try {
      setLoading(true);
      await generatePdf(ref, app.id ?? "idNonSpecificato");
      setLoading(false);
      setTimeout(() => setOpenModal(false), 500);
    } catch (error) {
      console.error("Errore nella generazione del PDF:", error);
      toast.error("Errore nella generazione del PDF. Riprova.");
    }
  };

  return (
    <>
      {openModal && (
        <Modal
          imgUrl={"/icons/qr.webp"}
          title={"Genera PDF"}
          onClose={() => setOpenModal(false)}
        >
          <div className="flex w-full items-center justify-center flex-col gap-4 min-w-[320px]">
            <PdfDoc app={app} ref={ref} />

            <CoolButton
              type="button"
              onClick={handleGeneratePdf}
              disabled={loading}
              className="mt-2"
              ariaLabel="Genera PDF"
            >
              {loading ? "Generazione in corso..." : "Genera PDF"}
            </CoolButton>
          </div>
        </Modal>
      )}

      <button
        type="button"
        aria-label="Scarica PDF dell'annuncio"
        title="Scarica PDF dell'annuncio"
        onClick={() => setOpenModal(true)}
        className="border bg-[#228E8D] text-white border-[#228E8D] font-semibold px-2 rounded-xl w-full h-full"
        disabled={loading}
      >
        <FontAwesomeIcon icon={faDownload} />
      </button>
      {loading && <LoadingIcon />}
    </>
  );
}

export default PDFGenerator;
