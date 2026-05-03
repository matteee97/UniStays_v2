import { RoomSearchRepository } from "@/core/ports/RoomSearchRepository";
import { searchRoomsInCandidateApartments } from "@/application/useCases/searchRoomsInCandidateApartments";
import { FirestoreRoomRepository } from "./FirestoreRoomRepository";

const roomsByApartmentIdCache = new Map();

const cachedRoomRepository = {
  async listByApartmentId(apartmentId) {
    if (roomsByApartmentIdCache.has(apartmentId)) {
      return roomsByApartmentIdCache.get(apartmentId);
    }

    const rooms = await FirestoreRoomRepository.listByApartmentId(apartmentId);
    roomsByApartmentIdCache.set(apartmentId, rooms);
    return rooms;
  },
};

class FirestoreCandidateRoomSearchRepositoryAdapter extends RoomSearchRepository {
  async search({ candidateApartments, filters, cityCoords }) {
    return searchRoomsInCandidateApartments({
      candidateApartments,
      filters,
      cityCoords,
      roomRepository: cachedRoomRepository,
    });
  }

  clearCache() {
    roomsByApartmentIdCache.clear();
  }
}

export const FirestoreCandidateRoomSearchRepository =
  new FirestoreCandidateRoomSearchRepositoryAdapter();
