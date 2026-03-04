/** @jest-environment jsdom */

import React, { useEffect } from "react";
import { act } from "react";
import { describe, expect, jest, test } from "@jest/globals";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import appartamentiReducer from "@/app/store/slices/appartamentiSlice";

const fetchPageMock = jest.fn();
const countByConstraintsMock = jest.fn();

jest.unstable_mockModule(
  "@/infrastructure/firebase/repositories/FirestoreApartmentRepository",
  () => ({
    FirestoreApartmentRepository: {
      fetchAppartamentiPage: fetchPageMock,
      countByConstraints: countByConstraintsMock,
    },
  })
);

const { useFetchAppartamenti } = await import("./useFetchAppartamenti");

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const createDeferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const flushMicrotasks = async (times = 4) => {
  for (let index = 0; index < times; index += 1) {
    await Promise.resolve();
  }
};

const makeDocs = (prefix, count) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    title: `${prefix}-${index + 1}`,
  }));

function HookProbe({ query, pageSize = 5, options = {}, onUpdate }) {
  const value = useFetchAppartamenti(query, pageSize, {
    queryScope: "test-hook",
    ...options,
  });

  useEffect(() => {
    onUpdate(value);
  }, [onUpdate, value]);

  return null;
}

const renderWithProvider = ({
  root,
  store,
  query,
  onUpdate,
  pageSize = 5,
  options = {},
}) => {
  root.render(
    React.createElement(
      Provider,
      { store },
      React.createElement(HookProbe, { query, onUpdate, pageSize, options })
    )
  );
};

const mountHook = () => {
  const store = configureStore({
    reducer: {
      appartamenti: appartamentiReducer,
    },
  });

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let latest = null;

  const render = async ({ query, pageSize, options }) => {
    await act(async () => {
      renderWithProvider({
        root,
        store,
        query,
        pageSize,
        options,
        onUpdate: (value) => {
          latest = value;
        },
      });
      await flushMicrotasks();
    });
  };

  const cleanup = async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  };

  return {
    render,
    cleanup,
    getLatest: () => latest,
  };
};

describe("useFetchAppartamenti", () => {
  test("keeps current query state stable on rapid query change", async () => {
    const deferredByCity = new Map();
    fetchPageMock.mockReset();
    countByConstraintsMock.mockReset();

    fetchPageMock.mockImplementation(({ constraints }) => {
      const city = constraints?.[0]?.value;
      const deferred = createDeferred();
      deferredByCity.set(city, deferred);
      return deferred.promise;
    });
    countByConstraintsMock.mockResolvedValue(0);

    const hook = mountHook();

    const queryRome = [{ type: "where", field: "address.city", value: "Rome" }];
    const queryMilan = [{ type: "where", field: "address.city", value: "Milan" }];

    await hook.render({ query: queryRome });
    await hook.render({ query: queryMilan });

    expect(deferredByCity.has("Milan")).toBe(true);
    expect(deferredByCity.has("Rome")).toBe(true);

    await act(async () => {
      deferredByCity.get("Milan").resolve({
        docs: [{ id: "mi-1", title: "Milano" }],
        cursor: "mi-1",
        snapshotLength: 1,
      });
      await flushMicrotasks();
    });

    expect(hook.getLatest().appartamenti.map((entry) => entry.id)).toEqual([
      "mi-1",
    ]);

    await act(async () => {
      deferredByCity.get("Rome").resolve({
        docs: [{ id: "rm-1", title: "Roma" }],
        cursor: "rm-1",
        snapshotLength: 1,
      });
      await flushMicrotasks();
    });

    expect(hook.getLatest().appartamenti.map((entry) => entry.id)).toEqual([
      "mi-1",
    ]);

    await hook.cleanup();
  });

  test("progressive mode fetches multiple ranked batches until page target is reached", async () => {
    fetchPageMock.mockReset();
    countByConstraintsMock.mockReset();

    const firstBatch = makeDocs("batch-1", 40);
    const secondBatch = makeDocs("batch-2", 40);

    fetchPageMock
      .mockResolvedValueOnce({
        docs: firstBatch,
        cursor: "cursor-1",
        snapshotLength: 40,
      })
      .mockResolvedValueOnce({
        docs: secondBatch,
        cursor: "cursor-2",
        snapshotLength: 40,
      });
    countByConstraintsMock.mockResolvedValue(0);

    const hook = mountHook();
    await hook.render({
      query: [{ type: "where", field: "address.city", value: "Perugia" }],
      pageSize: 24,
      options: {
        progressiveMode: true,
        progressiveBatchRange: { min: 40, max: 60 },
        applyClientFilters: (docs) =>
          docs.filter((doc) => Number(doc.id.split("-").at(-1)) % 2 === 0),
      },
    });

    const latest = hook.getLatest();
    expect(fetchPageMock).toHaveBeenCalledTimes(2);
    expect(fetchPageMock.mock.calls[0][0].pageSize).toBe(40);
    expect(fetchPageMock.mock.calls[1][0].pageSize).toBe(40);
    expect(latest.appartamenti.length).toBeGreaterThanOrEqual(24);
    expect(latest.allLoaded).toBe(false);

    await hook.cleanup();
  });

  test("progressive mode keeps fetching until dataset exhaustion for restrictive filters", async () => {
    fetchPageMock.mockReset();
    countByConstraintsMock.mockReset();

    fetchPageMock
      .mockResolvedValueOnce({
        docs: makeDocs("strict-1", 40),
        cursor: "strict-cursor-1",
        snapshotLength: 40,
      })
      .mockResolvedValueOnce({
        docs: makeDocs("strict-2", 13),
        cursor: "strict-cursor-2",
        snapshotLength: 13,
      });

    const hook = mountHook();
    await hook.render({
      query: [{ type: "where", field: "address.city", value: "Roma" }],
      pageSize: 24,
      options: {
        progressiveMode: true,
        progressiveBatchRange: { min: 40, max: 60 },
        applyClientFilters: () => [],
      },
    });

    const latest = hook.getLatest();
    expect(fetchPageMock).toHaveBeenCalledTimes(2);
    expect(latest.appartamenti).toEqual([]);
    expect(latest.allLoaded).toBe(true);

    await hook.cleanup();
  });

  test("ignores stale in-flight response after refetch on the same query", async () => {
    fetchPageMock.mockReset();
    countByConstraintsMock.mockReset();

    const staleDeferred = createDeferred();

    fetchPageMock
      .mockImplementationOnce(() => staleDeferred.promise)
      .mockResolvedValueOnce({
        docs: [{ id: "fresh-1", title: "Fresh apartment" }],
        cursor: "fresh-1",
        snapshotLength: 1,
      });

    const hook = mountHook();
    await hook.render({
      query: [{ type: "where", field: "address.city", value: "Bologna" }],
      pageSize: 5,
    });

    await act(async () => {
      hook.getLatest().refetch();
      await flushMicrotasks();
    });

    expect(hook.getLatest().appartamenti.map((entry) => entry.id)).toEqual([
      "fresh-1",
    ]);

    await act(async () => {
      staleDeferred.resolve({
        docs: [{ id: "stale-1", title: "Stale apartment" }],
        cursor: "stale-1",
        snapshotLength: 1,
      });
      await flushMicrotasks();
    });

    expect(hook.getLatest().appartamenti.map((entry) => entry.id)).toEqual([
      "fresh-1",
    ]);

    await hook.cleanup();
  });
});
