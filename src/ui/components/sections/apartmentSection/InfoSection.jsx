const VARIANTS = {
  default: "bg-white px-5 py-5",
  muted: "bg-white px-5 py-6",
  gradient:
    "bg-gradient-to-br from-[#f2fbf8] via-white to-[#eef9f6] dark:from-[#101e2b] dark:via-[#0F172A] dark:to-[#101e2b] px-5 py-6",
  bare: "",
};

export function InfoSectionCard({
  as: Component = "div",
  id,
  variant = "default",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      id={id}
      className={`rounded-3xl border border-[#d4f1ef] shadow-sm ${
        VARIANTS[variant] || ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function InfoSectionHeader({
  title,
  badge,
  className = "",
  titleClassName = "text-lg font-semibold text-gray-800",
  badgeClassName = "text-xs px-3 py-1 rounded-full border border-[#228E8D]/20 text-[#228E8D] bg-[#228E8D]/10",
}) {
  const baseClassName = `flex items-center gap-3 ${
    badge ? "justify-between" : ""
  }`;
  const renderTitle =
    typeof title === "string" ? (
      <h3 className={titleClassName}>{title}</h3>
    ) : (
      title
    );

  const renderBadge =
    typeof badge === "string" ? (
      <span className={badgeClassName}>{badge}</span>
    ) : (
      badge
    );

  return (
    <div className={`${baseClassName} ${className}`}>
      {renderTitle}
      {renderBadge}
    </div>
  );
}
