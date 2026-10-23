import { createContext, use, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";

/** Goes to an address on this site, adding a history entry. */
export type Navigate = (href: string) => void;

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
  };
}

/**
 * Adds a history entry for `href` and sends `popstate`, as the back button does, so everything that reads
 * the address follows. The page starts at the top, or at the anchor `href` names.
 */
export function pushAddress(href: string): void {
  const next = new URL(href, window.location.href);
  if (next.href === window.location.href) return;
  window.history.pushState(null, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (next.hash === "") {
    window.scrollTo({ top: 0 });
    return;
  }
  const id = decodeURIComponent(next.hash.slice(1));
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView();
  });
}

interface RouterSettings {
  readonly base: string;
  readonly navigate: Navigate;
  readonly serverHref: string;
}

const RouterContext = createContext<RouterSettings>({
  base: "",
  navigate: pushAddress,
  serverHref: "http://localhost/",
});

/** Where the app is served and how it moves between its pages. */
export interface RouterProps {
  /** The path the app is served under, such as `/demos/roastery`. Defaults to `""`, the site's root. */
  readonly base?: string | undefined;
  /**
   * How the app goes to an address. Defaults to `pushAddress`; a page that hosts the app and keeps its own
   * settings in the address passes its own.
   */
  readonly navigate?: Navigate | undefined;
  /** The address to render where there's no window, as a static build does. Defaults to the base. */
  readonly serverHref?: string | undefined;
}

/** Gives the app inside it its base path and the way it navigates. */
export function Router({
  base = "",
  navigate = pushAddress,
  serverHref = `http://localhost${base}/`,
  children,
}: RouterProps & { readonly children?: ReactNode }): ReactElement {
  return (
    <RouterContext value={{ base, navigate, serverHref }}>
      {children}
    </RouterContext>
  );
}

/** Where the app is. */
export interface Route {
  /** The path under the base, such as `/settings/notifications`; `/` at the app's start. */
  readonly path: string;
  /** The address's query, such as `q=decaf`. */
  readonly query: URLSearchParams;
}

/** Where the app is, followed as the address changes. */
export function useRoute(): Route {
  const { base, serverHref } = use(RouterContext);
  const href = useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => serverHref,
  );
  const { pathname, searchParams } = new URL(href);
  const inside =
    pathname === base || pathname.startsWith(`${base}/`)
      ? pathname.slice(base.length)
      : pathname;
  return {
    path: `/${inside.replace(/^\/+|\/+$/g, "")}`,
    query: searchParams,
  };
}

/** Turns a path in the app, such as `/orders` or `/search?q=decaf`, into its address from the base. */
export function useLink(): (path: string) => string {
  const { base } = use(RouterContext);
  return (path) => (base !== "" && path === "/" ? base : `${base}${path}`);
}

/** Goes to a path in the app, such as `/orders`. */
export function useNavigate(): (path: string) => void {
  const { navigate } = use(RouterContext);
  const link = useLink();
  return (path) => {
    navigate(link(path));
  };
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
 * Turns a click on any link to a path on this site into `navigate`, so buttery's link components, which
 * render a plain `<a href>`, move within the page. A link to an anchor on the same page is left to the
 * browser. Returns the function that stops it.
 */
export function followLinks(navigate: Navigate = pushAddress): () => void {
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
