import { useEffect, useState } from "react";

/**
 * True for `duration` milliseconds after `key` changes, as if the page fetched what it now shows. The
 * demo's data is seeded and needs no fetch; this shows the loading states a real one goes through.
 */
export function useSimulatedLoad(key: string, duration: number): boolean {
  const [loaded, setLoaded] = useState(key);

  useEffect(() => {
    if (key === loaded) return undefined;
    const timer = window.setTimeout(() => {
      setLoaded(key);
    }, duration);
    return () => {
      window.clearTimeout(timer);
    };
  }, [key, loaded, duration]);

  return key !== loaded;
}
