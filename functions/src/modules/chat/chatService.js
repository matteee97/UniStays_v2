"use strict";

const createChatService = ({
  db,
  FieldValue,
  APARTMENT_STATUS,
  ApiError,
  toTrimmedString,
} = {}) => {
  if (
    !db ||
    !FieldValue ||
    !APARTMENT_STATUS ||
    !ApiError ||
    typeof toTrimmedString !== "function"
  ) {
    throw new Error("Missing chat service dependencies.");
  }

  const startConversation = async ({ userId, hostId, apartmentId, claims } = {}) => {
    const normalizedHostId = toTrimmedString(hostId);
    const normalizedApartmentId = toTrimmedString(apartmentId);
    const requesterRole = String(
      claims?.role || claims?.claims?.role || ""
    ).toLowerCase();
    const isAdminUser = requesterRole === "admin";

    if (!normalizedHostId || !normalizedApartmentId) {
      throw new ApiError(400, "hostId e apartmentId sono obbligatori");
    }

    if (normalizedHostId === userId) {
      throw new ApiError(400, "Non puoi aprire una chat con te stesso");
    }

    const existingSnapshot = await db
      .collection("conversations")
      .where("participants", "array-contains", userId)
      .where("apartmentId", "==", normalizedApartmentId)
      .get();

    const existing = existingSnapshot.docs.find((docSnap) => {
      const data = docSnap.data() || {};
      const participants = Array.isArray(data.participants) ? data.participants : [];
      return participants.includes(normalizedHostId);
    });

    if (existing) {
      return { conversationId: existing.id, created: false };
    }

    const apartmentRef = db.collection("apartments").doc(normalizedApartmentId);
    const apartmentSnap = await apartmentRef.get();
    if (!apartmentSnap.exists) {
      throw new ApiError(404, "Annuncio non trovato");
    }

    if (!isAdminUser) {
      const apartmentData = apartmentSnap.data() || {};
      const ownerId = toTrimmedString(apartmentData.ownerId);
      if (!ownerId) {
        throw new ApiError(422, "Owner annuncio non valido");
      }

      const requesterIsOwner = ownerId === userId;
      const targetIsOwner = ownerId === normalizedHostId;

      if (requesterIsOwner) {
        const likeSnap = await apartmentRef.collection("likes").doc(normalizedHostId).get();
        if (!likeSnap.exists) {
          throw new ApiError(
            403,
            "Puoi contattare solo utenti che hanno messo like a questo annuncio."
          );
        }
      } else {
        if (!targetIsOwner) {
          throw new ApiError(
            403,
            "Il destinatario della chat deve essere il proprietario dell'annuncio."
          );
        }
        if (apartmentData.status !== APARTMENT_STATUS.PUBLISHED) {
          throw new ApiError(
            403,
            "Non puoi avviare una chat su un annuncio non pubblicato."
          );
        }
      }
    }

    const conversationRef = await db.collection("conversations").add({
      participants: [userId, normalizedHostId],
      userId,
      hostId: normalizedHostId,
      apartmentId: normalizedApartmentId,
      lastMessage: "",
      lastMessageTime: FieldValue.serverTimestamp(),
      lastMessageSender: userId,
      unreadCount: { [normalizedHostId]: 0 },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { conversationId: conversationRef.id, created: true };
  };

  const postMessage = async ({
    userId,
    conversationId,
    content,
    type,
    metadata,
    extraFields,
  } = {}) => {
    const normalizedConversationId = toTrimmedString(conversationId);
    const normalizedContent = toTrimmedString(content);
    const normalizedType = toTrimmedString(type || "text") || "text";
    const safeMetadata =
      metadata && typeof metadata === "object" ? metadata : {};
    const safeExtraFields =
      extraFields && typeof extraFields === "object" ? extraFields : {};

    if (!normalizedConversationId || !normalizedContent) {
      throw new ApiError(400, "Messaggio non valido");
    }

    const conversationRef = db.collection("conversations").doc(normalizedConversationId);
    const messageRef = conversationRef.collection("messages").doc();

    await db.runTransaction(async (tx) => {
      const conversationSnap = await tx.get(conversationRef);
      if (!conversationSnap.exists) {
        throw new ApiError(404, "Conversazione non trovata");
      }

      const conversation = conversationSnap.data() || {};
      const participants = Array.isArray(conversation.participants)
        ? conversation.participants
        : [];

      if (!participants.includes(userId)) {
        throw new ApiError(403, "Non puoi inviare messaggi in questa conversazione");
      }

      if (participants.length <= 1) {
        throw new ApiError(
          409,
          "Non puoi inviare messaggi in questa conversazione. L'altro partecipante ha rimosso la chat."
        );
      }

      const unreadCount = {
        ...(conversation.unreadCount || {}),
      };

      participants.forEach((participantId) => {
        if (participantId !== userId) {
          unreadCount[participantId] = Number(unreadCount[participantId] || 0) + 1;
        }
      });

      tx.set(messageRef, {
        senderId: userId,
        content: normalizedContent,
        timestamp: FieldValue.serverTimestamp(),
        isRead: false,
        type: normalizedType,
        metadata: safeMetadata,
        ...safeExtraFields,
      });

      tx.update(conversationRef, {
        lastMessage: normalizedContent,
        lastMessageTime: FieldValue.serverTimestamp(),
        lastMessageSender: userId,
        unreadCount,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { messageId: messageRef.id };
  };

  const markConversationRead = async ({ userId, conversationId } = {}) => {
    const normalizedConversationId = toTrimmedString(conversationId);
    if (!normalizedConversationId) {
      throw new ApiError(400, "Conversation ID mancante");
    }

    const conversationRef = db.collection("conversations").doc(normalizedConversationId);

    await db.runTransaction(async (tx) => {
      const conversationSnap = await tx.get(conversationRef);
      if (!conversationSnap.exists) {
        throw new ApiError(404, "Conversazione non trovata");
      }

      const conversation = conversationSnap.data() || {};
      const participants = Array.isArray(conversation.participants)
        ? conversation.participants
        : [];

      if (!participants.includes(userId)) {
        throw new ApiError(403, "Operazione non consentita");
      }

      const unreadCount = {
        ...(conversation.unreadCount || {}),
        [userId]: 0,
      };

      tx.update(conversationRef, {
        unreadCount,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const messagesSnapshot = await conversationRef.collection("messages").get();

    const unreadDocs = messagesSnapshot.docs.filter((docSnap) => {
      const data = docSnap.data() || {};
      return data.senderId !== userId && data.isRead !== true;
    });

    for (let i = 0; i < unreadDocs.length; i += 400) {
      const chunk = unreadDocs.slice(i, i + 400);
      const batch = db.batch();
      chunk.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          isRead: true,
          readAt: FieldValue.serverTimestamp(),
        });
      });
      // eslint-disable-next-line no-await-in-loop
      await batch.commit();
    }

    return { updated: true };
  };

  const leaveConversation = async ({ userId, conversationId } = {}) => {
    const normalizedConversationId = toTrimmedString(conversationId);
    if (!normalizedConversationId) {
      throw new ApiError(400, "Conversation ID mancante");
    }

    const conversationRef = db.collection("conversations").doc(normalizedConversationId);
    let shouldDeleteCompletely = false;

    await db.runTransaction(async (tx) => {
      const conversationSnap = await tx.get(conversationRef);
      if (!conversationSnap.exists) {
        throw new ApiError(404, "Conversazione non trovata");
      }

      const conversation = conversationSnap.data() || {};
      const currentParticipants = Array.isArray(conversation.participants)
        ? conversation.participants
        : [];

      if (!currentParticipants.includes(userId)) {
        throw new ApiError(403, "Operazione non consentita");
      }

      const updatedParticipants = currentParticipants.filter((id) => id !== userId);

      if (!updatedParticipants.length) {
        shouldDeleteCompletely = true;
        return;
      }

      tx.update(conversationRef, {
        participants: updatedParticipants,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    if (shouldDeleteCompletely) {
      await db.recursiveDelete(conversationRef);
      return { removed: true, deletedCompletely: true };
    }

    await conversationRef.collection("messages").add({
      senderId: userId,
      content:
        "L'altro partecipante ha rimosso questa conversazione. Non puoi più inviare messaggi.",
      timestamp: FieldValue.serverTimestamp(),
      isRead: false,
      isSystemMessage: true,
    });

    return { removed: true, deletedCompletely: false };
  };

  return {
    startConversation,
    postMessage,
    markConversationRead,
    leaveConversation,
  };
};

module.exports = {
  createChatService,
};
