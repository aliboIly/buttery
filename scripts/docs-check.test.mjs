import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkDocs } from "./docs-check.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixtures = join(root, "apps/docs/lab/docs-check");

/** The check run on one fixture's pages alone, with no component pages beside them. */
function fixture(name, options = {}) {
  return checkDocs({
    contentDir: join(fixtures, name, "content"),
    metaFiles: [],
    references: [],
    ...options,
  });
}

describe("docs check", () => {
  it("passes the site as it is", () => {
    expect(checkDocs()).toEqual([]);
  });

  it("fails a page without metadata, saying what to add", () => {
    expect(fixture("missing-metadata")).toEqual([
      "apps/docs/lab/docs-check/missing-metadata/content/guides/untitled.mdx has no frontmatter. Fix: start it with a --- block holding title, description, section, order, status, since.",
    ]);
  });

  it("fails two pages that share an order in their section, naming both", () => {
    expect(fixture("shared-order")).toEqual([
      '"First guide" (apps/docs/lab/docs-check/shared-order/content/guides/first.mdx) and "Second guide" (apps/docs/lab/docs-check/shared-order/content/guides/second.mdx) share order 10 in guides. Fix: give one of them an order no other page in its section has.',
    ]);
  });

  it("fails a link to a page or a heading that doesn't exist, and passes one that does", () => {
    expect(fixture("broken-link")).toEqual([
      "apps/docs/lab/docs-check/broken-link/content/guides/links.mdx links to /get-started/nowhere, which isn't a page on the site. Fix: link to a page's path, such as /components/button.",
      "apps/docs/lab/docs-check/broken-link/content/guides/links.mdx links to #nowhere, but guides/links has no heading with the id nowhere. Fix: link to one of its headings: where-to-go-next.",
    ]);
  });

  it("fails a page that shows an example that doesn't exist", () => {
    expect(
      fixture("missing-example", {
        metaFiles: [
          join(root, "packages/core/src/primitives/stack/Stack.meta.ts"),
        ],
      }),
    ).toEqual([
      'apps/docs/lab/docs-check/missing-example/content/guides/demo.mdx shows <Example of="Stack" name="nowhere">, which doesn\'t exist. Fix: name a component and a file in its examples folder, without .tsx.',
    ]);
  });

  it("fails a component with no home in the docs site's table of exports", () => {
    expect(
      fixture("no-home", {
        metaFiles: [join(fixtures, "no-home/components/stray/Stray.meta.ts")],
      }),
    ).toEqual([
      'Stray has no home in docs/DOCS_SITE.md. Fix: add it to its section\'s row in "Where every export is documented".',
    ]);
  });
});
