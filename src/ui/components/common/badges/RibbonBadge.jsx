import { isValidElement } from "react";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const VARIANT_STYLES = {
  primary: {
    base: "bg-[#228E8D] text-white",
    tail: "bg-[#1a6e6d]",
  },
  secondary: {
    base: "bg-[#1a6e6d] text-white",
    tail: "bg-[#145756]",
  },
  neutral: {
    base: "bg-gray-700 text-white",
    tail: "bg-gray-800",
  },
  light: {
    base: "bg-white text-gray-700",
    tail: "bg-gray-200",
  },
};

const SIZE_STYLES = {
  xs: {
    base: "text-[10px] h-4 px-2",
    icon: "w-2 h-2",
  },
  sm: {
    base: "text-xs h-5 px-3",
    icon: "w-2 h-2",
  },
  md: {
    base: "text-sm h-6 px-3.5",
    icon: "w-3 h-3",
  },
  lg: {
    base: "text-base h-7 px-4",
    icon: "w-3.5 h-3.5",
  },
};

const DEFAULT_POSITION = "top-9 -right-1";
const DEFAULT_TAIL_POSITION = "top-[39.99px] -right-[10.2px]";

/**
 * Ribbon badge for highlighting a card with a folded-tail effect.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Preferred content for the ribbon label.
 * @param {string} [props.label] - Alternate label prop (falls back to text).
 * @param {string} [props.text='Affidabile'] - Legacy label prop for backwards compatibility.
 * @param {object|React.ReactNode} [props.icon=faCheckCircle] - FontAwesome icon definition or custom node.
 * @param {boolean} [props.showIcon=true] - Whether to render the icon.
 * @param {'left'|'right'} [props.iconPosition='left'] - Position of the icon.
 * @param {'primary'|'secondary'|'neutral'|'light'} [props.variant='primary'] - Color style.
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='sm'] - Size of the ribbon.
 * @param {string} [props.position] - Tailwind classes to position the ribbon body.
 * @param {string} [props.tailPosition] - Tailwind classes to position the ribbon tail relative to the ribbon body.
 * @param {string} [props.className] - Additional classes for the ribbon body.
 * @param {string} [props.tailClassName] - Additional classes for the ribbon tail.
 * @param {string} [props.iconClassName] - Additional classes for the icon when using FontAwesome.
 * @returns {JSX.Element}
 */
export default function RibbonBadge({
  children,
  label,
  text = "Affidabile",
  icon = faCheckCircle,
  showIcon = true,
  iconPosition = "left",
  variant = "primary",
  size = "sm",
  position = DEFAULT_POSITION,
  tailPosition = DEFAULT_TAIL_POSITION,
  className = "",
  tailClassName = "",
  iconClassName = "",
  ...props
}) {
  const content = children ?? label ?? text;
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.sm;

  const iconNode =
    showIcon && icon ? (
      isValidElement(icon) ? (
        icon
      ) : (
        <FontAwesomeIcon
          icon={icon}
          className={clsx(sizeStyle.icon, iconClassName)}
        />
      )
    ) : null;

  return (
    <span className={clsx("absolute", position)} {...props}>
      <span
        className={clsx(
          "relative z-10 inline-flex w-fit items-center justify-center gap-2 shadow-md",
          "rounded-[0.6rem_0.3rem_0_0.6rem]",
          variantStyle.base,
          sizeStyle.base,
          className,
        )}
      >
        {iconPosition === "left" && iconNode}
        <span>{content}</span>
        {iconPosition === "right" && iconNode}
      </span>
      <span
        aria-hidden="true"
        className={clsx(
          "absolute z-0 h-5 w-[100px] -rotate-45 rounded-br-[5.7px]",
          tailPosition,
          variantStyle.tail,
          tailClassName,
        )}
      />
    </span>
  );
}
