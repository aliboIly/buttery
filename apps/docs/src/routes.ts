/** The version the site documents. */
export const DOCS_VERSION = "0.9.0";

/** Where buttery's source lives. */
export const SOURCE_URL = "https://github.com/aliboIly/buttery";

/** The templates a new app starts from: `blank` is the starter, and the others live in `apps/templates`. */
export const templates = [
  { name: "blank", title: "Blank", folder: "apps/starter" },
  { name: "dashboard", title: "Dashboard", folder: "apps/templates/dashboard" },
  { name: "editor", title: "Editor", folder: "apps/templates/editor" },
  { name: "marketing", title: "Marketing", folder: "apps/templates/marketing" },
] as const;

/** A template's name, as `pnpm new-app --template` takes it. */
export type TemplateName = (typeof templates)[number]["name"];

/** What the docs site says about a demo. */
export interface DemoInfo {
  /** Its folder in `apps/demos` and its path under `/demos`. */
  readonly route: string;
  readonly title: string;
  /** The template it's built from, whose shell it keeps. */
  readonly template: Exclude<TemplateName, "blank">;
  /** One line on what it is. */
  readonly description: string;
  /** The components and patterns it shows, by export name. */
  readonly uses: readonly string[];
}

/** Original demo apps built from buttery's components, each its template plus its own content. */
export const demoPages = [
  {
    route: "roastery",
    title: "Halfmoon Roastery",
    template: "dashboard",
    description:
      "A small coffee roaster's dashboard: orders, customers, wholesale, settings and a search across all of it.",
    uses: [
      "AppShell",
      "Sidebar",
      "TopBar",
      "CommandSearch",
      "MetricCard",
      "DataTable",
      "SettingsPage",
      "SetupGuide",
    ],
  },
  {
    route: "roastery-shop",
    title: "Halfmoon shop",
    template: "marketing",
    description:
      "Halfmoon Roastery's own shop: coffees to filter and open, a subscription builder, brew guides and a bag that checks out in place.",
    uses: [
      "NavBar",
      "MorphMenu",
      "SplitHero",
      "Bento",
      "ExpandableCard",
      "Dialog",
      "Morph",
      "SegmentedControl",
    ],
  },
  {
    route: "deckhand",
    title: "Deckhand",
    template: "editor",
    description:
      "A slide editor: write Halfmoon's pitch to cafés, lay out and style each slide, then present it.",
    uses: [
      "AppShell",
      "HeaderBar",
      "Stage",
      "Inspector",
      "FloatingToolbar",
      "SwatchGrid",
      "SharedIndicator",
      "Onboarding",
    ],
  },
] as const satisfies readonly DemoInfo[];

/** The playground route for a component: `fit-box` for FitBox. */
export function componentRoute(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
