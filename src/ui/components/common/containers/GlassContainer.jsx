import clsx from "clsx";
import { forwardRef } from "react";

/**
 * Named visual presets for glass rendering.
 * - `apple`: stronger highlights + richer inner reflections.
 * - `frosted`: balanced frosted panel.
 * - `subtle`: very light treatment for dense UIs.
 *
 * @typedef {"apple" | "frosted" | "subtle"} GlassPresetName
 */

/**
 * Edge distortion intensity.
 * - `none`: disable peripheral refraction.
 * - `soft`: very light distortion.
 * - `medium`: default liquid-glass edge.
 * - `strong`: visibly refracted borders.
 *
 * @typedef {"none" | "soft" | "medium" | "strong"} GlassDistortionLevel
 */

/**
 * Supported radius tokens for the container and overlay layers.
 *
 * @typedef {"sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"} GlassRadius
 */

/**
 * Preset class slots used to compose the final effect.
 *
 * @typedef {Object} GlassPresetConfig
 * @property {string} surface Main background and inner shadow layer.
 * @property {string} highlights Multi-gradient optical highlights layer.
 * @property {string} border Outer border line.
 * @property {string} innerRim Thin inner rim highlight.
 */

/**
 * Optional class overrides for specific rendering layers.
 *
 * @typedef {Object} GlassLayerClassNames
 * @property {string} [root]
 * @property {string} [overlay]
 * @property {string} [edgeDistortion]
 * @property {string} [edgeCaustics]
 * @property {string} [highlights]
 * @property {string} [border]
 * @property {string} [surface]
 * @property {string} [innerRim]
 */

/**
 * @typedef {Object} GlassContainerProps
 * @property {GlassPresetName} [preset="apple"] Named base preset.
 * @property {Partial<GlassPresetConfig>} [presetOverrides] Per-slot preset overrides.
 * @property {GlassDistortionLevel} [distortion="medium"] Peripheral refraction intensity.
 * @property {boolean} [disableDistortion=false] Force-disable refraction layer.
 * @property {boolean} [disableEffects=false] Disable expensive glass effects while keeping the base layout API unchanged.
 * @property {string} [distortionMask] Custom CSS mask image for distortion layers (advanced).
 * @property {GlassRadius} [radius="2xl"] Radius token shared by all layers.
 * @property {GlassLayerClassNames} [layerClassNames] Per-layer class overrides.
 * @property {string} [className] Additional classes for the main surface.
 * @property {import("react").ReactNode} [children]
 */

/** @type {Record<GlassRadius, string>} */
const RADIUS_CLASSES = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

/** @type {Record<GlassRadius, string>} */
const INNER_RIM_RADIUS_CLASSES = {
  sm: "rounded-sm",
  md: "rounded-sm",
  lg: "rounded-md",
  xl: "rounded-lg",
  "2xl": "rounded-xl",
  "3xl": "rounded-2xl",
  full: "rounded-full",
};

/**
 * Exported presets so other components can build custom variants
 * without duplicating base optical styles.
 *
 * @type {Readonly<Record<GlassPresetName, GlassPresetConfig>>}
 */
export const GLASS_PRESETS = Object.freeze({
  apple: Object.freeze({
    surface:
      "bg-white/10 dark:bg-[#0F1829]/10 backdrop-blur-[4px] shadow-[inset_4px_0_4px_-4px_rgba(0,0,0,0.25),inset_-4px_0_4px_-4px_rgba(0,0,0,0.25),inset_0_4px_8px_-4px_rgba(0,0,0,0.10),inset_0_-4px_8px_-4px_rgba(0,0,0,0.10),inset_0_-5px_2px_-4px_rgba(255,255,255,0.62),inset_0_5px_2px_-4px_rgba(255,255,255,0.62)] dark:shadow-[inset_4px_0_4px_-4px_rgba(0,0,0,0.3),inset_-4px_0_4px_-4px_rgba(0,0,0,0.3),inset_0_4px_8px_-4px_rgba(0,0,0,0.15),inset_0_-4px_8px_-4px_rgba(0,0,0,0.15),inset_0_-5px_2px_-4px_rgba(255,255,255,0.24),inset_0_5px_2px_-4px_rgba(255,255,255,0.24)]",
    highlights:
      "bg-[radial-gradient(130%_95%_at_50%_-12%,rgba(255,255,255,0.48),rgba(255,255,255,0.08)_38%,transparent_66%),radial-gradient(140%_110%_at_50%_120%,rgba(255,255,255,0.28),transparent_60%),linear-gradient(145deg,rgba(255,255,255,0.14),transparent_38%,rgba(255,255,255,0.09)_78%,rgba(255,255,255,0.2))] dark:bg-[radial-gradient(130%_95%_at_50%_-12%,rgba(255,255,255,0.22),rgba(255,255,255,0.04)_35%,transparent_68%),radial-gradient(140%_110%_at_50%_120%,rgba(255,255,255,0.12),transparent_60%),linear-gradient(145deg,rgba(255,255,255,0.06),transparent_42%,rgba(255,255,255,0.03)_78%,rgba(255,255,255,0.1))]",
    border: "border border-white/20 dark:border-white/10",
    innerRim:
      "border-[1.5px] border-[#ffffff09] dark:border-[#ffffff04] blur-[0.6px]",
  }),
  frosted: Object.freeze({
    surface:
      "bg-white/24 dark:bg-[#111B2F]/28 backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(255,255,255,0.14),0_10px_30px_-18px_rgba(0,0,0,0.42)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.08),0_12px_30px_-18px_rgba(0,0,0,0.6)]",
    highlights:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.08)_28%,transparent_58%),linear-gradient(145deg,rgba(255,255,255,0.12),transparent_42%,rgba(255,255,255,0.08)_76%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.03)_30%,transparent_60%),linear-gradient(145deg,rgba(255,255,255,0.06),transparent_44%,rgba(255,255,255,0.04)_80%)]",
    border: "border border-white/18 dark:border-white/8",
    innerRim: "border border-[#ffffff10] dark:border-[#ffffff05] blur-[0.5px]",
  }),
  subtle: Object.freeze({
    surface:
      "bg-white/20 dark:bg-[#111B2F]/22 backdrop-blur-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(255,255,255,0.1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(255,255,255,0.06)]",
    highlights:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent_45%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.1),transparent_45%)]",
    border: "border border-white/12 dark:border-white/6",
    innerRim: "border border-[#ffffff0b] dark:border-[#ffffff04]",
  }),
});

