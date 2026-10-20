import { lazy, Suspense } from "react";
import type { ReactElement } from "react";
import type { ComponentKind } from "@buttery/core";
import { referenceRoot } from "virtual:buttery-reference";
import { ComponentPage } from "./ComponentPage.tsx";
import { LevelsPage } from "./pages/LevelsPage.tsx";
import { MotionPage } from "./pages/MotionPage.tsx";
import { PalettesPage } from "./pages/PalettesPage.tsx";
import { SurfacesPage } from "./pages/SurfacesPage.tsx";
import { TextStacksPage } from "./pages/TextStacksPage.tsx";
import { TokensPage } from "./pages/TokensPage.tsx";
import { components } from "./registry.ts";
import { foundationPages } from "./routes.ts";

export interface Page {
  readonly route: string;
  readonly title: string;
  readonly render: () => ReactElement;
}

export interface PageGroup {
  readonly title: string;
  readonly pages: readonly Page[];
}

const FOUNDATIONS: Readonly<
  Record<(typeof foundationPages)[number]["route"], () => ReactElement>
> = {
  tokens: () => <TokensPage />,
  surfaces: () => <SurfacesPage />,
  levels: () => <LevelsPage />,
  palettes: () => <PalettesPage />,
  "text-stacks": () => <TextStacksPage />,
  motion: () => <MotionPage />,
};

const ComparePage =
  import.meta.env.DEV && referenceRoot !== null
    ? lazy(async () => {
        const { ComparePage: Page } = await import("./pages/ComparePage.tsx");
        return { default: Page };
      })
    : null;

const KINDS: readonly (readonly [ComponentKind, string])[] = [
  ["primitive", "Primitives"],
  ["layer", "Layers"],
  ["component", "Components"],
  ["pattern", "Patterns"],
];

/** Every playground page, grouped the way the sidebar shows them. */
export const pageGroups: readonly PageGroup[] = [
  {
    title: "Foundations",
    pages: foundationPages.map(({ route, title }) => ({
      route,
      title,
      render: FOUNDATIONS[route],
    })),
  },
  ...KINDS.map(([kind, title]) => ({
    title,
    pages: components
      .filter((entry) => entry.meta.kind === kind)
      .map((entry) => ({
        route: entry.route,
        title: entry.meta.name,
        render: () => <ComponentPage entry={entry} />,
      })),
  })).filter((group) => group.pages.length > 0),
  ...(ComparePage
    ? [
        {
          title: "Local",
          pages: [
            {
              route: "compare",
              title: "Compare",
              render: () => (
                <Suspense fallback={null}>
                  <ComparePage />
                </Suspense>
              ),
            },
          ],
        },
      ]
    : []),
];

export const pages: readonly Page[] = pageGroups.flatMap(
  (group) => group.pages,
);

const duplicate = pages.find(
  (page, index) =>
    pages.findIndex((other) => other.route === page.route) !== index,
);
if (duplicate) {
  throw new Error(
    `Two playground pages use the route "${duplicate.route}". Fix: rename the foundation page in routes.ts.`,
  );
}
