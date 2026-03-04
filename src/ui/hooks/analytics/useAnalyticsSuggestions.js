import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { SUGGESTION_KEYS, VIEWS_THRESHOLDS } from "@/ui/helpers/analyticsConstants";
import { NOTIFICATION_TYPES, STORAGE_KEYS } from "@/shared/types";

const getStoredSuggestion = (key) => {
  try {
    return localStorage.getItem(`${STORAGE_KEYS.SUGGESTIONS}_${key}`);
  } catch (error) {
    return null;
  }
};

const setStoredSuggestion = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.SUGGESTIONS}_${key}`, value);
  } catch (error) {
    // Fallback silenzioso se localStorage non è disponibile
  }
};

const clearStoredSuggestion = (key) => {
  try {
    localStorage.removeItem(`suggestion_${key}`);
  } catch (error) {
    // Fallback silenzioso
  }
};

// Controlla se è passato abbastanza tempo dall'ultimo suggerimento
const canShowSuggestion = (key) => {
  const lastShown = getStoredSuggestion(key);
  if (!lastShown) return true;
  
  const lastShownDate = new Date(lastShown);
  const now = new Date();
  const hoursSinceLastShown = (now - lastShownDate) / (1000 * 60 * 60);
  
  // Mostra di nuovo solo se sono passate almeno 24 ore
  return hoursSinceLastShown >= 24;
};

// Funzione per generare un hash unico basato sui dati
const generateSuggestionHash = (suggestionData) => {
  const { totalAnnunci, mediaPerAnnuncio, cityStats, viewTrend } =
    suggestionData;
  
  // Crea un hash basato sui valori chiave che determinano il suggerimento
  const hashData = {
    totalAnnunci,
    mediaPerAnnuncio: Math.round(mediaPerAnnuncio),
    cityCount: cityStats?.length || 0,
    trendLength: viewTrend?.length || 0,
    hasRecentData: viewTrend?.length > 7
  };
  
  return JSON.stringify(hashData);
};

export const useAnalyticsSuggestions = ({
  totalAnnunci,
  mediaPerAnnuncio,
  cityStats,
  viewTrend,
}) => {
    const lastHashRef = useRef(null);
    const hasShownSuggestionsRef = useRef(false);


    useEffect(() => {
    if (!totalAnnunci || !mediaPerAnnuncio || !cityStats || !viewTrend) return;

    // Genera hash dei dati attuali
    const currentHash = generateSuggestionHash({
      totalAnnunci,
      mediaPerAnnuncio,
      cityStats,
      viewTrend,
    });

    // Se l'hash è lo stesso dell'ultima volta e abbiamo già mostrato suggerimenti, non fare nulla
    if (lastHashRef.current === currentHash && hasShownSuggestionsRef.current) {
      return;
    }

    // Aggiorna l'hash corrente
    lastHashRef.current = currentHash;
    hasShownSuggestionsRef.current = true;

    const suggestions = [];

    // Suggerimento per utenti senza annunci
    if (totalAnnunci === 0) {
      const key = SUGGESTION_KEYS.NO_ANNUNCI;
      if (canShowSuggestion(key)) {
        suggestions.push({
          key,
          message: "Inizia subito! Pubblica il tuo primo annuncio per vedere le statistiche in tempo reale.",
          type: NOTIFICATION_TYPES.INFO
        });
      }
    }

    // Suggerimento per visualizzazioni basse
    if (totalAnnunci > 0 && mediaPerAnnuncio < VIEWS_THRESHOLDS.LOW) {
      const key = SUGGESTION_KEYS.LOW_VIEWS;
      if (canShowSuggestion(key)) {
        suggestions.push({
          key,
          message: "Le tue visualizzazioni sono basse. Prova a dare più visibilità ai tuoi annunci tramite descrizioni dettagliate!",
          type: NOTIFICATION_TYPES.WARNING
        });
      }
    }

    // Suggerimento per visualizzazioni alte
    if (mediaPerAnnuncio > VIEWS_THRESHOLDS.HIGH) {
      const key = SUGGESTION_KEYS.HIGH_VIEWS;
      if (canShowSuggestion(key)) {
        suggestions.push({
          key,
          message: "Ottimo lavoro! I tuoi annunci stanno performando molto bene. Considera di pubblicarne altri!",
          type: NOTIFICATION_TYPES.SUCCESS
        });
      }
    }

    // Suggerimento per concentrazione in una sola città
    if (cityStats.length === 1) {
      const key = SUGGESTION_KEYS.SINGLE_CITY;
      if (canShowSuggestion(key)) {
        suggestions.push({
          key,
          message: `Tutti i tuoi annunci sono a ${cityStats[0].city}. Considera di espanderti in altre città per raggiungere più studenti!`,
          type: NOTIFICATION_TYPES.INFO
        });
      }
    }

    // Suggerimento per presenza in multiple città
    if (cityStats.length > 3) {
      const key = SUGGESTION_KEYS.MULTIPLE_CITIES;
      if (canShowSuggestion(key)) {
        suggestions.push({
          key,
          message: "Ottima diversificazione geografica! Stai raggiungendo studenti in diverse città.",
          type: NOTIFICATION_TYPES.SUCCESS
        });
      }
    }

    // Analisi del trend delle visualizzazioni
    if (viewTrend.length > 7) {
      const recent = viewTrend.slice(-7);
      const older = viewTrend.slice(-14, -7);
      
      const recentAvg = recent.reduce((sum, item) => sum + item.views, 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + item.views, 0) / older.length;
      
      if (recentAvg < olderAvg * VIEWS_THRESHOLDS.TREND_DECLINE) {
        const key = SUGGESTION_KEYS.DECLINING_TREND;
        if (canShowSuggestion(key)) {
          suggestions.push({
            key,
            message: "Le visualizzazioni stanno diminuendo. Prova ad aggiornare le foto o i prezzi dei tuoi annunci!",
            type: NOTIFICATION_TYPES.WARNING
          });
        }
      } else if (recentAvg > olderAvg * VIEWS_THRESHOLDS.TREND_IMPROVE) {
        const key = SUGGESTION_KEYS.IMPROVING_TREND;
        if (canShowSuggestion(key)) {
          suggestions.push({
            key,
            message: "Le visualizzazioni stanno aumentando! Continua così con le tue strategie di marketing.",
            type: NOTIFICATION_TYPES.SUCCESS
          });
        }
      }
    }

    // Suggerimento per pattern stagionali
    if (viewTrend.length > 30) {
      const key = SUGGESTION_KEYS.SEASONAL_PATTERN;
      if (canShowSuggestion(key)) {
        suggestions.push({
          key,
          message: "Monitora i pattern stagionali nelle tue visualizzazioni per ottimizzare i prezzi nei periodi di alta domanda.",
          type: NOTIFICATION_TYPES.INFO
        });
      }
    }

    // Mostra i suggerimenti con un delay per evitare spam
    if (suggestions.length > 0) {
      // Limita a massimo 2 suggerimenti per sessione
      const limitedSuggestions = suggestions.slice(0, 2);
      
      limitedSuggestions.forEach((suggestion, index) => {
        setTimeout(() => {
          // Salva immediatamente che il suggerimento è stato mostrato
          setStoredSuggestion(suggestion.key, new Date().toISOString());
          
          toast[suggestion.type](suggestion.message, {
            duration: 6000
          });
        }, (index + 1) * 3000); // 3 secondi di delay tra ogni suggerimento
      });
    }

  }, [
    totalAnnunci,
    mediaPerAnnuncio,
    cityStats,
    viewTrend,
  ]);

  // Funzione per resettare tutti i suggerimenti
  const resetAllSuggestions = () => {
    Object.values(SUGGESTION_KEYS).forEach(key => {
      clearStoredSuggestion(key);
    });
    // Reset anche i ref per permettere nuovi suggerimenti
    lastHashRef.current = null;
    hasShownSuggestionsRef.current = false;
  };

  // Funzione per forzare la visualizzazione di un suggerimento specifico
  const forceShowSuggestion = (suggestionKey, message, type = "info") => {
    toast[type](message, {
      duration: 6000,
      onDismiss: () => {
        setStoredSuggestion(suggestionKey, new Date().toISOString());
      }
    });
  };

  return { resetAllSuggestions, forceShowSuggestion };
};