/**
 * Distortion profiles with independent mask and blur.
 *
 * @type {Readonly<Record<Exclude<GlassDistortionLevel, "none">, {
 *   outerRingPx: number,
 *   innerRingPx: number,
 *   outerClasses: string,
 *   innerClasses: string,
 *   outerBackdropFilter: string,
 *   innerBackdropFilter: string,
 *   causticsOpacity: string
 * }>>}
 */
export const GLASS_DISTORTION_PROFILES = Object.freeze({
  soft: Object.freeze({
    outerRingPx: 8,
    innerRingPx: 18,
    outerClasses: "opacity-90 bg-white/[0.02]",
    innerClasses: "opacity-70 bg-white/[0.01]",
    outerBackdropFilter:
      "blur(14px) saturate(145%) contrast(116%) brightness(1.05)",
    innerBackdropFilter:
      "blur(8px) saturate(125%) contrast(108%) brightness(1.03)",
    causticsOpacity: "opacity-40",
  }),
  medium: Object.freeze({
    outerRingPx: 8,
    innerRingPx: 14,
    outerClasses: "opacity-100 bg-white/[0.02]",
    innerClasses: "opacity-30 dark:opacity-80 bg-white/[0.01]",
    outerBackdropFilter:
      "blur(32px) saturate(125%) contrast(116%) brightness(1.08)",
    innerBackdropFilter:
      "blur(2px) saturate(105%) contrast(108%) brightness(1.03)",
    causticsOpacity: "opacity-15",
  }),
  strong: Object.freeze({
    outerRingPx: 8,
    innerRingPx: 22,
    outerClasses: "opacity-100 bg-white/[0.03]",
    innerClasses: "opacity-45 bg-white/[0.02]",
    outerBackdropFilter:
      "blur(30px) saturate(130%) contrast(118%) brightness(1.1)",
    innerBackdropFilter:
      "blur(16px) saturate(110%) contrast(110%) brightness(1.05)",
    causticsOpacity: "opacity-10",
  }),
});

const getRadiusClass = (radius) =>
  RADIUS_CLASSES[radius] || RADIUS_CLASSES["2xl"];
const getInnerRadiusClass = (radius) =>
  INNER_RIM_RADIUS_CLASSES[radius] || INNER_RIM_RADIUS_CLASSES["2xl"];

const buildBackdropFilterStyle = (backdropFilter = "") => ({
  WebkitBackdropFilter: backdropFilter,
  backdropFilter,
});

/**
 * Removes the utility classes that trigger expensive backdrop/filter work.
 * This is used as a performance fallback for scroll-heavy containers.
 *
 * @param {string} classNames
 * @returns {string}
 */
const stripExpensiveEffectClasses = (classNames = "") =>
  classNames
    .split(/\s+/)
    .filter(
      (token) =>
        token &&
        !token.includes("backdrop-blur") &&
        !token.includes("blur-[") &&
        token !== "blur",
    )
    .join(" ") + " bg-[#f0fafa] -z-10";

export const buildRingMaskStyle = ({
  ringWidthPx = 0,
  backdropFilter = "",
  customMask = "",
}) => {
  const base = buildBackdropFilterStyle(backdropFilter);

  if (customMask) {
    return {
      ...base,
      WebkitMaskImage: customMask,
      maskImage: customMask,
    };
  }

  return {
    ...base,
    padding: `${ringWidthPx}px`,
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };
};

