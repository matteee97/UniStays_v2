import { ArrowIcon } from "../..";

export default function DropdownToggleButton({
  city,
  isOpen,
  ref,
  onClick,
  onKeyDown,
  className,
  extended = false,
  disabled = false,
}) {
  return (
    <button
      id="dropdown-button"
      type="button"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls="dropdown-menu"
      aria-label="Seleziona la città"
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      className={`flex ${
        extended ? "w-[330px] mx-auto" : "min-w-[220px]"
      } font-medium text-lg justify-between items-center gap-2 bg-[#fff]/17 border-2 border-[#D4F1EF] sm:focus:outline-[#228E8D]/50 backdrop-blur-md  rounded-lg py-2 px-4 outline-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="flex justify-between gap-4 items-center">
        {extended && (
          <span className="text-gray-500 font-normal">Cerca annunci a:</span>
        )}
        <span className="truncate text-[#228E8D]">{city}</span>
      </div>
      <ArrowIcon
        className={`w-4 h-5 text-[#228E8D] drop-shadow-sm ${
          isOpen ? "rotate-180" : ""
        } transition-all duration-200`}
      />
    </button>
  );
}
