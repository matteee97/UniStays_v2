import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import FormSelect from "../form/FormSelect";
import ImageUploader from "../form/ImageUploader";
import TextAreaEditor from "../form/TextAreaEditor";
import Checkbox from "../form/Checkbox";
import CustomDateInput from "../form/CustomDateInput";
import RangeSliders from "@/ui/components/sections/PubblicaAnnuncioSection/RangeSliders";
import { ROOM_OCCUPANCY_STATUS, ROOM_TYPES } from "@/shared/types";
import ImageWithSkeleton from "../ImageWithSkeleton";

const roomTypeOptions = [
  { value: ROOM_TYPES.SINGLE, label: "Singola" },
  { value: ROOM_TYPES.DOUBLE, label: "Doppia" },
  { value: ROOM_TYPES.ENTIRE_APARTMENT, label: "Intero appartamento" },
];

const furnishingOptions = ["arredato", "parzialmente arredato", "non arredato"];

const occupancyStatusOptions = [
  { value: ROOM_OCCUPANCY_STATUS.FREE, label: "Libera" },
  { value: ROOM_OCCUPANCY_STATUS.OCCUPIED, label: "Occupata" },
  {
    value: ROOM_OCCUPANCY_STATUS.PARTIALLY_OCCUPIED,
    label: "Parzialmente occupata",
  },
  {
    value: ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS,
    label: "Disponibile con coinquilini presenti",
  },
  { value: ROOM_OCCUPANCY_STATUS.UNKNOWN, label: "Da definire" },
];

