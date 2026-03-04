import { useEffect, useMemo, useState } from "react";

export function usePreloadImages(urls = [], fallback) {
  const targets = useMemo(() => urls.filter(Boolean).slice(0, 5), [urls]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const toLoad = targets.map((u) => u ?? fallback);

    const preload = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ url, ok: true });
        img.onerror = () => resolve({ url, ok: false }); // IMPORTANT: risolve comunque
        img.src = url;
      });

    Promise.all(toLoad.map(preload)).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [targets, fallback]);

  return { ready, targets };
}
