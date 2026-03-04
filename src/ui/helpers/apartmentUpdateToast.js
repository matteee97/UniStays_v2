import { toast } from "sonner";
import { getApartmentUpdateDiffDays, getRemainingDaysToUpdate } from "@/core/policies/canUpdateApartment.policy";

export function showCannotUpdateApartmentToast(params) {
  const diffDays = getApartmentUpdateDiffDays(params);
  const remainingDays = getRemainingDaysToUpdate(params);

  toast.error(
    `Non puoi modificare l'annuncio adesso. Ultima modifica: ${
      diffDays === 0 ? "oggi" : diffDays === 1 ? "ieri" : `${diffDays} giorni fa`
    }. Riprova ${
      remainingDays === 1 ? "domani" : `tra ${remainingDays} giorni`
    }.`,
    { duration: 6000 }
  );
}
