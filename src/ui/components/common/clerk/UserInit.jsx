import { useEnsureUserDoc, useFirebaseBridgeAuth } from "@/ui/hooks";

export default function UserInit() {
  const { isReady } = useFirebaseBridgeAuth();
  useEnsureUserDoc({ enabled: isReady });

  return null; // non rende nulla, serve solo per far partire l'hook
}
