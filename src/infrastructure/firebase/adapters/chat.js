import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase";
import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

const getMessagesCollection = (conversationId) =>
  collection(db, "conversations", conversationId, "messages");

/**
 * Crea (o recupera) una conversazione tra utente e host per un annuncio.
 * L'ID utente viene validato lato backend tramite Firebase token.
 */
export const createConversation = async (
  userId,
  hostId,
  apartmentId = null,
  initialMessage = null
) => {
  if (!apartmentId) {
    throw new Error("apartmentId è obbligatorio per creare una conversazione");
  }

  const response = await callBackendApi("/v1/chat/conversations/start", {
    method: "POST",
    body: {
      hostId,
      apartmentId,
    },
  });

  const conversationId = response?.conversationId || null;
  if (!conversationId) {
    throw new Error("Impossibile creare la conversazione");
  }

  if (initialMessage) {
    await addMessage(conversationId, userId, initialMessage);
  }

  return conversationId;
};

/**
 * Aggiunge un messaggio a una conversazione.
 * senderId è mantenuto per compatibilità con i callsite legacy.
 */
export const addMessage = async (
  conversationId,
  _senderId,
  content,
  type = "text",
  metadata = {},
  extraFields = {}
) => {
  if (!conversationId) {
    throw new Error("Conversazione non valida");
  }

  const normalizedContent = typeof content === "string" ? content.trim() : "";
  if (!normalizedContent) {
    throw new Error("Messaggio vuoto");
  }

  const response = await callBackendApi(
    `/v1/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: {
        content: normalizedContent,
        type,
        metadata,
        extraFields,
      },
    }
  );

  return response?.messageId || null;
};

/**
 * Segna tutti i messaggi non letti della conversazione come letti.
 */
export const markMessagesAsRead = async (conversationId) => {
  if (!conversationId) return;

  await callBackendApi(`/v1/chat/conversations/${conversationId}/mark-read`, {
    method: "POST",
    body: {},
  });
};

/**
 * Ottiene le conversazioni di un utente in realtime.
 */
export const getUserConversations = (userId, callback) => {
  const conversationsQuery = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(
    conversationsQuery,
    (snapshot) => {
      const conversations = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      callback(conversations);
    },
    (error) => {
      console.error(error);
      callback([]);
    }
  );
};

/**
 * Ottiene i messaggi di una conversazione in realtime.
 */
export const getConversationMessages = (conversationId, callback) => {
  const messagesQuery = query(
    getMessagesCollection(conversationId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      callback(messages);
    },
    (error) => {
      console.error(error);
      callback([]);
    }
  );
};

export const hasMessageWithBookingKey = async (conversationId, bookingKey) => {
  if (!conversationId || !bookingKey) return false;

  const messagesQuery = query(
    getMessagesCollection(conversationId),
    where("metadata.bookingKey", "==", bookingKey),
    limit(1)
  );

  const snapshot = await getDocs(messagesQuery);
  return !snapshot.empty;
};

/**
 * Cerca o crea una conversazione per annuncio.
 */
export const findOrCreateConversation = async (userId, hostId, apartmentId) => {
  return createConversation(userId, hostId, apartmentId);
};

/**
 * Rimuove l'utente corrente dalla conversazione (soft delete lato utente).
 */
export const removeUserFromConversation = async (conversationId) => {
  if (!conversationId) return;

  await callBackendApi(`/v1/chat/conversations/${conversationId}/leave`, {
    method: "POST",
    body: {},
  });
};

/**
 * Compatibilità legacy: eliminazione conversazione.
 */
export const deleteConversationCompletely = async (conversationId) => {
  return removeUserFromConversation(conversationId);
};

/**
 * Compatibilità legacy: eliminazione conversazione.
 */
export const deleteConversation = async (conversationId) => {
  return removeUserFromConversation(conversationId);
};
