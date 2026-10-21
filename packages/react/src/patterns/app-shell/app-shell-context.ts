import { createContext, use } from "react";
import type { Context } from "react";

/** How an `AppShell`'s sidebar shows: full width, as an icon rail, or as a sheet opened from the top bar. */
export type SidebarMode = "full" | "rail" | "sheet";

/** What an `AppShell layout="sidebar"` tells the sidebar and top bar inside it. */
export interface AppShellState {
  /** How the sidebar shows at the shell's width. */
  readonly sidebar: SidebarMode;
  /** Opens the sidebar's sheet, while it's in sheet mode. */
  readonly openSidebar: () => void;
  /** Whether the sidebar's sheet is open. */
  readonly sidebarOpen: boolean;
  /** Scrolls the page region back to its top, as `AppPage` does when a new page mounts. */
  readonly scrollPageToTop: () => void;
}

const OUTSIDE_A_SHELL: AppShellState = {
  sidebar: "full",
  openSidebar: () => undefined,
  sidebarOpen: false,
  scrollPageToTop: () => undefined,
};

/** The state an `AppShell layout="sidebar"` shares. Outside one, the sidebar is full and nothing opens it. */
export const AppShellContext: Context<AppShellState> =
  createContext<AppShellState>(OUTSIDE_A_SHELL);

/** Reads the sidebar shell around a component: how its sidebar shows and how to open its sheet. */
export function useAppShell(): AppShellState {
  return use(AppShellContext);
}
