import { createContext, use, useSyncExternalStore } from "react";
import type { Context } from "react";

/** How much buttery animates: everything, or only what reduced motion allows. */
export type MotionPreference = "full" | "reduced";

/** The motion setting of the nearest `ButteryProvider`, or `null` to follow the OS. */
export const MotionPreferenceContext: Context<MotionPreference | null> =
  createContext<MotionPreference | null>(null);

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function systemPreference(): MotionPreference {
  return window.matchMedia(REDUCED_QUERY).matches ? "reduced" : "full";
}

function serverPreference(): MotionPreference {
  return "full";
}

/**
 * Whether buttery animates fully here or reduces motion: the `ButteryProvider` setting, or the OS
 * setting outside a provider.
 */
export function useMotionPreference(): MotionPreference {
  const configured = use(MotionPreferenceContext);
  const system = useSyncExternalStore(
    subscribe,
    systemPreference,
    serverPreference,
  );
  return configured ?? system;
}
