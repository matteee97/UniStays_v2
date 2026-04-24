import { describe, expect, test } from "@jest/globals";
import {
  ROOM_OCCUPANCY_STATUS,
} from "@/shared/types";
import {
  getRoomOccupancyConsistencyIssues,
  isRoomOccupancyStatusAllowedForAvailability,
  normalizeRoomOccupancy,
} from "./RoomOccupancyDomain";

describe("RoomOccupancyDomain", () => {
  test("rejects occupied when room is immediately available", () => {
    expect(
      isRoomOccupancyStatusAllowedForAvailability(
        ROOM_OCCUPANCY_STATUS.OCCUPIED,
        true
      )
    ).toBe(false);
  });

  test("rejects available_with_occupants when room is not immediately available", () => {
    expect(
      isRoomOccupancyStatusAllowedForAvailability(
        ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS,
        false
      )
    ).toBe(false);
  });

  test("flags free status with occupied spots", () => {
    const issues = getRoomOccupancyConsistencyIssues({
      availability: { isAvailableNow: true },
      occupancy: {
        status: ROOM_OCCUPANCY_STATUS.FREE,
        capacityTotal: 2,
        spotsOccupied: 1,
      },
    });

    expect(issues.some((issue) => issue.field === "occupancy.spotsOccupied")).toBe(
      true
    );
  });

  test("normalizes spotsAvailable from capacity and occupied", () => {
    const normalized = normalizeRoomOccupancy(
      {
        status: ROOM_OCCUPANCY_STATUS.PARTIALLY_OCCUPIED,
        capacityTotal: 3,
        spotsOccupied: 1,
        spotsAvailable: 0,
      },
      []
    );

    expect(normalized.spotsAvailable).toBe(2);
  });

  test("adjusts occupied status when room is marked as available now", () => {
    const normalized = normalizeRoomOccupancy(
      {
        status: ROOM_OCCUPANCY_STATUS.OCCUPIED,
        capacityTotal: 1,
        spotsOccupied: 1,
      },
      [],
      { isAvailableNow: true }
    );

    expect(normalized.status).not.toBe(ROOM_OCCUPANCY_STATUS.OCCUPIED);
  });
});
