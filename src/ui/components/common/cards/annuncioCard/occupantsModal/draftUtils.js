import {
  OCCUPANT_CONSENT_STATUS,
  OCCUPANT_PRESENCE_STATUS,
} from "@/shared/types";
import {
  DEFAULT_CONSENT_DECLARATION,
  DEFAULT_POLICY_VERSION,
  MAX_INTERESTS,
  MAX_LANGUAGES,
  MAX_LIFESTYLE_TAGS,
  ROOM_TYPE_LABELS,
} from "./constants";

const createLocalId = () =>
  `occ-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const isBlobPreviewUrl = (value) =>
  typeof value === "string" && value.startsWith("blob:");

export const revokePreviewUrl = (value) => {
  if (!isBlobPreviewUrl(value)) return;
  URL.revokeObjectURL(value);
};

export const cleanupDraftAvatarPreviews = (drafts = []) => {
  (Array.isArray(drafts) ? drafts : []).forEach((draft) =>
    revokePreviewUrl(draft?.avatarPreviewUrl),
  );
};

export const toSafeString = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

export const uniqueTrimmedList = (values = [], maxItems = 8) => {
  if (!Array.isArray(values)) return [];

  const normalized = values
    .map((value) => toSafeString(value))
    .filter(Boolean)
    .slice(0, maxItems);

  return Array.from(new Set(normalized));
};

export const toggleListValue = (list = [], value = "", maxItems = 8) => {
  if (!value) return uniqueTrimmedList(list, maxItems);

  const normalizedList = uniqueTrimmedList(list, maxItems);
  if (normalizedList.includes(value)) {
    return normalizedList.filter((item) => item !== value);
  }

  return uniqueTrimmedList([...normalizedList, value], maxItems);
};

export const resolveRoomId = (room = {}) => {
  const roomId = toSafeString(room?.roomId);
  if (roomId) return roomId;
  return toSafeString(room?.id);
};

export const buildRoomLabel = (room = {}, index = 0) => {
  const customLabel =
    toSafeString(room?.label) ||
    toSafeString(room?.name) ||
    toSafeString(room?.title);

  if (customLabel) return customLabel;

  const typeLabel = ROOM_TYPE_LABELS[toSafeString(room?.type)] || "";
  const baseLabel = `Stanza ${index + 1}`;
  return typeLabel ? `${baseLabel} - ${typeLabel}` : baseLabel;
};

export const createEmptyDraft = (roomId = "") => ({
  localId: createLocalId(),
  occupantId: "",
  roomId,
  displayName: "",
  avatarUrl: "",
  avatarPreviewUrl: "",
  avatarFile: null,
  originalAvatarUrl: "",
  ageRange: "",
  university: "",
  faculty: "",
  course: "",
  shortBio: "",
  lifestyleTags: [],
  interests: [],
  languages: [],
  livingRhythm: "",
  cleanlinessLevel: "",
  socialLevel: "",
  weekendPresence: "",
  presenceStatus: OCCUPANT_PRESENCE_STATUS.PRESENT,
  consentStatus: OCCUPANT_CONSENT_STATUS.PENDING,
  consentDeclaration: "",
  consentEvidenceNote: "",
  consentConfirmed: false,
  consentPolicyVersion: DEFAULT_POLICY_VERSION,
  isPublic: false,
});

export const buildDraftFromOccupant = (occupant, privateData) => ({
  localId: createLocalId(),
  occupantId: occupant.occupantId || occupant.id || "",
  roomId: toSafeString(occupant.roomId),
  displayName: occupant.publicProfile?.displayName || "",
  avatarUrl: occupant.publicProfile?.avatarUrl || "",
  avatarPreviewUrl: occupant.publicProfile?.avatarUrl || "",
  avatarFile: null,
  originalAvatarUrl: occupant.publicProfile?.avatarUrl || "",
  ageRange: occupant.publicProfile?.ageRange || "",
  university: occupant.publicProfile?.university || "",
  faculty: occupant.publicProfile?.faculty || "",
  course: occupant.publicProfile?.course || "",
  shortBio: occupant.publicProfile?.shortBio || "",
  lifestyleTags: uniqueTrimmedList(
    occupant.publicProfile?.lifestyleTags,
    MAX_LIFESTYLE_TAGS,
  ),
  interests: uniqueTrimmedList(occupant.publicProfile?.interests, MAX_INTERESTS),
  languages: uniqueTrimmedList(occupant.publicProfile?.languages, MAX_LANGUAGES),
  livingRhythm: occupant.publicProfile?.livingRhythm || "",
  cleanlinessLevel: occupant.publicProfile?.cleanlinessLevel || "",
  socialLevel: occupant.publicProfile?.socialLevel || "",
  weekendPresence: occupant.publicProfile?.weekendPresence || "",
  presenceStatus: occupant.presenceStatus || OCCUPANT_PRESENCE_STATUS.PRESENT,
  consentStatus:
    privateData?.consent?.status ||
    occupant.consent?.status ||
    OCCUPANT_CONSENT_STATUS.PENDING,
  consentDeclaration: privateData?.consent?.declaration || "",
  consentEvidenceNote: privateData?.consent?.evidenceNote || "",
  consentConfirmed: Boolean(privateData?.consent?.declaration),
  consentPolicyVersion:
    privateData?.consent?.policyVersion ||
    occupant.consent?.policyVersion ||
    DEFAULT_POLICY_VERSION,
  isPublic: occupant.visibility?.isPublic === true,
});

export const buildUpsertPayload = (draft) => {
  const consentStatus = draft.consentStatus || OCCUPANT_CONSENT_STATUS.PENDING;
  const hasExplicitConsent =
    consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED &&
    draft.consentConfirmed === true;
  const consentDeclaration = hasExplicitConsent
    ? draft.consentDeclaration?.trim() || DEFAULT_CONSENT_DECLARATION
    : null;
  const consentEvidenceNote = hasExplicitConsent
    ? draft.consentEvidenceNote?.trim() || null
    : null;
  const lifestyleTags = uniqueTrimmedList(
    draft.lifestyleTags,
    MAX_LIFESTYLE_TAGS,
  );
  const interests = uniqueTrimmedList(draft.interests, MAX_INTERESTS);
  const languages = uniqueTrimmedList(draft.languages, MAX_LANGUAGES);

  const publicProfile = {
    displayName: draft.displayName?.trim() || "",
    avatarUrl: draft.avatarUrl?.trim() || null,
    ageRange: draft.ageRange || null,
    university: draft.university?.trim() || null,
    faculty: draft.faculty?.trim() || null,
    course: draft.course?.trim() || null,
    shortBio: draft.shortBio?.trim() || null,
    lifestyleTags,
    interests,
    languages,
    livingRhythm: draft.livingRhythm?.trim() || null,
    cleanlinessLevel: draft.cleanlinessLevel?.trim() || null,
    socialLevel: draft.socialLevel?.trim() || null,
    weekendPresence: draft.weekendPresence?.trim() || null,
  };

  const scopes = {
    displayName: true,
    avatarUrl: Boolean(publicProfile.avatarUrl),
    ageRange: Boolean(publicProfile.ageRange),
    gender: false,
    university: Boolean(publicProfile.university),
    faculty: Boolean(publicProfile.faculty),
    course: Boolean(publicProfile.course),
    shortBio: Boolean(publicProfile.shortBio),
    lifestyleTags: lifestyleTags.length > 0,
    interests: interests.length > 0,
    languages: languages.length > 0,
    livingRhythm: Boolean(publicProfile.livingRhythm),
    cleanlinessLevel: Boolean(publicProfile.cleanlinessLevel),
    socialLevel: Boolean(publicProfile.socialLevel),
    weekendPresence: Boolean(publicProfile.weekendPresence),
  };

  return {
    occupantId: draft.occupantId || undefined,
    roomId: draft.roomId,
    presenceStatus: draft.presenceStatus || OCCUPANT_PRESENCE_STATUS.PRESENT,
    publicProfile,
    visibility: {
      isPublic:
        consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED &&
        draft.isPublic === true,
      reason:
        consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED
          ? null
          : "consent_required",
    },
    consent: {
      status: consentStatus,
      policyVersion: draft.consentPolicyVersion || DEFAULT_POLICY_VERSION,
      declaration: consentDeclaration,
      evidenceNote: consentEvidenceNote,
      scopes,
    },
  };
};
