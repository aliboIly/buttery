import type { ReactElement } from "react";
import type { DocsPage } from "@buttery/core";

/** A page's heading for its "On this page" list. */
export interface Heading {
  readonly depth: 2 | 3;
  readonly text: string;
  readonly id: string;
}

interface ContentModule {
  readonly page: DocsPage | undefined;
  readonly headings: readonly Heading[];
  readonly default: (props: {
    readonly components?: Readonly<Record<string, unknown>>;
  }) => ReactElement;
}

const modules = import.meta.glob<ContentModule>("../content/**/*.mdx", {
  eager: true,
});

/** A content page, written in MDX under `apps/docs/content/<section>/<page>.mdx`. */
export interface ContentEntry {
  /** Its path without the leading slash: its folder and file name, such as `get-started/installation`. */
  readonly route: string;
  readonly page: DocsPage;
  readonly headings: readonly Heading[];
  readonly Content: ContentModule["default"];
  /** Its source file from the repository's root, for "Edit this page". */
  readonly source: string;
}

function routeOf(path: string): string {
  return path.replace(/^\.\.\/content\//, "").replace(/\.mdx$/, "");
}

/** Every content page with frontmatter. The docs check reports the ones without it. */
export const contentPages: readonly ContentEntry[] = Object.entries(modules)
  .flatMap(([path, module]) =>
    module.page
      ? [
          {
            route: routeOf(path),
            page: module.page,
            headings: module.headings,
            Content: module.default,
            source: `apps/docs/content/${routeOf(path)}.mdx`,
          },
        ]
      : [],
  )
  .sort((a, b) => a.route.localeCompare(b.route));

const labModules = import.meta.env.DEV
  ? import.meta.glob<ContentModule>("../lab/**/content/**/*.mdx", {
      eager: true,
    })
  : {};

/**
 * The docs check's fixtures, as pages under `/lab` in development only: each one is a page the check fails,
 * shown as it would render.
 */
export const labPages: readonly ContentEntry[] = Object.entries(labModules).map(
  ([path, module]) => {
    const route = `lab/${path
      .replace(/^\.\.\/lab\//, "")
      .replace("/content/", "/")
      .replace(/\.mdx$/, "")}`;
    return {
      route,
      page: module.page ?? {
        section: "guides",
        title: route,
        description: "A page without frontmatter.",
        order: 0,
        status: "beta",
        since: "0.8.0",
      },
      headings: module.headings,
      Content: module.default,
      source: path.replace(/^\.\.\//, "apps/docs/"),
    };
  },
);
