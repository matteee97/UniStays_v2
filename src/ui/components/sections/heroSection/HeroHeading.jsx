import { isValidElement } from "react";

const HeroHeading = ({
  title,
  subtitle,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}) => {
  return (
    <div className={className}>
      {title && (
        <h1
          className={`text-4xl sm:text-5xl lg:text-7xl font-semibold text-[#0f3b3a] dark:text-white leading-tight ${titleClassName}`}
        >
          {title}
        </h1>
      )}

      {subtitle &&
        (typeof subtitle === "string" || typeof subtitle === "number" ? (
          <p
            className={`mt-4 text-lg md:text-xl text-slate-600/90 dark:text-slate-200 max-w-2xl leading-relaxed ${subtitleClassName}`}
          >
            {subtitle}
          </p>
        ) : (
          <div
            className={`mt-4 text-lg md:text-xl text-slate-600/90 dark:text-slate-200 max-w-2xl leading-relaxed ${subtitleClassName}`}
          >
            {isValidElement(subtitle) ? subtitle : String(subtitle)}
          </div>
        ))}
    </div>
  );
};

export default HeroHeading;
