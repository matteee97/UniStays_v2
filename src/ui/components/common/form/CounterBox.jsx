import { toast } from "sonner";

export default function CounterBox({
  label,
  innerText = label,
  icon,
  minValue = 1,
  maxValue = 99,
  value,
  setValue,
  disabled = false,
  isLowerBound = false,
}) {
  const inputId = `${label.toLowerCase().replace(/\s+/g, "-")}-input`;

  return (
    <div className="max-w-s mx-auto">
      <label
        htmlFor={inputId}
        className="block mb-2 text-sm font-medium text-gray-600"
      >
        {label}:
      </label>
      <div className="relative flex items-center max-w-[11rem]">
        <button
          type="button"
          aria-label={`Riduci ${label}`}
          onClick={() => setValue((prev) => Math.max(minValue, prev - 1))}
          className={`bg-white flex items-center text-[#228E8D] font-semibold border border-[#D4F1EF] rounded-s-lg p-3 h-11 hover:bg-gray-50 ${
            value === minValue ? "text-[#228e8c83]" : ""
          } ${disabled ? "cursor-not-allowed" : ""}`}
          disabled={value === minValue}
          aria-disabled={value === minValue}
        >
          -
        </button>
        <input
          type="number"
          aria-live="polite"
          id={inputId}
          className="bg-white border-x-0 border-y pl-4 border-[#D4F1EF] h-11 font-medium text-center text-gray-600 text-sm block w-full pb-6 focus:outline-none focus:ring-0"
          value={value}
          readOnly
        />
        {isLowerBound && (
          <span className="absolute bottom-[calc(50%+4px)] sm:bottom-[calc(50%+2px)] left-[calc(50%+12px)] sm:left-[calc(50%+5px)] text-xs sm:text-sm font-medium text-gray-500 ">
            {" "}
            +
          </span>
        )}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center text-xs text-gray-400 space-x-1">
          {icon}
          <span>{innerText}</span>
        </div>
        <button
          type="button"
          aria-label={`Aumenta ${label}`}
          onClick={() => {
            setValue((prev) => {
              const newValue = Math.min(maxValue, prev + 1);
              if (prev === maxValue) {
                toast.warning(
                  `Hai raggiunto il limite massimo di ${innerText}`
                );
              }
              return newValue;
            });
          }}
          className={`bg-white flex items-center text-[#228E8D] font-semibold border border-[#D4F1EF] rounded-e-lg p-3 h-11 hover:bg-gray-50 ${
            value === maxValue ? "text-[#228e8c83]" : ""
          } ${disabled ? "cursor-not-allowed" : ""}`}
          disabled={disabled && value === maxValue}
          aria-disabled={disabled && value === maxValue}
        >
          +
        </button>
      </div>
    </div>
  );
}
