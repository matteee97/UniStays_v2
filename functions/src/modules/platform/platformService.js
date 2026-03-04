"use strict";

const createPlatformService = ({
  db,
  FieldValue,
  platformUserId,
  toTrimmedString,
} = {}) => {
  if (
    !db ||
    !FieldValue ||
    typeof platformUserId !== "string" ||
    !platformUserId ||
    typeof toTrimmedString !== "function"
  ) {
    throw new Error("Missing platform service dependencies.");
  }

  const getConversationId = (userId) =>
    `platform_${String(userId || "").replace(/[^a-zA-Z0-9]/g, "_")}`;

  const ensureConversation = async (userId) => {
    const conversationId = getConversationId(userId);
    const conversationRef = db
      .collection("platformConversations")
      .doc(conversationId);
    const snapshot = await conversationRef.get();

    if (!snapshot.exists) {
      await conversationRef.set({
        userId,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return conversationId;
  };

  const markMessagesRead = async ({ userId, messageIds = [] } = {}) => {
    if (!Array.isArray(messageIds) || !messageIds.length) {
      return { updated: 0 };
    }

    const conversationId = getConversationId(userId);
    const baseRef = db
      .collection("platformConversations")
      .doc(conversationId)
      .collection("messages");

    let updated = 0;
    for (let i = 0; i < messageIds.length; i += 400) {
      const chunk = messageIds.slice(i, i + 400);
      const batch = db.batch();
      chunk.forEach((messageId) => {
        const normalizedId = toTrimmedString(messageId);
        if (!normalizedId) return;
        batch.update(baseRef.doc(normalizedId), {
          isRead: true,
          readAt: FieldValue.serverTimestamp(),
        });
        updated += 1;
      });
      // eslint-disable-next-line no-await-in-loop
      await batch.commit();
    }

    return { updated };
  };

  const sendMessage = async ({
    userId,
    message,
    type = "info",
    apartmentId = null,
  } = {}) => {
    if (!userId || !message) return;

    const conversationId = await ensureConversation(userId);
    await db
      .collection("platformConversations")
      .doc(conversationId)
      .collection("messages")
      .add({
        senderId: platformUserId,
        content: String(message),
        timestamp: FieldValue.serverTimestamp(),
        isRead: false,
        type: "text",
        metadata: {},
        platformMessageType: type,
        apartmentId: apartmentId || null,
      });
  };

  const sendVerificationSuccessMessage = async ({
    userId,
    apartmentId,
    apartmentTitle,
  } = {}) => {
    const message = `Ottime notizie!\n\nIl tuo annuncio "${apartmentTitle}" è stato verificato con successo ed è ora visibile sulla piattaforma.\n\nGrazie per aver scelto UniStays!\n\nClicca qui per vedere il tuo annuncio:`;
    await sendMessage({
      userId,
      message,
      type: "success",
      apartmentId,
    });
  };

  const sendRemovalMessage = async ({
    userId,
    apartmentId,
    apartmentTitle,
  } = {}) => {
    const message = `Siamo spiacenti, ma il tuo annuncio "${apartmentTitle}" non è stato pubblicato in quanto non rispetta le nostre linee guida.\n\nSe hai domande o ritieni che questo sia un errore, contattaci tramite la sezione contatti.`;
    await sendMessage({
      userId,
      message,
      type: "error",
      apartmentId,
    });
  };

  return {
    getConversationId,
    ensureConversation,
    markMessagesRead,
    sendMessage,
    sendVerificationSuccessMessage,
    sendRemovalMessage,
  };
};

module.exports = {
  createPlatformService,
};
