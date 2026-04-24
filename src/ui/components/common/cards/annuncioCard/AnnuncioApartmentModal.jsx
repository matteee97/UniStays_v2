import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Modal from "../../modals/Modal";
import CharacteristicsSection from "@/ui/components/sections/PubblicaAnnuncioSection/FormSections/CharacteristicsSection";
import ImagesSection from "@/ui/components/sections/PubblicaAnnuncioSection/FormSections/ImagesSection";
import compressAndUploadImages from "@/infrastructure/firebase/adapters/compressAndUploadImages";
import { createApartmentFormDraft } from "@/core/valueObjects/apartmentFormDraft";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { FirestoreRoomRepository } from "@/infrastructure/firebase/repositories/FirestoreRoomRepository";
import { FirestoreStorageRepository } from "@/infrastructure/firebase/repositories/FirestoreStorageRepository";
import { updateNestedField } from "@/ui/hooks/forms/nestedFormUtils";
import { useFormValidation } from "@/ui/hooks";
import { buildApartmentDetailsValidationRules } from "@/ui/hooks/forms/apartmentDetailsValidationRules";
import { buildRoomsValidationRules } from "@/ui/hooks/forms/roomsValidationRules";
import CoolButton from "../../buttons/CoolButton";

const MAX_APARTMENT_PHOTOS = 5;

const buildFormDataFromAnnuncio = (annuncio) => {
  const draft = createApartmentFormDraft(annuncio || {});
  return {
    ...draft,
    apartmentPhotoUrls: Array.isArray(annuncio?.apartmentPhotoUrls)
      ? annuncio.apartmentPhotoUrls
      : [],
    apartmentPhotoFiles: [],
  };
};

