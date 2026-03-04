import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/infrastructure/firebase";

const isStorageUrl = (value) =>
  typeof value === "string" && value.trim().length > 0;

const shouldIgnoreDeleteError = (error) =>
  error?.code === "storage/object-not-found";

export const FirestoreStorageRepository = {
  async deleteByUrl(url) {
    if (!isStorageUrl(url)) return;
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      if (shouldIgnoreDeleteError(error)) return;
      throw error;
    }
  },

  async deleteManyByUrl(urls = []) {
    const uniqueUrls = Array.from(
      new Set((Array.isArray(urls) ? urls : []).filter(isStorageUrl))
    );
    if (!uniqueUrls.length) return;
    await Promise.all(
      uniqueUrls.map((url) => FirestoreStorageRepository.deleteByUrl(url))
    );
  },
};
