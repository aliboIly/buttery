import { existsSync, globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

/** A demo screen a component page can link to: its demo, its page there when it has several, and where it is. */
export interface DemoScreen {
  /** The demo, as a sentence names it, such as "the roastery demo". */
  readonly demo: string;
  /** The page, such as "orders", for a demo with several pages. */
  readonly page?: string | undefined;
  readonly href: string;
}

/**
 * Which demo screen each demo source file draws, as `<demo>/<file>`. In a demo of several pages, a file that
 * isn't listed, such as a helper, counts toward none of them; in a demo of one page, toward that page. A part
 * of every page of a demo, such as the roastery's shell or its help panel, names only the demo, which a
 * component links to when no page of the demo uses it.
 */
const SCREENS: Readonly<Record<string, DemoScreen>> = {
  "roastery/Roastery.tsx": {
    demo: "the roastery demo",
    href: "/demos/roastery",
  },
  "roastery/OverviewPage.tsx": {
    demo: "the roastery demo",
    page: "overview",
    href: "/demos/roastery",
  },
  "roastery/OrdersPage.tsx": {
    demo: "the roastery demo",
    page: "orders",
    href: "/demos/roastery/orders",
  },
  "roastery/CustomersPage.tsx": {
    demo: "the roastery demo",
    page: "customers",
    href: "/demos/roastery/customers",
  },
  "roastery/SubscriptionsPage.tsx": {
    demo: "the roastery demo",
    page: "subscriptions",
    href: "/demos/roastery/subscriptions",
  },
  "roastery/PayoutsPage.tsx": {
    demo: "the roastery demo",
    page: "payouts",
    href: "/demos/roastery/payouts",
  },
  "roastery/RoastPlanPage.tsx": {
    demo: "the roastery demo",
    page: "roast plan",
    href: "/demos/roastery/roasts",
  },
  "roastery/StockPage.tsx": {
    demo: "the roastery demo",
    page: "stock",
    href: "/demos/roastery/stock",
  },
  "roastery/WholesalePage.tsx": {
    demo: "the roastery demo",
    page: "wholesale",
    href: "/demos/roastery/wholesale",
  },
  "roastery/SettingsPage.tsx": {
    demo: "the roastery demo",
    page: "settings",
    href: "/demos/roastery/settings",
  },
  "roastery/HelpPanel.tsx": {
    demo: "the roastery demo",
    href: "/demos/roastery",
  },
  "card-studio/CardStudio.tsx": {
    demo: "the Card Studio demo",
    href: "/demos/card-studio",
  },
  "card-studio-site/CardStudioSite.tsx": {
    demo: "the Card Studio site demo",
    href: "/demos/card-studio-site",
  },
};

const DEMOS = ["roastery", "card-studio", "card-studio-site"] as const;

/** The names a source imports from buttery's packages. */
function butteryImports(source: string): string[] {
  return [
    ...source.matchAll(
      /import\s*\{([^}]*)\}\s*from\s*"@buttery\/(?:core|react)"/g,
    ),
  ].flatMap(([, names]) =>
    (names ?? "")
      .split(",")
      .map((name) => name.trim())
      .filter((name) => /^[A-Z]/.test(name)),
  );
}

/**
 * For each component a demo uses, the demo screens that use it, read from the demos' imports: its pages, or
 * the demo itself when only a part of every page uses it.
 */
export function demoUsesIn(root: string): Record<string, DemoScreen[]> {
  const uses: Record<string, DemoScreen[]> = {};
  for (const demo of DEMOS) {
    const folder = join(root, "apps/demos", demo, "src");
    if (!existsSync(folder)) continue;
    const screens = Object.entries(SCREENS).filter(([key]) =>
      key.startsWith(`${demo}/`),
    );
    const only = screens.length === 1 ? screens[0]?.[1] : undefined;
    const files = globSync("*.tsx", { cwd: folder })
      .filter((file) => !file.endsWith(".test.tsx"))
      .sort();
    for (const file of files) {
      const screen = SCREENS[`${demo}/${file}`] ?? only;
      if (!screen) continue;
      for (const name of butteryImports(
        readFileSync(join(folder, file), "utf8"),
      )) {
        const list = (uses[name] ??= []);
        if (
          !list.some(
            (known) => known.demo === screen.demo && known.page === screen.page,
          )
        )
          list.push(screen);
      }
    }
  }
  for (const [name, list] of Object.entries(uses)) {
    uses[name] = list.filter(
      (screen) =>
        screen.page !== undefined ||
        !list.some(
          (other) => other.demo === screen.demo && other.page !== undefined,
        ),
    );
  }
  return uses;
}

const DEMO_USES_MODULE = "virtual:buttery-demo-uses";

/** Serves `virtual:buttery-demo-uses`: the demo screens each component appears on. */
export function butteryDemoUses(root: string): Plugin {
  return {
    name: "buttery-docs-demo-uses",
    resolveId(source) {
      return source === DEMO_USES_MODULE ? `\0${DEMO_USES_MODULE}` : undefined;
    },
    load(id) {
      if (id !== `\0${DEMO_USES_MODULE}`) return undefined;
      for (const file of globSync("apps/demos/*/src/*.tsx", { cwd: root }))
        this.addWatchFile(join(root, file));
      return `export const demoUses = ${JSON.stringify(demoUsesIn(root))};`;
    },
  };
}
