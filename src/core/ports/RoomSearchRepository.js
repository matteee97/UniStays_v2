/**
 * Port for searching room-level listing results.
 *
 * The current adapter derives rooms from candidate apartment documents and their
 * rooms subcollections. A future indexed projection can implement the same
 * contract without changing UI or application orchestration.
 */
export class RoomSearchRepository {
  /**
   * @param {object} params
   * @param {Array<object>} params.candidateApartments
   * @param {object | null} params.filters
   * @param {{lat:number,lng:number} | null} params.cityCoords
   * @returns {Promise<Array<object>>}
   */
  async search() {
    throw new Error("RoomSearchRepository.search must be implemented.");
  }
}
