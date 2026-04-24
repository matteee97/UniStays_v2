import { useEffect, useState } from "react";
import { isValidFirestoreId } from "@/ui/helpers/validation";
import { FirestoreRoomRepository } from "@/infrastructure/firebase/repositories/FirestoreRoomRepository";

export function useFetchApartmentRooms(apartmentId, enabled = true) {
  const validApartmentId = isValidFirestoreId(apartmentId)
    ? apartmentId
    : null;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!validApartmentId || !enabled) {
      setRooms([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    FirestoreRoomRepository.listByApartmentId(validApartmentId)
      .then((roomsData) => {
        if (cancelled) return;
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Errore nel fetch delle stanze:", error);
        setRooms([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [validApartmentId, enabled]);

  return { rooms, loading };
}
