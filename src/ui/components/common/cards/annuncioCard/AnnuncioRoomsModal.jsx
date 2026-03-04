import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Modal from "../../modals/Modal";
import RoomsEditor from "../../rooms/RoomsEditor";
import CoolButton from "../../buttons/CoolButton";
import compressAndUploadImages from "@/infrastructure/firebase/adapters/compressAndUploadImages";
import { ApartmentAggregateCalculator } from "@/core/services/ApartmentAggregateCalculator";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { FirestoreRoomRepository } from "@/infrastructure/firebase/repositories/FirestoreRoomRepository";
import { FirestoreStorageRepository } from "@/infrastructure/firebase/repositories/FirestoreStorageRepository";
import { createRoomDraft } from "@/core/valueObjects/roomDraft";
import { useFormValidation } from "@/ui/hooks";
import { buildRoomsValidationRules } from "@/ui/hooks/forms/roomsValidationRules";

const toDateValue = (raw) => {
  if (!raw) return null;
  if (typeof raw?.toDate === "function") return raw.toDate();
  if (raw instanceof Date) return raw;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDateString = (raw) => {
  const date = toDateValue(raw);
  return date ? date.toISOString().split("T")[0] : "";
};

const toJsDate = (raw) => toDateValue(raw);

const buildRoomDraft = (room) => ({
  ...createRoomDraft(),
  id: room.id,
  roomId: room.roomId || room.id,
  type: room.type || "",
  priceMonthly: room.priceMonthly ?? 0,
  areaMq: room.areaMq ?? "",
  furnishing: room.furnishing || "",
  notes: room.notes || "",
  availability: {
    isAvailableNow: room.availability?.isAvailableNow ?? true,
    availableFrom: toDateString(room.availability?.availableFrom),
  },
  photoUrls: Array.isArray(room.photoUrls) ? room.photoUrls : [],
  photoFiles: [],
});

export default function AnnuncioRoomsModal({
  annuncioId,
  totalAreaMq,
  isOpen,
  onClose,
  onRoomsUpdated,
}) {
  const [roomsDraft, setRoomsDraft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState([]);
  const validationFormData = useMemo(
    () => ({
      rooms: roomsDraft,
      features: { totalAreaMq },
    }),
    [roomsDraft, totalAreaMq],
  );
  const validationRules = useMemo(
    () =>
      buildRoomsValidationRules({
        rooms: roomsDraft,
        features: { totalAreaMq },
      }),
    [roomsDraft.length, totalAreaMq],
  );
  const validation = useFormValidation(validationRules, validationFormData);

  const hasRooms = roomsDraft.length > 0;

  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !annuncioId) return () => {};

    setLoading(true);
    FirestoreRoomRepository.listByApartmentId(annuncioId)
      .then((rooms) => {
        if (cancelled) return;
        const nextRooms = (rooms || []).map(buildRoomDraft);
        setRoomsDraft(nextRooms);
        setRemovedPhotoUrls([]);
        validation.clearErrors();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Errore nel fetch delle stanze:", err);
        toast.error("Errore nel caricamento delle stanze.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [annuncioId, isOpen, validation.clearErrors]);

  useEffect(() => {
    if (!validation.touched?.rooms) return;
    validation.validateSingleField("rooms");
  }, [
    roomsDraft,
    totalAreaMq,
    validation.touched,
    validation.validateSingleField,
  ]);

  const updateRoomField = useCallback((name, value) => {
    const [root, indexValue, ...path] = (name || "").split(".");
    if (root !== "rooms") return;
    const index = Number(indexValue);
    if (!Number.isFinite(index) || path.length === 0) return;

    setRoomsDraft((prev) =>
      prev.map((room, idx) => {
        if (idx !== index) return room;
        const next = { ...room };
        let ref = next;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          const current = ref[key];
          ref[key] =
            current && typeof current === "object" ? { ...current } : {};
          ref = ref[key];
        }
        ref[path[path.length - 1]] = value;
        return next;
      }),
    );
  }, []);

  const handleRoomBlur = useCallback(
    (event) => {
      const { name } = event.target || {};
      if (!name) return;
      validation.touchField(name);
      validation.validateSingleField(name);
    },
    [validation.touchField, validation.validateSingleField],
  );

  const handleRoomChange = useCallback(
    (event) => {
      const { name, value, type, checked, files } = event.target || {};
      if (!name) return;

      let nextValue = value;

      if (type === "checkbox") {
        nextValue = checked;
        updateRoomField(name, checked);
        if (name.endsWith("availability.isAvailableNow") && checked) {
          updateRoomField(name.replace("isAvailableNow", "availableFrom"), "");
          validation.clearFieldError(
            name.replace("isAvailableNow", "availableFrom"),
          );
        }
      } else if (type === "file") {
        nextValue = Array.from(files || []);
        updateRoomField(name, nextValue);
      } else {
        updateRoomField(name, value);
      }

      validation.touchField(name);

      const shouldValidateRooms =
        (name?.startsWith("rooms.") && name.endsWith(".areaMq")) ||
        name === "features.totalAreaMq";
      if (shouldValidateRooms) {
        validation.touchField("rooms");
      }

      if (typeof nextValue === "string" && nextValue.trim() === "") {
        validation.clearFieldError(name);
        return;
      }

      setTimeout(() => {
        validation.validateSingleField(name);
        if (shouldValidateRooms) {
          validation.validateSingleField("rooms");
        }
      }, 0);
    },
    [
      updateRoomField,
      validation.clearFieldError,
      validation.touchField,
      validation.validateSingleField,
    ],
  );

  const removePhotoUrl = useCallback(
    (index, urlToRemove) => {
      setRoomsDraft((prev) =>
        prev.map((room, idx) => {
          if (idx !== index) return room;
          return {
            ...room,
            photoUrls: (room.photoUrls || []).filter(
              (url) => url !== urlToRemove,
            ),
          };
        }),
      );
      setRemovedPhotoUrls((prev) =>
        prev.includes(urlToRemove) ? prev : [...prev, urlToRemove],
      );
      const fieldName = `rooms.${index}.photoFiles`;
      validation.touchField(fieldName);
      setTimeout(() => {
        validation.validateSingleField(fieldName);
      }, 0);
    },
    [validation.touchField, validation.validateSingleField],
  );

  const handleSave = async () => {
    if (!annuncioId || !hasRooms) return;
    const isValid = validation.validateAll();
    if (!isValid) {
      Object.keys(validationRules).forEach((field) =>
        validation.touchField(field),
      );
      toast.error("Completa i campi obbligatori prima di salvare.");
      return;
    }
    setSaving(true);
    try {
      if (removedPhotoUrls.length > 0) {
        try {
          await FirestoreStorageRepository.deleteManyByUrl(removedPhotoUrls);
        } catch (error) {
          console.error("Errore rimozione immagini stanza:", error);
          toast.error("Errore durante la rimozione delle immagini.");
          return;
        }
      }
      const roomUpdates = await Promise.all(
        roomsDraft.map(async (room) => {
          const roomId = room.roomId || room.id;
          const existingPhotoUrls = Array.isArray(room.photoUrls)
            ? [...room.photoUrls]
            : [];
          const uploadedUrls = Array.isArray(room.photoFiles)
            ? await compressAndUploadImages(
                room.photoFiles,
                annuncioId,
                `rooms/${roomId}`,
              )
            : [];
          const photoUrls = [...existingPhotoUrls, ...uploadedUrls];
          const isAvailableNow = room.availability?.isAvailableNow ?? true;
          const availableFrom = isAvailableNow
            ? null
            : toJsDate(room.availability?.availableFrom);

          return {
            roomId,
            data: {
              roomId,
              type: room.type,
              priceMonthly: Number(room.priceMonthly),
              areaMq: Number(room.areaMq),
              furnishing: room.furnishing,
              availability: {
                isAvailableNow: Boolean(isAvailableNow),
                availableFrom,
              },
              photoUrls,
              notes: room.notes?.trim() || "",
            },
          };
        }),
      );

      const aggregates = ApartmentAggregateCalculator.calculate(
        roomUpdates.map((entry) => entry.data),
      );

      await FirestoreApartmentRepository.updateRoomsAndAggregates(
        annuncioId,
        roomUpdates,
        aggregates,
      );

      setRemovedPhotoUrls([]);
      onRoomsUpdated?.(aggregates);
      toast.success("Stanze aggiornate.");
      onClose();
    } catch (err) {
      console.error("Errore durante l'aggiornamento delle stanze:", err);
      toast.error("Errore durante il salvataggio delle stanze.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Modifica stanze" onClose={onClose} disableOutsideClick>
      <div className="space-y-6 w-full md:w-[60vh] lg:min-w-[896px] min-h-[95vh] sm:max-w-4xl">
        {loading ? (
          <p className="text-sm text-gray-500">Caricamento stanze...</p>
        ) : !hasRooms ? (
          <p className="text-sm text-gray-500">Nessuna stanza trovata.</p>
        ) : (
          <RoomsEditor
            rooms={roomsDraft}
            handleChange={handleRoomChange}
            handleBlur={handleRoomBlur}
            getFieldError={validation.getFieldError}
            hasFieldError={validation.hasFieldError}
            allowAdd={false}
            allowRemove={false}
            showExistingPhotos
            getRoomPhotoUrls={(room) => room.photoUrls || []}
            onRemovePhotoUrl={removePhotoUrl}
            getMaxPhotoFiles={(room) =>
              Math.max(3 - (room.photoUrls?.length || 0), 0)
            }
            getPhotoUploaderLabel={(room) =>
              3 - (room.photoUrls?.length || 0) > 0
                ? "Aggiungi foto"
                : "Elimina foto per aggiungerne di nuove"
            }
            renderRoomMeta={(room) => (
              <span className="text-xs text-gray-400">
                ID: {room.roomId || room.id}
              </span>
            )}
          />
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 justify-end">
        <CoolButton
          type="button"
          ariaLabel="Salva stanze"
          disabled={saving || loading || !hasRooms}
          className="w-auto px-6"
          onClick={handleSave}
        >
          {saving ? "Salvataggio..." : "Salva modifiche stanze"}
        </CoolButton>
      </div>
    </Modal>
  );
}
