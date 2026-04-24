import { useMemo, useState } from "react";
import { InfoSectionCard, InfoSectionHeader } from "./InfoSection";
import ScrollLane from "./ScrollLane";
import RoomPreviewCard from "./roomPreview/RoomPreviewCard";
import RoomDetailsModal from "./roomPreview/RoomDetailsModal";
import {
  buildVisibleRoommateProfiles,
  groupRoommatesByRoomId,
} from "./roommateProfiles";
import { buildRoomPreviewItems } from "./roomPreview/roomPreviewUtils";

export default function RoomPreviewSection({
  rooms = [],
  occupants = [],
  utilitiesIncluded = false,
}) {
  const [activeRoomIndex, setActiveRoomIndex] = useState(null);
  const [activeRoommateId, setActiveRoommateId] = useState(null);

  const roommateProfiles = useMemo(
    () => buildVisibleRoommateProfiles(occupants, rooms),
    [occupants, rooms],
  );

  const roommatesByRoomId = useMemo(
    () => groupRoommatesByRoomId(roommateProfiles),
    [roommateProfiles],
  );

  const normalizedRooms = useMemo(
    () => buildRoomPreviewItems(rooms, roommatesByRoomId),
    [rooms, roommatesByRoomId],
  );

  const activeRoom =
    activeRoomIndex !== null ? normalizedRooms[activeRoomIndex] : null;

  if (!normalizedRooms.length) return null;

  const handleOpenRoom = (roomIndex) => {
    setActiveRoommateId(null);
    setActiveRoomIndex(roomIndex);
  };

  const handleCloseModal = () => {
    setActiveRoommateId(null);
    setActiveRoomIndex(null);
  };

  return (
    <>
      <InfoSectionCard id="section-stanze" className="space-y-4 !p-0">
        <InfoSectionHeader
          title="Dove dormirai"
          badge={`${normalizedRooms.length} stanz${
            normalizedRooms.length > 1 ? "e" : "a"
          }`}
          className="p-5 pb-0"
        />

        <ScrollLane
          viewportClassName="px-2"
          itemClassName="w-[292px] sm:w-[320px] xl:w-[344px]"
        >
          {normalizedRooms.map((room, roomIndex) => (
            <RoomPreviewCard
              key={room.id}
              room={room}
              roomIndex={roomIndex}
              onOpen={() => handleOpenRoom(roomIndex)}
            />
          ))}
        </ScrollLane>

        <p className="text-xs text-gray-400 pb-2 pl-5">
          *I prezzi visualizzati{" "}
          {utilitiesIncluded
            ? "sono comprensivi di utenze."
            : "non comprendono le utenze."}
        </p>
      </InfoSectionCard>

      {activeRoom ? (
        <RoomDetailsModal
          room={activeRoom}
          utilitiesIncluded={utilitiesIncluded}
          activeRoommateId={activeRoommateId}
          onRoommateToggle={setActiveRoommateId}
          onClose={handleCloseModal}
        />
      ) : null}
    </>
  );
}
