import React from "react";
import { Link } from "react-router-dom";
import HomeIcon from "@/ui/components/common/shared/icons/HomeIcon";
import SearchIcon from "@/ui/components/common/shared/icons/SearchIcon";
import ButtonDropDown from "@/ui/components/common/buttons/buttonDropDown/ButtonDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faSearch } from "@fortawesome/free-solid-svg-icons";
import SectionHeader from "../SectionHeader";
import InfoCard from "@/ui/components/common/cards/InfoCard";
import OneTimeMessage from "@/ui/components/common/messages/OneTimeMessage";

/**
 * Componente per lo stato vuoto della pagina preferiti
 * @param {Object} props
 * @param {Function} props.onSearch - Callback per la ricerca
 * @param {string} props.selectedCity - Città selezionata
 * @param {string} props.title - Titolo personalizzabile
 * @param {string} props.description - Descrizione personalizzabile
 * @param {string} props.homeButtonText - Testo del bottone home
 * @param {string} props.searchButtonText - Testo del bottone ricerca
 */
export default function FavoritesEmptyState({
  onSearch,
  title = "Nessun annuncio nei preferiti",
  oneTimeMessage,
  homeButtonText = "Torna alla home",
  searchButtonText = "",
  className = "",
}) {
  return (
    <div className={`relative bg-transparent min-h-screen ${className}`}>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#228E8D]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-[#62C1BA]/5 to-transparent rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Icon Container */}
        <SectionHeader
          title={title}
          icon={faHeart}
          badgeText={"I tuoi preferiti"}
        />

        <OneTimeMessage
          message={oneTimeMessage}
          title={"Suggerimento"}
          localStorageKey={"howToUseFavouritesPage-tip"}
        />

        {/* Main Content */}
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <InfoCard
              title="Salva i tuoi preferiti"
              description="Clicca sull'icona del cuore negli annunci che ti piacciono per aggiungerli ai preferiti."
              icon={
                <FontAwesomeIcon
                  icon={faHeart}
                  className="w-6 h-6 text-[#228E8D]"
                />
              }
            />

            <InfoCard
              title="Confronta facilmente"
              description="Visualizza tutti i tuoi preferiti in un unico posto per confrontarli e scegliere il migliore."
              icon={
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-6 h-6 text-[#228E8D]"
                />
              }
            />

            <InfoCard
              title="Torna alla home"
              description="Esplora tutti gli annunci disponibili e trova la tua casa
                ideale."
              icon={<HomeIcon className="w-6 h-6 text-[#228E8D]" />}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-[10px] bg-[#228E8D] text-white rounded-xl font-medium "
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                {homeButtonText}
              </Link>

              <span className="text-gray-500 font-medium">oppure</span>
              <div className="flex items-center gap-4">
                <ButtonDropDown />
                <button
                  onClick={onSearch}
                  className="font-medium text-lg p-2 bg-[#228E8D] text-white rounded-full flex items-center hover:scale-105 transition-all duration-300"
                  ariaLabel="Cerca risultati"
                >
                  <SearchIcon className="w-5 h-5" />
                  {searchButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
