import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import FormSection from "../FormSection";
import ImageUploader from "@/ui/components/common/form/ImageUploader";
import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";
import Alert from "@/ui/components/common/messages/PubblicaAnnuncioAlert";
import FormTips from "../FormTips";

const ImagesSection = ({
  formData = {},
  handleChange,
  handleBlur,
  showTips,
  getFieldError,
  existingPhotoUrls = [],
  onRemovePhotoUrl,
  maxFiles = 5,
  uploaderLabel,
  shadow = true,
}) => {
  const hasExistingPhotos =
    Array.isArray(existingPhotoUrls) && existingPhotoUrls.length > 0;
  return (
    <FormSection
      title="Immagini dell'alloggio"
      description="Carica le foto dell'appartamento"
      icon={<FontAwesomeIcon icon={faImage} />}
      required={true}
      shadow={shadow}
    >
      <div className="space-y-4">
        {hasExistingPhotos && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              Foto gia caricate
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {existingPhotoUrls.map((url) => (
                <div
                  key={url}
                  className="relative w-full aspect-square overflow-hidden rounded-lg border-2 border-[#D4F1EF]"
                >
                  <ImageWithSkeleton
                    src={url}
                    alt="foto appartamento"
                    imgClassName="object-cover w-full h-full"
                    rounded="rounded-none"
                  />
                  {onRemovePhotoUrl && (
                    <button
                      type="button"
                      onClick={() => onRemovePhotoUrl(url)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 text-xs rounded-full px-2 py-1 shadow"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Immagini degli spazi comuni e dell’esterno (min 1, max 5)
          </p>
          <ImageUploader
            onChange={handleChange}
            onBlur={handleBlur}
            name="apartmentPhotoFiles"
            files={formData?.apartmentPhotoFiles}
            maxFiles={maxFiles}
            label={uploaderLabel}
          />
          {getFieldError("apartmentPhotoFiles") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("apartmentPhotoFiles")}
            </p>
          )}
        </div>
      </div>

      <Alert>
        <p className="font-bold mr-4 text-gray-700">Attenzione</p>
        <p className="text-gray-600">
          In questa sezione vanno caricate{" "}
          <strong>solo immagini degli spazi comuni o dell’esterno</strong> (es.
          cucina, soggiorno, bagno, balcone, ingresso, garage).
          <br />
          <strong>
            Le foto delle stanze da letto vanno caricate separatamente
          </strong>{" "}
          nella sezione dedicata alle stanze.
        </p>
      </Alert>

      {showTips && <FormTips currentSection="images" />}
    </FormSection>
  );
};

export default ImagesSection;
