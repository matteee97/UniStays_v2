import { useEffect, useMemo, useState } from "react";
import {
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { NOTIFICATION_TYPES } from "@/shared/types";
import { isValidFirestoreId } from "@/ui/helpers/validation";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import PlatformMessageHeader from "./parts/PlatformMessageHeader";
import PlatformMessagePreview from "./parts/PlatformMessagePreview";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { FALLBACK_IMAGE as PREVIEW_IMAGE_FALLBACK } from "@/ui/shared/constants";

const PREVIEW_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
};

const TYPE_CONFIG = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    bg: "bg-[#d4f1ef]/60",
    border: "border-emerald-200 dark:border-emerald-800/50",
    text: "text-emerald-900 dark:text-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-800/10",
    iconText: "text-emerald-700",
    icon: faCheck,
    title: "Messaggio di successo",
    previewBorder: "border-[#228E8D]/40",
    previewAccent: "text-[#228E8D]",
    previewMuted: "text-[#228E8D]/70",
  },
  [NOTIFICATION_TYPES.ERROR]: {
    bg: "bg-rose-50 dark:bg-red-800/5",
    border: "border-rose-300 dark:border-red-800/70",
    text: "text-rose-900 dark:text-red-800",
    iconBg: "bg-rose-100 dark:bg-red-800/10",
    iconText: "text-rose-700",
    icon: faExclamationTriangle,
    title: "Messaggio di errore",
  },
  [NOTIFICATION_TYPES.WARNING]: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-900",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    icon: faExclamationTriangle,
    title: "Messaggio di avviso",
  },
  [NOTIFICATION_TYPES.INFO]: {
    bg: "bg-white",
    border: "border-[#d4f1ef]",
    text: "text-gray-600",
    iconBg: "bg-[#d4f1ef]",
    iconText: "text-gray-700",
    icon: faInfoCircle,
    title: "Messaggio di informazione",
  },
};

const previewCache = new Map();

const buildCitySlug = (city, provinceCode) => {
  const base = `${city ?? ""}${provinceCode ? `-${provinceCode}` : ""}`
    .trim()
    .toLowerCase();
  return base
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "");
};

const buildApartmentPreview = (apartmentId, data) => {
  const baseImages = Array.isArray(data?.apartmentPhotoUrls)
    ? data.apartmentPhotoUrls
    : [];
  const imageUrl = baseImages.find(Boolean) || PREVIEW_IMAGE_FALLBACK;

  return {
    id: apartmentId,
    title: data?.title || "Alloggio",
    priceLabel: getPriceRangeLabel(data?.aggregates),
    address: data?.address ?? {},
    imageUrl,
  };
};

export default function PlatformChatMessage({
  message,
  variant = "full",
  showPreview,
}) {
  const isCompact = variant === "compact";
  const shouldShowPreview = showPreview ?? !isCompact;
  const messageType = message?.platformMessageType || NOTIFICATION_TYPES.INFO;
  const config =
    TYPE_CONFIG[messageType] || TYPE_CONFIG[NOTIFICATION_TYPES.INFO];
  const apartmentId = message?.apartmentId;
  const shouldLoadPreview =
    shouldShowPreview &&
    messageType === NOTIFICATION_TYPES.SUCCESS &&
    isValidFirestoreId(apartmentId);

  const [preview, setPreview] = useState(() => {
    if (!shouldLoadPreview) return null;
    return previewCache.get(apartmentId) || null;
  });
  const [previewStatus, setPreviewStatus] = useState(() => {
    if (!shouldLoadPreview) return PREVIEW_STATUS.IDLE;
    return previewCache.has(apartmentId)
      ? PREVIEW_STATUS.READY
      : PREVIEW_STATUS.LOADING;
  });

  useEffect(() => {
    if (!shouldLoadPreview) {
      setPreview(null);
      setPreviewStatus(PREVIEW_STATUS.IDLE);
      return;
    }

    const cached = previewCache.get(apartmentId);
    if (cached) {
      setPreview(cached);
      setPreviewStatus(PREVIEW_STATUS.READY);
      return;
    }

    let isActive = true;

    const loadPreview = async () => {
      setPreviewStatus(PREVIEW_STATUS.LOADING);
      try {
        const apartment =
          await FirestoreApartmentRepository.getById(apartmentId);
        if (!isActive) return;
        if (!apartment) {
          setPreview(null);
          setPreviewStatus(PREVIEW_STATUS.ERROR);
          return;
        }

        const data = buildApartmentPreview(apartmentId, apartment);
        previewCache.set(apartmentId, data);
        setPreview(data);
        setPreviewStatus(PREVIEW_STATUS.READY);
      } catch (error) {
        if (!isActive) return;
        console.error("Errore nel caricamento anteprima appartamento:", error);
        setPreviewStatus(PREVIEW_STATUS.ERROR);
      }
    };

    loadPreview();

    return () => {
      isActive = false;
    };
  }, [apartmentId, shouldLoadPreview]);

  const previewUrl = useMemo(() => {
    if (!preview?.id) return null;

    const city = preview.address?.city;
    const provinceCode = preview.address?.provinceCode;
    const citySlug = buildCitySlug(city, provinceCode);

    return citySlug
      ? `/alloggi/${citySlug}/${preview.id}`
      : `/alloggi/${preview.id}`;
  }, [preview]);

  const content = typeof message?.content === "string" ? message.content : "";
  const priceLabel = preview?.priceLabel;
  const hasPrice =
    typeof priceLabel === "string" && priceLabel.trim().length > 0;

  const previewBorder = config.previewBorder || "border-emerald-200";
  const previewAccent = config.previewAccent || "text-emerald-700";
  const previewMuted = config.previewMuted || "text-emerald-700/70";

  return (
    <div
      className={`flex w-full ${
        isCompact
          ? "items-start px-0 my-0"
          : "justify-center items-center px-4 my-4"
      }`}
    >
      <div
        className={`w-full ${
          isCompact ? "text-left" : "text-center max-w-2xl"
        }`}
      >
        <div
          className={`${config.bg} ${config.border} border-2 ${
            config.text
          } text-sm ${isCompact ? "p-3" : "px-6 py-4"} rounded-xl shadow-md`}
        >
          <PlatformMessageHeader config={config} isCompact={isCompact} />
          <div className={`${config.text} whitespace-pre-wrap text-left`}>
            {content}
          </div>
          <PlatformMessagePreview
            shouldLoadPreview={shouldLoadPreview}
            previewStatus={previewStatus}
            preview={preview}
            previewUrl={previewUrl}
            isCompact={isCompact}
            previewBorder={previewBorder}
            previewAccent={previewAccent}
            previewMuted={previewMuted}
            hasPrice={hasPrice}
            priceLabel={priceLabel}
          />
        </div>
      </div>
    </div>
  );
}
