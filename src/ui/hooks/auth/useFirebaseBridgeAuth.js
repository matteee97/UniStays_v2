import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth } from "@/infrastructure/firebase";

const DEFAULT_ENDPOINT =
  import.meta.env.VITE_FIREBASE_TOKEN_ENDPOINT || "/api/firebase/token";

const STATUS = {
  IDLE: "idle",
  SIGNING_IN: "signing_in",
  SIGNED_IN: "signed_in",
  SIGNED_OUT: "signed_out",
  ERROR: "error",
};

/**
 * Bridge authentication between Clerk and Firebase Auth using a server-issued
 * custom token. Keeps Firebase auth state aligned with Clerk session.
 * @typedef {Object} FirebaseBridgeOptions
 * @property {string} [endpoint] Endpoint per ottenere il custom token Firebase.
 * @property {string} [tokenTemplate] Template JWT Clerk da usare per getToken.
 * @param {FirebaseBridgeOptions} [options]
 */
export default function useFirebaseBridgeAuth(options = {}) {
  const { getToken, isLoaded, isSignedIn, userId, sessionId } = useAuth();
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;
  const tokenTemplate =
    options.tokenTemplate || import.meta.env.VITE_CLERK_JWT_TEMPLATE || null;

  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(() => auth.currentUser);
  const [retryTick, setRetryTick] = useState(0);

  const inFlightRef = useRef(false);
  const lastSessionRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribe;
  }, []);

  const retry = useCallback(() => {
    setRetryTick((tick) => tick + 1);
  }, []);

  const signOutFirebase = useCallback(async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Errore signOut Firebase:", err);
    }
  }, []);

  const shouldSignIn = useMemo(() => {
    if (!isSignedIn || !userId) return false;
    if (!firebaseUser) return true;
    if (firebaseUser.uid !== userId) return true;
    if (lastSessionRef.current !== sessionId) return true;
    return false;
  }, [isSignedIn, sessionId, userId, firebaseUser]);

  useEffect(() => {
    if (!isLoaded) return;

    const controller = new AbortController();
    const run = async () => {
      if (!isSignedIn || !userId) {
        lastSessionRef.current = null;
        setError(null);
        setStatus(STATUS.SIGNED_OUT);
        await signOutFirebase();
        return;
      }

      if (!shouldSignIn || inFlightRef.current) {
        setStatus(firebaseUser ? STATUS.SIGNED_IN : STATUS.SIGNING_IN);
        return;
      }

      inFlightRef.current = true;
      setStatus(STATUS.SIGNING_IN);
      setError(null);

      const failSignIn = (message) => {
        const nextError = new Error(message);
        setError(nextError);
        setStatus(STATUS.ERROR);
      };

      try {
        const clerkToken = tokenTemplate
          ? await getToken({ template: tokenTemplate })
          : await getToken();
        if (!clerkToken) {
          failSignIn("Token Clerk mancante.");
          return;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          failSignIn(payload?.error || "Errore nel token Firebase.");
          return;
        }

        if (!payload?.token) {
          failSignIn("Custom token Firebase mancante.");
          return;
        }

        await signInWithCustomToken(auth, payload.token);
        lastSessionRef.current = sessionId || null;
        setStatus(STATUS.SIGNED_IN);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Errore bridge Firebase:", err);
        setError(err);
        setStatus(STATUS.ERROR);
      } finally {
        inFlightRef.current = false;
      }
    };

    void run();

    return () => controller.abort();
  }, [
    isLoaded,
    isSignedIn,
    userId,
    sessionId,
    getToken,
    endpoint,
    tokenTemplate,
    signOutFirebase,
    shouldSignIn,
    firebaseUser,
    retryTick,
  ]);

  return {
    status,
    error,
    firebaseUser,
    retry,
    isReady: status === STATUS.SIGNED_IN,
  };
}
