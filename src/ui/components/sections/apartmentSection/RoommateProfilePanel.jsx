import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCircleCheck,
  faGraduationCap,
  faHeart,
  faHouseUser,
  faLanguage,
} from "@fortawesome/free-solid-svg-icons";
import { InfoSectionCard } from "./InfoSection";
import RoommatePortrait from "./RoommatePortrait";

function TagCluster({ title, tags = [], tone = "default" }) {
  if (!tags.length) return null;

  const toneClasses =
    tone === "accent"
      ? "border-[#228E8D]/20 bg-[#228E8D]/10 text-[#196a69]"
      : "border-[#d4f1ef] bg-white text-[#9a5d2a]";

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={`${title}-${tag}`}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RoommateProfilePanel({ profile }) {
  if (!profile) return null;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,360px)_1fr]">
      <RoommatePortrait
        profile={profile}
        alt={profile.displayName}
        loading="eager"
        className="h-[360px] overflow-hidden rounded-[32px] border border-[#d4f1ef] shadow-sm sm:h-[460px] xl:h-full"
      >
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/45 via-black/35 via-black/20 to-transparent p-5 pt-16 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Profile
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold leading-none">
                {profile.displayName}
              </h3>
            </div>
          </div>
        </div>
      </RoommatePortrait>

      <div className="space-y-4">
        {profile.shortBio ? (
          <InfoSectionCard variant="gradient" className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#228E8D]">
              Prima impressione
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {profile.shortBio}
            </p>
          </InfoSectionCard>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoSectionCard variant="muted" className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              Stanza
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <FontAwesomeIcon icon={faBed} className="text-[#228E8D]" />
              {profile.roomLabel || "Non specificata"}
            </p>
          </InfoSectionCard>

          <InfoSectionCard variant="muted" className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              Presenza
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <FontAwesomeIcon icon={faHouseUser} className="text-[#228E8D]" />
              {profile.presenceLabel || "Non specificata"}
            </p>
          </InfoSectionCard>

          <InfoSectionCard variant="muted" className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              Studio
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-[#228E8D]"
              />
              {profile.studyLine || "Non specificato"}
            </p>
          </InfoSectionCard>

          <InfoSectionCard variant="muted" className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              Lingue
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <FontAwesomeIcon icon={faLanguage} className="text-[#228E8D]" />
              {profile.languages.length
                ? profile.languages.join(", ")
                : "Non specificate"}
            </p>
          </InfoSectionCard>
        </div>

        <InfoSectionCard variant="gradient" className="space-y-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHeart} className="text-[#228E8D]" />
            <p className="text-sm font-semibold text-gray-800">
              Come si vive la casa
            </p>
          </div>

          <TagCluster title="Vibe" tags={profile.lifestyleTags} tone="accent" />
          <TagCluster
            title="Routine"
            tags={profile.habitLabels}
            tone="default"
          />
          <TagCluster
            title="Interessi"
            tags={profile.interests}
            tone="accent"
          />
        </InfoSectionCard>
      </div>
    </div>
  );
}
