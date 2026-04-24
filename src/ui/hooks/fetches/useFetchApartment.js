import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { isValidFirestoreId } from "@/ui/helpers/validation";
import {
  useApartment,
  useApartmentLiked,
  useTrackApartmentView,
} from "../apartment";

export default function useFetchApartment(apartmentId, userID) {
  const validApartmentId = isValidFirestoreId(apartmentId)
    ? apartmentId
    : null;
  const { apartment, loading, error } = useApartment(validApartmentId);
  const ownerId = apartment?.ownerSnapshot?.ownerId || null;
  const owner = apartment?.ownerSnapshot || null;
  const { liked, setLiked } = useApartmentLiked(validApartmentId, userID);

  useTrackApartmentView(validApartmentId, !!apartment);

  const app = useMemo(() => {
    if (!apartment) return null;
    return {
      ...apartment,
      owner,
      id: apartment.id || validApartmentId,
    };
  }, [apartment, owner, validApartmentId]);

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

  return { app, liked, setLiked, loading };
}
