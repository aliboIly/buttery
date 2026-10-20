import { createContext, use } from "react";
import type { Context } from "react";
import type { ColorScheme, Density } from "@buttery/core";

/** Where the app runs. `"desktop"` means a Tauri window. */
export type Platform = "web" | "desktop";

/** What `ButteryProvider` resolved from its props and the OS. */
export interface ButteryContextValue {
  readonly colorScheme: ColorScheme;
  readonly density: Density;
  readonly platform: Platform;
  readonly reducedMotion: boolean;
}

export const ButteryContext: Context<ButteryContextValue | null> =
  createContext<ButteryContextValue | null>(null);

/** The resolved color scheme, density, platform and motion setting from the nearest `ButteryProvider`. */
export function useButtery(): ButteryContextValue {
  const value = use(ButteryContext);
  if (value === null) {
    throw new Error(
      "[buttery:useButtery] needs a <ButteryProvider> above it. Fix: wrap your app in <ButteryProvider>.",
    );
  }
  return value;
}
