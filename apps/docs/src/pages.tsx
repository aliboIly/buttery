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
import { buildNav, groupHref, rootOf } from "./nav.ts";
import type { NavSection } from "./nav.ts";
import { NotFoundPage } from "./NotFoundPage.tsx";
import type { SectionLink } from "./NotFoundPage.tsx";
import { MotionPage } from "./pages/MotionPage.tsx";
import * as cardStudio from "demo-card-studio";
import * as cardStudioSite from "demo-card-studio-site";
import * as roastery from "demo-roastery";
import { App as Starter } from "starter/src/App.tsx";
import * as dashboardTemplate from "template-dashboard";
import * as editorTemplate from "template-editor";
import * as marketingTemplate from "template-marketing";
import { DemoPage, HostedApp } from "./demos/DemoPage.tsx";
import type { DemoApp } from "./demos/DemoPage.tsx";
import { DemosPage } from "./demos/DemosPage.tsx";
import { components } from "./registry.ts";
import { SearchPage } from "./search/SearchPage.tsx";
import { demoPages, templates } from "./routes.ts";
import type { TemplateName } from "./routes.ts";

export interface Page {
  /** Its path without the leading slash, such as `components/button`. */
  readonly route: string;
  readonly title: string;
  readonly render: () => ReactElement;
  /** A whole app that brings its own landmarks, shown without the site's chrome. */
  readonly fullWindow?: boolean;
  /** An app with a router of its own, which draws the paths under its route too, such as a demo's settings. */
  readonly hosted?: boolean;
  /** Shown across the shell's whole width, without the sidebar and the page's headings. */
  readonly wide?: boolean;
  /** Renders its own `main`, as an `AppPage` does, so the shell doesn't put it in one of its own. */
  readonly ownMain?: boolean;
  /** Where it sits on the site, for the nav; demos and lab pages have none. */
  readonly docs?: DocsPage;
  /** Its headings, for its "On this page" list. */
  readonly headings?: readonly Heading[];
}

export interface PageGroup {
  readonly title: string;
  readonly pages: readonly Page[];
}

/**
 * Each template's root, served under `base`, and the paths under it that have a page; the blank template is
 * the starter, which has one page and no router.
 */
const TEMPLATE_APPS: Readonly<
  Record<
    TemplateName,
    {
      readonly render: (base: string) => ReactElement;
      readonly routes: readonly string[];
    }
  >
> = {
  blank: { render: () => <Starter />, routes: ["/"] },
  dashboard: {
    render: (base) => <HostedApp App={dashboardTemplate.App} base={base} />,
    routes: dashboardTemplate.routes,
  },
  editor: {
    render: (base) => <HostedApp App={editorTemplate.App} base={base} />,
    routes: editorTemplate.routes,
  },
  marketing: {
    render: (base) => <HostedApp App={marketingTemplate.App} base={base} />,
    routes: marketingTemplate.routes,
  },
};

/** Each template's live preview, filling the window, which its page shows in a frame; the nav leaves them out. */
const templatePreviews: readonly Page[] = templates.map(({ name, title }) => ({
  route: `templates/${name}/preview`,
  title: `${title} template`,
  render: () => TEMPLATE_APPS[name].render(`/templates/${name}/preview`),
  fullWindow: true,
  hosted: true,
}));

/** Each demo's own package, by its route. */
const DEMO_APPS: Readonly<
  Record<(typeof demoPages)[number]["route"], DemoApp>
> = {
  "card-studio": cardStudio,
  "card-studio-site": cardStudioSite,
  roastery,
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

/** A page's section, linking to its first page, and under Components its group, linking to its part of the overview. */
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
    ...(group ? [{ label: group.title, href: groupHref(group.title) }] : []),
  ];
}

/** The demos page and each demo, its own app, for the sidebar's last section. */
export const demoLinks: readonly {
  readonly route: string;
  readonly title: string;
}[] = [
  { route: "demos", title: "All demos" },
  ...demoPages.map(({ route, title }) => ({ route: `demos/${route}`, title })),
];

