const SEGMENT = /^[\w.~-]+$/;

/**
 * The path a build serves the site under, from `BUTTERY_DOCS_BASE`: `/`, the default, for a site at a
 * domain's root, or a path with a slash at each end, such as `/buttery/` for a GitHub Pages project site.
 * Throws on a value that isn't a path, saying how to fix it.
 */
export function docsBase(value: string | undefined): string {
  const segments = (value ?? "").split("/").filter((segment) => segment !== "");
  if (
    segments.some((segment) => !SEGMENT.test(segment) || /^\.+$/.test(segment))
  ) {
    throw new Error(
      `BUTTERY_DOCS_BASE is "${String(value)}". Fix: set it to the path the site is served under, such as /buttery/, or leave it unset to serve the site from /.`,
    );
  }
  return segments.length === 0 ? "/" : `/${segments.join("/")}/`;
}

/**
 * An address on the site, written from the site's root as its own links are, such as `/components/button`
 * or `/search?q=dialog`, as it's served under `base`: `/buttery/components/button` under `/buttery/`.
 */
export function sitePath(path: string, base: string): string {
  return `${base}${path.replace(/^\/+/, "")}`;
}

/**
 * The path of an address under `base`, from the site's root, such as `/components/button` for
 * `/buttery/components/button` under `/buttery/`, or `null` for an address outside the base.
 */
export function pathUnderBase(pathname: string, base: string): string | null {
  if (pathname.startsWith(base)) return `/${pathname.slice(base.length)}`;
  return `${pathname}/` === base ? "/" : null;
}

/**
 * The route an address opens: its path under `base` without its slashes, such as `components/button`, and
 * empty on the home page. An address outside the base reads as its whole path, which no page has.
 */
export function routeOf(pathname: string, base: string): string {
  return (pathUnderBase(pathname, base) ?? pathname).replace(/^\/+|\/+$/g, "");
}
