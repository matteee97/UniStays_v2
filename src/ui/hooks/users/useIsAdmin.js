import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/infrastructure/firebase";
import useFirebaseBridgeAuth from "../auth/useFirebaseBridgeAuth"; 
import { USER_ROLES } from "@/shared/types";

/**
 * Admin = VERITÀ: Firebase custom claims (role === ADMIN)
 */
export function useIsAdmin() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isReady: isFirebaseReady } = useFirebaseBridgeAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (isLoaded && !isSignedIn) {
      setIsAdmin(false);
      setLoading(false);
      return undefined;
    }

    // se il bridge non è pronto, ancora non ha senso leggere claims
    if (!isFirebaseReady) {
      setIsAdmin(false);
      setLoading(true);
      return undefined;
    }

    const checkClaims = async (fbUser) => {
      if (!fbUser) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(fbUser, true); // force refresh
        const role = String(tokenResult?.claims?.role ?? "").toLowerCase();

        if (!cancelled) {
          setIsAdmin(role === USER_ROLES.ADMIN);
          setLoading(false);
        }
      } catch (e) {
        console.error("Errore lettura claims Firebase:", e);
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    // prima check immediato
    setLoading(true);
    checkClaims(auth.currentUser);

    // poi ascolta cambi login/logout
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setLoading(true);
      checkClaims(fbUser);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [isFirebaseReady, isLoaded, isSignedIn]);

  return { isAdmin, loading };
}
