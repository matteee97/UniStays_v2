import { useEffect } from "react";
import {
  getDateKey,
  trackViewEvent,
} from "@/infrastructure/firebase/analytics/ApartmentAnalyticsService";
import { isValidFirestoreId } from "@/ui/helpers/validation";

const buildStorageKey = (apartmentId, dateKey) =>
  `viewed_${apartmentId}_${dateKey}`;

export function useTrackApartmentView(apartmentId, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (!apartmentId || !isValidFirestoreId(apartmentId)) return;
    if (typeof window === "undefined") return;

    const dateKey = getDateKey();
    const storageKey = buildStorageKey(apartmentId, dateKey);
    if (sessionStorage.getItem(storageKey)) return;

    let cancelled = false;

    const track = async () => {
      try {
        await trackViewEvent(apartmentId, dateKey);
        if (!cancelled) {
          sessionStorage.setItem(storageKey, "true");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Errore nel tracciamento visualizzazione:", err);
        }
      }
    };

    track();

    return () => {
      cancelled = true;
    };
  }, [apartmentId, enabled]);
}
