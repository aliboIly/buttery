import { createContext, use } from "react";
import type { Context } from "react";

/** What an `AppPage` tells the blocks inside it. */
export interface AppPageState {
  /** Whether the page fills its scroll area, so its last block scrolls inside and stays above the window's bottom. */
  readonly fill: boolean;
}

/** The state an `AppPage` shares, or `null` outside one. */
export const AppPageContext: Context<AppPageState | null> =
  createContext<AppPageState | null>(null);

/** Reads the `AppPage` around a component, or `null` outside one. */
export function useAppPage(): AppPageState | null {
  return use(AppPageContext);
}
