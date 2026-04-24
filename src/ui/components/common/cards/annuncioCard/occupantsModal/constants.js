import {
  faBed,
  faBook,
  faCircleInfo,
  faDumbbell,
  faFilm,
  faGamepad,
  faGlobe,
  faGraduationCap,
  faHeart,
  faLanguage,
  faMoon,
  faMusic,
  faPlane,
  faSmokingBan,
  faSun,
  faUtensils,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  OCCUPANT_CONSENT_STATUS,
  OCCUPANT_PRESENCE_STATUS,
} from "@/shared/types";

export const DEFAULT_POLICY_VERSION = "2026-03-occupants-v1";
export const MAX_LIFESTYLE_TAGS = 8;
export const MAX_INTERESTS = 8;
export const MAX_LANGUAGES = 6;
export const DEFAULT_CONSENT_DECLARATION =
  "Consenso esplicito confermato dall'host per la pubblicazione del profilo coinquilino.";

export const ROOM_TYPE_LABELS = {
  single: "Singola",
  double: "Doppia",
  entire_apartment: "Intero appartamento",
};

export const SECTION_ICONS = {
  identity: faBed,
  study: faGraduationCap,
  vibe: faHeart,
  consent: faCircleInfo,
};

export const PRESENCE_OPTIONS = [
  { value: OCCUPANT_PRESENCE_STATUS.PRESENT, label: "Presenza regolare" },
  {
    value: OCCUPANT_PRESENCE_STATUS.WEEKDAYS_ONLY,
    label: "Presente nei giorni feriali",
  },
  {
    value: OCCUPANT_PRESENCE_STATUS.WEEKENDS_ONLY,
    label: "Presente solo nei weekend",
  },
  {
    value: OCCUPANT_PRESENCE_STATUS.OCCASIONAL,
    label: "Presenza occasionale",
  },
  { value: OCCUPANT_PRESENCE_STATUS.MOVING_IN, label: "In ingresso" },
  { value: OCCUPANT_PRESENCE_STATUS.MOVING_OUT, label: "In uscita" },
];

export const CONSENT_OPTIONS = [
  { value: OCCUPANT_CONSENT_STATUS.PENDING, label: "Consenso da raccogliere" },
  { value: OCCUPANT_CONSENT_STATUS.GRANTED, label: "Consenso ottenuto" },
  { value: OCCUPANT_CONSENT_STATUS.REVOKED, label: "Consenso revocato" },
];

export const AGE_RANGE_OPTIONS = [
  { value: "18_20", label: "18-20" },
  { value: "21_23", label: "21-23" },
  { value: "24_26", label: "24-26" },
  { value: "27_plus", label: "27+" },
];

export const LIFESTYLE_OPTIONS = [
  { value: "Sportivo", label: "Sportivo", icon: faDumbbell },
  { value: "Sociale", label: "Sociale", icon: faUsers },
  { value: "Tranquillo", label: "Tranquillo", icon: faMoon },
  { value: "Studioso", label: "Studioso", icon: faBook },
  { value: "Non fumatore", label: "Non fumatore", icon: faSmokingBan },
  { value: "Erasmus", label: "Erasmus", icon: faGlobe },
  { value: "Early bird", label: "Early bird", icon: faSun },
  { value: "Nottambulo", label: "Nottambulo", icon: faMoon },
];

export const INTEREST_OPTIONS = [
  { value: "Musica", label: "Musica", icon: faMusic },
  { value: "Cinema", label: "Cinema", icon: faFilm },
  { value: "Gaming", label: "Gaming", icon: faGamepad },
  { value: "Cucina", label: "Cucina", icon: faUtensils },
  { value: "Viaggi", label: "Viaggi", icon: faPlane },
  { value: "Lettura", label: "Lettura", icon: faBook },
  { value: "Sport", label: "Sport", icon: faDumbbell },
  { value: "Serie TV", label: "Serie TV", icon: faFilm },
];

export const LANGUAGE_OPTIONS = [
  { value: "Italiano", label: "Italiano", icon: faLanguage },
  { value: "Inglese", label: "Inglese", icon: faLanguage },
  { value: "Spagnolo", label: "Spagnolo", icon: faLanguage },
  { value: "Francese", label: "Francese", icon: faLanguage },
  { value: "Tedesco", label: "Tedesco", icon: faLanguage },
];

export const RHYTHM_OPTIONS = [
  { value: "Early bird", label: "Early bird", icon: faSun },
  { value: "Equilibrato", label: "Equilibrato", icon: faCircleInfo },
  { value: "Nottambulo", label: "Nottambulo", icon: faMoon },
];

export const CLEANLINESS_OPTIONS = [
  { value: "Molto ordinato", label: "Molto ordinato", icon: faSun },
  { value: "Normale", label: "Normale", icon: faCircleInfo },
  { value: "Flessibile", label: "Flessibile", icon: faMoon },
];

export const SOCIAL_OPTIONS = [
  { value: "Molto sociale", label: "Molto sociale", icon: faUsers },
  { value: "Equilibrato", label: "Equilibrato", icon: faCircleInfo },
  { value: "Riservato", label: "Riservato", icon: faBook },
];

export const WEEKEND_OPTIONS = [
  { value: "Spesso in casa", label: "Spesso in casa", icon: faUsers },
  { value: "A volte fuori", label: "A volte fuori", icon: faPlane },
  {
    value: "Quasi sempre fuori",
    label: "Quasi sempre fuori",
    icon: faPlane,
  },
];
