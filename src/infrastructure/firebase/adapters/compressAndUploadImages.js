import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { storage } from "@/infrastructure/firebase";

const compressAndUploadImages = async (files, annuncioId, subFolder = "") => {
  const urls = [];
  for (let file of files) {
    const compressed = await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    });

    const uniqueName = `${Date.now()}_${file.name}`;
    const folderPath = subFolder
      ? `immagini/apt_${annuncioId}/${subFolder}`
      : `immagini/apt_${annuncioId}`;
    const storageRef = ref(storage, `${folderPath}/${uniqueName}`);
    await uploadBytes(storageRef, compressed);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
};

export default compressAndUploadImages;
