import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import compressAndUploadImages from "@/infrastructure/firebase/adapters/compressAndUploadImages";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { FirestoreOccupantRepository } from "@/infrastructure/firebase/repositories/FirestoreOccupantRepository";
import { FirestoreRoomRepository } from "@/infrastructure/firebase/repositories/FirestoreRoomRepository";
import { FirestoreStorageRepository } from "@/infrastructure/firebase/repositories/FirestoreStorageRepository";
import { OCCUPANT_CONSENT_STATUS } from "@/shared/types";
import {
  buildDraftFromOccupant,
  buildRoomLabel,
  buildUpsertPayload,
  cleanupDraftAvatarPreviews,
  createEmptyDraft,
  resolveRoomId,
  revokePreviewUrl,
  toggleListValue,
} from "./draftUtils";

const loadOccupantsModalData = async (annuncioId) => {
  const [roomsResult, occupantsPublicResult, occupantsPrivateResult] =
    await Promise.allSettled([
      FirestoreRoomRepository.listByApartmentId(annuncioId),
      FirestoreOccupantRepository.listByApartmentId(annuncioId),
      FirestoreOccupantRepository.listPrivateByApartmentId(annuncioId),
    ]);

  return {
    roomsResult,
    occupantsPublicResult,
    occupantsPrivateResult,
  };
};

const buildRoomOptions = (rooms = []) => {
  const seenRoomIds = new Set();

  return (Array.isArray(rooms) ? rooms : []).reduce((options, room, index) => {
    const value = resolveRoomId(room);
    if (!value || seenRoomIds.has(value)) return options;

    seenRoomIds.add(value);
    options.push({
      value,
      label: buildRoomLabel(room, index),
    });
    return options;
  }, []);
};

const getDraftsToSave = (drafts = []) =>
  drafts.filter((draft) => draft.displayName?.trim() || draft.occupantId);

const getValidationError = ({ roomOptions, draftsToSave, removedOccupantIds }) => {
  if (!roomOptions.length) {
    return "Aggiungi almeno una stanza prima di inserire coinquilini.";
  }

  if (!draftsToSave.length && removedOccupantIds.length === 0) {
    return "Inserisci almeno un coinquilino o rimuovi i record esistenti.";
  }

  if (draftsToSave.some((draft) => !draft.roomId)) {
    return "Ogni coinquilino deve essere associato a una stanza.";
  }

  if (draftsToSave.some((draft) => !draft.displayName?.trim())) {
    return "Inserisci il nome visibile per tutti i coinquilini.";
  }

  if (
    draftsToSave.some(
      (draft) =>
        draft.consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED &&
        draft.consentConfirmed !== true,
    )
  ) {
    return "Conferma il consenso esplicito prima di pubblicare un coinquilino.";
  }

  return null;
};

const uploadDraftAvatar = async (draft, annuncioId, uploadedUrls) => {
  const originalAvatarUrl = draft.originalAvatarUrl?.trim() || null;
  let nextAvatarUrl = draft.avatarUrl?.trim() || null;
  const avatarUrlsToDelete = [];

  if (draft.avatarFile) {
    const [uploadedAvatarUrl] = await compressAndUploadImages(
      [draft.avatarFile],
      annuncioId,
      `occupants/${draft.occupantId || draft.localId}`,
    );

    nextAvatarUrl = uploadedAvatarUrl || null;
    if (uploadedAvatarUrl) {
      uploadedUrls.push(uploadedAvatarUrl);
    }
    if (originalAvatarUrl && originalAvatarUrl !== nextAvatarUrl) {
      avatarUrlsToDelete.push(originalAvatarUrl);
    }
  } else if (!nextAvatarUrl && originalAvatarUrl) {
    avatarUrlsToDelete.push(originalAvatarUrl);
  }

  return {
    normalizedDraft: {
      ...draft,
      avatarUrl: nextAvatarUrl || "",
      avatarPreviewUrl: nextAvatarUrl || "",
      avatarFile: null,
      originalAvatarUrl: nextAvatarUrl || "",
    },
    avatarUrlsToDelete,
  };
};

/**
 * Centralizza lo stato del modal coinquilini:
 * fetch iniziale, mutazioni dei draft, upload avatar e persistenza finale.
 */
