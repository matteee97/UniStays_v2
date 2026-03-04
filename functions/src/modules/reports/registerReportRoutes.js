"use strict";

const registerReportRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  requireAdmin,
  reportsService,
} = {}) => {
  if (!app || !asyncHandler || !requireFirebaseAuth || !requireAdmin || !reportsService) {
    throw new Error("Missing reports routes dependencies.");
  }

  app.post(
    "/v1/reports",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await reportsService.createReport({
        target: req.body?.target,
        reporterId: req.firebaseUser.uid,
        reason: req.body?.reason,
        message: req.body?.message,
        priority: req.body?.priority,
        reporterSnapshot: req.body?.reporterSnapshot,
      });

      res.status(201).json(payload);
    })
  );

  app.post(
    "/v1/reports/apartments/:apartmentId",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await reportsService.createApartmentReport({
        apartmentId: req.params.apartmentId,
        reporterId: req.firebaseUser.uid,
        reason: req.body?.reason,
        message: req.body?.message,
        priority: req.body?.priority,
        reporterSnapshot: req.body?.reporterSnapshot,
      });

      res.status(201).json(payload);
    })
  );

  app.get(
    "/v1/admin/reports",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await reportsService.listAdminReports(req.query || {});
      res.json(payload);
    })
  );

  app.get(
    "/v1/admin/reports/:reportId",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await reportsService.getAdminReportDetails({
        reportId: req.params.reportId,
      });
      res.json(payload);
    })
  );

  app.patch(
    "/v1/admin/reports/:reportId",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await reportsService.updateAdminReport({
        reportId: req.params.reportId,
        body: req.body,
        handledBy: req.firebaseUser.uid,
      });
      res.json(payload);
    })
  );

  app.post(
    "/v1/admin/reports/:reportId/actions",
    requireFirebaseAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const payload = await reportsService.runAdminQuickAction({
        reportId: req.params.reportId,
        action: req.body?.action,
        note: req.body?.note,
        notifications:
          req.body?.notifications && typeof req.body.notifications === "object"
            ? req.body.notifications
            : undefined,
        handledBy: req.firebaseUser.uid,
      });
      res.json(payload);
    })
  );
};

module.exports = {
  registerReportRoutes,
};
