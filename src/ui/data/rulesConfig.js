import {
  faPaw,
  faChampagneGlasses,
  faSmoking,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

// Array di oggetti: key = nome campo in 'caratteristiche', 
// label = testo da mostrare, icon = icona FontAwesome, 
// fallback = testo se non presente, formatter (opzionale) = funzione per modificare valore
export const rulesConfig = [
  {
    key: "petsAllowed",
    labelTrue: "Animali ammessi",
    labelFalse: "Animali non ammessi",
    icon: faPaw,
    fallback: "Non specificato",
  },
  {
    key: "partiesForbidden",
    labelTrue: "Feste vietate",
    labelFalse: "Feste consentite",
    icon: faChampagneGlasses,
    fallback: "Non specificato",
  },
  {
    key: "smokingAllowed",
    labelTrue: "Fumatori ammessi",
    labelFalse: "Fumatori non ammessi",
    icon: faSmoking,
    fallback: "Non specificato",
  },
  {
    key: "studentsOnly",
    label: "Solo per studenti",
    icon: faGraduationCap,
    fallback: "Non presente",
  },
];
