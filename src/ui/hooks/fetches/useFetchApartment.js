import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { isValidFirestoreId } from "@/ui/helpers/validation";
import {
  useApartment,
  useApartmentLiked,
  useTrackApartmentView,
} from "../apartment";
import { FirestoreRoomRepository } from "@/infrastructure/firebase/repositories/FirestoreRoomRepository";

export default function useFetchApartment(apartmentId, userID) {
  const validApartmentId = isValidFirestoreId(apartmentId)
    ? apartmentId
    : null;
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const { apartment, loading, error } = useApartment(validApartmentId);
  const ownerId = apartment?.ownerSnapshot?.ownerId || null;
  const owner = apartment?.ownerSnapshot || null;
  const { liked, setLiked } = useApartmentLiked(validApartmentId, userID);

  useTrackApartmentView(validApartmentId, !!apartment);

  useEffect(() => {
    let cancelled = false;

    if (!validApartmentId) {
      setRooms([]);
      return () => {
        cancelled = true;
      };
    }

    setRoomsLoading(true);
    FirestoreRoomRepository.listByApartmentId(validApartmentId)
      .then((data) => {
        if (cancelled) return;
        setRooms(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Errore nel fetch delle stanze:", err);
        setRooms([]);
      })
      .finally(() => {
        if (cancelled) return;
        setRoomsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [validApartmentId]);

  const app = useMemo(() => {
    if (!apartment) return null;
    return {
      ...apartment,
      rooms,
      owner,
      id: apartment.id || validApartmentId,
    };
  }, [apartment, owner, validApartmentId, rooms]);

  useEffect(() => {
    if (!validApartmentId) return;
    if (error?.code === "not-found") {
      toast.error("Appartamento non trovato.");
    }
  }, [error, validApartmentId]);

  useEffect(() => {
    if (!apartment) return;
    if (!ownerId) {
      toast.error("Proprietario non trovato.");
    }
  }, [apartment, ownerId]);

  return { app, liked, setLiked, loading: loading || roomsLoading };
}
