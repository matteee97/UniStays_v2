import { formatDate } from "@/ui/helpers/formatDate";

export default function useBookingMessage(app, startDate, roomLabel) {
  const createMessage = () => {
    const sito = window.location.hostname;
    const numeroProprietario = app?.owner?.phone;
    const formattedDate = startDate
      ? formatDate(startDate, "it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";
    const targetRoom = roomLabel || "una stanza";
    return {
      numero: numeroProprietario,
      url: `https://wa.me/${numeroProprietario}?text=${encodeURIComponent(
        `Ciao! Ho trovato il tuo annuncio su https://${sito} riguardo l'alloggio "${app?.title}". Volevo chiederti se e' disponibile per ${targetRoom} a partire dal ${formattedDate}. Grazie mille!`
      )}`,
    };
  };

  return createMessage;
}
