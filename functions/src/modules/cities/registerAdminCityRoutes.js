"use strict";

const registerAdminCityRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  requireAdmin,
  citiesService,
} = {}) => {
  if (
    !app ||
    !asyncHandler ||
    !requireFirebaseAuth ||
    !requireAdmin ||
    !citiesService
  ) {
    throw new Error("Missing admin cities routes dependencies.");
  }

  app.post(
    "/v1/admin/cities",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await citiesService.createCity(req.body || {});
      res.status(201).json(payload);
    })
  );

  app.patch(
    "/v1/admin/cities/:cityId",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await citiesService.updateCity({
        cityId: req.params.cityId,
        payload: req.body || {},
      });
      res.json(payload);
    })
  );

  app.delete(
    "/v1/admin/cities/:cityId",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await citiesService.deleteCity(req.params.cityId);
      res.json(payload);
    })
  );

  app.post(
    "/v1/admin/cities/recompute-listings-count",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const payload = await citiesService.recomputeListingsCount();
      res.json(payload);
    })
  );
};

module.exports = {
  registerAdminCityRoutes,
};
