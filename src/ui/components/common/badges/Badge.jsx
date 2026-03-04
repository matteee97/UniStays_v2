import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faClock,
  faFire,
  faHeart,
  faShieldAlt,
  faAward,
  faRocket,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

const iconMap = {
  star: faStar,
  check: faCheckCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
  clock: faClock,
  fire: faFire,
  heart: faHeart,
  shield: faShieldAlt,
  award: faAward,
  rocket: faRocket,
  position: faMapMarkerAlt,
  university: faMapMarkerAlt,
};

const variantStyles = {
  // Varianti principali
  primary: {
    container: "bg-[#228E8D] text-white border-[#228E8D]",
    icon: "text-white",
  },
  secondary: {
    container:
      "bg-white/20 backdrop-blur-2xl text-gray-600 dark:text-[#ffffffaf] border border-[#fff]/40 dark:border-[#fff]/30",
    icon: "text-[#228E8D]",
  },
  success: {
    container: "bg-green-100 text-green-700 border-green-200",
    icon: "text-green-600",
  },
  warning: {
    container: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "text-amber-600",
  },
  danger: {
    container: "bg-red-100 text-red-700 border-red-200",
    icon: "text-red-600",
  },
  info: {
    container:
      "bg-white/20 backdrop-blur-md border-[#228E8D]/60 text-[#228E8D]",
    icon: "text-[#228E8D]",
  },
  dark: {
    container: "bg-gray-800 text-white border-gray-800",
    icon: "text-white",
  },
  light: {
    container: "bg-gray-100 text-gray-700 border-gray-200",
    icon: "text-gray-600",
  },

  // Varianti speciali per apartment
  featured: {
    container: "bg-[#228E8D]/90 text-white backdrop-blur-sm border-[#228E8D]",
    icon: "text-white",
  },
  new: {
    container: "bg-[#d4f1ef] text-[#228E8D] border-[#228e8c3f]",
    icon: "text-[#228E8D]",
  },
  verified: {
    container: "bg-white/20 text-[#228E8D] border-[1.5px] border-[#228E8e]/30",
    icon: "text-[#228E8D]",
  },
  premium: {
    container:
      "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-amber-500",
    icon: "text-white",
  },
  urgent: {
    container:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-500",
    icon: "text-white",
  },
  discount: {
    container:
      "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500",
    icon: "text-white",
  },
};

const sizeStyles = {
  xs: {
    container: "px-3 py-[5px] text-xs",
    icon: "w-3 h-3",
  },
  sm: {
    container: "px-3 py-1.5 text-sm",
    icon: "w-3.5 h-3.5",
  },
  md: {
    container: "px-4 py-2 text-sm",
    icon: "w-4 h-4",
  },
  lg: {
    container: "px-5 py-2.5 text-base",
    icon: "w-5 h-5",
  },
  xl: {
    container: "px-6 py-3 text-lg",
    icon: "w-6 h-6",
  },
};

/**
 * Badge component for displaying status, labels, or highlights with optional icon.
 *
 * @param {object} props - The props object.
 * @param {React.ReactNode} props.children - The content to display inside the badge.
 * @param {'primary'|'secondary'|'featured'|'new'|'verified'|'premium'|'urgent'|'discount'} [props.variant='primary'] - The visual style of the badge.
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - The size of the badge.
 * @param {string} [props.icon] - The name of the icon to display (must match a key in iconMap).
 * @param {'left'|'right'} [props.iconPosition='left'] - Position of the icon relative to the text.
 * @param {string} [props.className] - Additional CSS classes for the badge container.
 * @param {function} [props.onClick] - Click handler for the badge (makes badge interactive).
 * @param {boolean} [props.disabled=false] - If true, disables interaction and applies disabled styles.
 * @param {'full'|'lg'|'md'|'sm'} [props.rounded='full'] - The border radius style.
 * @param {boolean} [props.showIcon=true] - Whether to show the icon if provided.
 * @returns {JSX.Element} The rendered Badge component.
 */
export default function Badge({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  className = "",
  onClick,
  disabled = false,
  rounded = "full",
  showIcon = true,
  ...props
}) {
  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;
  const iconComponent = icon && iconMap[icon];

  const baseClasses = clsx(
    "inline-flex items-center gap-2 font-semibold border transition-all duration-200",
    variantStyle.container,
    sizeStyle.container,
    {
      "rounded-full": rounded === "full",
      "rounded-lg": rounded === "lg",
      "rounded-md": rounded === "md",
      rounded: rounded === "sm",
      "cursor-pointer hover:scale-105 hover:shadow-md": onClick && !disabled,
      "opacity-50 cursor-not-allowed": disabled,
      "flex-row-reverse": iconPosition === "right",
    },
    className
  );

  const iconClasses = clsx(sizeStyle.icon, variantStyle.icon);

  return (
    <div
      className={baseClasses}
      onClick={disabled ? undefined : onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      {...props}
    >
      {showIcon && iconComponent && iconPosition === "left" && (
        <FontAwesomeIcon icon={iconComponent} className={iconClasses} />
      )}
      <span>{children}</span>
      {showIcon && iconComponent && iconPosition === "right" && (
        <FontAwesomeIcon icon={iconComponent} className={iconClasses} />
      )}
    </div>
  );
}

// Componenti predefiniti per casi d'uso comuni
export function FeaturedBadge({ children, ...props }) {
  return (
    <Badge
      variant="featured"
      size="xs"
      className="!py-1"
      icon="star"
      {...props}
    >
      {children || "In Evidenza"}
    </Badge>
  );
}

export function NewBadge({ children, ...props }) {
  return (
    <Badge variant="new" icon="star" {...props}>
      {children || "Nuovo"}
    </Badge>
  );
}

export function VerifiedBadge({ children, ...props }) {
  return (
    <Badge variant="verified" icon="check" {...props}>
      {children || "Verificato"}
    </Badge>
  );
}

export function RatingBadge({ rating, round = false, ...props }) {
  if (!rating || !rating > 0 || !Number.isFinite(rating)) return null;
  return (
    <Badge variant="secondary" icon="star" {...props}>
      {Number.isFinite(rating) && (round ? Math.round(rating) : rating)}/5
    </Badge>
  );
}

export function PremiumBadge({ children, ...props }) {
  return (
    <Badge variant="premium" icon="award" {...props}>
      {children || "Premium"}
    </Badge>
  );
}

export function UrgentBadge({ children, ...props }) {
  return (
    <Badge variant="urgent" icon="fire" {...props}>
      {children || "Urgente"}
    </Badge>
  );
}

export function DiscountBadge({ discount, ...props }) {
  return (
    <Badge variant="discount" icon="award" {...props}>
      -{discount}%
    </Badge>
  );
}

export function UniversityBadge({ university, ...props }) {
  return (
    <Badge variant="secondary" icon="university" size="xs" {...props}>
      {university}
    </Badge>
  );
}
