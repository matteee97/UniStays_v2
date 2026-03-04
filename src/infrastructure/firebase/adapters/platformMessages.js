import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase";
import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

export const PLATFORM_USER_ID = "platform_unistays";
export const PLATFORM_CONVERSATION_COLLECTION = "platformConversations";

const getPlatformConversationRef = (conversationId) =>
  doc(db, PLATFORM_CONVERSATION_COLLECTION, conversationId);

const getPlatformMessagesCollection = (conversationId) =>
  collection(db, PLATFORM_CONVERSATION_COLLECTION, conversationId, "messages");

/**
 * Genera un ID prevedibile per la conversazione piattaforma
 */
export function getPlatformConversationId(userId) {
  return `platform_${userId.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

const ensurePlatformConversationByUserId = async (userId) => {
  const conversationId = getPlatformConversationId(userId);
  const conversationRef = getPlatformConversationRef(conversationId);
  const snapshot = await getDoc(conversationRef);

  if (!snapshot.exists()) {
    await setDoc(conversationRef, {
      userId,
      createdAt: serverTimestamp(),
    });
  }

  return conversationId;
};

export async function ensurePlatformConversation() {
  const response = await callBackendApi("/v1/platform/conversations/ensure", {
    method: "POST",
    body: {},
  });
  return response?.conversationId || null;
}

export function subscribePlatformMessages(userId, { onNext, onError } = {}) {
  const conversationId = getPlatformConversationId(userId);
  const messagesQuery = query(
    getPlatformMessagesCollection(conversationId),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const mapped = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onNext?.(mapped);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function markPlatformMessagesRead(userId, messageIds = []) {
  if (!userId || !messageIds.length) return;
  await callBackendApi("/v1/platform/messages/mark-read", {
    method: "POST",
    body: {
      messageIds,
    },
  });
}

const addPlatformMessage = async (
  conversationId,
  senderId,
  content,
  type = "text",
  metadata = {},
  extraFields = {}
) => {
  const messageData = {
    senderId,
    content,
    timestamp: serverTimestamp(),
    isRead: false,
    type,
    metadata,
    ...extraFields,
  };

  const messageRef = await addDoc(
    getPlatformMessagesCollection(conversationId),
    messageData
  );

  return messageRef.id;
};

/**
 * Invia un messaggio della piattaforma a un utente
 */
export async function sendPlatformMessage(userId, message, type = "info", apartmentId = null) {
  if (!userId || !message) {
    throw new Error("User ID e messaggio richiesti");
  }

  try {
    const conversationId = await ensurePlatformConversationByUserId(userId);
    const messageId = await addPlatformMessage(
      conversationId,
      PLATFORM_USER_ID,
      message,
      "text",
      {},
      {
        platformMessageType: type,
        apartmentId: apartmentId || null,
      }
    );

    return messageId;
  } catch (error) {
    console.error("Errore invio messaggio piattaforma:", error);
    throw error;
  }
}

/**
 * Invia messaggio di verifica successo
 */
export async function sendVerificationSuccessMessage(userId, apartmentId, apartmentTitle) {
  const message = `Ottime notizie!\n\nIl tuo annuncio "${apartmentTitle}" è stato verificato con successo ed è ora visibile sulla piattaforma.\n\nGrazie per aver scelto UniStays!\n\nClicca qui per vedere il tuo annuncio:`;
  return await sendPlatformMessage(userId, message, "success", apartmentId);
}

/**
 * Invia messaggio di rimozione
 */
export async function sendRemovalMessage(userId, apartmentId, apartmentTitle) {
  const message = `Siamo spiacenti, ma il tuo annuncio "${apartmentTitle}" non è stato pubblicato in quanto non rispetta le nostre linee guida.\n\nSe hai domande o ritieni che questo sia un errore, contattaci tramite la sezione contatti.`;
  return await sendPlatformMessage(userId, message, "error", apartmentId);
}