/** The site's nav, generated from every page's metadata. */
export const nav: readonly NavSection[] = buildNav(
  docsPages.flatMap((page) =>
    page.docs ? [{ route: page.route, page: page.docs }] : [],
  ),
);

/** Each section's own address and the page it opens, its first, such as `foundations` and `foundations/colors`. */
export const sectionHomes: ReadonlyMap<string, string> = new Map(
  nav.flatMap((section) => {
    const first = section.pages[0] ?? section.groups[0]?.pages[0];
    return first ? [[section.root, first.route] as const] : [];
  }),
);

/** Each section's title and first page, then the demos, for a page that links to all of them. */
const sectionLinks: readonly SectionLink[] = [
  ...nav.flatMap((section) => {
    const home = sectionHomes.get(section.root);
    return home === undefined
      ? []
      : [{ title: section.title, href: `/${home}` }];
  }),
  { title: "Demos", href: "/demos" },
];

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
    pages: [
      { route: "demos", title: "Demos", render: () => <DemosPage /> },
      ...demoPages.map((demo) => ({
        route: `demos/${demo.route}`,
        title: demo.title,
        render: () => <DemoPage demo={demo} app={DEMO_APPS[demo.route]} />,
        fullWindow: true,
        hosted: true,
      })),
    ],
  },
];

/** The sections the landing page's Explore tiles open, with what each counts; the demos have the last tile. */
const EXPLORE: readonly { readonly root: string; readonly unit: string }[] = [
  { root: "foundations", unit: "pages" },
  { root: "layout", unit: "pages" },
  { root: "motion", unit: "pages" },
  { root: "components", unit: "components" },
  { root: "patterns", unit: "pages" },
  { root: "templates", unit: "templates" },
];

const exploreSections: readonly ExploreSection[] = [
  ...EXPLORE.flatMap(({ root, unit }) => {
    const section = nav.find((candidate) => candidate.root === root);
    if (!section) return [];
    const first = section.pages[0] ?? section.groups[0]?.pages[0];
    const counted =
      section.groups.length > 0
        ? section.groups.flatMap((group) => group.pages)
        : section.pages;
    return first
      ? [
          {
            title: section.title,
            href: `/${first.route}`,
            count: counted.length,
            unit,
          },
        ]
      : [];
  }),
  { title: "Demos", href: "/demos", count: demoPages.length, unit: "demos" },
];

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
  wide: true,
  ownMain: true,
};

/**
 * The paths under each demo and each template's preview that have pages of their own, such as
 * `demos/roastery/settings/notifications`, which the static build writes out beside the pages.
 */
export const hostedRoutes: readonly string[] = [
  ...demoPages.flatMap(({ route }) =>
    DEMO_APPS[route].routes.flatMap((path) =>
      path === "/" ? [] : [`demos/${route}${path}`],
    ),
  ),
  ...templates.flatMap(({ name }) =>
    TEMPLATE_APPS[name].routes.flatMap((path) =>
      path === "/" ? [] : [`templates/${name}/preview${path}`],
    ),
  ),
];

export const pages: readonly Page[] = [
  landingPage,
  ...pageGroups.flatMap((group) => group.pages),
  searchPage,
  ...templatePreviews,
  ...labDocs,
];

/** What an address with no page shows, under that address. */
function notFoundPage(route: string): Page {
  return {
    route,
    title: "Page not found",
    render: () => <NotFoundPage route={route} sections={sectionLinks} />,
  };
}

/**
 * The page at `route`: the page with that route; for a section's own address, the section's first page; for
 * a path under a demo or a template's preview, such as `demos/roastery/settings/team`, the app that draws it;
 * and for any other address, the not-found page.
 */
export function pageAt(route: string): Page {
  const wanted = sectionHomes.get(route) ?? route;
  return (
    pages.find((candidate) => candidate.route === wanted) ??
    pages
      .filter(
        (candidate) =>
          candidate.hosted === true && wanted.startsWith(`${candidate.route}/`),
      )
      .sort((a, b) => b.route.length - a.route.length)[0] ??
    notFoundPage(wanted)
  );
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
