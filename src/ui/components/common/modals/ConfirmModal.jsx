import { createPortal } from "react-dom";
import GlassContainer from "../containers/GlassContainer";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Sei sicuro?",
  description = "Questa azione non può essere annullata.",
  confirmText = "Conferma",
  cancelText = "Annulla",
  loading = false,
  confirmClassName = "border text-red-400 dark:text-red-800 border-red-400 dark:border-red-900 hover:bg-red-500 dark:hover:bg-red-800 hover:text-white dark:hover:text-white",
  cancelClassName = "border border-[#228E8D] hover:bg-[#228E8D] text-[#228E8D] hover:text-white",
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
      role="dialog"
      aria-modal="true"
    >
      <GlassContainer className="max-w-72 sm:max-w-96 text-center text-gray-800 font-medium px-4 py-3 gap-3 rounded-2xl">
        <h2 className="mb-2 text-lg font-semibold text-gray-700">{title}</h2>
        <p className="mb-6 text-gray-500">{description}</p>

        <div className="flex justify-around gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 rounded-full transition ${cancelClassName} font-medium duration-300`}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-full transition ${confirmClassName} font-medium duration-300`}
            aria-label={confirmText}
          >
            {loading ? "Caricamento..." : confirmText}
          </button>
        </div>
      </GlassContainer>
    </div>,
    document.body,
  );
}
