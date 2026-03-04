import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

/**
 * Rifiuta/rimuove un annuncio tramite backend admin API.
 * userId è mantenuto solo per compatibilità con i callsite esistenti.
 */
export const removeAnnuncio = async (annuncioId) => {
  if (!annuncioId) {
    return;
  }

  await callBackendApi(`/v1/admin/apartments/${annuncioId}/reject`, {
    method: "POST",
    body: {},
  });
};
