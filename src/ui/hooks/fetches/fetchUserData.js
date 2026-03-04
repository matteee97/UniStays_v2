import { fetchUserData as fetchUserDataUseCase } from "@/application/useCases/fetchUserData";
import { FirestoreUserRepository } from "@/infrastructure/firebase/repositories/FirestoreUserRepository";

export const fetchPublicUserData = async (userId, options = {}) =>
  fetchUserDataUseCase({
    userRepository: FirestoreUserRepository,
    userId,
    scope: "public",
    allowMissing: options.allowMissing === true,
  });

export const fetchPrivateUserData = async (userId, options = {}) =>
  fetchUserDataUseCase({
    userRepository: FirestoreUserRepository,
    userId,
    scope: "private",
    allowMissing: options.allowMissing === true,
  });

export default async function fetchUserData(userId, options = {}) {
  return fetchUserDataUseCase({
    userRepository: FirestoreUserRepository,
    userId,
    scope: options.scope || "public",
    allowMissing: options.allowMissing === true,
  });
}
