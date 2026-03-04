import { useCallback, useEffect, useRef, useState } from "react";
import UpLoadIcon from "../shared/icons/UpLoadIcon";

export default function ImageUploader({
  onChange,
  onBlur,
  name = "apartmentPhotoFiles",
  label = "Carica immagini",
  multiple = true,
  accept = "image/*",
  maxFiles = 5,
  files = null,
}) {
  const inputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const inputId = `${sanitizedName}-file-input`;
  const isControlled = Array.isArray(files);

  const replacePreviewUrls = useCallback((nextUrls = []) => {
    setPreviewUrls((prevUrls) => {
      prevUrls.forEach((url) => URL.revokeObjectURL(url));
      return nextUrls;
    });
  }, []);

  /**
   * Gestisce l'input file e ne estrae le immagini valide e il loro URL di preview
   * @param {FileList} files Lista di file selezionati
   */
  const handleFiles = (incomingFiles) => {
    const validImages = Array.from(incomingFiles || [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, maxFiles);

    if (!isControlled) {
      replacePreviewUrls(validImages.map((file) => URL.createObjectURL(file)));
    }

    onChange &&
      onChange({
        target: {
          name: name,
          files: validImages,
          type: "file",
        },
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  useEffect(() => {
    if (!isControlled) return;

    const controlledFiles = files
      .filter((file) => file?.type?.startsWith?.("image/"))
      .slice(0, maxFiles);
    const nextUrls = controlledFiles.map((file) => URL.createObjectURL(file));
    replacePreviewUrls(nextUrls);
  }, [files, isControlled, maxFiles, replacePreviewUrls]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={label + " clicca o trascina immagini per caricare"}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className="flex flex-col items-center justify-center w-full px-4 py-6 bg-white text-[#228E8D] border-2 border-dashed border-[#D4F1EF] rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200"
      >
        <UpLoadIcon className="w-8 h-8 mb-2 text-[#228E8D]" />
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#228E8D] text-center"
        >
          {label} <br />
          <span className="text-xs text-gray-400">(Max {maxFiles} file)</span>
        </label>
        <input
          id={inputId}
          type="file"
          ref={inputRef}
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          onBlur={onBlur}
          className="hidden"
        />
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative w-full aspect-square overflow-hidden rounded-lg border-2 border-[#D4F1EF]"
            >
              <img
                src={url}
                alt={`preview-${index}`}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
