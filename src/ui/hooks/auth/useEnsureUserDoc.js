import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { auth } from "@/infrastructure/firebase";
import { STORAGE_KEYS } from "@/shared/types";
import { ensureUserDocs } from "@/application/useCases/ensureUserDocs";
import { FirestoreUserRepository } from "@/infrastructure/firebase/repositories/FirestoreUserRepository";

export default function useInitUserDoc({ enabled = true } = {}) {
  const { user, isLoaded, isSignedIn } = useUser();
  const inFlightRef = useRef(false);
  const lastToastRef = useRef(0);
  const lastErrorRef = useRef(null);

  const userId = user?.id || null;
  const baseDisplayName =
    user?.fullName || user?.username || user?.firstName || "Utente";

  const buildStorageKey = (suffix) =>
    `${STORAGE_KEYS.USER_CHECKED}_${userId || "anon"}_${suffix}`;

  const readStorage = (key) => {
    try {
      return sessionStorage.getItem(key) ?? localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writeStorage = (key, value, { persistent = false } = {}) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Ignore storage errors (e.g., disabled storage).
    }
    if (persistent) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore storage errors (e.g., disabled storage).
      }
    }
  };

  const clearStorage = (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
  };

  const shouldSkipAttempt = () => {
    if (!userId) return true;
    const status = readStorage(buildStorageKey("status"));
    if (status === "ok") return true;
    if (status === "blocked") return true;
    if (status === "pending") {
      const pendingAt = Number(readStorage(buildStorageKey("pendingAt")) || 0);
      return Date.now() - pendingAt < 30 * 1000;
    }
    if (status !== "failed") return false;

    const lastAttempt = Number(readStorage(buildStorageKey("failedAt")) || 0);
    const cooldownMs = 5 * 60 * 1000;
    return Date.now() - lastAttempt < cooldownMs;
  };

  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn || !userId) return;
    if (!auth.currentUser || auth.currentUser.uid !== userId) return;
    if (inFlightRef.current) return;
    if (shouldSkipAttempt()) return;

    const ensureDoc = async () => {
      try {
        inFlightRef.current = true;
        writeStorage(buildStorageKey("status"), "pending", { persistent: true });
        writeStorage(buildStorageKey("pendingAt"), String(Date.now()), {
          persistent: true,
        });
        await ensureUserDocs({
          userRepository: FirestoreUserRepository,
          userId,
          publicPayload: {
            userId,
            displayName: baseDisplayName,
            firstName: user?.firstName || null,
            lastName: user?.lastName || null,
            photoUrl: user?.imageUrl || null,
            bio: "",
            isHost: false,
            isVerifiedHost: false,
            isAgency: false,
            publicStats: {
              apartmentsCount: 0,
              reportsCount: 0,
              resolvedReportsCount: 0,
            },
          },
          privatePayload: {
            userId,
            email: user?.emailAddresses[0]?.emailAddress || null,
            phone: null,
            address: null,
            stripeCustomerId: null,
            reportsCount: 0,
            reportsCreatedCount: 0,
            lastReportCreatedAt: null,
            reportRateWindowStartedAt: null,
            reportRateWindowCount: 0,
            settings: {},
          },
        });
        writeStorage(buildStorageKey("status"), "ok", { persistent: true });
        clearStorage(buildStorageKey("failedAt"));
        clearStorage(buildStorageKey("pendingAt"));
      } catch (e) {
        console.error("Errore nella creazione del documento utente:", e);
        const isPermissionError =
          e?.code === "permission-denied" ||
          String(e?.message || "").toLowerCase().includes("permission");
        const statusValue = isPermissionError ? "blocked" : "failed";
        writeStorage(buildStorageKey("status"), statusValue, {
          persistent: true,
        });
        if (!isPermissionError) {
          writeStorage(buildStorageKey("failedAt"), String(Date.now()), {
            persistent: true,
          });
        }
        clearStorage(buildStorageKey("pendingAt"));
        const now = Date.now();
        const shouldToast =
          now - lastToastRef.current > 4000 || lastErrorRef.current !== e;

        if (shouldToast) {
          lastToastRef.current = now;
          lastErrorRef.current = e;
          toast.error(
            isPermissionError
              ? "Profilo utente non verificabile: permessi insufficienti."
              : "Errore durante la verifica del profilo utente"
          );
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    ensureDoc();
  }, [enabled, userId, isLoaded, isSignedIn]);
}
