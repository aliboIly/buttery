/** Pages that aren't components: the token, surface and type references. */
export const foundationPages = [
  { route: "tokens", title: "Tokens" },
  { route: "surfaces", title: "Surfaces" },
  { route: "levels", title: "Levels" },
  { route: "palettes", title: "Palettes" },
  { route: "text-stacks", title: "Text stacks" },
] as const;

/** The playground route for a component: `fit-box` for FitBox. */
export function componentRoute(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
