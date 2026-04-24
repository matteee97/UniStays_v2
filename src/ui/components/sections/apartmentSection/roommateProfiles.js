import { OCCUPANT_CONSENT_STATUS } from "@/shared/types";

const ROOM_TYPE_LABELS = {
  single: "Singola",
  double: "Doppia",
  entire_apartment: "Intero appartamento",
};

const PRESENCE_LABELS = {
  present: "Presenza regolare",
  weekdays_only: "Presente nei giorni feriali",
  weekends_only: "Presente nei weekend",
  occasional: "Presenza occasionale",
  moving_in: "In ingresso",
  moving_out: "In uscita",
};

const AGE_RANGE_LABELS = {
  "18_20": "18-20",
  "21_23": "21-23",
  "24_26": "24-26",
  "27_plus": "27+",
};

const toSafeText = (value) => (typeof value === "string" ? value.trim() : "");

const toCleanList = (values = [], maxItems = 8) => {
  if (!Array.isArray(values)) return [];

  const normalized = values
    .map((value) => toSafeText(value))
    .filter(Boolean)
    .slice(0, maxItems);

  return Array.from(new Set(normalized));
};

const resolveRoomId = (room = {}, index = 0) =>
  toSafeText(room?.roomId) || toSafeText(room?.id) || `room-${index}`;

export const buildRoomLabel = (room = {}, index = 0) => {
  const customLabel =
    toSafeText(room?.label) ||
    toSafeText(room?.name) ||
    toSafeText(room?.title);

  if (customLabel) return customLabel;

  const typeLabel = ROOM_TYPE_LABELS[toSafeText(room?.type)] || "";
  const baseLabel = `Stanza ${index + 1}`;

  return typeLabel ? `${baseLabel} - ${typeLabel}` : baseLabel;
};

export const isPublicRoommate = (occupant = {}) => {
  const isPublic = occupant?.visibility?.isPublic === true;
  const consentStatus = occupant?.consent?.status;

  return (
    isPublic &&
    (!consentStatus || consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED)
  );
};

export const buildVisibleRoommateProfiles = (occupants = [], rooms = []) => {
  const roomLookup = new Map();
  const roomByOccupantId = new Map();

  (Array.isArray(rooms) ? rooms : []).forEach((room, index) => {
    const roomId = resolveRoomId(room, index);
    const roomTypeLabel = ROOM_TYPE_LABELS[toSafeText(room?.type)] || "";
    const roomMeta = {
      id: roomId,
      roomLabel: buildRoomLabel(room, index),
      roomTypeLabel,
      roomOrder: index,
      roomOccupantIds: Array.isArray(room?.occupantIds)
        ? room.occupantIds.filter((value) => typeof value === "string")
        : [],
      room,
    };

    roomLookup.set(roomId, roomMeta);

    roomMeta.roomOccupantIds.forEach((occupantId) => {
      const normalizedId = toSafeText(occupantId);
      if (!normalizedId) return;
      roomByOccupantId.set(normalizedId, roomMeta);
    });
  });

  return (Array.isArray(occupants) ? occupants : [])
    .filter((occupant) => isPublicRoommate(occupant))
    .map((occupant, index) => {
      const publicProfile = occupant?.publicProfile || {};
      const occupantId =
        toSafeText(occupant?.occupantId) ||
        toSafeText(occupant?.id) ||
        `occupant-${index}`;
      const roomId = toSafeText(occupant?.roomId);
      const roomMeta =
        roomLookup.get(roomId) || roomByOccupantId.get(occupantId) || null;
      const university = toSafeText(publicProfile?.university);
      const faculty = toSafeText(publicProfile?.faculty);
      const course = toSafeText(publicProfile?.course);
      const livingRhythm = toSafeText(publicProfile?.livingRhythm);
      const cleanlinessLevel = toSafeText(publicProfile?.cleanlinessLevel);
      const socialLevel = toSafeText(publicProfile?.socialLevel);
      const weekendPresence = toSafeText(publicProfile?.weekendPresence);

      return {
        id: occupantId,
        occupantId,
        displayName: toSafeText(publicProfile?.displayName) || "Coinquilino",
        avatarUrl: toSafeText(publicProfile?.avatarUrl),
        shortBio: toSafeText(publicProfile?.shortBio),
        ageRangeLabel:
          AGE_RANGE_LABELS[toSafeText(publicProfile?.ageRange)] ||
          toSafeText(publicProfile?.ageRange),
        presenceLabel:
          PRESENCE_LABELS[toSafeText(occupant?.presenceStatus)] || "",
        university,
        faculty,
        course,
        studyLine: [university, faculty, course].filter(Boolean).join(" · "),
        livingRhythm,
        cleanlinessLevel,
        socialLevel,
        weekendPresence,
        habitLabels: [livingRhythm, cleanlinessLevel, socialLevel, weekendPresence]
          .filter(Boolean)
          .slice(0, 4),
        lifestyleTags: toCleanList(publicProfile?.lifestyleTags, 5),
        interests: toCleanList(publicProfile?.interests, 5),
        languages: toCleanList(publicProfile?.languages, 4),
        roomId: roomMeta?.id || roomId,
        roomLabel: roomMeta?.roomLabel || "Stanza da confermare",
        roomTypeLabel: roomMeta?.roomTypeLabel || "",
        roomOrder: roomMeta?.roomOrder ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((left, right) => {
      if (left.roomOrder !== right.roomOrder) {
        return left.roomOrder - right.roomOrder;
      }

      return left.displayName.localeCompare(right.displayName, "it");
    });
};

export const groupRoommatesByRoomId = (profiles = []) =>
  (Array.isArray(profiles) ? profiles : []).reduce((acc, profile) => {
    if (!profile?.roomId) return acc;

    if (!acc[profile.roomId]) {
      acc[profile.roomId] = [];
    }

    acc[profile.roomId].push(profile);
    return acc;
  }, {});
