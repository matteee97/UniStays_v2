import {
  faWifi3,
  faSnowflake,
  faShirt,
  faFireBurner,
  faCar,
  faMountainSun,
  faElevator,
  faKitchenSet,
  faUtensils,
  faBoxArchive,
  faTv,
  faDesktop,
  faWhiskeyGlass,
  faWindowMaximize,
  faCalendarWeek,
} from "@fortawesome/free-solid-svg-icons"; // assicurati che ci siano tutti questi

export const dotazioniConfig = [
  { key: "wifi", label: "Wi-fi", icon: faWifi3 },
  { key: "airConditioning", label: "Aria condizionata", icon: faSnowflake },
  { key: "parking", label: "Parcheggio", icon: faCar },
  { key: "tv", label: "TV", icon: faTv },
  { key: "kitchenType", label: "Cucina - ", icon: faFireBurner },
  { key: "washer", label: "Lavatrice", icon: faShirt },
  { key: "dishwasher", label: "Lavastoviglie", icon: faBoxArchive },
  { key: "balcony", label: "Balcone", icon: faMountainSun },
  { key: "kitchenBasics", label: "Servizi base per cucinare", icon: faKitchenSet },
  { key: "kitchenware", label: "Piatti e posate", icon: faUtensils },
  { key: "oven", label: "Forno", icon: faCalendarWeek },
  { key: "deskInRoom", label: "Scrivania in camera", icon: faDesktop },
  { key: "dryer", label: "Asciugatrice", icon: faWhiskeyGlass },
  { key: "elevator", label: "Ascensore", icon: faElevator },
  { key: "microwave", label: "Microonde", icon: faWindowMaximize },
];


export const DOTAZIONI_SECTIONS = [
  {
    title: "Comfort",
    keys: ["wifi", "airConditioning", "tv"],
  },
  {
    title: "Cucina",
    keys: [
      "kitchenType",
      "kitchenBasics",
      "kitchenware",
      "oven",
      "microwave",
      "dishwasher",
    ],
  },
  {
    title: "Lavanderia",
    keys: ["washer", "dryer"],
  },
  {
    title: "Spazi e accesso",
    keys: ["balcony", "parking", "elevator"],
  },
  {
    title: "Studio",
    keys: ["deskInRoom"],
  },
];