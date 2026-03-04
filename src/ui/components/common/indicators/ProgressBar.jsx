import { useState, useEffect } from "react";

/**
 * Super reusable ProgressBar component with customizable styling and animations
 * @param {Object} props - Component props
 * @param {number} props.value - Current value (0-100 or custom range)
 * @param {number} props.max - Maximum value (default: 100)
 * @param {string} props.label - Label text
 * @param {string} props.suffix - Suffix for value display (e.g., "/5", "%", "€")
 * @param {string} props.description - Description text below the bar
 * @param {string} props.variant - Visual variant: "default", "gradient", "success", "warning", "danger", "info"
 * @param {string} props.size - Size: "sm", "md", "lg", "xl"
 * @param {boolean} props.animated - Enable fill animation
 * @param {number} props.animationDuration - Animation duration in ms
 * @param {boolean} props.showValue - Show value text
 * @param {boolean} props.showPercentage - Show percentage
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.customColors - Custom colors: { bg, fill, text, label }
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.interactive - Make it clickable
 * @returns {JSX.Element} ProgressBar component
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label = "",
  suffix = "",
  description = "",
  variant = "default",
  size = "md",
  animated = true,
  animationDuration = 1000,
  showValue = true,
  showPercentage = false,
  className = "",
  customColors = null,
  onClick = null,
  interactive = false,
  ...props
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Animation effect
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, animated]);

  // Variant styles
  const variants = {
    default: {
      bg: "bg-gray-200",
      fill: "bg-gradient-to-r from-[#228E8D] to-[#62C1BA]",
      text: "text-[#228E8D]",
      label: "text-gray-700",
    },
    success: {
      bg: "bg-gray-200",
      fill: "bg-gradient-to-r from-green-400 to-green-600",
      text: "text-green-600",
      label: "text-gray-700",
    },
    warning: {
      bg: "bg-gray-200",
      fill: "bg-gradient-to-r from-yellow-400 to-orange-500",
      text: "text-orange-600",
      label: "text-gray-700",
    },
    danger: {
      bg: "bg-gray-200",
      fill: "bg-gradient-to-r from-red-400 to-red-600",
      text: "text-red-600",
      label: "text-gray-700",
    },
    info: {
      bg: "bg-gray-200",
      fill: "bg-gradient-to-r from-blue-400 to-blue-600",
      text: "text-blue-600",
      label: "text-gray-700",
    },
  };

  // Calculate rating variant dynamically based on value
  const getRatingVariant = () => {
    if (value <= 2) {
      return {
        bg: "bg-gray-200",
        fill: "bg-gradient-to-r from-red-400 to-red-600",
        text: "text-red-600",
        label: "text-gray-700",
      };
    } else if (value <= 3.3) {
      return {
        bg: "bg-gray-200",
        fill: "bg-gradient-to-r from-orange-500 to-orange-600",
        text: "text-orange-600",
        label: "text-gray-700",
      };
    } else {
      return {
        bg: "bg-gray-200",
        fill: "bg-gradient-to-r from-[#228E8D] to-[#62C1BA]",
        text: "text-[#228E8D]",
        label: "text-gray-700",
      };
    }
  };

  // Size styles
  const sizes = {
    sm: {
      height: "h-2",
      text: "text-base",
      label: "text-sm",
      description: "text-xs",
      padding: "p-2",
    },
    md: {
      height: "h-3",
      text: "text-base",
      label: "text-sm",
      description: "text-xs",
      padding: "p-3",
    },
    lg: {
      height: "h-[13px]",
      text: "text-lg",
      label: "text-base",
      description: "text-sm",
      padding: "p-4",
    },
    xl: {
      height: "h-4",
      text: "text-xl",
      label: "text-lg",
      description: "text-base",
      padding: "p-6",
    },
  };

  const currentVariant =
    customColors ||
    (variant === "rating" ? getRatingVariant() : variants?.[variant]);
  const currentSize = sizes[size];

  const displayValue = showValue ? `${value}${suffix}` : "";
  const displayPercentage = showPercentage ? `${Math.round(percentage)}%` : "";

  const Component = interactive || onClick ? "button" : "div";

  return (
    <Component
      className={`
        ${currentSize.padding}
        ${
          interactive
            ? "cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            : ""
        }
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {/* Header with label and value */}
      {(label || showValue || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span
              className={`${currentSize.label} w-full font-medium ${currentVariant?.label}`}
            >
              {label}
            </span>
          )}
          <div className="flex items-center gap-2">
            {showValue && displayValue && (
              <span
                className={`${currentSize.text} font-bold ${currentVariant?.text}`}
              >
                {displayValue}
              </span>
            )}
            {showPercentage && displayPercentage && (
              <span
                className={`${currentSize.text} font-bold ${currentVariant?.text}`}
              >
                {displayPercentage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`w-full ${currentVariant?.bg} rounded-full overflow-hidden`}
      >
        <div
          className={`
            ${currentSize?.height}
            ${currentVariant?.fill}
            rounded-full
            transition-all
            ${animated ? "ease-out" : ""}
            relative
            overflow-hidden
          `}
          style={{
            width: `${animatedValue}%`,
            transitionDuration: animated ? `${animationDuration}ms` : "0ms",
          }}
        >
          {/* Shimmer effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className={`${currentSize?.description} text-gray-500 mt-2`}>
          {description}
        </p>
      )}
    </Component>
  );
}

// Preset components for common use cases
export function RatingBar({ rating, max = 5, ...props }) {
  return (
    <ProgressBar
      value={rating}
      max={max}
      suffix={`/${max}`}
      showValue={true}
      showPercentage={false}
      variant="rating"
      {...props}
    />
  );
}

export function PercentageBar({ percentage, ...props }) {
  return (
    <ProgressBar
      value={percentage}
      max={100}
      suffix="%"
      variant="gradient"
      showValue={true}
      showPercentage={false}
      {...props}
    />
  );
}

export function LoadingBar({ progress, ...props }) {
  return (
    <ProgressBar
      value={progress}
      max={100}
      variant="info"
      showValue={false}
      showPercentage={true}
      animated={true}
      {...props}
    />
  );
}
