import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLanguage,
  faLocationDot,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/ui/components/common/modals/Modal";
import { InfoSectionCard, InfoSectionHeader } from "./InfoSection";
import RoommatePortrait from "./RoommatePortrait";
import RoommateProfilePanel from "./RoommateProfilePanel";
import { buildVisibleRoommateProfiles } from "./roommateProfiles";
import ScrollLane from "./ScrollLane";
import { Badge } from "../../common";

const MAX_VISIBLE_TAGS = 2;

export default function RoommatesSection({ occupants = [], rooms = [] }) {
  const [activeRoommateId, setActiveRoommateId] = useState(null);

  const visibleRoommates = useMemo(
    () => buildVisibleRoommateProfiles(occupants, rooms),
    [occupants, rooms],
  );

  const activeRoommate =
    visibleRoommates.find((roommate) => roommate.id === activeRoommateId) ||
    null;

  return (
    <>
      <InfoSectionCard
        id="section-roommates"
        className="space-y-5 overflow-hidden !p-0"
      >
        <InfoSectionHeader
          className="mb-1 flex-wrap p-5 pb-0"
          title={
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#228E8D]">
                Coinquilini presenti
              </p>
              <h3 className="text-xl font-semibold text-gray-800">
                Profili pubblici dell'alloggio
              </h3>
            </div>
          }
          badge={`${visibleRoommates.length} profil${
            visibleRoommates.length === 1 ? "o" : "i"
          }`}
        />

        {visibleRoommates.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#d4f1ef] bg-white/80 p-5 text-sm text-gray-600">
            <p className="font-medium text-gray-700">
              Nessun profilo pubblico.
            </p>
            <p className="mt-1">
              L&apos;host non ha ancora pubblicato dettagli sui coinquilini
              presenti.
            </p>
          </div>
        ) : (
          <ScrollLane
            viewportClassName="px-2 pb-2"
            itemClassName="w-[292px] sm:w-[320px] xl:w-[344px]"
          >
            {visibleRoommates.map((roommate) => (
              <article
                key={roommate.id}
                className="h-full min-w-[292px] shrink-0 sm:min-w-[320px] xl:min-w-[344px]"
              >
                <div className="group h-full overflow-hidden rounded-[32px] border-[2.5px] border-[#d4f1ef] bg-white dark:border-[#1F2937] ">
                  <button
                    type="button"
                    onClick={() => setActiveRoommateId(roommate.id)}
                    className="block h-full w-full text-left"
                  >
                    <RoommatePortrait
                      profile={roommate}
                      alt={roommate.displayName}
                      className="h-[270px]"
                    >
                      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                          <FontAwesomeIcon icon={faLocationDot} />
                          {roommate.roomLabel}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black dark:from-[#0F172A] via-black/65 dark:via-[#0F172A]/40 via-black/65 dark:via-[#0F172A]/30 dark:via-[#0F172A]/20 to-transparent p-5 text-white">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <h4 className="mt-2 text-3xl font-semibold leading-none">
                              {roommate.displayName}
                            </h4>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                            {roommate.ageRangeLabel || "Età sconosciuta"}
                          </span>
                        </div>
                      </div>
                    </RoommatePortrait>

                    <div className="flex h-[220px] flex-col space-y-4 bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#228E8D]">
                          <FontAwesomeIcon icon={faStar} />
                          Profilo
                        </p>
                      </div>

                      <p className="line-clamp-2 min-h-[44px] text-sm leading-relaxed text-gray-600">
                        {roommate.shortBio ||
                          "Bio non disponibile per questo coinquilino"}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {[...roommate.lifestyleTags, ...roommate.interests]
                          .filter(Boolean)
                          .slice(0, MAX_VISIBLE_TAGS)
                          .map((tag) => (
                            <Badge
                              variant="new"
                              size="xs"
                              key={`${roommate.id}-${tag}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        {roommate.lifestyleTags.length +
                          roommate.interests.length >
                        MAX_VISIBLE_TAGS ? (
                          <Badge size="xs">
                            +
                            {roommate.lifestyleTags.length +
                              roommate.interests.length -
                              MAX_VISIBLE_TAGS}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#d4f1ef] pt-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faLanguage}
                            className="text-[#228E8D]"
                          />
                          {roommate.languages.length
                            ? roommate.languages.join(", ")
                            : "Lingue non indicate"}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </article>
            ))}
          </ScrollLane>
        )}
      </InfoSectionCard>

      {activeRoommate ? (
        <Modal
          id="roommate-profile-modal"
          disableDistortion
          disableEffects
          title={`${activeRoommate.displayName} · ${activeRoommate.roomLabel}`}
          onClose={() => setActiveRoommateId(null)}
        >
          <div className="w-[94vw] max-w-[1100px]">
            <RoommateProfilePanel profile={activeRoommate} />
          </div>
        </Modal>
      ) : null}
    </>
  );
}
