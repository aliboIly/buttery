import type { DocsPage, DocsSection } from "@buttery/core";

/** The site's sections in nav order, each with its title, and the component groups under Components. */
export const SECTIONS: readonly {
  readonly root: string;
  readonly title: string;
  readonly groups?: readonly {
    readonly section: DocsSection;
    readonly title: string;
    /** What's in it, in a few words, for the top bar's menu. */
    readonly summary: string;
  }[];
}[] = [
  { root: "get-started", title: "Get started" },
  { root: "foundations", title: "Foundations" },
  { root: "layout", title: "Layout" },
  { root: "motion", title: "Motion" },
  {
    root: "components",
    title: "Components",
    groups: [
      {
        section: "components/actions",
        title: "Actions",
        summary: "Buttons, links and toolbars",
      },
      {
        section: "components/inputs",
        title: "Inputs",
        summary: "Fields, sliders and pickers",
      },
      {
        section: "components/selection",
        title: "Selection",
        summary: "Checkboxes, switches and choices",
      },
      {
        section: "components/navigation",
        title: "Navigation",
        summary: "Bars, tabs, sidebars and search",
      },
      {
        section: "components/overlays",
        title: "Overlays",
        summary: "Dialogs, menus and popovers",
      },
      {
        section: "components/data-display",
        title: "Data display",
        summary: "Tables, charts and badges",
      },
      {
        section: "components/feedback",
        title: "Feedback and status",
        summary: "Banners, toasts and empty states",
      },
    ],
  },
  { root: "patterns", title: "Patterns" },
  { root: "templates", title: "Templates" },
  { root: "guides", title: "Guides" },
  { root: "tools", title: "Tools" },
  { root: "resources", title: "Resources" },
];

/** The first part of a page's section: `components` for `components/actions`. */
export function rootOf(section: DocsSection): string {
  return section.split("/")[0] ?? section;
}

/** A page the nav links to. */
export interface NavPage {
  readonly route: string;
  readonly page: DocsPage;
}

/** A section of the nav with its pages, or, under Components, its groups of pages. */
export interface NavSection {
  readonly root: string;
  readonly title: string;
  readonly pages: readonly NavPage[];
  readonly groups: readonly {
    readonly title: string;
    readonly summary: string;
    readonly pages: readonly NavPage[];
  }[];
}

function byOrder(a: NavPage, b: NavPage): number {
  return (
    a.page.order - b.page.order || a.page.title.localeCompare(b.page.title)
  );
}

/** The nav, generated from every page's metadata: sections in order, pages by their `order`. */
export function buildNav(pages: readonly NavPage[]): readonly NavSection[] {
  return SECTIONS.map(({ root, title, groups = [] }) => ({
    root,
    title,
    pages: pages.filter((entry) => entry.page.section === root).sort(byOrder),
    groups: groups
      .map((group) => ({
        title: group.title,
        summary: group.summary,
        pages: pages
          .filter((entry) => entry.page.section === group.section)
          .sort(byOrder),
      }))
      .filter((group) => group.pages.length > 0),
  })).filter(
    (section) => section.pages.length > 0 || section.groups.length > 0,
  );
}
