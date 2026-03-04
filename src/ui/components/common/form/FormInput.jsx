export default function FormInput({
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  label,
  type = "text", // default type
  className = "",
  id,
  autoComplete,
  hasFieldError,
}) {
  const inputId = id || name;

  const inputProps = {
    id: inputId,
    name,
    placeholder,
    required,
    type,
    autoComplete,
    className: `w-full px-3 py-2 text-gray-600 rounded-lg border-2 border-[#D4F1EF] focus:outline-none focus:ring-2  ${className} ${
      hasFieldError
        ? "border-red-300 focus:ring-red-500"
        : "focus:ring-[#228E8D]"
    }`,
    "aria-label": label || placeholder, // fallback accessibilità
  };

  if (value !== undefined && onChange !== undefined) {
    inputProps.value = value;
    inputProps.onChange = onChange;
    inputProps.onBlur = onBlur;
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input {...inputProps} />
    </div>
  );
}
