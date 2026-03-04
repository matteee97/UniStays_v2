import React, { useEffect, useMemo, useState } from "react";
import Modal from "../modals/Modal";
import { useWindowWidth } from "@/ui/hooks";
import { set } from "date-fns";

const OneTimeMessage = ({
  message,
  title = "Suggerimento",
  localStorageKey,
  imageUrl,
  onlyOnSmallScreen = false,
  onClose,
  disableOutsideClick = false,
}) => {
  const width = useWindowWidth();
  const isSmall = width <= 768;
  const [modalOpen, setModalOpen] = useState(true);

  const key = useMemo(() => localStorageKey ?? title, [localStorageKey, title]);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (onlyOnSmallScreen && !isSmall) return;
    if (typeof window === "undefined") return;

    const alreadySeen = window.localStorage.getItem(key) === "true";
    if (!alreadySeen) setShouldShow(true);
  }, [key, onlyOnSmallScreen, isSmall]);

  if (!shouldShow) return null;

  const handleClose = () => {
    window.localStorage.setItem(key, "true");
    setModalOpen(false);
    onClose?.();
  };

  return (
    modalOpen && (
      <Modal
        onClose={handleClose}
        imageUrl={imageUrl}
        title={title}
        disableOutsideClick={disableOutsideClick}
      >
        <div className="flex flex-col items-center justify-center gap-4 max-w-sm">
          <p>{message}</p>
        </div>
      </Modal>
    )
  );
};

export default OneTimeMessage;
