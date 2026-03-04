import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase";
import { APARTMENT_STATUS } from "@/shared/types";
import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

const CITIES_COLLECTION = "cities";
const APPARTAMENTI_COLLECTION = "apartments";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const convertTimestamp = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
};

export const buildCitySlug = (city, provinceCode) => {
  const base = `${city ?? ""}${provinceCode ? `-${provinceCode}` : ""}`
    .trim()
    .toLowerCase();
  return base
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "");
};

const normalizeCityDoc = (docSnap) => {
  const data = docSnap.data() ?? {};
  const city = data.city?.trim() || data.name?.trim() || "";
  const provinceCode = data.provinceCode || "";
  const slug = data.slug || buildCitySlug(city, provinceCode);
  const lat = toNumber(data.lat ?? data.coords?.lat);
  const lng = toNumber(data.lng ?? data.coords?.lng);

  return {
    id: docSnap.id,
    city,
    provinceCode,
    university: data.university ?? "",
    slug,
    imgUrl: data.imgUrl ?? data.imageUrl ?? "",
    coords: { lat, lng },
    active: data.active !== false,
    stats: {
      listingsCount:
        data.stats?.listingsCount ??
        data.listingsCount ??
        null,
    },
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
};

const countListingsForCity = async (cityName) => {
  if (!cityName) return null;
  const q = query(
    collection(db, APPARTAMENTI_COLLECTION),
    where("address.city", "==", cityName),
    where("status", "==", APARTMENT_STATUS.PUBLISHED),
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count ?? 0;
};

export async function fetchCities({ recomputeCounts = false, includeCounts = false } = {}) {
  const shouldComputeCounts = recomputeCounts || includeCounts;
  const q = query(
    collection(db, CITIES_COLLECTION),
    where("active", "==", true)
  );

  const snapshot = await getDocs(q);
  const cities = snapshot.docs.map(normalizeCityDoc);

  if (!shouldComputeCounts) return cities;

  const withCounts = await Promise.all(
    cities.map(async (city) => {
      try {
        const listingsCount = await countListingsForCity(city.city);
        return { ...city, stats: { ...city.stats, listingsCount } };
      } catch (error) {
        console.error("Errore conteggio annunci per", city.city, error);
        return city;
      }
    })
  );

  return withCounts;
}


export async function getCityBySlug(
  slug,
  { recomputeCounts = false, includeCounts = false } = {}
) {
  if (!slug) return null;
  const normalized = slug.toLowerCase();
  const q = query(
    collection(db, CITIES_COLLECTION),
    where("slug", "==", normalized),
    where("active", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const city = normalizeCityDoc(snapshot.docs[0]);
  const shouldComputeCounts = recomputeCounts || includeCounts;
  if (!shouldComputeCounts) return city;

  try {
    const listingsCount = await countListingsForCity(city.city);
    return { ...city, stats: { ...city.stats, listingsCount } };
  } catch (error) {
    console.error("Errore conteggio annunci per", city.city, error);
    return city;
  }
}

export async function createCity(input) {
  const response = await callBackendApi("/v1/admin/cities", {
    method: "POST",
    body: input,
  });
  if (!response?.cityId) {
    throw new Error("Risposta API città non valida.");
  }
  const created = await getDoc(doc(db, CITIES_COLLECTION, response.cityId));
  if (!created.exists()) {
    throw new Error("Impossibile leggere la città creata.");
  }
  return normalizeCityDoc(created);
}

export async function updateCity(id, input) {
  await callBackendApi(`/v1/admin/cities/${id}`, {
    method: "PATCH",
    body: input,
  });
  const updated = await getDoc(doc(db, CITIES_COLLECTION, id));
  if (!updated.exists()) {
    throw new Error("Impossibile leggere la città aggiornata.");
  }
  return normalizeCityDoc(updated);
}

export async function recomputeCitiesListingsCount() {
  const response = await callBackendApi("/v1/admin/cities/recompute-listings-count", {
    method: "POST",
    body: {},
  });
  return Array.isArray(response?.updates) ? response.updates : [];
}

export async function deleteCity(id) {
  await callBackendApi(`/v1/admin/cities/${id}`, {
    method: "DELETE",
  });
  return true;
}

export const FirestoreCityRepository = {
  fetchCities,
  getCityBySlug,
  createCity,
  updateCity,
  recomputeCitiesListingsCount,
  deleteCity,
};
