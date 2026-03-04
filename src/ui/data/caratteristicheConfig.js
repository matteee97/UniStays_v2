import {
  faBuilding,
  faTemperatureHigh,
  faArrowDownUpAcrossLine,
  faTree,
  faWarehouse,
  faRulerCombined,
  faBath,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

// Array di oggetti: key = nome campo in 'caratteristiche',
// label = testo da mostrare, icon = icona FontAwesome,
// fallback = testo se non presente, formatter (opzionale) = funzione per modificare valore
export const caratteristicheConfig = [
  {
    key: "totalAreaMq",
    label: "Superficie totale",
    icon: faRulerCombined,
    fallback: "Non specificato",
    formatter: (val) => `${val} m²`,
  },
  {
    key: "bathroomsCount",
    label: "Bagni",
    icon: faBath,
    fallback: "Non specificato",
  },
  {
    key: "propertyCondition",
    label: "Stato immobile",
    icon: faBuilding,
    fallback: "Non specificato",
  },
  {
    key: "heatingType",
    label: "Riscaldamento",
    icon: faTemperatureHigh,
    fallback: "Non presente",
  },
  {
    key: "utilitiesIncluded",
    label: "Utenze incluse",
    icon: faBolt,
    fallback: "Non specificato",
    formatter: (val) => (val ? "Si" : "No"),
  },
  {
    key: "floor",
    label: "Piano",
    icon: faArrowDownUpAcrossLine,
    fallback: "Non specificato",
    formatter: (val) => (val === 0 ? "terra" : val),
  },
  {
    key: "gardenType",
    label: "Giardino",
    icon: faTree,
    fallback: "Non specificato",
  },
  {
    key: "garageType",
    label: "Garage",
    icon: faWarehouse,
    fallback: "Non specificato",
  },
];
