import { Helmet } from "react-helmet-async";
import { useRouteMetadata } from "@/ui/hooks";

/**
 * MetaManager component for handling SEO metadata
 *
 * @param {Object} props - Component props
 * @param {string} [props.title] - Custom page title (overrides route metadata)
 * @param {string} [props.description] - Custom page description (overrides route metadata)
 * @param {string} [props.keywords] - Custom page keywords (overrides route metadata)
 * @param {string} [props.image] - Custom page image for social sharing
 * @param {string} [props.url] - Custom page URL for canonical link
 * @param {string[]} [props.preloadImages=[]] - Array of image URLs to preload
 * @param {boolean} [props.useRouteDefaults=true] - Whether to use route metadata as defaults
 *
 * @example
 * // Simple usage - automatically uses route metadata
 * <MetaManager />
 *
 * @example
 * // Custom metadata with route fallbacks
 * <MetaManager
 *   title="Custom Title"
 *   description="Custom description"
 *   preloadImages={["/img/hero.webp"]}
 * />
 *
 * @example
 * // Disable route defaults completely
 * <MetaManager
 *   useRouteDefaults={false}
 *   title="Custom Title"
 *   description="Custom description"
 * />
 */
export default function MetaManager({
  title,
  description,
  keywords,
  image,
  url,
  preloadImages = [],
  useRouteDefaults = true,
}) {
  // Get route-specific metadata
  const routeMetadata = useRouteMetadata();

  // Use provided props or fall back to route metadata
  const finalTitle =
    title?.trim() ||
    (useRouteDefaults ? routeMetadata.title : "Alloggi Universitari");
  const finalDescription =
    description?.trim() ||
    (useRouteDefaults
      ? routeMetadata.description
      : "Trova e pubblica alloggi universitari in Italia. La piattaforma per studenti e proprietari.");
  const finalKeywords =
    keywords?.trim() ||
    (useRouteDefaults
      ? routeMetadata.keywords
      : "alloggi universitari, affitti studenti, appartamenti studenti, casa per studenti, affitti universitari");

  const finalImage = image?.startsWith("http")
    ? image
    : `https://www.alloggi-universitari.it${image || "/img/logo.svg"}`;

  const finalUrl = url
    ? url.startsWith("http")
      ? url
      : `https://www.alloggi-universitari.it${url}`
    : window.location.href;

  return (
    <Helmet>
      {/* Title */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}

      {/* Canonical */}
      <link rel="canonical" href={finalUrl} />

      {/* Preload images */}
      {preloadImages.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}
