import { createContext, use } from "react";
import type { Context } from "react";
import type { ColorScheme, Density } from "@butteryui/core";

/** Where the app runs. `"desktop"` means a Tauri window. */
export type Platform = "web" | "desktop";

/** What `ButteryProvider` resolved from its props and the OS. */
export interface ButteryContextValue {
  /** The color scheme in use. */
  readonly colorScheme: ColorScheme;
  /** The density in use. */
  readonly density: Density;
  /** Where the app runs. */
  readonly platform: Platform;
  /** Whether motion is reduced. */
  readonly reducedMotion: boolean;
}

/**
 * What the nearest `ButteryProvider` resolved, or `null` without one. Read it with `use(ButteryContext)` in a
 * component that works with or without a provider; `useButtery()` throws without one.
 */
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
