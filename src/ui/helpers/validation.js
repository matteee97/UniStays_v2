import { isValidFirestoreId } from "@/shared/utils/firestoreId";

export { isValidFirestoreId };

export function parseHostParams(param) {
  if (typeof param !== "string" || param.trim() === "") return null;

  const trimmed = param.trim();
  const userId = trimmed;

  if (!isValidFirestoreId(userId)) {
    return null;
  }

  return { userId };
}