export function useOccupantsModalState({
  annuncioId,
  isOpen,
  onClose,
  onOccupantsUpdated,
  roomCandidates,
}) {
  const [rooms, setRooms] = useState([]);
  const [occupantsDraft, setOccupantsDraft] = useState([]);
  const [removedOccupantIds, setRemovedOccupantIds] = useState([]);
  const [removedAvatarUrls, setRemovedAvatarUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const roomCandidatesRef = useRef([]);
  const draftsRef = useRef([]);

  useEffect(() => {
    roomCandidatesRef.current = Array.isArray(roomCandidates) ? roomCandidates : [];
  }, [roomCandidates]);

  useEffect(() => {
    draftsRef.current = occupantsDraft;
  }, [occupantsDraft]);

  useEffect(
    () => () => {
      cleanupDraftAvatarPreviews(draftsRef.current);
    },
    [],
  );

  useEffect(() => {
    if (isOpen) return;
    cleanupDraftAvatarPreviews(draftsRef.current);
  }, [isOpen]);

  const roomOptions = useMemo(() => buildRoomOptions(rooms), [rooms]);

  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !annuncioId) return () => {};

    setLoading(true);

    loadOccupantsModalData(annuncioId)
      .then(({ roomsResult, occupantsPublicResult, occupantsPrivateResult }) => {
        if (cancelled) return;

        const fetchedRooms =
          roomsResult.status === "fulfilled" && Array.isArray(roomsResult.value)
            ? roomsResult.value
            : [];
        const fallbackRooms = roomCandidatesRef.current;
        const nextRooms = fetchedRooms.length > 0 ? fetchedRooms : fallbackRooms;

        if (!nextRooms.length) {
          toast.error("Aggiungi almeno una stanza prima di inserire coinquilini.");
        }
        if (roomsResult.status === "rejected") {
          console.error("Errore nel caricamento stanze coinquilini:", roomsResult.reason);
        }
        if (occupantsPublicResult.status === "rejected") {
          console.error(
            "Errore nel caricamento coinquilini pubblici host:",
            occupantsPublicResult.reason,
          );
        }
        if (occupantsPrivateResult.status === "rejected") {
          console.warn(
            "Dati privati coinquilini non disponibili:",
            occupantsPrivateResult.reason,
          );
        }

        const publicOccupants =
          occupantsPublicResult.status === "fulfilled" &&
          Array.isArray(occupantsPublicResult.value)
            ? occupantsPublicResult.value
            : [];
        const privateOccupants =
          occupantsPrivateResult.status === "fulfilled" &&
          Array.isArray(occupantsPrivateResult.value)
            ? occupantsPrivateResult.value
            : [];

        const privateById = new Map(
          privateOccupants.map((occupant) => [occupant.occupantId || occupant.id, occupant]),
        );
        const firstRoomId = resolveRoomId(nextRooms[0]);
        const roomIds = new Set(nextRooms.map(resolveRoomId).filter(Boolean));
        const nextDrafts = publicOccupants.map((occupant) => {
          const draft = buildDraftFromOccupant(
            occupant,
            privateById.get(occupant.occupantId || occupant.id),
          );

          return {
            ...draft,
            roomId: roomIds.has(draft.roomId) ? draft.roomId : firstRoomId,
          };
        });

        cleanupDraftAvatarPreviews(draftsRef.current);
        setRooms(nextRooms);
        setRemovedOccupantIds([]);
        setRemovedAvatarUrls([]);
        setOccupantsDraft(
          nextDrafts.length > 0 ? nextDrafts : [createEmptyDraft(firstRoomId)],
        );
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Errore nel caricamento coinquilini:", error);
        toast.error("Errore nel caricamento coinquilini.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [annuncioId, isOpen]);

  const updateDraftField = useCallback((localId, field, value) => {
    setOccupantsDraft((currentDrafts) =>
      currentDrafts.map((draft) => {
        if (draft.localId !== localId) return draft;

        const nextDraft = { ...draft, [field]: value };
        if (
          field === "consentStatus" &&
          value !== OCCUPANT_CONSENT_STATUS.GRANTED
        ) {
          nextDraft.isPublic = false;
          nextDraft.consentConfirmed = false;
        }
        if (field === "consentConfirmed" && value !== true) {
          nextDraft.isPublic = false;
        }
        return nextDraft;
      }),
    );
  }, []);

  const toggleDraftTag = useCallback((localId, field, value, maxItems) => {
    setOccupantsDraft((currentDrafts) =>
      currentDrafts.map((draft) => {
        if (draft.localId !== localId) return draft;
        return {
          ...draft,
          [field]: toggleListValue(draft[field], value, maxItems),
        };
      }),
    );
  }, []);

  const handleAddOccupant = useCallback(() => {
    const fallbackRoomId = roomOptions[0]?.value || "";
    setOccupantsDraft((currentDrafts) => [
      ...currentDrafts,
      createEmptyDraft(fallbackRoomId),
    ]);
  }, [roomOptions]);

  const handleAvatarSelected = useCallback((localId, file) => {
    if (file && !file.type?.startsWith("image/")) {
      toast.error("Seleziona un file immagine valido.");
      return;
    }

    const currentDraft = draftsRef.current.find((draft) => draft.localId === localId);
    revokePreviewUrl(currentDraft?.avatarPreviewUrl);

    const nextPreviewUrl = file ? URL.createObjectURL(file) : "";
    setOccupantsDraft((currentDrafts) =>
      currentDrafts.map((draft) => {
        if (draft.localId !== localId) return draft;
        return {
          ...draft,
          avatarFile: file || null,
          avatarPreviewUrl: nextPreviewUrl,
        };
      }),
    );
  }, []);

  const handleAvatarRemoved = useCallback((localId) => {
    const currentDraft = draftsRef.current.find((draft) => draft.localId === localId);
    revokePreviewUrl(currentDraft?.avatarPreviewUrl);

    setOccupantsDraft((currentDrafts) =>
      currentDrafts.map((draft) => {
        if (draft.localId !== localId) return draft;
        return {
          ...draft,
          avatarUrl: "",
          avatarPreviewUrl: "",
          avatarFile: null,
        };
      }),
    );
  }, []);

  const handleRemoveOccupant = useCallback(
    (localId) => {
      setOccupantsDraft((currentDrafts) => {
        const targetDraft = currentDrafts.find((draft) => draft.localId === localId);
        revokePreviewUrl(targetDraft?.avatarPreviewUrl);

        if (targetDraft?.occupantId) {
          setRemovedOccupantIds((currentIds) =>
            currentIds.includes(targetDraft.occupantId)
              ? currentIds
              : [...currentIds, targetDraft.occupantId],
          );
        }
        if (targetDraft?.originalAvatarUrl) {
          setRemovedAvatarUrls((currentUrls) =>
            currentUrls.includes(targetDraft.originalAvatarUrl)
              ? currentUrls
              : [...currentUrls, targetDraft.originalAvatarUrl],
          );
        }

        const nextDrafts = currentDrafts.filter((draft) => draft.localId !== localId);
        if (nextDrafts.length > 0) return nextDrafts;

        const fallbackRoomId = roomOptions[0]?.value || "";
        return [createEmptyDraft(fallbackRoomId)];
      });
    },
    [roomOptions],
  );

  const handleSave = useCallback(async () => {
    if (!annuncioId) return;

    const draftsToSave = getDraftsToSave(occupantsDraft);
    const validationError = getValidationError({
      roomOptions,
      draftsToSave,
      removedOccupantIds,
    });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    const newlyUploadedAvatarUrls = [];

    try {
      const avatarUrlsToDelete = [...removedAvatarUrls];
      const normalizedDrafts = [];

      for (const draft of draftsToSave) {
        const { normalizedDraft, avatarUrlsToDelete: uploadedDeletes } =
          await uploadDraftAvatar(draft, annuncioId, newlyUploadedAvatarUrls);
        normalizedDrafts.push(normalizedDraft);
        avatarUrlsToDelete.push(...uploadedDeletes);
      }

      const result = await FirestoreApartmentRepository.updateOccupants(annuncioId, {
        occupantUpserts: normalizedDrafts.map(buildUpsertPayload),
        occupantDeletes: removedOccupantIds,
      });

      const uniqueAvatarUrlsToDelete = Array.from(
        new Set(
          avatarUrlsToDelete.filter(
            (url) => url && !newlyUploadedAvatarUrls.includes(url),
          ),
        ),
      );

      if (uniqueAvatarUrlsToDelete.length > 0) {
        try {
          await FirestoreStorageRepository.deleteManyByUrl(uniqueAvatarUrlsToDelete);
        } catch (storageError) {
          console.error("Errore rimozione vecchie foto coinquilini:", storageError);
          toast.error(
            "Coinquilini salvati, ma non è stato possibile rimuovere alcune vecchie immagini.",
          );
        }
      }

      setRemovedOccupantIds([]);
      setRemovedAvatarUrls([]);
      onOccupantsUpdated?.({
        aggregates: result?.aggregates,
        occupancySummary: result?.occupancySummary,
        occupantListingSnapshot: result?.occupantListingSnapshot,
      });
      toast.success("Coinquilini aggiornati.");
      onClose?.();
    } catch (error) {
      if (newlyUploadedAvatarUrls.length > 0) {
        try {
          await FirestoreStorageRepository.deleteManyByUrl(newlyUploadedAvatarUrls);
        } catch (cleanupError) {
          console.error(
            "Errore nella pulizia delle nuove foto coinquilini:",
            cleanupError,
          );
        }
      }
      console.error("Errore nel salvataggio coinquilini:", error);
      toast.error(error?.message || "Errore durante il salvataggio coinquilini.");
    } finally {
      setSaving(false);
    }
  }, [
    annuncioId,
    occupantsDraft,
    onClose,
    onOccupantsUpdated,
    removedAvatarUrls,
    removedOccupantIds,
    roomOptions,
  ]);

  return {
    loading,
    occupantsDraft,
    roomOptions,
    saving,
    handleAddOccupant,
    handleAvatarRemoved,
    handleAvatarSelected,
    handleRemoveOccupant,
    handleSave,
    toggleDraftTag,
    updateDraftField,
  };
}
