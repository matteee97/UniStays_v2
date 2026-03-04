import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import Modal from "@/ui/components/common/modals/Modal";
import { FirestoreReportRepository } from "@/infrastructure/firebase/repositories/FirestoreReportRepository";
import { REPORT_REASON_OPTIONS } from "@/shared/constants/reports";
import {
  getReportTargetLabel,
  normalizeReportTarget,
} from "@/shared/utils/reportTarget";
import FormSelectDropdown from "../form/FormSelect";

const DEFAULT_REASON = "other";
const MIN_MESSAGE_LENGTH = 10;

const buildReporterSnapshot = (user) => ({
  displayName: user?.fullName || user?.username || user?.firstName || "Utente",
  photoUrl: user?.imageUrl || null,
});

export default function ReportModal({
  isOpen,
  onClose,
  target,
  targetLabel = null,
  title = "Invia segnalazione",
  onSubmitted = null,
}) {
  const { user } = useUser();
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [validationError, setValidationError] = useState("");

  const normalizedTarget = useMemo(
    () => normalizeReportTarget(target),
    [target],
  );
  const resolvedTargetLabel =
    targetLabel || getReportTargetLabel(normalizedTarget?.type);

  useEffect(() => {
    if (!isOpen) return;
    setReason(DEFAULT_REASON);
    setMessage("");
    setValidationError("");
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (sending) return;
    onClose?.();
  }, [onClose, sending]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!normalizedTarget) {
        toast.error("Segnalazione non disponibile per questo contenuto.");
        return;
      }

      if (!user?.id) {
        toast.error("Devi effettuare l'accesso per inviare una segnalazione.");
        return;
      }

      const normalizedMessage = String(message || "").trim();
      if (normalizedMessage.length < MIN_MESSAGE_LENGTH) {
        setValidationError(
          `Inserisci almeno ${MIN_MESSAGE_LENGTH} caratteri per descrivere il problema.`,
        );
        return;
      }

      setValidationError("");
      setSending(true);

      try {
        await FirestoreReportRepository.createReport({
          target: normalizedTarget,
          reporterId: user.id,
          reporterSnapshot: buildReporterSnapshot(user),
          reason,
          message: normalizedMessage,
        });

        toast.success("Segnalazione inviata con successo.");
        onSubmitted?.();
        onClose?.();
      } catch (error) {
        console.error("Errore invio segnalazione:", error);
        toast.error("Errore durante l'invio della segnalazione. Riprova.");
      } finally {
        setSending(false);
      }
    },
    [message, normalizedTarget, onClose, onSubmitted, reason, user],
  );

  if (!isOpen) return null;

  return (
    <Modal onClose={handleClose} title={title} disableOutsideClick={sending}>
      <span className="sr-only">Stai segnalando:{resolvedTargetLabel}</span>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full sm:min-w-[410px] bg-white p-2 sm:p-4 rounded-lg border-2 border-[#d4f1ef]"
      >
        <div className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Motivo
            <FormSelectDropdown
              value={reason}
              required
              name="reason"
              id="reason"
              placeholder={DEFAULT_REASON}
              onChange={(event) => setReason(event.target.value)}
              className="rounded-lg w-full"
              options={REPORT_REASON_OPTIONS}
              minWidth="sm:min-w-[370px] max-h-[200px]"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Descrizione dettagliata
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Descrivi chiaramente il problema riscontrato..."
            rows={5}
            className="rounded-lg border border-[#d4f1ef] bg-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#228E8D]"
            required
          />
        </label>

        {validationError && (
          <p className="text-sm text-red-600" role="alert">
            {validationError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={sending}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-[#228E8D] px-4 py-2 text-sm text-white hover:bg-[#1a6f6d] transition-colors disabled:opacity-60"
          >
            {sending ? "Invio..." : "Invia segnalazione"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
