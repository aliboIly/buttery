import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "./frontmatter.ts";

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
