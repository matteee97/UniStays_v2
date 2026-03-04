"use strict";

const createAuthService = ({
  verifyToken,
  createClerkClient,
  clerkSecretProvider,
  createFirebaseCustomToken,
  ApiError,
} = {}) => {
  if (
    typeof verifyToken !== "function" ||
    typeof createClerkClient !== "function" ||
    typeof clerkSecretProvider !== "function" ||
    typeof createFirebaseCustomToken !== "function" ||
    !ApiError
  ) {
    throw new Error("Missing auth service dependencies.");
  }

  const exchangeClerkToken = async (rawToken) => {
    if (!rawToken) {
      throw new ApiError(401, "Missing Clerk token");
    }

    const secret = clerkSecretProvider();
    if (!secret) {
      throw new ApiError(500, "Missing CLERK_SECRET_KEY");
    }

    let payload;
    try {
      payload = await verifyToken(rawToken, { secretKey: secret });
    } catch (_) {
      throw new ApiError(401, "Invalid Clerk token");
    }

    const clerkUserId = payload?.sub;
    if (!clerkUserId) {
      throw new ApiError(401, "Invalid Clerk token");
    }

    let isAdmin = false;
    try {
      const clerkClient = createClerkClient({ secretKey: secret });
      const user = await clerkClient.users.getUser(clerkUserId);
      isAdmin = user?.privateMetadata?.role === "admin";
    } catch (_) {
      // Keep default non-admin if Clerk lookup fails.
    }

    try {
      const token = await createFirebaseCustomToken(
        clerkUserId,
        isAdmin ? { role: "admin" } : undefined
      );
      return { token };
    } catch (error) {
      const message =
        error?.message || "Errore generazione custom token Firebase";
      const hint = message.includes("signBlob")
        ? "Concedi il ruolo Service Account Token Creator al service account della Cloud Function."
        : null;

      throw new ApiError(500, message, hint ? { hint } : null);
    }
  };

  return {
    exchangeClerkToken,
  };
};

module.exports = {
  createAuthService,
};
