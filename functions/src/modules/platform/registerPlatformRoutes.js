"use strict";

const registerPlatformRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  platformService,
} = {}) => {
  if (
    !app ||
    !asyncHandler ||
    !requireFirebaseAuth ||
    !platformService
  ) {
    throw new Error("Missing platform routes dependencies.");
  }

  app.post(
    "/v1/platform/conversations/ensure",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const userId = req.firebaseUser.uid;
      const conversationId = await platformService.ensureConversation(userId);
      res.json({ conversationId });
    })
  );

  app.post(
    "/v1/platform/messages/mark-read",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const userId = req.firebaseUser.uid;
      const messageIds = Array.isArray(req.body?.messageIds) ? req.body.messageIds : [];
      const payload = await platformService.markMessagesRead({
        userId,
        messageIds,
      });
      res.json(payload);
    })
  );
};

module.exports = {
  registerPlatformRoutes,
};
