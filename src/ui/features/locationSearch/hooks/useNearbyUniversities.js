import { useEffect, useState } from "react";

const GEO_DEFAULT = "prompt"; // 'prompt' | 'granted' | 'denied'

export default function useNearbyUniversities() {
  const [status, setStatus] = useState(GEO_DEFAULT);

  useEffect(() => {
    let permissionResult = null;
    let cancelled = false;

    async function run() {
      try {
        if (!navigator?.permissions?.query) return;

        permissionResult = await navigator.permissions.query({ name: "geolocation" });
        if (cancelled) return;

        setStatus(permissionResult.state);

        permissionResult.onchange = () => {
          if (!cancelled) setStatus(permissionResult.state);
        };
      } catch {
        // se fallisce, lasciamo "prompt"
      }
    }

    run();

    return () => {
      cancelled = true;
      if (permissionResult) permissionResult.onchange = null;
    };
  }, []);

  return status;
}
