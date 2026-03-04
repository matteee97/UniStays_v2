"use strict";

const registerApartmentRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  requireAdmin,
  apartmentsService,
} = {}) => {
  if (
    !app ||
    !asyncHandler ||
    !requireFirebaseAuth ||
    !requireAdmin ||
    !apartmentsService
  ) {
    throw new Error("Missing apartments routes dependencies.");
  }

  app.post(
    "/v1/apartments",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await apartmentsService.createApartment({
        ownerId: req.firebaseUser.uid,
        apartmentId: req.body?.apartmentId,
        apartmentData: req.body?.apartmentData || {},
        roomsData: req.body?.roomsData || [],
        ownerPublicOverrides: req.body?.ownerPublicOverrides || null,
        ownerPrivateOverrides: req.body?.ownerPrivateOverrides || null,
      });

      res.status(201).json(payload);
    })
  );

  app.patch(
    "/v1/apartments/:apartmentId/description",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await apartmentsService.updateApartmentDescription({
        apartmentId: req.params.apartmentId,
        uid: req.firebaseUser.uid,
        claims: req.firebaseUser,
        description: req.body?.description,
      });

      res.json(payload);
    })
  );

  app.patch(
    "/v1/apartments/:apartmentId",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await apartmentsService.updateApartment({
        apartmentId: req.params.apartmentId,
        uid: req.firebaseUser.uid,
        claims: req.firebaseUser,
        payload: req.body?.payload,
      });

      res.json(payload);
    })
  );

  app.patch(
    "/v1/apartments/:apartmentId/rooms",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await apartmentsService.updateApartmentRooms({
        apartmentId: req.params.apartmentId,
        uid: req.firebaseUser.uid,
        claims: req.firebaseUser,
        roomUpdates: req.body?.roomUpdates || [],
        aggregates: req.body?.aggregates,
      });

      res.json(payload);
    })
  );

  app.post(
    "/v1/admin/apartments/:apartmentId/publish",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await apartmentsService.publishApartmentByAdmin(
        req.params.apartmentId
      );
      res.json(payload);
    })
  );

  app.post(
    "/v1/admin/apartments/:apartmentId/reject",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await apartmentsService.rejectApartmentByAdmin(
        req.params.apartmentId
      );
      res.json(payload);
    })
  );
};

module.exports = {
  registerApartmentRoutes,
};
