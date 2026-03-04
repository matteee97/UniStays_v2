import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCity } from "@/app/store/slices/citySlice";
import useCityClickTracker from "../users/useCityClickTracker";
import { STORAGE_KEYS } from "@/shared/types";

/**
 * Hook per la gestione logica del dropdown di selezione città
 * @param {Object} options - Oggetto con le seguenti proprietà:
 *   - citiesByLetter: array di oggetti con le seguenti proprietà:
 *     - letter: stringa contenente la lettera corrispondente
 *     - cities: array di oggetti contenenti le città associate alla lettera
 *   - startingWord: stringa contenente la parola iniziale del dropdown
 *   - onCitySelect: funzione da chiamare quando si seleziona una città
 *   - rememberPreferredCity: booleano per ricordare la città preferita
 *   - preferredCityKey: stringa contenente la chiave per il localStorage
 *   - syncWithRedux: booleano per sincronizzare con Redux
 * @returns {Object} - Oggetto con le seguenti proprietà:
 *   - city: stringa contenente la città selezionata o iniziale
 *   - searchTerm: stringa contenente il termine di ricerca
 *   - activeIndex: numero contenente l'indice attivo della lista di città
 *   - isDropdownOpen: booleano per stabilire se il dropdown è aperto
 *   - filteredCity: array di oggetti contenenti le città filtrate in base alla ricerca
 *   - flatCity: array di oggetti contenenti le città associate alla lettera
 *   - activeRefs: array di refs contenenti le città attive
 *   - setCity: funzione per impostare la città selezionata
 *   - setSearchTerm: funzione per impostare il termine di ricerca
 *   - setActiveIndex: funzione per impostare l'indice attivo della lista di città
 *   - setIsDropdownOpen: funzione per stabilire se il dropdown è aperto
 *   - handleCitySelect: funzione per gestire la selezione di una città
 *   - handleCityClick: funzione per gestire il click su una città
 *   - handleKeyDown: funzione per gestire la navigazione con tastiera
 *   - toggleDropdown: funzione per aprire o chiudere il dropdown
 *   - handleSearchChange: funzione per gestire il cambio della ricerca
 *   - showResults: booleano per stabilire se visualizzare i risultati
 *   - showResultsIfAvailable: funzione per aprire il dropdown se ci sono risultati
 *   - hideResults: funzione per chiudere il dropdown
 *   - clearSearch: funzione per cancellare la ricerca
 */
