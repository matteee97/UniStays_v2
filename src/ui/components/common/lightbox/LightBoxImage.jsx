import React from "react";
import LightBox from "./LightBox";
import { ImageWithSkeleton } from "..";

const BASE_IMAGE_CLASSES =
  "w-auto h-auto max-w-full max-h-full !object-contain shadow-lg";
const LightBoxImage = ({
  onClose,
  imageSrc,
  imageClassName = BASE_IMAGE_CLASSES,
  alt = "Lightbox Image",
}) => {
  return (
    <LightBox onClose={onClose}>
      <ImageWithSkeleton
        src={imageSrc}
        alt={alt}
        containerClassName="max-w-full sm:max-w-[95vw] max-h-[70vh] overflow-hidden "
        imgClassName={imageClassName}
      />
    </LightBox>
  );
};

export default LightBoxImage;
