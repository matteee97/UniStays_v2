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

export default function RoommatePortrait({
  profile,
  alt,
  className = "",
  imageClassName = "",
  loading = "lazy",
  children,
}) {
  const paletteIndex = buildSeed(profile?.displayName || profile?.id || "roommate");
  const backgroundClass = AVATAR_PALETTES[paletteIndex % AVATAR_PALETTES.length];
  const initials = useMemo(
    () => buildInitials(profile?.displayName || profile?.id || ""),
    [profile?.displayName, profile?.id],
  );
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profile?.avatarUrl]);

  const showImage = Boolean(profile?.avatarUrl) && !imageFailed;

  return (
    <div
      className={`relative overflow-hidden bg-[#0F172A] ${className}`}
      aria-label={alt}
    >
      {showImage ? (
        <img
          src={profile.avatarUrl}
          alt={alt}
          loading={loading}
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={`absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br ${backgroundClass}`}
        >
          <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/25 bg-white/18 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
            <span className="text-5xl font-bold tracking-[0.02em] text-white drop-shadow-sm">
              {initials}
            </span>
          </div>
        </div>
      )}

      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}