export const useCityLogic = ({
  citiesByLetter = [],
  startingWord = "Seleziona città",
  onCitySelect,
  rememberPreferredCity = true,
  preferredCityKey = STORAGE_KEYS.PREFERRED_CITY,
  syncWithRedux = true,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [city, setCity] = useState(startingWord);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRefs = useRef([]);
  
  const selectedCity = useSelector((state) => state.city.selectedCity);
  const { trackCityClick } = useCityClickTracker();
  const dispatch = useDispatch();

  // Reset active index quando cambia la ricerca
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  // Filtra le città in base alla search (normalizza il termine di ricerca a stringa)
  const filteredCities = useMemo(() => {
    const normalizedSearch = (typeof searchTerm === "string"
      ? searchTerm
      : String(searchTerm ?? "")
    ).toLowerCase();

    return citiesByLetter
      .map(({ letter, cities }) => {
        const filtered = cities.filter((cityObj) => {
          const cityName = cityObj.city?.toLowerCase?.() ?? String(cityObj.city ?? "").toLowerCase();
          const uniName = cityObj.university?.toLowerCase?.() ?? String(cityObj.university ?? "").toLowerCase();
          return cityName.includes(normalizedSearch) || uniName.includes(normalizedSearch);
        });
        return filtered.length > 0 ? { letter, cities: filtered } : null;
      })
      .filter(Boolean);
  }, [citiesByLetter, searchTerm]);

  const flatCities = useMemo(() => {
    return filteredCities.flatMap(({ letter, cities }) =>
      cities.map((city) => ({ city, letter }))
    );
  }, [filteredCities]);

  // Gestisce startingWord e selectedCity
  useEffect(() => {
    if (flatCities.length > 0) {
      // Se si vuole sincronizzare con Redux e c'è una città selezionata → priorità massima
      if (syncWithRedux && selectedCity) {
        setCity(selectedCity.city);

        const index = flatCities.findIndex(
          (c) => c.city.city === selectedCity.city
        );
        if (index !== -1) {
          setActiveIndex(index);
        }
      } 
      // Altrimenti, se si vuole ricordare la città preferita
      else if (rememberPreferredCity) {
        const preferredCity = localStorage.getItem(preferredCityKey);
        if (preferredCity) {
          try {
            const parsedCity = JSON.parse(preferredCity);
            const foundIndex = flatCities.findIndex(
              (c) => c.city.city === parsedCity.city
            );
            if (foundIndex !== -1) {
              setCity(parsedCity.city);
              setActiveIndex(foundIndex);
              // dispatchiamo Redux
              dispatch(setSelectedCity(parsedCity));
            }
          } catch (e) {
            // Se il parsing fallisce, rimuoviamo il valore corrotto
            localStorage.removeItem(preferredCityKey);
          }
        }
        // Se non c'è città preferita, usa startingWord
        else if (startingWord && startingWord !== "Seleziona città") {
          const foundIndex = flatCities.findIndex(
            (c) => c.city.city.toLowerCase() === startingWord.toLowerCase()
          );
          if (foundIndex !== -1) {
            const foundCity = flatCities[foundIndex].city;
            setCity(foundCity.city);
            setActiveIndex(foundIndex);
            if (syncWithRedux) {
              dispatch(setSelectedCity(foundCity));
            }
          } else {
            setCity(startingWord);
            setActiveIndex(0);
          }
        }
      }
      // Se non si vuole ricordare nulla, usa solo startingWord
      else if (startingWord && startingWord !== "Seleziona città") {
        const foundIndex = flatCities.findIndex(
          (c) => c.city.city.toLowerCase() === startingWord.toLowerCase()
        );
        if (foundIndex !== -1) {
          const foundCity = flatCities[foundIndex].city;
          setCity(foundCity.city);
          setActiveIndex(foundIndex);
          if (syncWithRedux) {
            dispatch(setSelectedCity(foundCity));
          }
        } else {
          setCity(startingWord);
          setActiveIndex(0);
        }
      }
    }
  }, [startingWord, flatCities, selectedCity, dispatch, rememberPreferredCity, preferredCityKey, syncWithRedux]);

  // Scroll automatico all'elemento attivo
  useEffect(() => {
    const currentRef = activeRefs.current[activeIndex];
    if (currentRef) {
      currentRef.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  // Reset refs quando cambiano le città
  useEffect(() => {
    activeRefs.current = [];
  }, [flatCities]);

  // Gestisce la selezione di una città
  const handleCitySelect = (selected) => {
    trackCityClick(selected.city);

    // Salva la città preferita se richiesto
    if (rememberPreferredCity) {
      localStorage.setItem(preferredCityKey, JSON.stringify(selected));
    }

    if (onCitySelect) {
      onCitySelect(selected);
    } else if (syncWithRedux) {
      dispatch(setSelectedCity(selected));
    }
  };

  // Gestisce il click su una città
  const handleCityClick = (selectedCity) => {
    setCity(selectedCity.city);
    setIsDropdownOpen(false);
    setSearchTerm("");
    handleCitySelect(selectedCity);
  };

  // Gestisce la navigazione con tastiera
  const handleKeyDown = (e) => {
    if (!filteredCities.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatCities.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === 0 ? flatCities.length - 1 : prev - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        handleCityClick(flatCities[activeIndex].city);
        break;
      case "Escape":
        setIsDropdownOpen(false);
        break;
    }
  };

  // Apre/chiude il dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Gestisce il cambio della ricerca
  const handleSearchChange = (value) => {
    // Gestisce sia eventi che valori diretti e forza stringa
    const raw = value?.target?.value ?? value ?? "";
    const searchValue = typeof raw === "string" ? raw : String(raw);
    setSearchTerm(searchValue);
  };

  // Per la ricerca (CitySearch)
  const showResults = searchTerm.trim() && flatCities.length > 0;
  const showResultsIfAvailable = () => {
    if (searchTerm.trim() && flatCities.length > 0) {
      setIsDropdownOpen(true);
    }
  };
  const hideResults = () => {
    setIsDropdownOpen(false);
  };
  const clearSearch = () => {
    setSearchTerm("");
    setActiveIndex(0);
  };

  return {
    // State
    city,
    searchTerm,
    activeIndex,
    isDropdownOpen,
    filteredCities,
    flatCities,
    activeRefs,
    
    // Actions
    setCity,
    setSearchTerm,
    setActiveIndex,
    setIsDropdownOpen,
    handleCitySelect,
    handleCityClick,
    handleKeyDown,
    toggleDropdown,
    handleSearchChange,
    
    // Per la ricerca
    showResults,
    showResultsIfAvailable,
    hideResults,
    clearSearch,
  };
};
