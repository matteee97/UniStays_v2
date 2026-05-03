import {
  createRoomCandidateApartmentMatcher,
  createRoomFilterMatcher,
} from "@/application/filters/roomSearchFilters";

const DEFAULT_CONCURRENCY = 6;

const getRoomId = (room, index) => room?.roomId || room?.id || `room-${index}`;

const getPrimaryRoomImage = (room, apartment) =>
  room?.photoUrls?.[0] || apartment?.apartmentPhotoUrls?.[0] || null;

const buildRoomSearchResult = ({ apartment, room, roomIndex }) => {
  const roomId = getRoomId(room, roomIndex);

  return {
    id: `${apartment.id}:${roomId}`,
    apartment,
    room,
    apartmentId: apartment.id,
    roomId,
    roomIndex,
    title: apartment.title,
    address: apartment.address,
    ownerSnapshot: apartment.ownerSnapshot,
    metrics: apartment.metrics,
    occupantListingSnapshot: apartment.occupantListingSnapshot,
    image: getPrimaryRoomImage(room, apartment),
  };
};

const sortRoomResults = (left, right) => {
  const leftAvailable = left.room?.availability?.isAvailableNow === true ? 1 : 0;
  const rightAvailable =
    right.room?.availability?.isAvailableNow === true ? 1 : 0;
  if (leftAvailable !== rightAvailable) return rightAvailable - leftAvailable;

  const leftScore = Number(left.apartment?.metrics?.score) || 0;
  const rightScore = Number(right.apartment?.metrics?.score) || 0;
  if (leftScore !== rightScore) return rightScore - leftScore;

  const leftPrice = Number(left.room?.priceMonthly) || Number.MAX_SAFE_INTEGER;
  const rightPrice = Number(right.room?.priceMonthly) || Number.MAX_SAFE_INTEGER;
  return leftPrice - rightPrice;
};

const mapWithConcurrency = async (items, concurrency, mapper) => {
  const results = [];
  let cursor = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (cursor < items.length) {
        const currentIndex = cursor;
        cursor += 1;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    },
  );

  await Promise.all(workers);
  return results;
};

/**
 * Searches rooms by deriving them from candidate apartments. This keeps
 * apartments and rooms as the only source of truth while preserving a repository
 * contract that can later be backed by an indexed projection.
 */
export const searchRoomsInCandidateApartments = async ({
  candidateApartments = [],
  filters = null,
  cityCoords = null,
  roomRepository,
  concurrency = DEFAULT_CONCURRENCY,
}) => {
  if (!roomRepository || typeof roomRepository.listByApartmentId !== "function") {
    throw new Error("roomRepository.listByApartmentId is required.");
  }

  const safeApartments = Array.isArray(candidateApartments)
    ? candidateApartments.filter((apartment) => apartment?.id)
    : [];
  if (!safeApartments.length) return [];

  const candidateMatcher = createRoomCandidateApartmentMatcher(
    filters,
    cityCoords,
  );
  const exactRoomMatcher = createRoomFilterMatcher(filters, cityCoords);
  const candidateMatches = candidateMatcher
    ? safeApartments.filter(candidateMatcher)
    : safeApartments;

  const roomGroups = await mapWithConcurrency(
    candidateMatches,
    concurrency,
    async (apartment) => {
      const rooms = await roomRepository.listByApartmentId(apartment.id);
      return {
        apartment,
        rooms: Array.isArray(rooms) ? rooms : [],
      };
    },
  );

  return roomGroups
    .flatMap(({ apartment, rooms }) =>
      rooms.map((room, roomIndex) =>
        buildRoomSearchResult({ apartment, room, roomIndex }),
      ),
    )
    .filter((result) =>
      exactRoomMatcher({ room: result.room, apartment: result.apartment }),
    )
    .sort(sortRoomResults);
};
