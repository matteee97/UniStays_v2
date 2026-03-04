"use strict";

const registerAuthRoutes = ({ app, asyncHandler, authService } = {}) => {
  if (!app || !asyncHandler || !authService) {
    throw new Error("Missing auth routes dependencies.");
  }

  app.post(
    "/firebase/token",
    asyncHandler(async (req, res) => {
      const authHeader = req.get("Authorization") || "";
      const rawToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      const payload = await authService.exchangeClerkToken(rawToken);
      res.json(payload);
    })
  );
};

module.exports = {
  registerAuthRoutes,
};
