import { describe, expect, it } from "vitest";
import { headingsOf, parseFrontmatter, withoutJsx } from "./frontmatter.ts";

describe("parseFrontmatter", () => {
  it("reads strings, numbers and lists, one key a line", () => {
    expect(
      parseFrontmatter(
        'title: Forms\norder: 20\nrelated: [components/text-field, "components/password-field"]',
        "forms.mdx",
      ),
    ).toEqual({
      title: "Forms",
      order: 20,
      related: ["components/text-field", "components/password-field"],
    });
  });

  it("reads a list that Prettier broke over indented lines", () => {
    expect(
      parseFrontmatter(
        "title: Forms\nexports:\n  [\n    FormFieldCaption,\n    FormFieldError,\n  ]\norder: 20",
        "forms.mdx",
      ),
    ).toEqual({
      title: "Forms",
      exports: ["FormFieldCaption", "FormFieldError"],
      order: 20,
    });
  });

  it("names the file and line of a line it can't read", () => {
    expect(() =>
      parseFrontmatter("title: Forms\n- a list item", "forms.mdx"),
    ).toThrow(
      'forms.mdx: frontmatter line 3 isn\'t "key: value". Fix: one key per line, such as title: Button.',
    );
  });
});

describe("headingsOf", () => {
  it("lists a page's ## and ### headings outside its code blocks", () => {
    expect(
      headingsOf(
        [
          "## Install",
          "",
          "```md",
          "## Not a heading",
          "```",
          "### With `pnpm`",
        ].join("\n"),
      ),
    ).toEqual([
      { depth: 2, text: "Install", id: "install" },
      { depth: 3, text: "With pnpm", id: "with-pnpm" },
    ]);
  });

  it("puts the headings a component writes where the component sits", () => {
    expect(
      headingsOf(["## Before", "", "<WhatsNew />", "", "## After"].join("\n"), {
        WhatsNew: () => [
          { depth: 2, text: "0.9.0 Docs site", id: "release-0-9-0" },
        ],
      }),
    ).toEqual([
      { depth: 2, text: "Before", id: "before" },
      { depth: 2, text: "0.9.0 Docs site", id: "release-0-9-0" },
      { depth: 2, text: "After", id: "after" },
    ]);
  });
});

describe("withoutJsx", () => {
  it("drops a whole component, even over several lines, and keeps the Markdown a wrapper holds", () => {
    expect(
      withoutJsx(
        [
          "<Rules>",
          '<Rule title="Flow layout">',
          "",
          "Siblings sit in a `Stack`.",
          "",
          "</Rule>",
          "</Rules>",
          "",
          "<SurfacesDemo />",
          "",
          "<Card",
          '  icon="monitor"',
          '  title="On the desktop"',
          ">",
          "",
          "It knows it's in Tauri.",
          "",
          "</Card>",
          "<DocsTable",
          '  columns={["A"]}',
          '  rows={[["b"]]}',
          "/>",
          "After the table.",
        ].join("\n"),
      )
        .split("\n")
        .filter((line) => line.trim() !== ""),
    ).toEqual([
      "Siblings sit in a `Stack`.",
      "It knows it's in Tauri.",
      "After the table.",
    ]);
  });

  it("leaves code blocks alone, components in them included", () => {
    const code = ["```tsx", "<Stack gap={3} />", "```"].join("\n");
    expect(withoutJsx(code)).toBe(code);
  });
});
