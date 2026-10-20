import { useSyncExternalStore } from "react";
import type { Density } from "@buttery/core";
import type { ColorSchemePreference } from "@buttery/react";

const CHANGE = "playground:location";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

function useHref(): string {
  return useSyncExternalStore(subscribe, () => window.location.href);
}

/** Motion in the playground: the OS setting, or forced full or reduced. */
export type MotionSetting = "system" | "full" | "reduced";

export interface Settings {
  readonly route: string;
  readonly theme: ColorSchemePreference;
  readonly density: Density;
  readonly motion: MotionSetting;
  readonly chrome: boolean;
}

function parseTheme(value: string | null): ColorSchemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

function parseMotion(value: string | null): MotionSetting {
  return value === "full" || value === "reduced" ? value : "system";
}

/** Route and settings, read from the URL so Playwright can open any page in any state. */
export function useSettings(): Settings {
  const url = new URL(useHref());
  return {
    route: url.hash.replace(/^#\/?/, "") || "tokens",
    theme: parseTheme(url.searchParams.get("theme")),
    density:
      url.searchParams.get("density") === "compact" ? "compact" : "comfortable",
    motion: parseMotion(url.searchParams.get("motion")),
    chrome: url.searchParams.get("chrome") !== "0",
  };
}

/** Updates one URL setting without adding a history entry. */
export function setSetting(
  name: "theme" | "density" | "motion",
  value: string,
): void {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(CHANGE));
}
