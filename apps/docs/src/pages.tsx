import { lazy, Suspense } from "react";
import type { ReactElement } from "react";
import type { DocsPage } from "@buttery/core";
import { referenceRoot } from "virtual:buttery-reference";
import { ComponentPage, componentHeadings } from "./ComponentPage.tsx";
import { ContentPage } from "./ContentPage.tsx";
import { contentPages, labPages } from "./content.ts";
import type { Heading } from "./content.ts";
import { buildNav, rootOf } from "./nav.ts";
import type { NavSection } from "./nav.ts";
import { LevelsPage } from "./pages/LevelsPage.tsx";
import { MotionPage } from "./pages/MotionPage.tsx";
import { PalettesPage } from "./pages/PalettesPage.tsx";
import { SurfacesPage } from "./pages/SurfacesPage.tsx";
import { TextStacksPage } from "./pages/TextStacksPage.tsx";
import { TokensPage } from "./pages/TokensPage.tsx";
import { CardStudio } from "./card-studio/CardStudio.tsx";
import { CardStudioSite } from "./card-studio/CardStudioSite.tsx";
import { Roastery } from "./roastery/Roastery.tsx";
import { components } from "./registry.ts";
import { demoPages, referencePages } from "./routes.ts";

export interface Page {
  /** Its path without the leading slash, such as `components/button`. */
  readonly route: string;
  readonly title: string;
  readonly render: () => ReactElement;
  /** A whole app that brings its own landmarks, shown without the site's chrome. */
  readonly fullWindow?: boolean;
  /** Where it sits on the site, for the nav; demos and lab pages have none. */
  readonly docs?: DocsPage;
  /** Its headings, for its "On this page" list. */
  readonly headings?: readonly Heading[];
}

export interface PageGroup {
  readonly title: string;
  readonly pages: readonly Page[];
}

const DEMOS: Readonly<
  Record<
    (typeof demoPages)[number]["route"],
    Pick<Page, "render" | "fullWindow">
  >
> = {
  "card-studio": { render: () => <CardStudio /> },
  "card-studio-site": { render: () => <CardStudioSite /> },
  roastery: { render: () => <Roastery />, fullWindow: true },
};

const REFERENCES: Readonly<
  Record<(typeof referencePages)[number]["route"], () => ReactElement>
> = {
  "foundations/tokens": () => <TokensPage />,
  "foundations/surfaces": () => <SurfacesPage />,
  "foundations/levels": () => <LevelsPage />,
  "foundations/palettes": () => <PalettesPage />,
  "foundations/text-stacks": () => <TextStacksPage />,
  "motion/presets": () => <MotionPage />,
};

const ComparePage =
  import.meta.env.DEV && referenceRoot !== null
    ? lazy(async () => {
        const { ComparePage: Page } = await import("./pages/ComparePage.tsx");
        return { default: Page };
      })
    : null;

const referenceDocs: readonly Page[] = referencePages.map(
  ({ route, title, section, order }) => ({
    route,
    title,
    render: REFERENCES[route],
    docs: {
      section,
      title,
      description: `buttery's ${title.toLowerCase()}.`,
      order,
      status: "stable",
      since: "0.2.0",
    },
  }),
);

const componentDocs: readonly Page[] = components.flatMap((entry) =>
  entry.page
    ? [
        {
          route: `${rootOf(entry.page.section)}/${entry.route}`,
          title: entry.page.title,
          render: () => <ComponentPage entry={entry} />,
          docs: entry.page,
          headings: componentHeadings(entry),
        },
      ]
    : [],
);

const contentDocs: readonly Page[] = contentPages.map((entry) => ({
  route: entry.route,
  title: entry.page.title,
  render: () => <ContentPage entry={entry} />,
  docs: entry.page,
  headings: entry.headings,
}));

const docsPages = [...contentDocs, ...referenceDocs, ...componentDocs];

/** The demos, each its own app, for the sidebar's last section. */
export const demoLinks: readonly {
  readonly route: string;
  readonly title: string;
}[] = demoPages.map(({ route, title }) => ({ route: `demos/${route}`, title }));

/** The site's nav, generated from every page's metadata. */
export const nav: readonly NavSection[] = buildNav(
  docsPages.flatMap((page) =>
    page.docs ? [{ route: page.route, page: page.docs }] : [],
  ),
);

/** The pages the site's menus show, grouped: the nav's sections, then the demos. */
export const pageGroups: readonly PageGroup[] = [
  ...nav.map((section) => {
    const routes = [
      ...section.pages,
      ...section.groups.flatMap((group) => group.pages),
    ].map(({ route }) => route);
    return {
      title: section.title,
      pages: routes.flatMap(
        (route) => docsPages.find((page) => page.route === route) ?? [],
      ),
    };
  }),
  {
    title: "Demos",
    pages: demoPages.map(({ route, title }) => ({
      route: `demos/${route}`,
      title,
      ...DEMOS[route],
    })),
  },
];

/** Pages only tests and the maintainer visit, in development only; the nav never links to them. */
const labDocs: readonly Page[] = import.meta.env.DEV
  ? [
      ...(ComparePage
        ? [
            {
              route: "lab/compare",
              title: "Compare",
              render: () => (
                <Suspense fallback={null}>
                  <ComparePage />
                </Suspense>
              ),
            },
          ]
        : []),
      ...labPages.map((entry) => ({
        route: entry.route,
        title: entry.page.title,
        render: () => <ContentPage entry={entry} />,
      })),
    ]
  : [];

export const pages: readonly Page[] = [
  ...pageGroups.flatMap((group) => group.pages),
  ...labDocs,
];

const duplicate = pages.find(
  (page, index) =>
    pages.findIndex((other) => other.route === page.route) !== index,
);
if (duplicate) {
  throw new Error(
    `Two docs pages use the route "${duplicate.route}". Fix: give one of them another file name or section.`,
  );
}
