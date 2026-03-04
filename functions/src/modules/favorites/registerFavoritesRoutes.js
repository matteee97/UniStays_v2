"use strict";

const registerFavoritesRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  favoritesService,
  ApiError,
  toTrimmedString,
  parseIntInRange,
  getDateKey,
  defaultReceivedLikesLimit = 40,
  maxReceivedLikesLimit = 200,
} = {}) => {
  if (
    !app ||
    !asyncHandler ||
    !requireFirebaseAuth ||
    !favoritesService ||
    !ApiError ||
    typeof toTrimmedString !== "function" ||
    typeof parseIntInRange !== "function" ||
    typeof getDateKey !== "function"
  ) {
    throw new Error("Missing favorites routes dependencies.");
  }

  app.post(
    "/v1/favorites",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const userId = req.firebaseUser.uid;
      const apartmentId = toTrimmedString(req.body?.apartmentId);
      const dateKey = toTrimmedString(req.body?.dateKey) || getDateKey();
      if (!apartmentId) {
        throw new ApiError(400, "Apartment ID mancante");
      }

      await favoritesService.addFavorite({
        userId,
        apartmentId,
        dateKey,
      });

      res.json({ favorited: true });
    })
  );

  app.get(
    "/v1/favorites/received",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const ownerId = req.firebaseUser.uid;
      const limit = parseIntInRange(req.query?.limit, defaultReceivedLikesLimit, {
        min: 1,
        max: maxReceivedLikesLimit,
      });

      const payload = await favoritesService.listReceivedLikes({
        ownerId,
        limit,
        maxLimit: maxReceivedLikesLimit,
      });

      res.json(payload);
    })
  );

  app.delete(
    "/v1/favorites/:apartmentId",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const userId = req.firebaseUser.uid;
      const apartmentId = toTrimmedString(req.params.apartmentId);
      const dateKey = toTrimmedString(req.query?.dateKey) || getDateKey();

      if (!apartmentId) {
        throw new ApiError(400, "Apartment ID mancante");
      }

      await favoritesService.removeFavorite({
        userId,
        apartmentId,
        dateKey,
      });

      res.json({ favorited: false });
    })
  );
};

module.exports = {
  registerFavoritesRoutes,
};
