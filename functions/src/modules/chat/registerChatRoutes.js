"use strict";

const registerChatRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  chatService,
} = {}) => {
  if (!app || !asyncHandler || !requireFirebaseAuth || !chatService) {
    throw new Error("Missing chat routes dependencies.");
  }

  app.post(
    "/v1/chat/conversations/start",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await chatService.startConversation({
        userId: req.firebaseUser.uid,
        hostId: req.body?.hostId,
        apartmentId: req.body?.apartmentId,
        claims: req.firebaseUser,
      });

      if (payload.created) {
        res.status(201).json(payload);
        return;
      }

      res.json(payload);
    })
  );

  app.post(
    "/v1/chat/conversations/:conversationId/messages",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await chatService.postMessage({
        userId: req.firebaseUser.uid,
        conversationId: req.params.conversationId,
        content: req.body?.content,
        type: req.body?.type,
        metadata: req.body?.metadata,
        extraFields: req.body?.extraFields,
      });

      res.status(201).json(payload);
    })
  );

  app.post(
    "/v1/chat/conversations/:conversationId/mark-read",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await chatService.markConversationRead({
        userId: req.firebaseUser.uid,
        conversationId: req.params.conversationId,
      });

      res.json(payload);
    })
  );

  app.post(
    "/v1/chat/conversations/:conversationId/leave",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await chatService.leaveConversation({
        userId: req.firebaseUser.uid,
        conversationId: req.params.conversationId,
      });

      res.json(payload);
    })
  );
};

module.exports = {
  registerChatRoutes,
};