export default function AnnuncioApartmentModal({
  annuncio,
  isOpen,
  onClose,
  onApartmentUpdated,
}) {
  const [formData, setFormData] = useState(() =>
    buildFormDataFromAnnuncio(annuncio),
  );
  const [roomsSnapshot, setRoomsSnapshot] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState([]);
  const prevAreaRef = useRef(formData.features?.totalAreaMq);
  const prevBathroomsRef = useRef(formData.features?.bathroomsCount);

  const validationFormData = useMemo(
    () => ({
      ...formData,
      rooms: roomsSnapshot,
    }),
    [formData, roomsSnapshot],
  );

  const validationRules = useMemo(() => {
    const baseRules = buildApartmentDetailsValidationRules();
    return {
      ...baseRules,
      ...buildRoomsValidationRules(validationFormData, {
        includeRoomFields: false,
      }),
    };
  }, [validationFormData]);

  const validation = useFormValidation(validationRules, validationFormData);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(buildFormDataFromAnnuncio(annuncio));
    setRemovedPhotoUrls([]);
    validation.clearErrors();
  }, [annuncio, isOpen, validation.clearErrors]);

  useEffect(() => {
    if (!isOpen || !annuncio?.id) return;
    let cancelled = false;
    setLoadingRooms(true);
    FirestoreRoomRepository.listByApartmentId(annuncio.id)
      .then((rooms) => {
        if (cancelled) return;
        setRoomsSnapshot(rooms || []);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Errore nel fetch delle stanze:", error);
        toast.error("Errore nel caricamento delle stanze.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingRooms(false);
      });

    return () => {
      cancelled = true;
    };
  }, [annuncio?.id, isOpen]);

  useEffect(() => {
    const currentArea = formData.features?.totalAreaMq;
    if (prevAreaRef.current !== currentArea) {
      prevAreaRef.current = currentArea;
      validation.touchField("features.totalAreaMq");
      validation.validateSingleField("features.totalAreaMq");
      validation.touchField("rooms");
      validation.validateSingleField("rooms");
    }
  }, [
    formData.features?.totalAreaMq,
    validation.touchField,
    validation.validateSingleField,
  ]);

  useEffect(() => {
    const currentBathrooms = formData.features?.bathroomsCount;
    if (prevBathroomsRef.current !== currentBathrooms) {
      prevBathroomsRef.current = currentBathrooms;
      validation.touchField("features.bathroomsCount");
      validation.validateSingleField("features.bathroomsCount");
    }
  }, [
    formData.features?.bathroomsCount,
    validation.touchField,
    validation.validateSingleField,
  ]);

  useEffect(() => {
    if (!validation.touched?.rooms) return;
    validation.validateSingleField("rooms");
  }, [roomsSnapshot, validation.touched, validation.validateSingleField]);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked, files } = event.target || {};
      if (!name) return;

      let nextValue = value;
      if (type === "checkbox") {
        nextValue = checked;
        updateNestedField(setFormData, name, checked);
      } else if (type === "file") {
        nextValue = Array.from(files || []);
        updateNestedField(setFormData, name, nextValue);
      } else {
        updateNestedField(setFormData, name, value);
      }

      validation.touchField(name);

      if (typeof nextValue === "string" && nextValue.trim() === "") {
        validation.clearFieldError(name);
        return;
      }

      setTimeout(() => {
        validation.validateSingleField(name);
      }, 0);
    },
    [
      validation.clearFieldError,
      validation.touchField,
      validation.validateSingleField,
    ],
  );

  const handleBlur = useCallback(
    (event) => {
      const { name } = event.target || {};
      if (!name) return;
      validation.touchField(name);
      validation.validateSingleField(name);
    },
    [validation.touchField, validation.validateSingleField],
  );

  const removePhotoUrl = useCallback(
    (urlToRemove) => {
      setFormData((prev) => ({
        ...prev,
        apartmentPhotoUrls: (prev.apartmentPhotoUrls || []).filter(
          (url) => url !== urlToRemove,
        ),
      }));
      setRemovedPhotoUrls((prev) =>
        prev.includes(urlToRemove) ? prev : [...prev, urlToRemove],
      );
      const fieldName = "apartmentPhotoFiles";
      validation.touchField(fieldName);
      setTimeout(() => {
        validation.validateSingleField(fieldName);
      }, 0);
    },
    [validation.touchField, validation.validateSingleField],
  );

  const handleSave = async () => {
    if (!annuncio?.id) return;
    const isValid = validation.validateAll();
    if (!isValid) {
      Object.keys(validationRules).forEach((field) =>
        validation.touchField(field),
      );
      toast.error("Completa i campi obbligatori prima di salvare.");
      return;
    }
    if (loadingRooms) return;

    setSaving(true);
    try {
      if (removedPhotoUrls.length > 0) {
        try {
          await FirestoreStorageRepository.deleteManyByUrl(removedPhotoUrls);
        } catch (error) {
          console.error("Errore rimozione immagini appartamento:", error);
          toast.error("Errore durante la rimozione delle immagini.");
          return;
        }
      }

      const uploadedUrls = Array.isArray(formData.apartmentPhotoFiles)
        ? await compressAndUploadImages(
            formData.apartmentPhotoFiles,
            annuncio.id,
          )
        : [];

      const apartmentPhotoUrls = [
        ...(formData.apartmentPhotoUrls || []),
        ...uploadedUrls,
      ];

      const floorValue = Number(formData.features.floor);
      const normalizedFloor = Number.isFinite(floorValue)
        ? Math.trunc(floorValue)
        : formData.features.floor;

      const updatedData = {
        amenities: formData.amenities,
        houseRules: formData.houseRules,
        features: {
          ...formData.features,
          totalAreaMq: Number(formData.features.totalAreaMq),
          bathroomsCount: Number(formData.features.bathroomsCount),
          floor: normalizedFloor,
        },
        additionalInfo: formData.additionalInfo?.trim() || "",
        apartmentPhotoUrls,
      };

      await FirestoreApartmentRepository.updateApartment(
        annuncio.id,
        updatedData,
      );

      onApartmentUpdated?.(updatedData);
      setRemovedPhotoUrls([]);
      toast.success("Informazioni aggiornate.");
      onClose();
    } catch (error) {
      console.error("Errore aggiornamento appartamento:", error);
      toast.error("Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const remainingPhotoSlots = Math.max(
    MAX_APARTMENT_PHOTOS - (formData.apartmentPhotoUrls?.length || 0),
    0,
  );

  return (
    <Modal
      title="Modifica informazioni appartamento"
      onClose={onClose}
      disableEffects
      disableDistortion
      disableOutsideClick
    >
      <div className="space-y-8 w-full md:w-[70vh] lg:min-w-[960px] min-h-[90vh] sm:max-w-5xl">
        <ImagesSection
          handleChange={handleChange}
          handleBlur={handleBlur}
          showTips={false}
          getFieldError={validation.getFieldError}
          existingPhotoUrls={formData.apartmentPhotoUrls || []}
          onRemovePhotoUrl={removePhotoUrl}
          maxFiles={remainingPhotoSlots}
          uploaderLabel={
            remainingPhotoSlots > 0
              ? "Aggiungi foto"
              : "Elimina foto per aggiungerne di nuove"
          }
          shadow={false}
        />

        <CharacteristicsSection
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          showTips={false}
          shadow={false}
          getFieldError={validation.getFieldError}
          hasFieldError={validation.hasFieldError}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3 justify-end">
        <CoolButton
          type="button"
          ariaLabel="Salva informazioni appartamento"
          disabled={saving || loadingRooms}
          className="w-auto px-6"
          onClick={handleSave}
        >
          {saving ? "Salvataggio..." : "Salva modifiche"}
        </CoolButton>
      </div>
    </Modal>
  );
}
