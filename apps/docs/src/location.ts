import { useSyncExternalStore } from "react";
import type { Density } from "@buttery/core";
import type { ColorSchemePreference } from "@buttery/react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
  };
}

/** Tells everything that reads the address it changed, as the back button does, the demos' own routers too. */
function announce(): void {
  window.dispatchEvent(new PopStateEvent("popstate"));
}

let serverHref = "http://localhost/";

/** The address a page renders for when there's no window, as the static build renders each route. */
export function setServerHref(href: string): void {
  serverHref = href;
}

function useHref(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => serverHref,
  );
}

/** Motion on the site: the OS setting, or forced full or reduced. */
export type MotionSetting = "system" | "full" | "reduced";

export interface Settings {
  /** The path without its leading slash, such as `components/button`; empty on the home page. */
  readonly route: string;
  /** The query string, such as `?q=decaf`, for pages that read their own parameters. */
  readonly query: string;
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
    route: url.pathname.replace(/^\/+|\/+$/g, ""),
    query: url.search,
    theme: parseTheme(url.searchParams.get("theme")),
    density:
      url.searchParams.get("density") === "compact" ? "compact" : "comfortable",
    motion: parseMotion(url.searchParams.get("motion")),
    chrome: url.searchParams.get("chrome") !== "0",
  };
}

/** The settings that stay with the visitor from page to page. */
const KEPT = ["theme", "density", "motion", "chrome"] as const;

/**
 * Goes to `href`, a path on this site, adding a history entry. The theme, density, motion and chrome
 * settings in the URL carry over unless `href` sets them.
 */
export function navigate(href: string): void {
  const current = new URL(window.location.href);
  const next = new URL(href, current);
  for (const name of KEPT) {
    const value = current.searchParams.get(name);
    if (value !== null && !next.searchParams.has(name))
      next.searchParams.set(name, value);
  }
  if (next.href === current.href) return;
  window.history.pushState(null, "", next);
  announce();
  if (next.hash === "") {
    window.scrollTo({ top: 0 });
    return;
  }
  const id = decodeURIComponent(next.hash.slice(1));
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView();
  });
}

/** Moves the address to the page at `route` without a history entry, keeping its query and hash, as a redirect does. */
export function redirectTo(route: string): void {
  const url = new URL(window.location.href);
  url.pathname = `/${route}`;
  window.history.replaceState(null, "", url);
  announce();
}

/** Updates one URL setting without adding a history entry. */
export function setSetting(
  name: "theme" | "density" | "motion",
  value: string,
): void {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState(null, "", url);
  announce();
}

/** Whether a click on a link is one the browser should handle: another tab, a download, another site. */
function leavesPage(event: MouseEvent, link: HTMLAnchorElement): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (link.target !== "" && link.target !== "_self") ||
    link.hasAttribute("download") ||
    link.origin !== window.location.origin
  );
}

/**
 * Makes a click on any link to a path on this site a navigation within the page, so every buttery link
 * component works as it is. A link to an anchor on the same page is left to the browser. Returns the
 * function that stops it.
 */
export function followLinks(): () => void {
  const onClick = (event: MouseEvent): void => {
    const link =
      event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement) || leavesPage(event, link)) return;
    const next = new URL(link.href);
    const here = new URL(window.location.href);
    if (
      next.pathname === here.pathname &&
      next.search === here.search &&
      next.hash !== ""
    )
      return;
    event.preventDefault();
    navigate(next.pathname + next.search + next.hash);
  };
  document.addEventListener("click", onClick);
  return () => {
    document.removeEventListener("click", onClick);
  };
}
