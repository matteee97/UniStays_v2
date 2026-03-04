"use strict";

const registerUserRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  usersService,
} = {}) => {
  if (!app || !asyncHandler || !requireFirebaseAuth || !usersService) {
    throw new Error("Missing users routes dependencies.");
  }

  app.post(
    "/v1/users/public",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const userId = req.firebaseUser.uid;
      const payload = req.body?.payload || {};
      const result = await usersService.ensurePublicUser({ userId, payload });
      res.json(result);
    })
  );

  app.post(
    "/v1/users/private",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const userId = req.firebaseUser.uid;
      const payload = req.body?.payload || {};
      const result = await usersService.ensurePrivateUser({ userId, payload });
      res.json(result);
    })
  );
};

module.exports = {
  registerUserRoutes,
};
