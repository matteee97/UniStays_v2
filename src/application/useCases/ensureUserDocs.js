/**
 * @typedef {import("@/core/ports/UserRepository").UserRepository} UserRepository
 */

/**
 * @typedef {Object} EnsureUserDocsParams
 * @property {UserRepository} userRepository
 * @property {string} userId
 * @property {Object} publicPayload
 * @property {Object} privatePayload
 */

export async function ensureUserDocs({
  userRepository,
  userId,
  publicPayload,
  privatePayload,
}) {
  if (!userRepository) {
    throw new Error("UserRepository mancante.");
  }
  if (!userId) {
    throw new Error("ID utente non fornito.");
  }

  const [publicDoc, privateDoc] = await Promise.all([
    userRepository.getPublicById(userId, { allowMissing: true }),
    userRepository.getPrivateById(userId, { allowMissing: true }),
  ]);

  if (!publicDoc) {
    await userRepository.createPublic(userId, publicPayload);
  }

  if (!privateDoc) {
    await userRepository.createPrivate(userId, privatePayload);
  }
}
