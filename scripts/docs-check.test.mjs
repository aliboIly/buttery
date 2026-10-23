import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { propsTablesIn } from "../apps/docs/vite/props.ts";
import { checkDocs } from "./docs-check.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixtures = join(root, "apps/docs/lab/docs-check");

/** The check run on one fixture's pages alone, with no component pages beside them. */
function fixture(name, options = {}) {
  return checkDocs({
    contentDir: join(fixtures, name, "content"),
    metaFiles: [],
    references: [],
    packageIndex: null,
    changelogs: [],
    ...options,
  });
}

describe("docs check", () => {
  it("passes the site as it is", () => {
    expect(checkDocs()).toEqual([]);
  });

  it("fails a release a changelog lists without a What's new entry, and an entry without two or three highlights", () => {
    expect(
      fixture("missing-release", {
        changelogs: [join(fixtures, "missing-release/react/CHANGELOG.md")],
      }),
    ).toEqual([
      'apps/docs/lab/docs-check/missing-release/content/whats-new/0.10.0.md has 1 highlight. Fix: list two or three, each a "- " line on what the release brought.',
      "apps/docs/lab/docs-check/missing-release/react/CHANGELOG.md has 0.11.0, but What's new has no entry for it. Fix: add apps/docs/lab/docs-check/missing-release/content/whats-new/0.11.0.md with its version, date and title in the frontmatter and two or three highlights.",
    ]);
  });

  it("fails a page that says it arrived in a release What's new has no entry for", () => {
    expect(fixture("unknown-release")).toEqual([
      "apps/docs/lab/docs-check/unknown-release/content/guides/stepper.mdx says it arrived in 0.4.5, a release What's new has no entry for. Fix: set since to the release it arrived in, one of 0.9.0.",
    ]);
  });

  it("fails release notes without a summary, or showing an example that doesn't exist", () => {
    expect(
      fixture("release-notes", {
        metaFiles: [
          join(root, "packages/react/src/components/slider/Slider.meta.ts"),
        ],
        docsSite: join(root, "docs/DOCS_SITE.md"),
        examples: false,
      }).filter((problem) => problem.includes("whats-new")),
    ).toEqual([
      "apps/docs/lab/docs-check/release-notes/content/whats-new/0.9.0.md has no summary. Fix: give its frontmatter version, date (YYYY-MM-DD), title and summary, a sentence on what the release is for.",
      "apps/docs/lab/docs-check/release-notes/content/whats-new/0.9.0.md shows the example Slider/no-such-example, which doesn't exist. Fix: name a component and one of its examples' files, such as examples: [Slider/opacity-row].",
      "apps/docs/lab/docs-check/release-notes/content/whats-new/0.9.0.md shows the example Stepper/checkout, which doesn't exist. Fix: name a component and one of its examples' files, such as examples: [Slider/opacity-row].",
    ]);
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

  it("knows a component page's headings, so a link to its examples passes and one to a heading it lacks fails", () => {
    const button = join(
      root,
      "packages/react/src/components/button/Button.meta.ts",
    );
    const problems = fixture("component-anchor", { metaFiles: [button] });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(
      /links to \/components\/button#nowhere, but components\/button has no heading with the id nowhere/,
    );
    expect(problems[0]).toContain("save-and-cancel-example");
  });

  it("fails a page that shows an example that doesn't exist", () => {
    expect(
      fixture("missing-example", {
        metaFiles: [
          join(root, "packages/core/src/primitives/stack/Stack.meta.ts"),
        ],
      }),
    ).toContain(
      'apps/docs/lab/docs-check/missing-example/content/guides/demo.mdx shows <Example of="Stack" name="nowhere">, which doesn\'t exist. Fix: name a component and a file in its examples folder, without .tsx.',
    );
  });

  it("fails a prop without JSDoc, since its props table couldn't say what it does", () => {
    expect(
      fixture("prop-without-jsdoc", {
        metaFiles: [
          join(fixtures, "prop-without-jsdoc/components/quiet/Quiet.meta.ts"),
        ],
      }),
    ).toContain(
      "apps/docs/lab/docs-check/prop-without-jsdoc/components/quiet/Quiet.tsx: Quiet's prop tone has no JSDoc, so its props table can't say what it does. Fix: add a /** … */ comment above it saying what it does and its default.",
    );
  });

  it("asks a component whose props are a union for the examples its members' props call for", () => {
    expect(
      fixture("union-props", {
        metaFiles: [join(fixtures, "union-props/components/pane/Pane.meta.ts")],
      }),
    ).toContain(
      'Pane has no controlled example. Fix: add one to apps/docs/lab/docs-check/union-props/components/pane/examples with export const kind: ExampleKind = "controlled".',
    );
  });

  it("fails a component page with no live demo, keyboard table, layout note or reduced-motion note", () => {
    const bare = join(fixtures, "missing-parts/components/bare");
    expect(
      fixture("missing-parts", { metaFiles: [join(bare, "Bare.meta.ts")] }),
    ).toEqual(
      expect.arrayContaining([
        "apps/docs/lab/docs-check/missing-parts/components/bare/Bare.playground.tsx has no live demo. Fix: export const live: LiveDemo = { controls, render }, with a control for each prop a reader most wants to try.",
        'apps/docs/lab/docs-check/missing-parts/components/bare/Bare.meta.ts has no keyboard table. Fix: add keyboard: [{ keys: "Enter or Space", does: "Presses it" }], a row for each key it answers while it has focus, or keyboard: [] when it takes no keyboard input of its own.',
        'apps/docs/lab/docs-check/missing-parts/components/bare/Bare.meta.ts doesn\'t say how Bare lays out. Fix: add layout: "…", on how it sizes itself (its height token and width), what it truncates or wraps, and its hit areas.',
        'apps/docs/lab/docs-check/missing-parts/components/bare/Bare.meta.ts doesn\'t say what Bare does with reduced motion. Fix: add reducedMotion: "…", one sentence on how it moves when motion is reduced.',
      ]),
    );
  });

  it("fails an export outside a component's folder that no page describes", () => {
    const folder = join(fixtures, "export-without-page");
    expect(
      fixture("export-without-page", {
        packageIndex: join(folder, "package/index.ts"),
      }),
    ).toEqual([
      "apps/docs/lab/docs-check/export-without-page/content/guides/helpers.mdx lists mutedHelper in its exports but doesn't describe it. Fix: write about `mutedHelper` on the page, with its name in backticks, alone or called, as in `mutedHelper()`.",
      "quietHelper, exported from apps/docs/lab/docs-check/export-without-page/package/index.ts, has no docs page. Fix: add it to exports: [...] in the frontmatter of the page that documents it, and describe it there.",
    ]);
  });

  it("gives FloatingLanes.Item a props table, since its props are named after the part", () => {
    const tables = propsTablesIn(
      "FloatingLanes",
      join(root, "packages/core/src/layers/floating-lanes/FloatingLanes.tsx"),
    );
    expect(tables.map((table) => [table.part, table.interfaceName])).toEqual([
      ["Item", "FloatingLanesItemProps"],
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
