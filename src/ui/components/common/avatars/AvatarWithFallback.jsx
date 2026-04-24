import { useEffect, useMemo, useState } from "react";

const AVATAR_PALETTES = [
  "from-[#1f6f7a] via-[#2d8c8a] to-[#8de1d4]",
  "from-[#8b4a67] via-[#b7647e] to-[#f2b87a]",
  "from-[#294569] via-[#3b6f9f] to-[#b7ecff]",
  "from-[#31543f] via-[#5f8a3d] to-[#e4ef8f]",
];

const buildSeed = (value = "") =>
  [...String(value)].reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

const buildInitials = (value = "") => {
  const parts = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

/**
 * Avatar con fallback deterministico a iniziali quando l'immagine manca o fallisce.
 *
 * Il componente evita placeholder statici fragili e genera un fallback visivo
 * coerente con il nome o l'identificativo disponibile.
 */
export default function AvatarWithFallback({
  avatarUrl,
  name,
  alt,
  className = "",
  imageClassName = "",
  initialsClassName = "",
  fallbackClassName = "",
  loading = "lazy",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  const initials = useMemo(() => buildInitials(name), [name]);
  const paletteIndex = buildSeed(name || avatarUrl || "avatar");
  const backgroundClass =
    AVATAR_PALETTES[paletteIndex % AVATAR_PALETTES.length];
  const showImage = Boolean(avatarUrl) && !imageFailed;

  return (
    <div
      className={`relative overflow-hidden bg-[#0F172A] ${className}`}
      aria-label={alt || name || "Avatar"}
      role="img"
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={alt || name || "Avatar"}
          loading={loading}
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={`absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br ${backgroundClass} ${fallbackClassName}`}
        >
          <span
            className={`font-bold leading-none text-white drop-shadow-sm ${initialsClassName}`}
          >
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
