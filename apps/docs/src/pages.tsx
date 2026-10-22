import { lazy, Suspense } from "react";
import type { ReactElement } from "react";
import type { DocsPage, DocsSection } from "@buttery/core";
import { referenceRoot } from "virtual:buttery-reference";
import { ComponentPage, componentHeadings } from "./ComponentPage.tsx";
import { ContentPage } from "./ContentPage.tsx";
import { LabExamples } from "./LabExamples.tsx";
import { LandingPage } from "./LandingPage.tsx";
import type { ExploreSection } from "./LandingPage.tsx";
import { contentPages, labPages } from "./content.ts";
import type { Heading } from "./content.ts";
import type { Neighbor } from "./PageFooter.tsx";
import { buildNav, rootOf } from "./nav.ts";
import type { NavSection } from "./nav.ts";
import { MotionPage } from "./pages/MotionPage.tsx";
import { CardStudioSite } from "./card-studio/CardStudioSite.tsx";
import { App as CardStudio } from "demo-card-studio";
import { App as Roastery } from "demo-roastery";
import { HostedApp } from "./demos/DemoPage.tsx";
import { components } from "./registry.ts";
import { SearchPage } from "./search/SearchPage.tsx";
import { demoPages } from "./routes.ts";

export interface Page {
  /** Its path without the leading slash, such as `components/button`. */
  readonly route: string;
  readonly title: string;
  readonly render: () => ReactElement;
  /** A whole app that brings its own landmarks, shown without the site's chrome. */
  readonly fullWindow?: boolean;
  /** Shown across the shell's whole width, without the sidebar and the page's headings. */
  readonly wide?: boolean;
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
  "card-studio": {
    render: () => <HostedApp App={CardStudio} base="/demos/card-studio" />,
    fullWindow: true,
  },
  "card-studio-site": { render: () => <CardStudioSite /> },
  roastery: {
    render: () => <HostedApp App={Roastery} base="/demos/roastery" />,
    fullWindow: true,
  },
};

const ComparePage =
  import.meta.env.DEV && referenceRoot !== null
    ? lazy(async () => {
        const { ComparePage: Page } = await import("./pages/ComparePage.tsx");
        return { default: Page };
      })
    : null;

const componentDocs: readonly Page[] = components.flatMap((entry) => {
  const { page } = entry;
  if (!page || page.home !== undefined) return [];
  const route = `${rootOf(page.section)}/${entry.route}`;
  return [
    {
      route,
      title: page.title,
      render: () => (
        <ComponentPage
          entry={entry}
          crumbs={crumbsFor(page.section)}
          {...neighbors(route)}
        />
      ),
      docs: page,
      headings: componentHeadings(entry),
    },
  ];
});

const contentDocs: readonly Page[] = contentPages.map((entry) => ({
  route: entry.route,
  title: entry.page.title,
  render: () => <ContentPage entry={entry} {...neighbors(entry.route)} />,
  docs: entry.page,
  headings: entry.headings,
}));

const docsPages = [...contentDocs, ...componentDocs];

/** Every page in the nav's order, for the pages before and after each one. */
function navOrder(): readonly {
  readonly route: string;
  readonly title: string;
}[] {
  return nav.flatMap((section) =>
    [...section.pages, ...section.groups.flatMap((group) => group.pages)].map(
      ({ route, page }) => ({ route, title: page.title }),
    ),
  );
}

/** The pages before and after `route` in the nav. */
function neighbors(route: string): {
  readonly previous: Neighbor | undefined;
  readonly next: Neighbor | undefined;
} {
  const order = navOrder();
  const index = order.findIndex((page) => page.route === route);
  return {
    previous: index > 0 ? order[index - 1] : undefined,
    next: index >= 0 ? order[index + 1] : undefined,
  };
}

/** A page's section and, under Components, its group, each linking to the first page in it. */
function crumbsFor(
  section: DocsSection,
): readonly { readonly label: string; readonly href: string }[] {
  const found = nav.find(({ root }) => root === rootOf(section));
  if (!found) return [];
  const group = found.groups.find(({ pages }) =>
    pages.some(({ page }) => page.section === section),
  );
  const first = found.pages[0] ?? found.groups[0]?.pages[0];
  return [
    ...(first ? [{ label: found.title, href: `/${first.route}` }] : []),
    ...(group?.pages[0]
      ? [{ label: group.title, href: `/${group.pages[0].route}` }]
      : []),
  ];
}

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

/** The sections the landing page's Explore tiles open, with what each counts. */
const EXPLORE: readonly { readonly root: string; readonly unit: string }[] = [
  { root: "foundations", unit: "pages" },
  { root: "layout", unit: "pages" },
  { root: "motion", unit: "pages" },
  { root: "components", unit: "components" },
  { root: "patterns", unit: "pages" },
  { root: "templates", unit: "templates" },
];

const exploreSections: readonly ExploreSection[] = EXPLORE.flatMap(
  ({ root, unit }) => {
    const section = nav.find((candidate) => candidate.root === root);
    if (!section) return [];
    const routes = [
      ...section.pages,
      ...section.groups.flatMap((group) => group.pages),
    ];
    const first = routes[0];
    return first
      ? [
          {
            title: section.title,
            href: `/${first.route}`,
            count: routes.length,
            unit,
          },
        ]
      : [];
  },
);

/** The site's front page, at `/`. */
const landingPage: Page = {
  route: "",
  title: "buttery",
  render: () => <LandingPage sections={exploreSections} />,
  wide: true,
};

/** Pages only tests and the maintainer visit, in development only; the nav never links to them. */
const labDocs: readonly Page[] = import.meta.env.DEV
  ? [
      {
        route: "lab/motion",
        title: "Motion timing",
        render: () => <MotionPage />,
      },
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
      ...components
        .filter((entry) => entry.examples.length > 0)
        .map((entry) => ({
          route: `lab/examples/${entry.route}`,
          title: `${entry.meta.name} examples`,
          render: () => <LabExamples entry={entry} />,
        })),
    ]
  : [];

/** Every result for a search, which "View all results" in the top bar's search opens. */
const searchPage: Page = {
  route: "search",
  title: "Search",
  render: () => <SearchPage />,
};

export const pages: readonly Page[] = [
  landingPage,
  ...pageGroups.flatMap((group) => group.pages),
  searchPage,
  ...labDocs,
];

/**
 * The page at `route`: the page with that route, else the one whose route is the longest start of it, as a
 * demo's own path is (`demos/roastery/settings/team`), else the landing page.
 */
export function pageAt(route: string): Page {
  const page =
    pages.find((candidate) => candidate.route === route) ??
    pages
      .filter(
        (candidate) =>
          candidate.route !== "" && route.startsWith(`${candidate.route}/`),
      )
      .sort((a, b) => b.route.length - a.route.length)[0] ??
    pages[0];
  if (!page) throw new Error("The docs site needs at least one page.");
  return page;
}

const duplicate = pages.find(
  (page, index) =>
    pages.findIndex((other) => other.route === page.route) !== index,
);
if (duplicate) {
  throw new Error(
    `Two docs pages use the route "${duplicate.route}". Fix: give one of them another file name or section.`,
  );
}
