/** A real query and the results it should find in the top three: any result whose link starts with one. */
export interface GoldenQuery {
  readonly query: string;
  readonly expect: readonly string[];
  /** Whether it also has to be the search panel's first row, at the top of the group the panel shows first. */
  readonly first?: boolean;
}

/**
 * Queries people really type, each with what it should find in the top three. `pnpm check` runs them
 * against the index the site builds, so a page that drops out of reach fails the build.
 */
export const searchGolden: readonly GoldenQuery[] = [
  { query: "modal", expect: ["/components/dialog"] },
  { query: "popup", expect: ["/components/dialog", "/components/popover"] },
  { query: "dropdown", expect: ["/components/menu", "/components/select"] },
  {
    query: "drawer",
    expect: ["/components/sheet", "/components/side-panel"],
  },
  { query: "snackbar", expect: ["/components/toaster"] },
  { query: "spinner", expect: ["/components/loading-pill"] },
  {
    query: "toggle",
    expect: ["/components/segmented-control", "/components/switch"],
  },
  { query: "command palette", expect: ["/components/command-search"] },
  { query: "dark mode", expect: ["/foundations/theming"], first: true },
  { query: "theme", expect: ["/foundations/theming"], first: true },
  { query: "light and dark", expect: ["/foundations/theming"], first: true },
  { query: "colors", expect: ["/foundations/colors"], first: true },
  {
    query: "Bring your brand",
    expect: ["/guides/bring-your-brand"],
    first: true,
  },
  { query: "onboarding", expect: ["/patterns/onboarding"], first: true },
  { query: "onValueChange", expect: ["/components/"] },
  { query: "--bt-r-lg", expect: ["/foundations/radius"] },
  { query: "no overlap", expect: ["/layout/the-layout-contract"] },
  {
    query: "make my app buttery",
    expect: ["/get-started/make-anything-buttery"],
  },
  { query: "button", expect: ["/components/button"] },
  { query: "buton", expect: ["/components/button"] },
  { query: "install", expect: ["/get-started/installation"] },
  { query: "quick start", expect: ["/get-started/quick-start"] },
  { query: "tauri", expect: ["/get-started/desktop-apps"] },
  { query: "desktop app", expect: ["/get-started/desktop-apps"] },
  { query: "coding agent", expect: ["/get-started/using-coding-agents"] },
  { query: "spring", expect: ["/motion/"] },
  { query: "reduced motion", expect: ["/motion/reduced-motion"] },
  { query: "stagger", expect: ["/motion/", "/motion/presets#stagger"] },
  { query: "stack", expect: ["/layout/stack-inline-and-grid"] },
  {
    query: "gap",
    expect: [
      "/layout/stack-inline-and-grid",
      "/foundations/spacing-and-sizing",
    ],
  },
  { query: "container query", expect: ["/layout/responsive"] },
  { query: "shadow", expect: ["/foundations/elevation"] },
  { query: "z-index", expect: ["/foundations/layers"] },
  { query: "icons", expect: ["/foundations/icons"] },
  { query: "font", expect: ["/foundations/typography"] },
  { query: "palette", expect: ["/foundations/palettes"] },
  {
    query: "brand color",
    expect: ["/guides/bring-your-brand", "/foundations/theming"],
  },
  { query: "accessibility", expect: ["/guides/accessibility"] },
  {
    query: "focus ring",
    expect: ["/guides/accessibility", "/foundations/elevation"],
  },
  {
    query: "expectButtery",
    expect: ["/tools/testing", "/guides/check-your-layout"],
  },
  { query: "eslint", expect: ["/tools/lint-configs"] },
  { query: "table", expect: ["/components/data-table"] },
  {
    query: "chart",
    expect: ["/components/chart-frame", "/components/line-chart"],
  },
  { query: "sidebar", expect: ["/components/sidebar", "/patterns/app-shell"] },
  { query: "settings page", expect: ["/patterns/settings-pages"] },
  { query: "tooltip", expect: ["/components/tooltip"] },
  { query: "text input", expect: ["/components/text-field"] },
  { query: "empty state", expect: ["/components/empty-state"] },
  { query: "skeleton", expect: ["/components/skeleton", "/layout/"] },
  {
    query: "pricing",
    expect: ["/patterns/plans", "/components/plan-comparison"],
  },
  { query: "hero", expect: ["/patterns/marketing-page"] },
  { query: "roadmap", expect: ["/resources/roadmap"] },
  { query: "changelog", expect: ["/resources/whats-new"] },
  { query: "release notes", expect: ["/resources/whats-new"] },
  { query: "breadcrumb", expect: ["/components/breadcrumbs"] },
  { query: "useShortcut", expect: ["/components/kbd", "/components/button"] },
];
