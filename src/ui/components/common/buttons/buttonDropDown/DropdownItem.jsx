export default function DropdownItem({
  children,
  isActive,
  onClick,
  onHover,
  refCallback,
  isFeatured = false,
  rounded = false,
  ...props
}) {
  return (
    <button
      type="button"
      ref={refCallback}
      onMouseEnter={onHover}
      onClick={(e) => {
        onClick();
        e.preventDefault();
      }}
      className={`group px-3 py-1 my-1 transition-colors duration-100 cursor-pointer w-full text-left ${rounded ? "rounded-xl" : "rounded-none"} ${
        isActive ? "bg-[#228E8E]/10 dark:bg-[#228E8E]/20" : ""
      } ${isFeatured ? "font-semibold text-[#228E8E]" : "text-gray-600"}`}
      {...props}
    >
      {children}
    </button>
  );
}
