import { describe, expect, test } from "@jest/globals";
import appartamentiReducer, {
  fetchStart,
  fetchSuccess,
  resetQueryState,
  selectAppartamentiQueryState,
  setTotalCount,
} from "./appartamentiSlice";

const QUERY_A = "query-a";
const QUERY_B = "query-b";

describe("appartamentiSlice byQueryKey", () => {
  test("keeps two queries isolated without overwriting each other", () => {
    let state = appartamentiReducer(undefined, { type: "@@INIT" });

    state = appartamentiReducer(state, fetchStart({ queryKey: QUERY_A }));
    state = appartamentiReducer(
      state,
      fetchSuccess({
        queryKey: QUERY_A,
        nuoviAppartamenti: [{ id: "a-1", title: "A1" }],
        snapshotLength: 1,
        limitUsed: 10,
        cursor: "a-1",
      })
    );

    state = appartamentiReducer(state, fetchStart({ queryKey: QUERY_B }));
    state = appartamentiReducer(
      state,
      fetchSuccess({
        queryKey: QUERY_B,
        nuoviAppartamenti: [{ id: "b-1", title: "B1" }],
        snapshotLength: 1,
        limitUsed: 10,
        cursor: "b-1",
      })
    );

    state = appartamentiReducer(
      state,
      fetchSuccess({
        queryKey: QUERY_A,
        nuoviAppartamenti: [{ id: "a-2", title: "A2" }],
        snapshotLength: 1,
        limitUsed: 10,
        cursor: "a-2",
      })
    );
    state = appartamentiReducer(
      state,
      setTotalCount({ queryKey: QUERY_A, totalCount: 22 })
    );

    const queryAState = selectAppartamentiQueryState(
      { appartamenti: state },
      QUERY_A
    );
    const queryBState = selectAppartamentiQueryState(
      { appartamenti: state },
      QUERY_B
    );

    expect(queryAState.items.map((item) => item.id)).toEqual(["a-1", "a-2"]);
    expect(queryAState.cursor).toBe("a-2");
    expect(queryAState.totalCount).toBe(22);

    expect(queryBState.items.map((item) => item.id)).toEqual(["b-1"]);
    expect(queryBState.cursor).toBe("b-1");
    expect(queryBState.totalCount).toBeNull();
  });

  test("resets only the targeted query key", () => {
    let state = appartamentiReducer(undefined, { type: "@@INIT" });

    state = appartamentiReducer(
      state,
      fetchSuccess({
        queryKey: QUERY_A,
        nuoviAppartamenti: [{ id: "a-1" }],
        snapshotLength: 1,
        limitUsed: 10,
        cursor: "a-1",
      })
    );
    state = appartamentiReducer(
      state,
      fetchSuccess({
        queryKey: QUERY_B,
        nuoviAppartamenti: [{ id: "b-1" }],
        snapshotLength: 1,
        limitUsed: 10,
        cursor: "b-1",
      })
    );

    state = appartamentiReducer(state, resetQueryState({ queryKey: QUERY_A }));

    const queryAState = selectAppartamentiQueryState(
      { appartamenti: state },
      QUERY_A
    );
    const queryBState = selectAppartamentiQueryState(
      { appartamenti: state },
      QUERY_B
    );

    expect(queryAState.items).toEqual([]);
    expect(queryAState.cursor).toBeNull();
    expect(queryAState.hasFetched).toBe(false);
    expect(queryBState.items.map((item) => item.id)).toEqual(["b-1"]);
  });
});

