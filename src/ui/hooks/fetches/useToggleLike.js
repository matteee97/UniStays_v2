import { toast } from "sonner";
import { FirestoreFavoritesRepository } from "@/infrastructure/firebase/repositories/FirestoreFavoritesRepository";

const useToggleLike = (userID, apartmentId, title) => {
  const toggle = async (liked, setLiked) => {
    if (!userID) {
      toast.warning(
        "Devi prima effettuare l'accesso per aggiungere ai preferiti."
      );
      return;
    }

    try {
      if (liked) {
        await FirestoreFavoritesRepository.removeFavorite(userID, apartmentId);
      } else {
        await FirestoreFavoritesRepository.addFavorite(userID, apartmentId);
      }

      setLiked(!liked);
      toast.success(
        `${title} ${liked ? "rimosso dai" : "aggiunto ai"} preferiti.`
      );
    } catch (err) {
      console.error("Errore aggiornamento like:", err);
      toast.error("Errore durante l'aggiornamento del preferito: " + err.message);
    }
  };

  return toggle;
};

export default useToggleLike;