export default function RoomsEditor({
  rooms = [],
  handleChange,
  handleBlur,
  getFieldError,
  hasFieldError,
  onAddRoom,
  onRemoveRoom,
  allowAdd = true,
  allowRemove = true,
  showExistingPhotos = false,
  getRoomPhotoUrls = (room) =>
    Array.isArray(room?.photoUrls) ? room.photoUrls : [],
  onRemovePhotoUrl,
  getMaxPhotoFiles = () => 3,
  getPhotoUploaderLabel,
  renderRoomMeta,
}) {
  const safeHasFieldError = hasFieldError || (() => false);
  const safeGetFieldError = getFieldError || (() => null);
  const canAdd = allowAdd && typeof onAddRoom === "function";
  const canRemove = allowRemove && typeof onRemoveRoom === "function";

  return (
    <div className="space-y-6">
      {rooms.map((room, index) => {
        const photoUrls = showExistingPhotos ? getRoomPhotoUrls(room) : [];
        const rawMaxFiles = getMaxPhotoFiles(room, index);
        const resolvedMaxFiles = Number.isFinite(Number(rawMaxFiles))
          ? Number(rawMaxFiles)
          : 3;
        const photoLabel = getPhotoUploaderLabel?.(room, index);
        const roomMeta = renderRoomMeta?.(room, index);
        const hasRoomPhotos = Array.isArray(photoUrls) && photoUrls.length > 0;
        const occupancyCapacity = Number(room?.occupancy?.capacityTotal) || 1;
        const occupancyOccupied = Number(room?.occupancy?.spotsOccupied) || 0;
        const occupancyAvailable = Math.max(
          occupancyCapacity - occupancyOccupied,
          0
        );

        return (
          <div
            key={room.localId || room.roomId || room.id || index}
            className="bg-white border-2 border-[#d4f1ef] rounded-2xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-[#228E8D]">
                Stanza {index + 1}
              </h4>
              <div className="flex items-center gap-3">
                {roomMeta}
                {canRemove && rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveRoom(index)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-full"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Rimuovi
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-10">
              <RangeSliders
                data={room}
                handleChange={handleChange}
                hasFieldError={safeHasFieldError}
                getFieldError={safeGetFieldError}
                index={index}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormSelect
                    id={"tipologia"}
                    name={`rooms.${index}.type`}
                    options={roomTypeOptions}
                    value={room.type}
                    onChange={handleChange}
                    label="Tipologia stanza"
                    minWidth="min-w-[200px]"
                    required
                  />
                  {safeHasFieldError(`rooms.${index}.type`) && (
                    <p className="text-red-500 text-sm mt-1">
                      {safeGetFieldError(`rooms.${index}.type`)}
                    </p>
                  )}
                </div>

                <div>
                  <FormSelect
                    id={"arredamento"}
                    name={`rooms.${index}.furnishing`}
                    options={furnishingOptions}
                    value={room.furnishing}
                    onChange={handleChange}
                    label="Arredamento"
                    minWidth="min-w-[200px]"
                    required
                  />
                  {safeHasFieldError(`rooms.${index}.furnishing`) && (
                    <p className="text-red-500 text-sm mt-1">
                      {safeGetFieldError(`rooms.${index}.furnishing`)}
                    </p>
                  )}
                </div>

                <div>
                  <FormSelect
                    id={"occupazione-stanza"}
                    name={`rooms.${index}.occupancy.status`}
                    options={occupancyStatusOptions}
                    value={room?.occupancy?.status || ROOM_OCCUPANCY_STATUS.FREE}
                    onChange={handleChange}
                    label="Stato occupazione stanza"
                    minWidth="min-w-[200px]"
                    required
                  />
                  {safeHasFieldError(`rooms.${index}.occupancy.status`) && (
                    <p className="text-red-500 text-sm mt-1">
                      {safeGetFieldError(`rooms.${index}.occupancy.status`)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor={`rooms.${index}.occupancy.capacityTotal`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Posti totali stanza
                  </label>
                  <input
                    id={`rooms.${index}.occupancy.capacityTotal`}
                    name={`rooms.${index}.occupancy.capacityTotal`}
                    type="number"
                    min={1}
                    value={room?.occupancy?.capacityTotal ?? 1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-xl border-2 border-[#d4f1ef] px-3 py-2 text-sm focus:outline-none focus:border-[#228E8D]"
                  />
                  {safeHasFieldError(`rooms.${index}.occupancy.capacityTotal`) && (
                    <p className="text-red-500 text-sm mt-1">
                      {safeGetFieldError(`rooms.${index}.occupancy.capacityTotal`)}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={`rooms.${index}.occupancy.spotsOccupied`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Posti occupati
                  </label>
                  <input
                    id={`rooms.${index}.occupancy.spotsOccupied`}
                    name={`rooms.${index}.occupancy.spotsOccupied`}
                    type="number"
                    min={0}
                    max={occupancyCapacity}
                    value={room?.occupancy?.spotsOccupied ?? 0}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-xl border-2 border-[#d4f1ef] px-3 py-2 text-sm focus:outline-none focus:border-[#228E8D]"
                  />
                  {safeHasFieldError(`rooms.${index}.occupancy.spotsOccupied`) && (
                    <p className="text-red-500 text-sm mt-1">
                      {safeGetFieldError(`rooms.${index}.occupancy.spotsOccupied`)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Posti ancora liberi: {occupancyAvailable}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Checkbox
                  name={`rooms.${index}.availability.isAvailableNow`}
                  checked={room.availability?.isAvailableNow ?? true}
                  onChange={handleChange}
                  label="Disponibile subito"
                  className="max-w-44"
                />

                {!room.availability?.isAvailableNow && (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium mb-2">A partire dal:</p>
                    <DatePicker
                      selected={
                        room.availability?.availableFrom
                          ? new Date(room.availability.availableFrom)
                          : null
                      }
                      onChange={(date) =>
                        handleChange({
                          target: {
                            name: `rooms.${index}.availability.availableFrom`,
                            value: date ? date.toISOString().split("T")[0] : "",
                          },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Seleziona una data"
                      popperPlacement="bottom-center"
                      customInput={<CustomDateInput />}
                      minDate={new Date()}
                      inline
                      calendarClassName="flex items-center justify-center"
                    />
                    {safeHasFieldError(
                      `rooms.${index}.availability.availableFrom`,
                    ) && (
                      <p className="text-red-500 text-sm mt-1">
                        {safeGetFieldError(
                          `rooms.${index}.availability.availableFrom`,
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Foto stanza
                </p>
                {showExistingPhotos && (
                  <>
                    {hasRoomPhotos ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {photoUrls.map((url) => (
                          <div
                            key={url}
                            className="relative w-full aspect-square overflow-hidden rounded-lg border-2 border-[#D4F1EF]"
                          >
                            <ImageWithSkeleton
                              src={url}
                              alt="foto stanza"
                              imgClassName="object-cover w-full h-full"
                              rounded="rounded-none"
                            />
                            {onRemovePhotoUrl && (
                              <button
                                type="button"
                                onClick={() => onRemovePhotoUrl(index, url)}
                                className="absolute top-1 right-1 bg-white/90 text-red-500 text-xs rounded-full px-2 py-1 shadow"
                              >
                                Rimuovi
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Nessuna foto salvata.
                      </p>
                    )}
                  </>
                )}

                <ImageUploader
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`rooms.${index}.photoFiles`}
                  files={room.photoFiles}
                  maxFiles={Math.max(resolvedMaxFiles, 0)}
                  multiple
                  label={photoLabel}
                />
                {safeHasFieldError(`rooms.${index}.photoFiles`) && (
                  <p className="text-red-500 text-sm mt-1">
                    {safeGetFieldError(`rooms.${index}.photoFiles`)}
                  </p>
                )}
              </div>

              <TextAreaEditor
                id={`rooms.${index}.notes`}
                name={`rooms.${index}.notes`}
                label="Note stanza (opzionale)"
                helper="Dettagli utili: esposizione, silenziosita, servizi inclusi."
                value={room.notes || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                expandedRows={6}
              />
            </div>
          </div>
        );
      })}

      {canAdd && (
        <button
          type="button"
          onClick={onAddRoom}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#228E8D]  hover:bg-[#228E8D]/10 px-4 py-2 rounded-full"
        >
          <FontAwesomeIcon icon={faPlus} />
          Aggiungi stanza
        </button>
      )}
    </div>
  );
}
