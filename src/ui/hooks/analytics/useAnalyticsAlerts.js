import { useMemo } from "react";
import { APARTMENT_STATUS } from "@/shared/types";

const HOURS_24_IN_MS = 24 * 60 * 60 * 1000;
export const ALERT_TYPES = {
  WARNING: "warning",
  INFO: "info",
  SUCCESS: "success",
  ERROR: "error",
};

const toDateOrNull = (value) => {
  if (!value) return null;
  if (value?.toDate) {
    const date = value.toDate();
    return Number.isNaN(date?.getTime?.()) ? null : date;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatLikeDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCount = (count) => (count === 1 ? "1 annuncio" : `${count} annunci`);

export const useAnalyticsAlerts = ({ apartments = [], receivedLikes = [] }) => {
  const alerts = useMemo(() => {
    const safeApartments = Array.isArray(apartments) ? apartments : [];
    const safeLikes = Array.isArray(receivedLikes) ? receivedLikes : [];

    if (!safeApartments.length && !safeLikes.length) return [];

    const counts = {
      unreviewed: 0,
      noImages: 0,
      noTitle: 0,
      noDescription: 0,
      shortDescription: 0,
      noPrice: 0,
      noCity: 0,
      noAvailability: 0,
      zeroViews: 0,
      lowRating: 0,
    };

    const minDescriptionLength = 60;
    const toNumber = (value) =>
      typeof value === "number" && Number.isFinite(value) ? value : 0;
    const resolveCity = (annuncio) => {
      const city =
        annuncio?.address?.city || annuncio?.address?.area || annuncio?.city;
      return typeof city === "string" ? city.trim() : "";
    };
    const countImages = (annuncio) => annuncio?.apartmentPhotoUrls?.length ?? 0;

    safeApartments.forEach((annuncio) => {
      if (annuncio?.status !== APARTMENT_STATUS.PUBLISHED) {
        counts.unreviewed += 1;
      }
      if (countImages(annuncio) === 0) counts.noImages += 1;

      const title =
        typeof annuncio?.title === "string" ? annuncio.title.trim() : "";
      if (!title) counts.noTitle += 1;

      const description =
        typeof annuncio?.description === "string"
          ? annuncio.description.trim()
          : "";
      if (!description) counts.noDescription += 1;
      else if (description.length < minDescriptionLength) {
        counts.shortDescription += 1;
      }

      const priceValue = Number(annuncio?.aggregates?.minRoomPrice);
      if (!Number.isFinite(priceValue) || priceValue <= 0) counts.noPrice += 1;

      if (!resolveCity(annuncio)) counts.noCity += 1;

      const availableRooms = annuncio?.aggregates?.totalRoomsAvailable;
      if (Number.isFinite(availableRooms) && availableRooms <= 0) {
        counts.noAvailability += 1;
      }

      const totalViews = toNumber(
        annuncio?.metrics?.totalViews ?? annuncio?.totalViews
      );
      if (totalViews === 0) counts.zeroViews += 1;

      const ratingAvg = toNumber(
        annuncio?.metrics?.ratingAvg ?? annuncio?.ratingAvg
      );
      const ratingCount = toNumber(
        annuncio?.metrics?.ratingCount ??
          annuncio?.metrics?.reviewsCount ??
          annuncio?.reviewsCount
      );
      if (ratingCount > 0 && ratingAvg > 0 && ratingAvg < 3.5) {
        counts.lowRating += 1;
      }
    });

    const messages = [];
    if (counts.unreviewed > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.unreviewed
        )} in attesa di revisione: non sono ancora visibili nei risultati.`,
        type: ALERT_TYPES.INFO}
      );
    }
    if (counts.noImages > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.noImages
        )} senza foto: aggiungi immagini per aumentare le richieste.`,
        type: ALERT_TYPES.WARNING}
      );
    }
    if (counts.noTitle > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.noTitle
        )} senza titolo: completa il titolo per essere trovato più facilmente.`,
        type: ALERT_TYPES.WARNING}
      );
    }
    if (counts.noDescription > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.noDescription
        )} senza descrizione: aggiungi dettagli su stanze e servizi.`,
        type: ALERT_TYPES.WARNING}
      );
    }
    if (counts.shortDescription > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.shortDescription
        )} con descrizione troppo breve: aggiungi informazioni utili.`,
        type: ALERT_TYPES.WARNING}
      );
    }
    if (counts.noPrice > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.noPrice
        )} senza prezzo valido: aggiorna il canone mensile.`,
        type: ALERT_TYPES.ERROR}
      );
    }
    if (counts.noCity > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.noCity
        )} senza città: completa la posizione per comparire nelle ricerche.`,
        type: ALERT_TYPES.ERROR}
      );
    }
    if (counts.noAvailability > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.noAvailability
        )} con 0 stanze disponibili: verifica la disponibilita o rendi l'annuncio non disponibile.`,
        type: ALERT_TYPES.ERROR}
      );
    }
    if (counts.zeroViews > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.zeroViews
        )} con 0 visualizzazioni: rivedi titolo e foto per aumentare il traffico.`,
        type: ALERT_TYPES.INFO}
      );
    }
    if (counts.lowRating > 0) {
      messages.push(
        {message: `Hai ${formatCount(
          counts.lowRating
        )} con rating medio sotto 3.5: migliora la qualità e rispondi alle recensioni.`,
        type: ALERT_TYPES.WARNING}
      );
    }

    const likesWithDate = safeLikes
      .map((item) => ({
        ...item,
        likedAtDate: toDateOrNull(item?.likedAt),
      }))
      .sort((a, b) => {
        const dateA = a?.likedAtDate?.getTime?.() || 0;
        const dateB = b?.likedAtDate?.getTime?.() || 0;
        return dateB - dateA;
      });

    if (likesWithDate.length > 0) {
      const latestLike = likesWithDate[0];
      const likedBy =
        typeof latestLike?.likedByDisplayName === "string" &&
        latestLike.likedByDisplayName.trim()
          ? latestLike.likedByDisplayName.trim()
          : "Uno studente";
      const apartmentTitle =
        typeof latestLike?.apartmentTitle === "string" &&
        latestLike.apartmentTitle.trim()
          ? latestLike.apartmentTitle.trim()
          : "un tuo annuncio";
      const latestLikeDateLabel = formatLikeDate(latestLike.likedAtDate);
      messages.unshift(
        {message: `Ultimo like ricevuto: ${likedBy} ha messo like a "${apartmentTitle}"${
          latestLikeDateLabel ? ` il ${latestLikeDateLabel}` : ""
        }.`,
        type: ALERT_TYPES.SUCCESS}
      );

      const nowMs = Date.now();
      const likesIn24h = likesWithDate.filter((entry) => {
        const likedAtMs = entry?.likedAtDate?.getTime?.() || 0;
        return likedAtMs > 0 && nowMs - likedAtMs <= HOURS_24_IN_MS;
      }).length;

      if (likesIn24h > 1) {
        messages.unshift({message: `Hai ricevuto ${likesIn24h} like nelle ultime 24 ore.`, type: ALERT_TYPES.SUCCESS});
      }
    }

    return messages.slice(0, 6);
  }, [apartments, receivedLikes]);

  return alerts;
};