/**
 * Glass container with Apple-like optics and peripheral refraction.
 * The component is intentionally layered so each optical step can be
 * overridden without rewriting the base implementation.
 *
 * @param {GlassContainerProps & Omit<import("react").HTMLAttributes<HTMLDivElement>, "children">} props
 * @param {import("react").ForwardedRef<HTMLDivElement>} ref
 */
const GlassContainer = forwardRef(
  (
    {
      preset = "apple",
      presetOverrides = {},
      distortion = "medium",
      disableDistortion = false,
      disableEffects = false,
      distortionMask,
      radius = "2xl",
      layerClassNames = {},
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const radiusClass = getRadiusClass(radius);
    const innerRadiusClass = getInnerRadiusClass(radius);

    const basePreset = GLASS_PRESETS[preset] || GLASS_PRESETS.apple;
    const resolvedPreset = {
      ...basePreset,
      ...presetOverrides,
    };
    const resolvedSurfaceClassName = disableEffects
      ? stripExpensiveEffectClasses(resolvedPreset.surface)
      : resolvedPreset.surface;
    const resolvedInnerRimClassName = disableEffects
      ? stripExpensiveEffectClasses(resolvedPreset.innerRim)
      : resolvedPreset.innerRim;

    const distortionProfile =
      distortion !== "none" ? GLASS_DISTORTION_PROFILES[distortion] : null;
    const shouldRenderDistortion =
      !disableEffects && !disableDistortion && Boolean(distortionProfile);
    const outerDistortionStyle = distortionProfile
      ? buildRingMaskStyle({
          ringWidthPx: distortionProfile.outerRingPx,
          backdropFilter: distortionProfile.outerBackdropFilter,
          customMask: distortionMask || "",
        })
      : undefined;
    const innerDistortionStyle = distortionProfile
      ? buildRingMaskStyle({
          ringWidthPx: distortionProfile.innerRingPx,
          backdropFilter: distortionProfile.innerBackdropFilter,
          customMask: distortionMask || "",
        })
      : undefined;
    const causticsStyle = distortionProfile
      ? buildRingMaskStyle({
          ringWidthPx: distortionProfile.innerRingPx + 2,
          customMask: distortionMask || "",
        })
      : undefined;

    return (
      <div className={clsx("relative", radiusClass, layerClassNames.root)}>
        {!disableEffects ? (
          <div
            className={clsx(
              "pointer-events-none absolute inset-0 overflow-hidden",
              radiusClass,
              layerClassNames.overlay,
            )}
          >
            {shouldRenderDistortion ? (
              <div
                className={clsx(
                  "absolute inset-0",
                  radiusClass,
                  distortionProfile.outerClasses,
                  layerClassNames.edgeDistortion,
                )}
                style={outerDistortionStyle}
              />
            ) : null}

            {shouldRenderDistortion ? (
              <div
                className={clsx(
                  "absolute inset-0",
                  radiusClass,
                  distortionProfile.innerClasses,
                  layerClassNames.edgeDistortion,
                )}
                style={innerDistortionStyle}
              />
            ) : null}

            {shouldRenderDistortion ? (
              <div
                className={clsx(
                  "absolute inset-0",
                  radiusClass,
                  distortionProfile.causticsOpacity,
                  "bg-[radial-gradient(130%_80%_at_2%_50%,rgba(255,255,255,0.55),transparent_40%),radial-gradient(130%_80%_at_98%_50%,rgba(255,255,255,0.5),transparent_38%),radial-gradient(130%_95%_at_50%_-10%,rgba(255,255,255,0.45),transparent_45%),radial-gradient(120%_90%_at_50%_112%,rgba(255,255,255,0.28),transparent_45%)]",
                  "dark:bg-[radial-gradient(130%_80%_at_2%_50%,rgba(255,255,255,0.22),transparent_40%),radial-gradient(130%_80%_at_98%_50%,rgba(255,255,255,0.2),transparent_38%),radial-gradient(130%_95%_at_50%_-10%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(120%_90%_at_50%_112%,rgba(255,255,255,0.12),transparent_45%)]",
                  layerClassNames.edgeCaustics,
                )}
                style={causticsStyle}
              />
            ) : null}

            <div
              className={clsx(
                "absolute inset-0",
                radiusClass,
                resolvedPreset.highlights,
                layerClassNames.highlights,
              )}
            />

            <div
              className={clsx(
                "absolute inset-0",
                radiusClass,
                resolvedPreset.border,
                layerClassNames.border,
              )}
            />
          </div>
        ) : null}

        <div className="relative z-10">
          <div
            ref={ref}
            className={clsx(
              "relative",
              radiusClass,
              resolvedSurfaceClassName,
              layerClassNames.surface,
              className,
            )}
            {...props}
          >
            <div
              className={clsx(
                "pointer-events-none absolute inset-[3px_4px] -z-1",
                innerRadiusClass,
                resolvedInnerRimClassName,
                layerClassNames.innerRim,
              )}
            />
            {children}
          </div>
        </div>
      </div>
    );
  },
);

GlassContainer.displayName = "GlassContainer";

export default GlassContainer;
