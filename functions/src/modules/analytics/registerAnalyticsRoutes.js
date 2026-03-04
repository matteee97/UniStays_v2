"use strict";

const registerAnalyticsRoutes = ({
  app,
  db,
  ApiError,
  asyncHandler,
  attachFirebaseUserOptional,
  toTrimmedString,
  getDateKey,
  getApartmentRef,
  analyticsService,
} = {}) => {
  if (!app || !db || !ApiError || !asyncHandler || !attachFirebaseUserOptional) {
    throw new Error("Missing analytics routes dependencies.");
  }

  app.post(
    "/v1/analytics/events",
    attachFirebaseUserOptional,
    asyncHandler(async (req, res) => {
      const event = req.body || {};
      const kind = toTrimmedString(event.kind);
      const apartmentId = toTrimmedString(event.apartmentId);

      if (!kind || !apartmentId) {
        throw new ApiError(400, "Evento analytics non valido");
      }

      if (kind === "like" && !req.firebaseUser?.uid) {
        throw new ApiError(401, "Autenticazione richiesta per evento like");
      }

      if (kind === "review" && !req.firebaseUser?.uid) {
        throw new ApiError(401, "Autenticazione richiesta per evento review");
      }

      await db.runTransaction(async (tx) => {
        const apartmentRef = getApartmentRef(apartmentId);
        const apartmentSnap = await tx.get(apartmentRef);
        if (!apartmentSnap.exists) {
          return;
        }

        analyticsService.applyAnalyticsInTransaction({
          tx,
          apartmentSnap,
          apartmentRef,
          event: {
            kind,
            apartmentId,
            dateKey: toTrimmedString(event.dateKey) || getDateKey(),
            delta: Number(event.delta),
            added: Number(event.added),
            rating: Number(event.rating),
          },
        });
      });

      res.json({ tracked: true });
    })
  );
};

module.exports = {
  registerAnalyticsRoutes,
};

