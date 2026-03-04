import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  faBoltLightning,
  faBook,
  faCertificate,
  faChartBar,
  faCompass,
  faEuro,
  faHome,
  faIcons,
  faMap,
  faMobile,
  faPaintRoller,
  faPaperPlane,
  faPersonDigging,
  faRectangleXmark,
  faSearch,
  faSimCard,
  faSun,
  faToggleOn,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Import solo i componenti essenziali per evitare problemi di caricamento
import {
  CoolButton,
  CloseButton,
  GoToButton,
  GreenButton,
  HeartToggle,
  LocalStorageToggleButton,
  ButtonDropDown,
  FormInput,
  FormSelect,
  SearchInput,
  RangeSlider,
  CounterBox,
  Checkbox,
  ImageUploader,
  CardBase,
  SmallCard,
  CityCard,
  AnnuncioCard,
  Breadcrumb,
  PageNavigation,
  NavigationButtons,
  Modal,
  ConfirmModal,
  Alert,
  EmptyResults,
  PubblicaAnnuncioAlert,
  Badge,
  FeaturedBadge,
  NewBadge,
  VerifiedBadge,
  RatingBadge,
  PremiumBadge,
  UrgentBadge,
  DiscountBadge,
  ArrowIcon,
  SearchIcon,
  HomeIcon,
  AccountIcon,
  CloseIcon,
  FiltersIcon,
  HeartIcon,
  ListIcon,
  LogoutIcon,
  MailBoxIcon,
  MenuArrow,
  MoonIcon,
  PeopleIcon,
  PositionIcon,
  Stars,
  TemperatureIcon,
  UpLoadIcon,
  WifiIcon,
  XIcon,
  FacebookIcon,
  InstagramIcon,
  ImgSkeleton,
  StatsCard,
  BarChartComponent,
  PieChartComponent,
  CitySearch,
  GreenContainer,
  WhiteContainer,
  GoogleMapComponent,
} from "@/ui/components/common/index.js";
import { toast } from "sonner";
import InfoCard from "@/ui/components/common/cards/InfoCard.jsx";

