/** The version the site documents. */
export const DOCS_VERSION = "0.9.0";

/** Where buttery's source lives. */
export const SOURCE_URL = "https://github.com/aliboIly/buttery";

/** Original demo apps built from buttery's components. */
export const demoPages = [
  { route: "card-studio", title: "Card Studio" },
  { route: "card-studio-site", title: "Card Studio site" },
  { route: "roastery", title: "Halfmoon Roastery" },
] as const;

/** The playground route for a component: `fit-box` for FitBox. */
export function componentRoute(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
