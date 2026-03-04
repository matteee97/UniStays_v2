import { useState } from "react";
import GoogleMapComponent from "@/ui/components/common/mapComponents/GoogleMapComponent";
import InfoToggle from "@/ui/components/common/indicators/InfoToggle";
import DotazioniList from "./DotazioniList";
import CaratteristicheList from "./CaratteristicheList";
import RulesSection from "./RulesSection";
import RoomPreviewSection from "./RoomPreviewSection";
import { InfoSectionCard, InfoSectionHeader } from "./InfoSection";
import { Link } from "react-router-dom";
import ArrowIcon from "@/ui/components/common/shared/icons/ArrowIcon.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { USER_ROLES } from "@/shared/types";

export default function ApartmentInfo({ app }) {
  const [fullDescription, setFullDescription] = useState(false);
  const [showAllDotazioni, setShowAllDotazioni] = useState(false);

  const caratteristiche = app?.features || {};
  const aggregates = app?.aggregates || {};
  const host = app?.owner || app?.ownerSnapshot || {};
  const ownerId = host?.ownerId;
  const img_profilo = host?.photoUrl;
  const isAgency = host?.isAgency || host?.roleBadge === "agency";
  const rooms = app?.rooms || [];
  const additionalInfo = app?.additionalInfo;

  const postiDisponibiliLabel = Number.isFinite(aggregates.totalRoomsAvailable)
    ? `Disponibilita per ${aggregates.totalRoomsAvailable} stanz${
        aggregates.totalRoomsAvailable > 1 ? "e" : "a"
      }`
    : "Disponibilità su richiesta";

  const quickStats = [
    {
      label: "Camere",
      value: aggregates.totalRooms ?? "-",
      helper: aggregates.totalRooms > 1 ? "Camere totali" : "Camera totale",
    },
    {
      label: "Bagni",
      value: caratteristiche.bathroomsCount ?? "-",
      helper:
        caratteristiche.bathroomsCount > 1
          ? "Bagni disponibili"
          : "Bagno privato",
    },
    {
      label: "Superficie",
      value: caratteristiche.totalAreaMq
        ? `${caratteristiche.totalAreaMq} m²`
        : "-",
      helper: "Spazio abitabile",
    },
    {
      label: "Stanze disponibili",
      value: aggregates.totalRoomsAvailable ?? "-",
      helper: postiDisponibiliLabel,
    },
  ];

  return (
    <>
      <div className="md:col-span-2 space-y-6 sm:ml-3">
        <InfoSectionCard variant="muted">
          <InfoSectionHeader
            className="flex-wrap"
            title={
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                  Panoramica
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  Dati essenziali dell’alloggio
                </p>
              </div>
            }
            badge={
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-[#228E8D] bg-[#228E8D]/10 rounded-full border border-[#228E8D]/20">
                <span className="h-2 w-2 rounded-full bg-[#228E8D] animate-pulse"></span>
                {postiDisponibiliLabel}
              </span>
            }
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.helper}</p>
              </div>
            ))}
          </div>
        </InfoSectionCard>

        <InfoSectionCard variant="gradient">
          <InfoSectionHeader
            title={
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faInfo}
                  className="text-[#228E8D] w-4 h-4 rounded-full p-2 border-2 border-[#228E8D]/20"
                />
                <div>
                  <p className="text-xs font-semibold text-[#228E8D] uppercase tracking-[0.08em]">
                    Informazioni sull’alloggio
                  </p>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Vivi gli spazi come li ha descritti l’host
                  </h2>
                </div>
              </div>
            }
          />
          <pre
            className={
              (fullDescription ? "" : "line-clamp-5") +
              " whitespace-pre-line text-sm text-gray-600 text-muted-foreground mt-5 leading-relaxed"
            }
          >
            {app?.description || "Descrizione non presente"}
          </pre>
          <button
            type="button"
            onClick={() => setFullDescription(!fullDescription)}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#228E8D] hover:text-[#1b6f6e] transition-colors"
          >
            {fullDescription ? "Mostra meno" : "Leggi di più"}
            <span
              className={`transition-transform ${
                fullDescription ? "rotate-0" : "rotate-180"
              }`}
            >
              <ArrowIcon className="w-4 h-4 rotate-180" />
            </span>
          </button>
        </InfoSectionCard>

        <InfoSectionCard
          as={Link}
          to={ownerId ? `/host/${ownerId}` : "#"}
          className="flex items-center gap-4"
        >
          {img_profilo ? (
            <img
              src={img_profilo}
              alt="immagine profilo proprietario/agenzia"
              className="w-14 h-14 rounded-full border-2 border-[#228E8D] object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#228E8D]/10 border-2 border-[#228E8D]/30 flex items-center justify-center text-lg font-semibold text-[#228E8D]">
              {host?.displayName?.[0]?.toUpperCase() || "H"}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
              {isAgency ? "Agenzia" : "Host"}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {host?.displayName || "Informazioni non presenti"}
            </p>
            <p className="text-xs text-gray-400">
              Contatta l’{USER_ROLES.HOST} per dettagli su visite, contratti e
              disponibilità.
            </p>
          </div>
        </InfoSectionCard>

        <InfoSectionCard id="section-dotazioni">
          <InfoSectionHeader
            className="mb-3"
            title="Dotazioni"
            badge="Comfort inclusi"
          />
          <DotazioniList
            app={app.amenities}
            showAllDotazioni={showAllDotazioni}
            setShowAllDotazioni={setShowAllDotazioni}
          />
        </InfoSectionCard>

        <InfoSectionCard id="section-caratteristiche">
          <InfoSectionHeader
            className="mb-3"
            title="Caratteristiche dell’alloggio"
            badge="Specifiche"
          />
          <CaratteristicheList caratteristiche={app.features} />
        </InfoSectionCard>

        <InfoSectionCard id="section-regole">
          <InfoSectionHeader
            className="mb-3"
            title="Regole della casa"
            badge="Cosa sapere prima di prenotare"
          />
          <RulesSection regole={app?.houseRules} />
        </InfoSectionCard>

        <RoomPreviewSection
          rooms={rooms}
          utilitiesIncluded={app?.features?.utilitiesIncluded}
        />

        <InfoSectionCard
          id="section-informazioni-aggiuntive"
          variant="gradient"
        >
          <InfoSectionHeader className="mb-3" title="Informazioni aggiuntive" />
          {additionalInfo ? (
            <pre className="whitespace-pre-line text-sm text-gray-600 text-muted-foreground leading-relaxed">
              {additionalInfo}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">
              Non sono state fornite informazioni aggiuntive.
            </p>
          )}
        </InfoSectionCard>

        <InfoSectionCard
          id="section-posizione"
          variant="bare"
          className="relative h-[300px] md:h-[500px] w-full overflow-hidden"
        >
          <GoogleMapComponent appartamenti={[app]} zoom={14} isSingle={true} />
          <InfoToggle
            title="Info mappa"
            className="absolute left-3 top-3 max-w-xs"
          >
            <ul className="list-disc list-inside space-y-1">
              <li>
                La posizione indicata è approssimata e potrebbe non
                corrispondere all'indirizzo esatto dell'alloggio.
              </li>
              <li>
                Controlla sempre di persona e confrontati con l'
                {USER_ROLES.HOST} per ottenere indicazioni precise.
              </li>
              <li>
                La piattaforma non garantisce l'accuratezza delle coordinate o
                delle distanze mostrate.
              </li>
            </ul>
          </InfoToggle>
        </InfoSectionCard>
      </div>
    </>
  );
}
