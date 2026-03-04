import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import compressAndUploadImages from "@/infrastructure/firebase/adapters/compressAndUploadImages";
import fetchUserData from "../fetches/fetchUserData";
import { getCoordinates } from "@/ui/helpers/getCoordinates";
import { ApartmentAggregateCalculator } from "@/core/services/ApartmentAggregateCalculator";
import { ApartmentValidator } from "@/core/services/ApartmentValidator";
import { createApartmentFormDraft } from "@/core/valueObjects/apartmentFormDraft";
import { APARTMENT_STATUS } from "@/shared/types";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { FirestoreRoomRepository } from "@/infrastructure/firebase/repositories/FirestoreRoomRepository";
import { updateNestedField } from "./nestedFormUtils";

export default function usePubblicaAnnuncioForm({
  getOwnerInfo,
  setGetOwnerInfo,
}) {
  const { user } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [ownerSnapshot, setOwnerSnapshot] = useState(null);

  const buildInitialFormData = () => createApartmentFormDraft();

  const [formData, setFormData] = useState(buildInitialFormData);

  useEffect(() => {
    if (!user?.id) return;
    const fetchUser = async () => {
      try {
        const userData = await fetchUserData(user.id);
        const apartmentsCount = userData?.publicStats?.apartmentsCount || 0;
        setGetOwnerInfo(!(apartmentsCount > 0));
        setOwnerSnapshot({
          displayName: userData?.displayName || null,
          bio: userData?.bio || "",
          roleBadge: userData?.isAgency ? "agency" : null,
          inPlatformSince: userData?.createdAt || null,
          photoUrl: userData?.photoUrl || user?.imageUrl || null,
          ownerId: userData?.userId || user?.id || null,
        });
      } catch (err) {
        setGetOwnerInfo(true);
        console.error("Errore nel fetch dell'utente:", err);
      }
    };

    fetchUser();
  }, [user?.id, setGetOwnerInfo, user?.imageUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      updateNestedField(setFormData, name, checked);
      if (name.endsWith("availability.isAvailableNow") && checked) {
        const baseName = name.replace("isAvailableNow", "availableFrom");
        updateNestedField(setFormData, baseName, "");
      }
      return;
    }

    if (type === "file") {
      if (name === "apartmentPhotoFiles") {
        setFormData((prev) => ({
          ...prev,
          apartmentPhotoFiles: Array.from(files || []),
        }));
        return;
      }

      if (name?.startsWith("rooms.") && name.includes(".photoFiles")) {
        updateNestedField(setFormData, name, Array.from(files || []));
        return;
      }
    }

    updateNestedField(setFormData, name, value);
  };

  const cityHandle = (selectedCity) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        city: selectedCity.city,
        provinceCode: selectedCity.provinceCode,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = ApartmentValidator.validate(formData, formData.rooms, {
      requireOwnerDetails: getOwnerInfo === true,
    });
    if (!validation.isValid) {
      toast.error(
        validation.errors?.[0]?.message ||
          "Completa i campi obbligatori prima di pubblicare."
      );
      return;
    }

    setLoading(true);

    try {
      const apartmentId = FirestoreApartmentRepository.createId();

      const fullAddress = `${formData.address.street}, ${formData.address.postalCode} ${formData.address.city}, ${formData.address.provinceCode}`;
      const coords = await getCoordinates(fullAddress);
      if (!coords) {
        setLoading(false);
        return;
      }

      const uploadedApartmentPhotos = await compressAndUploadImages(
        formData.apartmentPhotoFiles,
        apartmentId
      );

      const roomUploads = await Promise.all(
        (formData.rooms || []).map(async (room) => {
          const roomId = FirestoreRoomRepository.createId(apartmentId);
          const photoUrls = await compressAndUploadImages(
            room.photoFiles || [],
            apartmentId,
            `rooms/${roomId}`
          );

          const availableFrom = room.availability?.isAvailableNow
            ? null
            : room.availability?.availableFrom
            ? new Date(room.availability.availableFrom)
            : null;

          return {
            roomId,
            data: {
              roomId,
              type: room.type,
              priceMonthly: Number(room.priceMonthly),
              areaMq: Number(room.areaMq),
              furnishing: room.furnishing,
              availability: {
                isAvailableNow: Boolean(room.availability?.isAvailableNow),
                availableFrom,
              },
              photoUrls,
              notes: room.notes?.trim() || "",
            },
          };
        })
      );

      const roomsPayload = roomUploads.map((entry) => entry.data);
      const aggregates = ApartmentAggregateCalculator.calculate(roomsPayload);

      const isAgency = Boolean(formData.ownerDetails?.isAgency);
      const firstName = formData.ownerDetails?.firstName?.trim();
      const lastName = formData.ownerDetails?.lastName?.trim();
      const displayName = isAgency
        ? firstName || "Agency"
        : [firstName, lastName].filter(Boolean).join(" ") || "Host";

      const snapshot = {
        displayName: ownerSnapshot?.displayName || displayName,
        bio:
          ownerSnapshot?.bio ||
          formData.ownerDetails?.bio?.trim() ||
          "",
        roleBadge:
          ownerSnapshot?.roleBadge || (isAgency ? "agency" : null),
        inPlatformSince: ownerSnapshot?.createdAt || null,
        photoUrl: ownerSnapshot?.photoUrl || user?.imageUrl || null,
        ownerId: ownerSnapshot?.ownerId || user?.id || null,
      };

      const floorValue = Number(formData.features.floor);
      const normalizedFloor = Number.isFinite(floorValue)
        ? Math.trunc(floorValue)
        : formData.features.floor;

      const apartmentPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: {
          ...formData.address,
          location: { lat: coords.lat, lng: coords.lng },
        },
        features: {
          ...formData.features,
          totalAreaMq: Number(formData.features.totalAreaMq),
          bathroomsCount: Number(formData.features.bathroomsCount),
          floor: normalizedFloor,
        },
        houseRules: formData.houseRules,
        amenities: formData.amenities,
        additionalInfo: formData.additionalInfo?.trim() || "",
        apartmentPhotoUrls: uploadedApartmentPhotos,
        ownerId: user?.id || null,
        ownerSnapshot: snapshot,
        status: APARTMENT_STATUS.PENDING_REVIEW,
        isFeatured: false,
        aggregates: {
          minRoomPrice: aggregates.minRoomPrice,
          maxRoomPrice: aggregates.maxRoomPrice,
          totalRooms: aggregates.totalRooms,
          totalRoomsAvailable: aggregates.totalRoomsAvailable,
          roomTypes: aggregates.roomTypes || [],
          isAvailableNow: aggregates.isAvailableNow,
          availableFromMin: aggregates.availableFromMin,
        },
        metrics: {
          totalViews: 0,
          likesCount: 0,
          totalReports: 0,
          reviewsCount: 0,
          ratingSum: 0,
          ratingAvg: 0,
          ratingCount: 0,
          score: null,
        },
      };

      const ownerPublicOverrides = getOwnerInfo
        ? {
            displayName,
            firstName: firstName || "",
            lastName: lastName || "",
            isAgency,
            bio: formData.ownerDetails?.bio?.trim() || "",
            photoUrl: user?.imageUrl || null,
          }
        : null;

      const ownerPrivateOverrides = getOwnerInfo
        ? {
            phone: formData.ownerDetails?.phone?.trim() || "",
            email: user?.emailAddresses[0]?.emailAddress || null,
          }
        : null;

      await FirestoreApartmentRepository.createApartmentWithRooms({
        apartmentId,
        apartmentData: apartmentPayload,
        roomsData: roomUploads,
        ownerId: user?.id || null,
        ownerPublicOverrides,
        ownerPrivateOverrides,
      });

      setFormData(buildInitialFormData());
      toast.success("Annuncio inviato in revisione.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Errore durante la pubblicazione.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    cityHandle,
  };
}
