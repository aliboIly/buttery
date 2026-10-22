import { createContext, use } from "react";
import type { Context } from "react";

/** How an `AppShell`'s sidebar shows: full width, as an icon rail, or as a sheet opened from the top bar. */
export type SidebarMode = "full" | "rail" | "sheet";

/** How a `SidePanel` in an `AppShell` shows: docked beside the column, or as a sheet over the page. */
export type PanelMode = "docked" | "sheet";

/**
 * What a `Sidebar` without a `storageKey` remembers (its open groups and Recent), kept by the shell so it
 * lasts while the sidebar moves between the shell and its sheet.
 */
export interface SidebarMemory {
  /** What's remembered, as the sidebar last wrote it. */
  readonly value: unknown;
  /** Writes it, from what's remembered now. */
  readonly update: (next: (current: unknown) => unknown) => void;
}

/** What an `AppShell layout="sidebar"` tells the sidebar and top bar inside it. */
export interface AppShellState {
  /** How the sidebar shows at the shell's width. */
  readonly sidebar: SidebarMode;
  /** How a `SidePanel` shows at the shell's width: docked from 1280px, a sheet under that. */
  readonly panel: PanelMode;
  /** Whether the shell has measured its width. Until it has, in the commit before its first paint, its modes are the wide ones. */
  readonly measured: boolean;
  /** Opens the sidebar's sheet, while it's in sheet mode. */
  readonly openSidebar: () => void;
  /** Whether the sidebar's sheet is open. */
  readonly sidebarOpen: boolean;
  /** Scrolls the page region back to its top, as `AppPage` does when a new page mounts. */
  readonly scrollPageToTop: () => void;
  /** Keeps a `Sidebar`'s memory when it has no `storageKey`. Outside a shell there's none. */
  readonly sidebarMemory: SidebarMemory | undefined;
}

const OUTSIDE_A_SHELL: AppShellState = {
  sidebar: "full",
  panel: "docked",
  measured: true,
  openSidebar: () => undefined,
  sidebarOpen: false,
  scrollPageToTop: () => undefined,
  sidebarMemory: undefined,
};

/**
 * The state an `AppShell layout="sidebar"` shares. Outside one, the sidebar is full and nothing opens it, and
 * a side panel docks where it's placed.
 */
export const AppShellContext: Context<AppShellState> =
  createContext<AppShellState>(OUTSIDE_A_SHELL);

/** Reads the sidebar shell around a component: how its sidebar shows and how to open its sheet. */
export function useAppShell(): AppShellState {
  return use(AppShellContext);
}
