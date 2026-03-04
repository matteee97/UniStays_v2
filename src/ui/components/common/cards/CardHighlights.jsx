export default function CardHighlights({
  items = [],
  className = "",
  type = "default",
  itemColor = "text-white",
}) {
  if (!items.length) return null;

  const types = {
    default: "rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-lg",
    primary: "rounded-xl bg-white/5 px-2 py-1 xl:mx-4 backdrop-blur-sm",
  };

  return (
    <div
      className={`grid grid-cols-2 gap-2 text-xs tracking-wide text-white/80 w-full ${className}`}
    >
      {items.map((item) => (
        <div key={item.label} className={types[type]}>
          <p className="text-[10px] uppercase text-[#d4f1ef]/50">
            {item.label}
          </p>
          <p className={`text-sm font-semibold ${itemColor}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
