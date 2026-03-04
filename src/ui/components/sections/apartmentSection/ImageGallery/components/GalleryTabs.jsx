export default function GalleryTabs({ activeTab, onChange, roomsAvailable }) {
  return (
    <div className="inline-flex rounded-2xl bg-white p-1 border-2 border-[#d4f1ef]">
      <GalleryTabButton
        active={activeTab === "apartment"}
        onClick={() => onChange("apartment")}
      >
        Alloggio
      </GalleryTabButton>
      <GalleryTabButton
        active={activeTab === "rooms"}
        onClick={() => onChange("rooms")}
        disabled={!roomsAvailable}
      >
        Stanze
      </GalleryTabButton>
    </div>
  );
}

function GalleryTabButton({ active, onClick, disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={
        "rounded-xl px-3 py-2 text-sm font-semibold transition " +
        (!active
          ? "bg-white text-gray-600"
          : "text-white dark:text-white/80 dark:hover:text-white bg-[#228E8D]/70") +
        (disabled ? " cursor-not-allowed opacity-50 hover:text-white/80" : "") +
        " transition-colors duration-200"
      }
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
