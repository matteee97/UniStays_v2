import {
  faGraduationCap,
  faUsers,
  faHeart,
  faRocket,
  faLightbulb,
  faHandshake,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

export const teamMembers = [
  {
    id: 1,
    name: "Matteo Vittori",
    role: "Founder & CEO",
    university: "Università di Camerino",
    degree: "Computer Science",
    image: "/img/team/member1.jpg",
    description:
      "Studente che ha vissuto la frustrazione di cercare casa. Ha trasformato questa esperienza in una missione.",
    skills: ["Leadership", "Product Vision", "Student Experience", "UI/UX Design", "Full Stack Development", "Marketing", "Database Management"],
    link: "https://matteo-vittori.netlify.app/",
  },
];

export const stats = [
  {
    icon: faGraduationCap,
    number: "15+",
    label: "Università",
    description: "Coperte in tutta Italia",
    img: "/img/3D/home/university.webp",
  },
  {
    icon: faHeart,
    number: "98%",
    label: "Soddisfazione",
    description: "Dei nostri utenti",
    img: "/img/3D/common/happy-customers.webp",
  },
  {
    icon: faRocket,
    number: "3x",
    label: "Più veloce",
    description: "Nella ricerca casa",
    img: "/img/3D/home/fast.webp",
  },
];

export const values = [
  {
    icon: faLightbulb,
    title: "Innovazione",
    description:
      "Utilizziamo tecnologie all'avanguardia per semplificare la ricerca di alloggi universitari.",
  },
  {
    icon: faHandshake,
    title: "Trasparenza",
    description:
      "Crediamo in relazioni oneste e trasparenti tra studenti e proprietari.",
  },
  {
    icon: faHeart,
    title: "Empatia",
    description:
      "Abbiamo vissuto le stesse difficoltà, per questo capiamo le vostre esigenze.",
  },
  {
    icon: faChartLine,
    title: "Crescita",
    description:
      "Ci impegniamo a migliorare costantemente la piattaforma per voi.",
  },
];

export const tabs = [
  { id: "mission", label: "La Nostra Missione", icon: faRocket },
  { id: "team", label: "Il Team", icon: faUsers },
  { id: "values", label: "I Nostri Valori", icon: faHeart },
];