const DebugPage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Utility per mostrare il nome del componente e un pannello Help con props/descrizione
  const ComponentDemo = ({
    componentName,
    description,
    propsSchema = [],
    children,
    className = "",
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <div
        className={`rounded-xl border border-gray-200 shadow-sm bg-white/90 backdrop-blur p-4 ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 rounded-md text-sm bg-gray-900 text-green-300 shadow-inner">
              {`<${componentName} />`}
            </code>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-1.5 text-sm rounded-lg border border-[#D4F1EF] text-[#228E8D] hover:bg-[#D4F1EF]/40 transition-colors"
            aria-label={`Help ${componentName}`}
          >
            Help
          </button>
        </div>
        {open && (
          <div className="mb-3 rounded-lg border border-gray-100 bg-white p-3">
            {description && (
              <p className="text-sm text-gray-700 mb-2">{description}</p>
            )}
            {propsSchema?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="py-1 pr-3 font-semibold">Prop</th>
                      <th className="py-1 pr-3 font-semibold">Tipo</th>
                      <th className="py-1 pr-3 font-semibold">Req</th>
                      <th className="py-1 pr-3 font-semibold">Default</th>
                      <th className="py-1 font-semibold">Descrizione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propsSchema.map((p) => (
                      <tr
                        key={p.name}
                        className="border-t border-gray-100 align-top"
                      >
                        <td className="py-1 pr-3">
                          <code className="text-[13px] bg-gray-100 px-1 rounded">
                            {p.name}
                          </code>
                        </td>
                        <td className="py-1 pr-3 text-gray-700">{p.type}</td>
                        <td className="py-1 pr-3 text-gray-700">
                          {p.required ? "si" : "no"}
                        </td>
                        <td className="py-1 pr-3 text-gray-700">
                          {p.default ?? "-"}
                        </td>
                        <td className="py-1 text-gray-700">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
    );
  };

  const sections = [
    { id: "overview", label: "Panoramica", icon: faHome },
    { id: "colors", label: "Palette Colori", icon: faPaintRoller },
    { id: "typography", label: "Tipografia", icon: faPaperPlane },
    { id: "buttons", label: "Pulsanti", icon: faToggleOn },
    { id: "forms", label: "Form", icon: faPaperPlane },
    { id: "cards", label: "Card", icon: faSimCard },
    { id: "navigation", label: "Navigazione", icon: faCompass },
    { id: "modals", label: "Modal", icon: faRectangleXmark },
    { id: "badges", label: "Badge", icon: faCertificate },
    { id: "icons", label: "Icone", icon: faSearch },
    { id: "charts", label: "Grafici", icon: faChartBar },
    { id: "maps", label: "Mappe", icon: faMap },
    { id: "animations", label: "Animazioni", icon: faSun },
    { id: "responsive", label: "Responsive", icon: faMobile },
    { id: "architecture", label: "Architettura", icon: faPersonDigging },
  ];

  const colorPalette = {
    primary: {
      main: "#228E8D",
      light: "#62C1BA",
      lighter: "#A4E0DB",
      lightest: "#D4F1EF",
      dark: "#1A6B6A",
    },
    semantic: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    dark: {
      background: "#0B1220",
      surface: "#0F1829",
      border: "#1F2937",
      text: "#E2E8F0",
      accent: "#21A190",
      gradientFrom: "#0F172A",
      gradientTo: "#122529",
    },
    neutral: {
      white: "#FFFFFF",
      gray50: "#F9FAFB",
      gray100: "#F3F4F6",
      gray200: "#E5E7EB",
      gray300: "#D1D5DB",
      gray400: "#9CA3AF",
      gray500: "#6B7280",
      gray600: "#4B5563",
      gray700: "#374151",
      gray800: "#1F2937",
      gray900: "#111827",
      black: "#000000",
    },
  };

  const typography = {
    headings: {
      h1: "text-4xl font-bold text-gray-900",
      h2: "text-3xl font-semibold text-gray-800",
      h3: "text-2xl font-semibold text-gray-700",
      h4: "text-xl font-medium text-gray-700",
      h5: "text-lg font-medium text-gray-600",
      h6: "text-base font-medium text-gray-600",
    },
    body: {
      large: "text-lg text-gray-700",
      base: "text-base text-gray-600",
      small: "text-sm text-gray-500",
      xs: "text-xs text-gray-400",
    },
    weights: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
  };

  const spacing = {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  };

  const breakpoints = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    "3xl": "1792px", // custom breakpoint
  };

  const animations = {
    fadeIn: "animate-fadeIn",
    fadeInUp: "animate-fadeInUp",
    fadeInLeft: "animate-fadeInLeft",
    fadeInRight: "animate-fadeInRight",
    bumpLeft: "animate-bumpLeft",
    bumpRight: "animate-bumpRight",
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-[#228E8D] to-[#62C1BA] dark:from-[#0F172A] dark:via-[#0B2E2D] dark:to-[#0B3B5D] rounded-2xl p-8 text-white">
              <h1 className="text-4xl font-bold mb-4">
                UniStays Design System
              </h1>
              <p className="text-xl opacity-90 mb-6">
                Sistema di design completo per la piattaforma di affitti
                universitari
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Componenti</h3>
                  <p className="text-sm opacity-80">
                    130+ componenti riutilizzabili
                  </p>
                </div>
                <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Tecnologie</h3>
                  <p className="text-sm opacity-80">
                    React 18, Tailwind CSS, Firebase
                  </p>
                </div>
                <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Architettura</h3>
                  <p className="text-sm opacity-80">
                    Clean Architecture, SOLID
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <FontAwesomeIcon
                    icon={faPaintRoller}
                    className="mr-2 text-[#228E8D]"
                  />{" "}
                  Design System
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Palette colori coerente</li>
                  <li>• Tipografia gerarchica</li>
                  <li>• Spacing system</li>
                  <li>• Componenti modulari</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <FontAwesomeIcon
                    icon={faBoltLightning}
                    className="mr-2 text-[#228E8D]"
                  />{" "}
                  Performance
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Lazy loading</li>
                  <li>• Code splitting</li>
                  <li>• Memoizzazione</li>
                  <li>• Ottimizzazioni React</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <FontAwesomeIcon
                    icon={faMobile}
                    className="mr-2 text-[#228E8D]"
                  />{" "}
                  Responsive
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Mobile-first design</li>
                  <li>• Breakpoints personalizzati</li>
                  <li>• Touch-friendly</li>
                  <li>• Adaptive layouts</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "colors":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Palette Colori
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
                    Colori Primari
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(colorPalette.primary).map(
                      ([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-full h-20 rounded-lg shadow-md mb-2"
                            style={{ backgroundColor: value }}
                          ></div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            {key}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-300 font-mono">
                            {value}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
                    Colori Semantici
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(colorPalette.semantic).map(
                      ([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-full h-20 rounded-lg shadow-md mb-2"
                            style={{ backgroundColor: value }}
                          ></div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            {key}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-300 font-mono">
                            {value}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
                    Palette Dark
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {Object.entries(colorPalette.dark).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div
                          className="w-full h-20 rounded-lg shadow-md mb-2 border border-gray-200 dark:border-gray-700"
                          style={{ backgroundColor: value }}
                        ></div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                          {key}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300 font-mono">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
                    Scale Grigi
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(colorPalette.neutral).map(
                      ([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-full h-16 rounded-lg shadow-md mb-2 border border-gray-200"
                            style={{ backgroundColor: value }}
                          ></div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            {key}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-300 font-mono">
                            {value}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "typography":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Sistema Tipografico
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Intestazioni
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(typography.headings).map(
                      ([level, classes]) => (
                        <div
                          key={level}
                          className="border-l-4 border-[#228E8D] pl-4"
                        >
                          <div className={classes}>
                            {level.toUpperCase()} - Intestazione di esempio
                          </div>
                          <code className="text-xs text-gray-500 font-mono mt-1">
                            {classes}
                          </code>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Testo Corpo
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(typography.body).map(([size, classes]) => (
                      <div
                        key={size}
                        className="border-l-4 border-[#62C1BA] pl-4"
                      >
                        <div className={classes}>
                          Testo di esempio per {size} - Lorem ipsum dolor sit
                          amet consectetur.
                        </div>
                        <code className="text-xs text-gray-500 font-mono mt-1">
                          {classes}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Pesi Font
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(typography.weights).map(
                      ([weight, classes]) => (
                        <div
                          key={weight}
                          className="border-l-4 border-[#A4E0DB] pl-4"
                        >
                          <div className={`text-lg ${classes}`}>
                            Peso {weight} - Testo di esempio
                          </div>
                          <code className="text-xs text-gray-500 font-mono mt-1">
                            {classes}
                          </code>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "buttons":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Componenti Pulsanti
              </h2>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ComponentDemo
                    componentName="CoolButton"
                    description="Pulsante primario con effetto spotlight su desktop."
                    propsSchema={[
                      {
                        name: "children",
                        type: "ReactNode",
                        required: true,
                        description: "Contenuto del pulsante",
                      },
                      {
                        name: "className",
                        type: "string",
                        required: false,
                        default: "",
                        description: "Classi Tailwind aggiuntive",
                      },
                      {
                        name: "animated",
                        type: "boolean",
                        required: false,
                        default: "true",
                        description: "Abilita spotlight desktop",
                      },
                    ]}
                  >
                    <CoolButton>Cool Button</CoolButton>
                  </ComponentDemo>

                  <ComponentDemo
                    componentName="GreenButton"
                    description="Pulsante verde standard, usato per azioni conferma."
                    propsSchema={[
                      { name: "children", type: "ReactNode", required: true },
                      { name: "onClick", type: "() => void", required: false },
                      { name: "className", type: "string", required: false },
                    ]}
                  >
                    <GreenButton>Normal Button</GreenButton>
                  </ComponentDemo>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ComponentDemo
                    componentName="GoToButton"
                    description="Pulsante navigazione styled."
                    propsSchema={[
                      { name: "children", type: "ReactNode", required: true },
                      { name: "className", type: "string", required: false },
                    ]}
                  >
                    <div className="w-32">
                      <GoToButton className="border-2 border-[#D4F1EF]">
                        Go To
                      </GoToButton>
                    </div>
                  </ComponentDemo>

                  <ComponentDemo
                    componentName="CloseButton"
                    description="Icon button per chiusura modali/pannelli."
                    propsSchema={[
                      { name: "onClick", type: "() => void", required: false },
                    ]}
                  >
                    <CloseButton onClick={() => {}} />
                  </ComponentDemo>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ComponentDemo
                    componentName="HeartToggle"
                    description="Toggle like con animazione."
                    propsSchema={[
                      {
                        name: "liked",
                        type: "boolean",
                        required: true,
                        default: "false",
                      },
                      { name: "onToggle", type: "() => void", required: true },
                    ]}
                  >
                    <HeartToggle liked={false} onToggle={() => {}} />
                  </ComponentDemo>

                  <ComponentDemo
                    componentName="LocalStorageToggleButton"
                    description="Toggle stato persistito in localStorage."
                    propsSchema={[
                      { name: "storageKey", type: "string", required: true },
                      {
                        name: "defaultState",
                        type: "boolean",
                        required: false,
                        default: "false",
                      },
                      {
                        name: "onToggle",
                        type: "(v:boolean)=>void",
                        required: false,
                      },
                    ]}
                  >
                    <LocalStorageToggleButton
                      storageKey="debug-toggle"
                      defaultState={false}
                      onToggle={() => {}}
                    />
                  </ComponentDemo>
                </div>

                <ComponentDemo
                  componentName="ButtonDropDown"
                  description="Menu a discesa con elenco azioni."
                  propsSchema={[
                    { name: "label", type: "string", required: true },
                    {
                      name: "items",
                      type: "{label:string,onClick:()=>void}[]",
                      required: true,
                    },
                  ]}
                >
                  <ButtonDropDown
                    label="Dropdown Menu"
                    items={[
                      { label: "Opzione 1", onClick: () => {} },
                      { label: "Opzione 2", onClick: () => {} },
                      { label: "Opzione 3", onClick: () => {} },
                    ]}
                  />
                </ComponentDemo>
              </div>
            </div>
          </div>
        );

      case "forms":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Componenti Form
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Input Base
                  </h3>
                  <div className="max-w-md space-y-4">
                    <ComponentDemo
                      componentName="FormInput"
                      description="Input di testo con label e stati di focus."
                      propsSchema={[
                        { name: "label", type: "string", required: false },
                        {
                          name: "placeholder",
                          type: "string",
                          required: false,
                        },
                        { name: "value", type: "string", required: true },
                        { name: "onChange", type: "(e)=>void", required: true },
                      ]}
                    >
                      <FormInput
                        label="Nome"
                        placeholder="Inserisci il tuo nome"
                        value=""
                        onChange={() => {}}
                      />
                    </ComponentDemo>

                    <ComponentDemo
                      componentName="FormSelect"
                      description="Select con label e options tipizzate."
                      propsSchema={[
                        { name: "label", type: "string", required: false },
                        {
                          name: "options",
                          type: "{value:string,label:string}[]",
                          required: true,
                        },
                        { name: "value", type: "string", required: true },
                        { name: "onChange", type: "(v)=>void", required: true },
                      ]}
                    >
                      <FormSelect
                        label="Città"
                        options={[
                          { value: "roma", label: "Roma" },
                          { value: "milano", label: "Milano" },
                          { value: "napoli", label: "Napoli" },
                        ]}
                        value=""
                        onChange={() => {}}
                      />
                    </ComponentDemo>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Componenti Interattivi
                  </h3>
                  <div className="max-w-md space-y-4">
                    <ComponentDemo
                      componentName="SearchInput"
                      description="Campo di ricerca con icona e debounce opzionale."
                      propsSchema={[
                        {
                          name: "placeholder",
                          type: "string",
                          required: false,
                        },
                        { name: "value", type: "string", required: true },
                        { name: "onChange", type: "(v)=>void", required: true },
                      ]}
                    >
                      <SearchInput
                        placeholder="Cerca appartamenti..."
                        value=""
                        onChange={() => {}}
                      />
                    </ComponentDemo>

                    <ComponentDemo
                      componentName="RangeSlider"
                      description="Selettore range per valori min/max."
                      propsSchema={[
                        { name: "minValue", type: "number", required: true },
                        { name: "maxValue", type: "number", required: true },
                        {
                          name: "value",
                          type: "[number,number]",
                          required: true,
                        },
                        { name: "onChange", type: "(v)=>void", required: true },
                        { name: "label", type: "string", required: false },
                      ]}
                    >
                      <RangeSlider
                        minValue={0}
                        maxValue={1000}
                        value={[200, 600]}
                        onChange={() => {}}
                        label="Range Prezzo"
                      />
                    </ComponentDemo>

                    <ComponentDemo
                      componentName="CounterBox"
                      description="Stepper numerico con limiti."
                      propsSchema={[
                        { name: "label", type: "string", required: false },
                        { name: "value", type: "number", required: true },
                        {
                          name: "min",
                          type: "number",
                          required: false,
                          default: "0",
                        },
                        { name: "max", type: "number", required: false },
                        { name: "onChange", type: "(v)=>void", required: true },
                      ]}
                    >
                      <CounterBox
                        label="Camere"
                        value={2}
                        min={1}
                        max={10}
                        onChange={() => {}}
                      />
                    </ComponentDemo>

                    <ComponentDemo
                      componentName="Checkbox"
                      description="Checkbox accessibile con label."
                      propsSchema={[
                        { name: "label", type: "string", required: false },
                        { name: "checked", type: "boolean", required: true },
                        { name: "onChange", type: "(v)=>void", required: true },
                      ]}
                    >
                      <Checkbox
                        label="Accetto i termini"
                        checked={false}
                        onChange={() => {}}
                      />
                    </ComponentDemo>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Upload Immagini
                  </h3>
                  <div className="max-w-md">
                    <ComponentDemo
                      componentName="ImageUploader"
                      description="Uploader drag&drop con anteprime e limite immagini."
                      propsSchema={[
                        {
                          name: "onImageSelect",
                          type: "(files)=>void",
                          required: true,
                        },
                        {
                          name: "maxImages",
                          type: "number",
                          required: false,
                          default: "5",
                        },
                        { name: "label", type: "string", required: false },
                      ]}
                    >
                      <ImageUploader
                        onImageSelect={() => {}}
                        maxImages={5}
                        label="Carica immagini"
                      />
                    </ComponentDemo>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Ricerca Città
                  </h3>
                  <div className="max-w-md">
                    <CitySearch
                      onCitySelect={() => {}}
                      placeholder="Cerca città..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "cards":
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Componenti Card
            </h2>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Info card
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { variant: "default", label: "Default" },
                  { variant: "primary", label: "Primary" },
                  { variant: "secondary", label: "Secondary" },
                  { variant: "success", label: "Success" },
                  { variant: "warning", label: "Warning" },
                  { variant: "info", label: "Info" },
                ].map((v) => (
                  <ComponentDemo
                    key={v.variant}
                    componentName="InfoCard"
                    description={`Card informativa variante ${v.label}.`}
                    propsSchema={[
                      { name: "icon", type: "ReactNode", required: false },
                      {
                        name: "variant",
                        type: "'default'|'primary'|'secondary'|'success'|'warning'|'info'",
                        required: false,
                        default: "default",
                      },
                      { name: "title", type: "string", required: true },
                      { name: "description", type: "string", required: true },
                      { name: "clickable", type: "boolean", required: false },
                    ]}
                  >
                    <InfoCard
                      icon={<FontAwesomeIcon icon={faIcons} />}
                      variant={v.variant}
                      title="titolo"
                      description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam provident rem blanditiis, quos adipisci iste "
                      clickable
                    />
                  </ComponentDemo>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Card Base
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ComponentDemo
                    componentName="CardBase"
                    description="Container card con slot immagine e contenuto."
                    propsSchema={[
                      {
                        name: "imageSection",
                        type: "ReactNode",
                        required: false,
                      },
                      { name: "children", type: "ReactNode", required: true },
                    ]}
                  >
                    <CardBase
                      imageSection={
                        <div className="bg-gray-100 h-40 flex justify-center items-center text-gray-600">
                          sezione immagine
                        </div>
                      }
                    >
                      <div className="p-4">
                        <h4 className="font-semibold mb-2">Card Base</h4>
                        <p className="text-sm text-gray-600">
                          Contenuto della card base
                        </p>
                      </div>
                    </CardBase>
                  </ComponentDemo>

                  <ComponentDemo
                    componentName="SmallCard"
                    description="Card compatta con immagine e testo."
                    propsSchema={[
                      { name: "title", type: "string", required: true },
                      { name: "description", type: "string", required: false },
                      { name: "image", type: "string", required: false },
                    ]}
                  >
                    <SmallCard
                      title="Small Card"
                      description="Descrizione breve"
                      image="/img/cities/Roma.webp"
                    />
                  </ComponentDemo>

                  <ComponentDemo
                    componentName="CityCard"
                    description="Card città con conteggio appartamenti."
                    propsSchema={[
                      {
                        name: "city",
                        type: "{city:string, university?:string, imgUrl?:string}",
                        required: true,
                      },
                      { name: "apartments", type: "number", required: false },
                    ]}
                  >
                    <CityCard
                      city={{
                        city: "Roma",
                        university: "LUISS",
                        imgUrl: "/img/cities/Roma.webp",
                      }}
                      apartments={25}
                    />
                  </ComponentDemo>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Card Gestione Appartamenti
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <ComponentDemo
                    componentName="AnnuncioCard"
                    description="Card gestionale annuncio con azioni heart/details."
                    propsSchema={[
                      { name: "annuncio", type: "Annuncio", required: true },
                      {
                        name: "onHeartToggle",
                        type: "()=>void",
                        required: false,
                      },
                      {
                        name: "onViewDetails",
                        type: "()=>void",
                        required: false,
                      },
                    ]}
                  >
                    <AnnuncioCard
                      annuncio={{
                        id: "1",
                        title: "Appartamento Roma Centro",
                        address: { city: "Roma" },
                        apartmentPhotoUrls: ["/img/cities/Roma.webp"],
                        status: "published",
                        aggregates: {
                          minRoomPrice: 600,
                          maxRoomPrice: 600,
                          totalRooms: 2,
                          totalRoomsAvailable: 1,
                          isAvailableNow: true,
                        },
                        features: { totalAreaMq: 60, bathroomsCount: 1 },
                      }}
                      onHeartToggle={() => {}}
                      onViewDetails={() => {}}
                    />
                  </ComponentDemo>
                </div>
              </div>
            </div>
          </div>
        );

      case "navigation":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Componenti Navigazione
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Breadcrumb
                  </h3>
                  <ComponentDemo
                    componentName="Breadcrumb"
                    description="Breadcrumb responsive con gestione crumb disabilitato."
                    propsSchema={[
                      {
                        name: "crumbs",
                        type: "{label:string, href:string|null}[]",
                        required: true,
                      },
                      { name: "className", type: "string", required: false },
                    ]}
                  >
                    <Breadcrumb
                      crumbs={[
                        { label: "Home", href: "/" },
                        { label: "Appartamenti", href: "/appartamenti" },
                        { label: "Roma", href: "/appartamenti/roma" },
                        { label: "Dettagli", href: null },
                      ]}
                      className="relative"
                    />
                  </ComponentDemo>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Page Navigation
                  </h3>
                  <ComponentDemo
                    componentName="PageNavigation"
                    description="Navigazione paginata con controlli prev/next."
                    propsSchema={[
                      {
                        name: "paginaCorrente",
                        type: "number",
                        required: true,
                      },
                      { name: "numeroPagine", type: "number", required: true },
                      {
                        name: "onPageChange",
                        type: "(n:number)=>void",
                        required: true,
                      },
                    ]}
                  >
                    <PageNavigation
                      paginaCorrente={4}
                      numeroPagine={99}
                      onPageChange={() => {}}
                    />
                  </ComponentDemo>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Navigation Buttons
                  </h3>
                  <ComponentDemo
                    componentName="NavigationButtons"
                    description="Widget con frecce circolari per step form."
                    propsSchema={[
                      {
                        name: "canGoToPrevious",
                        type: "boolean",
                        required: true,
                      },
                      { name: "canGoToNext", type: "boolean", required: true },
                      {
                        name: "goToPrevious",
                        type: "()=>void",
                        required: true,
                      },
                      { name: "goToNext", type: "()=>void", required: true },
                      { name: "isLastStep", type: "boolean", required: true },
                      { name: "isFormValid", type: "boolean", required: true },
                      {
                        name: "isSubmitting",
                        type: "boolean",
                        required: false,
                      },
                      { name: "loading", type: "boolean", required: false },
                    ]}
                  >
                    <div className="relative w-24 h-24 ml-10">
                      <NavigationButtons
                        canGoToPrevious={true}
                        canGoToNext={true}
                        goToPrevious={() => {}}
                        goToNext={() => {}}
                        isLastStep={false}
                        isFormValid={true}
                        isSubmitting={false}
                        loading={false}
                      />
                    </div>
                  </ComponentDemo>
                </div>
              </div>
            </div>
          </div>
        );

      case "modals":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Componenti Modal
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Modal Base
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComponentDemo
                      componentName="Modal"
                      description="Finestra modale con overlay e titolo."
                      propsSchema={[
                        { name: "onClose", type: "()=>void", required: true },
                        { name: "title", type: "string", required: false },
                        {
                          name: "children",
                          type: "ReactNode",
                          required: false,
                        },
                      ]}
                    >
                      <CoolButton onClick={() => setShowModal(true)}>
                        Apri Modal
                      </CoolButton>
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="ConfirmModal"
                      description="Dialog conferma con azioni Conferma/Chiudi."
                      propsSchema={[
                        { name: "isOpen", type: "boolean", required: true },
                        { name: "onClose", type: "()=>void", required: true },
                        { name: "onConfirm", type: "()=>void", required: true },
                        { name: "title", type: "string", required: false },
                        { name: "message", type: "string", required: false },
                      ]}
                    >
                      <CoolButton onClick={() => setShowConfirmModal(true)}>
                        Apri Confirm Modal
                      </CoolButton>
                    </ComponentDemo>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Alert Messages
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComponentDemo
                      componentName="toast.success"
                      description="Notifica di successo (Sonner)."
                      propsSchema={[]}
                    >
                      <CoolButton
                        onClick={() =>
                          toast.success("Operazione completata con successo!")
                        }
                        className="h-fit mt-auto"
                      >
                        Mostra messaggio di: successo
                      </CoolButton>
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="toast.warning"
                      description="Notifica di attenzione."
                      propsSchema={[]}
                    >
                      <CoolButton
                        onClick={() =>
                          toast.warning("Attenzione: controlla i dati inseriti")
                        }
                      >
                        Mostra messaggio di: warning
                      </CoolButton>
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="toast.error"
                      description="Notifica di errore."
                      propsSchema={[]}
                    >
                      <CoolButton
                        onClick={() =>
                          toast.error("Errore durante il salvataggio")
                        }
                      >
                        Mostra messaggio di: error
                      </CoolButton>
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="toast.info"
                      description="Notifica informativa."
                      propsSchema={[]}
                    >
                      <CoolButton
                        onClick={() => toast.info("Informazione importante!")}
                      >
                        Mostra messaggio di: info
                      </CoolButton>
                    </ComponentDemo>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Messaggi Speciali
                  </h3>
                  <div className="space-y-10 ">
                    <ComponentDemo
                      componentName="EmptyResults"
                      description="Messaggio empty-state per liste appartamenti."
                    >
                      <div className="relative h-40">
                        <EmptyResults />
                      </div>
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="PubblicaAnnuncioAlert"
                      description="Alert promozionale per pubblicazione annuncio."
                    >
                      <PubblicaAnnuncioAlert>
                        Lorem ipsum, dolor sit amet consectetur adipisicing
                        elit.
                      </PubblicaAnnuncioAlert>
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="Alert"
                      description="Banner di stato inline."
                      propsSchema={[
                        { name: "message", type: "string", required: true },
                      ]}
                    >
                      <Alert message="Errore nel caricamento dati errore: lorem ipsum.." />
                    </ComponentDemo>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Examples */}
            {showModal && (
              <Modal
                onClose={() => setShowModal(false)}
                title="Modal di Esempio"
              >
                <div className="p-6">
                  <p className="text-gray-600 mb-4 max-w-xl">
                    Questo è un esempio di modal con contenuto personalizzato.
                    <br></br>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Inventore impedit provident ea eveniet quibusdam ab aperiam,
                    ipsum incidunt quidem, nesciunt minima sequi voluptate
                    aliquid, doloribus vel totam dolorem recusandae blanditiis.
                  </p>
                </div>
              </Modal>
            )}

            <ConfirmModal
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={() => setShowConfirmModal(false)}
              title="Conferma Azione"
              message="Sei sicuro di voler procedere con questa azione?"
            />
          </div>
        );

      case "badges":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Componenti Badge
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Badge Base
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { v: "primary", icon: "star", label: "Primario" },
                      { v: "secondary", icon: "check", label: "Secondario" },
                      { v: "success", icon: "check", label: "Successo" },
                      { v: "warning", icon: "warning", label: "Avviso" },
                      { v: "danger", icon: "warning", label: "Errore" },
                      { v: "info", icon: "info", label: "Info" },
                    ].map((b) => (
                      <ComponentDemo
                        key={b.v}
                        componentName="Badge"
                        description={`Badge ${b.label} semantico.`}
                        propsSchema={[
                          { name: "variant", type: "string", required: true },
                          {
                            name: "icon",
                            type: "'star'|'check'|'warning'|'info'|...",
                            required: false,
                          },
                          { name: "children", type: "string", required: true },
                        ]}
                      >
                        <Badge variant={b.v} icon={b.icon}>
                          {b.label}
                        </Badge>
                      </ComponentDemo>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Badge Speciali
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComponentDemo
                      componentName="FeaturedBadge"
                      description="Badge per evidenziare item in evidenza."
                    >
                      <FeaturedBadge />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="NewBadge"
                      description="Badge per elementi nuovi."
                    >
                      <NewBadge />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="VerifiedBadge"
                      description="Badge verifica."
                    >
                      <VerifiedBadge />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="RatingBadge"
                      description="Badge con valutazione numerica."
                      propsSchema={[
                        { name: "rating", type: "number", required: true },
                      ]}
                    >
                      <RatingBadge rating={4.5} />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="PremiumBadge"
                      description="Badge premium."
                    >
                      <PremiumBadge />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="UrgentBadge"
                      description="Badge urgenza."
                    >
                      <UrgentBadge />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="DiscountBadge"
                      description="Badge sconto con percentuale."
                      propsSchema={[
                        { name: "discount", type: "number", required: true },
                      ]}
                    >
                      <DiscountBadge discount={20} />
                    </ComponentDemo>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "icons":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Icone SVG
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Icone Navigazione
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    <div className="text-center">
                      <HomeIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Home</p>
                    </div>
                    <div className="text-center">
                      <SearchIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Search</p>
                    </div>
                    <div className="text-center">
                      <AccountIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Account</p>
                    </div>
                    <div className="text-center">
                      <HeartIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Heart</p>
                    </div>
                    <div className="text-center">
                      <FiltersIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Filters</p>
                    </div>
                    <div className="text-center">
                      <ListIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">List</p>
                    </div>
                    <div className="text-center">
                      <MailBoxIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Mail</p>
                    </div>
                    <div className="text-center">
                      <LogoutIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Logout</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Icone Funzionali
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    <div className="text-center">
                      <ArrowIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Arrow</p>
                    </div>
                    <div className="text-center">
                      <CloseIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Close</p>
                    </div>
                    <div className="text-center">
                      <PositionIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Position</p>
                    </div>
                    <div className="text-center">
                      <PeopleIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">People</p>
                    </div>
                    <div className="text-center">
                      <Stars className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Stars</p>
                    </div>
                    <div className="text-center">
                      <WifiIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Wifi</p>
                    </div>
                    <div className="text-center">
                      <TemperatureIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Temperature</p>
                    </div>
                    <div className="text-center">
                      <UpLoadIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Upload</p>
                    </div>
                    <div className="text-center">
                      <MoonIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Moon</p>
                    </div>
                    <div className="text-center">
                      <MenuArrow className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Menu Arrow</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Icone Social
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <FacebookIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Facebook</p>
                    </div>
                    <div className="text-center">
                      <InstagramIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Instagram</p>
                    </div>
                    <div className="text-center">
                      <XIcon className="w-8 h-8 text-[#228E8D] mx-auto mb-2" />
                      <p className="text-xs text-gray-600">X</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Skeleton
                  </h3>

                  <div className="text-center border-2 border-[#228E8D] rounded-xl overflow-hidden w-full h-36">
                    <ImgSkeleton className=" text-[#228E8D] mx-auto mb-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "charts":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Componenti Grafici
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Statistiche
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComponentDemo
                      componentName="StatsCard"
                      description="Card statistica con icona e valore."
                      propsSchema={[
                        { name: "title", type: "string", required: true },
                        {
                          name: "value",
                          type: "string|number",
                          required: true,
                        },
                        {
                          name: "icon",
                          type: "IconDefinition|ReactNode",
                          required: false,
                        },
                      ]}
                    >
                      <StatsCard
                        title="Appartamenti"
                        value="1200"
                        icon={faHome}
                      />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="StatsCard"
                      description="Card statistica."
                    >
                      <StatsCard
                        title="Utenti Attivi"
                        value="5678"
                        icon={faUser}
                      />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="StatsCard"
                      description="Card statistica."
                    >
                      <StatsCard
                        title="Prenotazioni"
                        value="890"
                        icon={faBook}
                      />
                    </ComponentDemo>
                    <ComponentDemo
                      componentName="StatsCard"
                      description="Card statistica."
                    >
                      <StatsCard title="Ricavi" value="45678" icon={faEuro} />
                    </ComponentDemo>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Grafici
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ComponentDemo
                      componentName="BarChartComponent"
                      description="Grafico a barre semplice."
                      propsSchema={[
                        {
                          name: "data",
                          type: "{[key:string]:number}[]",
                          required: true,
                        },
                        { name: "dataKey", type: "string", required: true },
                        {
                          name: "height",
                          type: "number",
                          required: false,
                          default: "200",
                        },
                        { name: "title", type: "string", required: false },
                      ]}
                    >
                      <div className="bg-white rounded-lg p-6 shadow-lg">
                        <BarChartComponent
                          title="Grafico a Barre"
                          dataKey="value"
                          data={[
                            { value: 400 },
                            { value: 300 },
                            { value: 200 },
                            { value: 500 },
                          ]}
                          height={200}
                        />
                      </div>
                    </ComponentDemo>

                    <ComponentDemo
                      componentName="PieChartComponent"
                      description="Grafico a torta con categorie."
                      propsSchema={[
                        {
                          name: "data",
                          type: "{nome:string,count:number}[]",
                          required: true,
                        },
                        {
                          name: "height",
                          type: "number",
                          required: false,
                          default: "200",
                        },
                        { name: "title", type: "string", required: false },
                      ]}
                    >
                      <div className="bg-white rounded-lg p-6 shadow-lg">
                        <PieChartComponent
                          title="Grafico a Torta"
                          data={[
                            { nome: "Roma", count: 20 },
                            { nome: "Milano", count: 30 },
                            { nome: "Napoli", count: 15 },
                            { nome: "Altri", count: 10 },
                          ]}
                          height={200}
                        />
                      </div>
                    </ComponentDemo>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "maps":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Componenti Mappa
              </h2>

              <div className="space-y-8">
                <div className="relative mb-10 w-full">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Mappa Google
                  </h3>
                  <ComponentDemo
                    componentName="GoogleMapComponent"
                    description="Wrapper mappa Google con marker e controlli (richiede chiave API)."
                    propsSchema={[]}
                  >
                    <div className="h-96">
                      <GoogleMapComponent />
                    </div>
                  </ComponentDemo>
                </div>
              </div>
            </div>
          </div>
        );

      case "animations":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Animazioni e Transizioni
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Animazioni CSS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(animations).map(([name, classes]) => (
                      <div
                        key={name}
                        className="bg-white rounded-lg p-6 shadow-lg text-center"
                      >
                        <div
                          className={`w-16 h-16 bg-[#228E8D] rounded-lg mx-auto mb-4 ${classes}`}
                        ></div>
                        <h4 className="font-semibold text-gray-800">{name}</h4>
                        <code className="text-xs text-gray-500 font-mono">
                          {classes}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Transizioni Tailwind
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <h4 className="font-semibold mb-2">Timing Functions</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#228E8D] rounded-lg mx-auto mb-2 transition-all duration-300 ease-linear hover:scale-110"></div>
                          <p className="text-xs text-gray-600">ease-linear</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#228E8D] rounded-lg mx-auto mb-2 transition-all duration-300 ease-in-out hover:scale-110"></div>
                          <p className="text-xs text-gray-600">ease-in-out</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#228E8D] rounded-lg mx-auto mb-2 transition-all duration-300 ease-in hover:scale-110"></div>
                          <p className="text-xs text-gray-600">ease-in</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#228E8D] rounded-lg mx-auto mb-2 transition-all duration-300 ease-out hover:scale-110"></div>
                          <p className="text-xs text-gray-600">ease-out</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "responsive":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Design Responsive
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Breakpoints
                  </h3>
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(breakpoints).map(([name, value]) => (
                        <div
                          key={name}
                          className="text-center p-4 bg-gray-50 rounded-lg"
                        >
                          <h4 className="font-semibold text-gray-800">
                            {name}
                          </h4>
                          <p className="text-sm text-gray-600">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Sistema Spaziature
                  </h3>
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="space-y-4">
                      {Object.entries(spacing).map(([name, value]) => (
                        <div key={name} className="flex items-center gap-4">
                          <div
                            className="bg-[#228E8D] rounded"
                            style={{ width: value, height: "20px" }}
                          ></div>
                          <div>
                            <span className="font-semibold text-gray-800">
                              {name}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Container Responsivi
                  </h3>
                  <div className="space-y-4">
                    <GreenContainer>
                      <p className="text-white">Green Container - Responsive</p>
                    </GreenContainer>
                    <WhiteContainer>
                      <p className="text-gray-700">
                        White Container - Responsive
                      </p>
                    </WhiteContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "architecture":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Architettura del Progetto
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Principi Architetturali
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        🏗️ Clean Architecture
                      </h4>
                      <p className="text-sm text-gray-600">
                        Separazione delle responsabilità in layer distinti: UI,
                        Business Logic, Data Access.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        🔧 SOLID Principles
                      </h4>
                      <p className="text-sm text-gray-600">
                        Single Responsibility, Open/Closed, Liskov Substitution,
                        Interface Segregation, Dependency Inversion.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        ♻️ DRY Principle
                      </h4>
                      <p className="text-sm text-gray-600">
                        Don't Repeat Yourself - Riutilizzo massimo di componenti
                        e logica.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Struttura Cartelle
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm">
                    <pre>{`src/
├── app/                 # Bootstrap, routing, providers, config, store
│   ├── routes/          # Route definitions
│   ├── providers/       # App-level providers
│   ├── config/          # App config
│   └── store/           # Redux store + slices
├── core/              # Logica pura (policy, value objects)
│   ├── policies/
│   ├── services/
│   ├── valueObjects/
│   └── ports/
├── application/         # Use cases, DTO, mappers
│   ├── useCases/
│   ├── dto/
│   └── mappers/
├── infrastructure/      # Implementazioni concrete
│   ├── firebase/
│   └── http/
├── ui/                  # React UI
│   ├── pages/
│   ├── components/
│   │   ├── common/
│   │   ├── sections/
│   │   └── layouts/
│   ├── hooks/
│   ├── helpers/
│   └── data/
└── shared/              # Shared constants/types
    ├── constants/
    └── types/`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Tecnologie Utilizzate
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Frontend
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• React 18 - Framework JavaScript</li>
                        <li>• Vite - Build tool moderno</li>
                        <li>• Tailwind CSS - Framework CSS</li>
                        <li>• React Router - Routing</li>
                        <li>• Redux Toolkit - State management</li>
                        <li>• Clerk - Autenticazione</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Backend & Database
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Firebase - Backend-as-a-Service</li>
                        <li>• Firestore - Database NoSQL</li>
                        <li>• Firebase Storage - File storage</li>
                        <li>• Firebase Functions - Serverless</li>
                        <li>• Google Maps API - Geolocalizzazione</li>
                        <li>• Sonner - Notifiche toast</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Pattern di Design
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Component Composition
                      </h4>
                      <p className="text-sm text-gray-600">
                        Composizione di componenti piccoli e focalizzati
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Custom Hooks
                      </h4>
                      <p className="text-sm text-gray-600">
                        Logica di business estratta in hook riutilizzabili
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Props-based Communication
                      </h4>
                      <p className="text-sm text-gray-600">
                        Comunicazione tramite props ben definite
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Lazy Loading
                      </h4>
                      <p className="text-sm text-gray-600">
                        Caricamento lazy delle pagine e componenti
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Error Boundaries
                      </h4>
                      <p className="text-sm text-gray-600">
                        Gestione errori con boundary components
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Memoization
                      </h4>
                      <p className="text-sm text-gray-600">
                        Ottimizzazione performance con React.memo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Sezione non trovata</div>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Debug - UniStays Design System</title>
        <meta
          name="description"
          content="Pagina debug con tutti i componenti e le caratteristiche di design di UniStays"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  UniStays Debug
                </h1>
                <span className="ml-3 px-3 py-1 bg-[#228E8D] text-white text-sm font-medium rounded-full">
                  Design System
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Sezioni
                </h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-[#228E8D] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={section.icon}
                        className="text-lg"
                      />

                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-lg p-8">
                {renderSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DebugPage;
