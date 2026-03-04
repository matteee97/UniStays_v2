import { faClock, faSmile, faHome } from "@fortawesome/free-solid-svg-icons";

export const contactInfo = {
  title: "Contattaci",
  subtitle: "Hai bisogno di supporto o vuoi pubblicare un annuncio?",
  description: "Il nostro team è a tua disposizione per fornirti assistenza rapida e puntuale.",
  collaborationText: "Valutiamo con interesse anche proposte di collaborazione, sponsorizzazione o progetti innovativi legati al mondo degli affitti universitari. Siamo pronti ad ascoltarti.",
  stats: [
    {
      number: "24h",
      label: "Tempo di risposta medio",
      description: "Rispondiamo entro 24 ore",
      icon: faClock,
      img: "/img/3D/contacts/fast-response.webp"
    },
    {
      number: "98%",
      label: "Soddisfazione clienti",
      description: "Utenti soddisfatti del supporto",
      icon: faSmile,
      img: "/img/3D/common/happy-customers.webp"
    },
    {
      number: "500+",
      label: "Annunci pubblicati",
      description: "Con il nostro aiuto",
      icon: faHome,
      img: "/img/3D/contacts/italy-map-with-pointers.webp"
    }
  ],
  contactDetails: [
    {
      icon: "faEnvelope",
      label: "Email",
      value: "supporto@unistays.it",
      link: "mailto:supporto@unistays.it",
      description: "Risposta rapida via email"
    },
    {
      icon: "faPhone", 
      label: "Telefono",
      value: "+39 331 993 2488",
      link: "tel:+393319932488",
      description: "Supporto telefonico diretto"
    },
    {
      icon: "faLocationDot",
      label: "Indirizzo",
      value: "Amandola (FM), Italia",
      link: "https://maps.google.com/?q=Amandola+FM+Italia",
      description: "Sede operativa"
    }
  ]
};

export const contactReasons = [
  {
    value: "studente-cerco-affitto",
    label: "Sono uno studente - cerco un alloggio",
    description: "Hai bisogno di aiuto per trovare la casa perfetta?",
    icon: "faGraduationCap",
    benefits: ["Consulenza gratuita", "Filtri personalizzati", "Supporto nella scelta"]
  },
  {
    value: "proprietario-cerco-collaboratori", 
    label: "Sono un proprietario - cerco collaboratori",
    description: "Vuoi collaborare con noi per migliorare la piattaforma?",
    icon: "faHandshake",
    benefits: ["Partnership esclusive", "Supporto tecnico", "Visibilità garantita"]
  },
  {
    value: "segnalazione",
    label: "Segnalazione di un problema",
    description: "Hai riscontrato un problema tecnico o un bug?",
    icon: "faExclamationTriangle",
    benefits: ["Risoluzione rapida", "Feedback diretto", "Miglioramenti continui"]
  },
  {
    value: "collaborazione",
    label: "Richiesta di collaborazione/pubblicità",
    description: "Interessato a partnership o opportunità pubblicitarie?",
    icon: "faRocket",
    benefits: ["Opportunità di crescita", "Piani personalizzati", "ROI garantito"]
  },
  {
    value: "altro",
    label: "Altro",
    description: "Hai altre domande o richieste?",
    icon: "faQuestionCircle",
    benefits: ["Supporto personalizzato", "Soluzioni su misura", "Consulenza esperta"]
  }
];

export const formFields = {
  name: {
    label: "Nome",
    placeholder: "Mario Rossi",
    required: true,
    type: "text"
  },
  email: {
    label: "Email", 
    placeholder: "mario@email.com",
    required: true,
    type: "email"
  },
  message: {
    label: "Messaggio",
    placeholder: "Scrivici cosa hai in mente...",
    required: true,
    rows: 5
  }
};

export const testimonials = [
  {
    name: "Marco S.",
    role: "Studente Universitario",
    content: "Il supporto è stato fantastico! Mi hanno aiutato a trovare la casa perfetta in meno di una settimana.",
    rating: 5
  },
  {
    name: "Laura M.",
    role: "Proprietaria",
    content: "Pubblicare il mio annuncio è stato semplicissimo. Il team mi ha guidato passo dopo passo.",
    rating: 5
  },
  {
    name: "Alessandro R.",
    role: "Studente",
    content: "Risposta veloce e professionale. Hanno risolto il mio problema in poche ore!",
    rating: 5
  }
];

export const faqData = [
  {
    question: "Quanto tempo ci vuole per ricevere una risposta?",
    answer: "Rispondiamo solitamente entro 24 ore durante i giorni lavorativi. Per urgenze, puoi contattarci telefonicamente."
  },
  {
    question: "Il supporto è gratuito?",
    answer: "Sì, il nostro supporto è completamente gratuito per tutti gli utenti della piattaforma."
  },
  {
    question: "Posso segnalare un annuncio sospetto?",
    answer: "Assolutamente! La segnalazione di annunci sospetti ci aiuta a mantenere la qualità della piattaforma."
  },
  {
    question: "Offrite consulenza per proprietari?",
    answer: "Sì, forniamo consulenza gratuita per proprietari che vogliono ottimizzare i loro annunci."
  }
];
