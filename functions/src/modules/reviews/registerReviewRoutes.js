"use strict";

const registerReviewRoutes = ({
  app,
  asyncHandler,
  requireFirebaseAuth,
  reviewsService,
} = {}) => {
  if (!app || !asyncHandler || !requireFirebaseAuth || !reviewsService) {
    throw new Error("Missing reviews routes dependencies.");
  }

  app.post(
    "/v1/reviews",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await reviewsService.createReview({
        userId: req.firebaseUser.uid,
        apartmentId: req.body?.apartmentId,
        rating5: req.body?.rating5,
        text: req.body?.text,
        userName: req.body?.userName,
      });
      res.status(201).json(payload);
    })
  );

  app.post(
    "/v1/reviews/:reviewId/toggle-like",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await reviewsService.toggleReviewLike({
        userId: req.firebaseUser.uid,
        apartmentId: req.body?.apartmentId,
        reviewId: req.params.reviewId,
        isLiked: Boolean(req.body?.isLiked),
      });
      res.json(payload);
    })
  );

  app.post(
    "/v1/reviews/:reviewId/replies",
    requireFirebaseAuth,
    asyncHandler(async (req, res) => {
      const payload = await reviewsService.createReviewReply({
        userId: req.firebaseUser.uid,
        apartmentId: req.body?.apartmentId,
        reviewId: req.params.reviewId,
        text: req.body?.text,
        isOwner: req.body?.isOwner,
      });
      res.status(201).json(payload);
    })
  );
};

module.exports = {
  registerReviewRoutes,
};
