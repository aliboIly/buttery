declare module "*.mdx" {
  import type { ReactElement } from "react";
  import type { DocsPage } from "@buttery/core";

  /** The page's frontmatter; undefined when it has none, which the docs check reports. */
  export const page: DocsPage | undefined;

  /** The page's content, with `components` standing in for the Markdown elements it renders. */
  export default function Content(props: {
    readonly components?: Readonly<Record<string, unknown>>;
  }): ReactElement;
}
