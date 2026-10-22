/** Pages that aren't a component's: the token, surface and type references, and the motion presets. */
export const referencePages = [
  {
    route: "foundations/tokens",
    title: "Tokens",
    section: "foundations",
    order: 10,
  },
  {
    route: "foundations/surfaces",
    title: "Surfaces",
    section: "foundations",
    order: 20,
  },
  {
    route: "foundations/levels",
    title: "Levels",
    section: "foundations",
    order: 30,
  },
  {
    route: "foundations/palettes",
    title: "Palettes",
    section: "foundations",
    order: 40,
  },
  {
    route: "foundations/text-stacks",
    title: "Text stacks",
    section: "foundations",
    order: 50,
  },
  { route: "motion/presets", title: "Presets", section: "motion", order: 10 },
] as const;

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
