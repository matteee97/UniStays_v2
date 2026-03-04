/**
 * @typedef {import("@/core/ports/UserRepository").UserRepository} UserRepository
 */

/**
 * @typedef {Object} FetchUserDataParams
 * @property {UserRepository} userRepository
 * @property {string} userId
 * @property {"public" | "private" | "combined"} [scope]
 * @property {boolean} [allowMissing]
 */

const resolvePublicUser = (userRepository, userId, allowMissing) =>
  userRepository.getPublicById(userId, { allowMissing });

const resolvePrivateUser = (userRepository, userId, allowMissing) =>
  userRepository.getPrivateById(userId, { allowMissing });

export async function fetchUserData({
  userRepository,
  userId,
  scope = "public",
  allowMissing = false,
}) {
  if (!userRepository) {
    throw new Error("UserRepository mancante.");
  }

  if (scope === "private") {
    return resolvePrivateUser(userRepository, userId, allowMissing);
  }

  if (scope === "combined") {
    const [publicResult, privateResult] = await Promise.allSettled([
      resolvePublicUser(userRepository, userId, allowMissing),
      resolvePrivateUser(userRepository, userId, allowMissing),
    ]);

    if (publicResult.status === "rejected") {
      if (allowMissing) return null;
      throw publicResult.reason;
    }

    if (!publicResult.value) {
      if (allowMissing) return null;
      throw new Error("Utente non trovato.");
    }

    if (privateResult.status === "fulfilled" && privateResult.value) {
      return { ...publicResult.value, ...privateResult.value };
    }

    return publicResult.value;
  }

  return resolvePublicUser(userRepository, userId, allowMissing);
}
