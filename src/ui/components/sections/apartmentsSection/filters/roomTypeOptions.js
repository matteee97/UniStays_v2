import { ROOM_TYPES } from "@/shared/types";

export const ROOM_TYPE_OPTIONS = [
  { value: "", label: "Qualsiasi tipologia" },
  { value: ROOM_TYPES.SINGLE, label: "Singola" },
  { value: ROOM_TYPES.DOUBLE, label: "Doppia" },
  { value: ROOM_TYPES.ENTIRE_APARTMENT, label: "Intero appartamento" },
];

export const ROOM_TYPE_LABELS = Object.freeze({
  [ROOM_TYPES.SINGLE]: "Singola",
  [ROOM_TYPES.DOUBLE]: "Doppia",
  [ROOM_TYPES.ENTIRE_APARTMENT]: "Intero appartamento",
});
