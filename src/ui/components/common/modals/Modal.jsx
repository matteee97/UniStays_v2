import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CloseButton from "../buttons/CloseButton.jsx";
import { useInView } from "@/ui/hooks";
import GlassContainer from "../containers/GlassContainer.jsx";

/**
 * Modal component to display a modal dialog with a title, full description, and children.
 * The component also handles outside clicks and disables the body's overflow.
 *
 * @param {string} imgUrl - URL of the image to display in the modal title.
 * @param {string} title - Title of the modal.
 * @param {string} fullDesc - Full description of the modal. Can contain HTML (**keep in mind**).
 * @param {function} onClose - Callback function to call when the modal is closed.
 * @param {ReactNode} children - Children of the modal.
 * @param {string} id - ID of the modal.
 * @param {boolean} disableOutsideClick - Whether to disable outside clicks. Defaults to false.
 * @param {boolean} closeOnEsc - Whether to close the modal on Escape key press. Defaults to true.
 */
export default function Modal({
  imgUrl,
  title,
  fullDesc,
  onClose,
  children,
  id,
  disableOutsideClick = false,
  closeOnEsc = true,
  disableEffects = false,
  disableDistortion = false,
}) {
  const modalRef = useRef(null);
  const [imgRef, isVisible] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleOutsidePointerDown = (e) => {
      if (disableOutsideClick) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (!closeOnEsc) return;
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown, {
      capture: true,
    });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("pointerdown", handleOutsidePointerDown, {
        capture: true,
      });
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, disableOutsideClick, closeOnEsc]);

  // opzionale: focus iniziale
  useEffect(() => {
    modalRef.current?.focus?.();
  }, []);

  return createPortal(
    <div
      id={id ?? "modal"}
      className="fixed inset-0 z-[9999] grid place-content-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      aria-describedby="modal-description"
    >
      <div className="rounded-2xl shadow-2xl">
        <GlassContainer
          ref={modalRef}
          tabIndex={-1}
          disableEffects={disableEffects}
          disableDistortion={disableDistortion}
          className={
            "max-h-[74vh] sm:max-h-[95vh] flex flex-col outline-none  w-[98vw] sm:w-full rounded-2xl p-3 sm:p-6"
          }
        >
          <div className="flex items-start justify-between">
            <div className="flex">
              {imgUrl && (
                <span
                  ref={imgRef}
                  className="relative h-2 sm:h-10 mb-4 w-20 overflow-visible"
                >
                  {isVisible && (
                    <img
                      src={imgUrl}
                      alt={title}
                      loading="lazy"
                      className="absolute -top-10 left-0 h-20 w-20 animate-fadeIn transition-all duration-300"
                    />
                  )}
                </span>
              )}

              <h3
                id="modalTitle"
                className="text-xl font-semibold text-gray-800 mb-2"
              >
                {title}
              </h3>
            </div>

            <CloseButton onClick={onClose} />
          </div>

          <div className="mt-4 h-[90%] overflow-y-auto sm:px-1 flex-1">
            {fullDesc && (
              <p
                className="text-gray-700 bg-white/90  border-2 border-[#d4f1ef] p-3 rounded-xl"
                id="modal-description"
                dangerouslySetInnerHTML={{ __html: fullDesc }}
              />
            )}
            {children}
          </div>
        </GlassContainer>
      </div>
    </div>,
    document.body,
  );
}
