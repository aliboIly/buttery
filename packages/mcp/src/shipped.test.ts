import { posix } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { repoKnowledge } from "../scripts/fixture.ts";
import { SITE } from "../scripts/knowledge.ts";
import {
  coreFiles,
  manifestOf,
  reactFiles,
  shippedLinks,
} from "../scripts/shipped.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

/** The links in `markdown` to files, without their anchors: every link that isn't a web address or an anchor. */
function fileLinks(markdown: string): string[] {
  return [...markdown.matchAll(/\]\(([^)\s]+)\)/g)]
    .map(([, href]) => (href ?? "").split("#")[0] ?? "")
    .filter((href) => href !== "" && !/^[a-z]+:/.test(href));
}

describe("links in the docs the packages ship", () => {
  const shipped = new Set(["components/button", "layout/primitives"]);

  it("point at a shipped page's file, from the folder the Markdown is in, keeping the anchor", () => {
    expect(
      shippedLinks("[Button](/components/button)", "docs/components", shipped),
    ).toBe("[Button](button.md)");
    expect(
      shippedLinks(
        "[Stack](/layout/primitives#stack)",
        "docs/components",
        shipped,
      ),
    ).toBe("[Stack](../layout/primitives.md#stack)");
    expect(
      shippedLinks(
        "- [Button](/components/button.md): A button.",
        ".",
        shipped,
      ),
    ).toBe("- [Button](docs/components/button.md): A button.");
  });

  it("point at the docs site for anything else from the site's root, and leave other links alone", () => {
    expect(
      shippedLinks(
        "[the orders](/demos/roastery/orders)",
        "docs/components",
        shipped,
      ),
    ).toBe(`[the orders](${SITE}/demos/roastery/orders)`);
    expect(
      shippedLinks(
        "[npm](https://www.npmjs.com/package/@butteryui/core) and [its props](#props)",
        ".",
        shipped,
      ),
    ).toBe(
      "[npm](https://www.npmjs.com/package/@butteryui/core) and [its props](#props)",
    );
  });
});

describe("what @butteryui/core ships for agents", () => {
  const files = coreFiles(root, "1.2.3");

  it("has every page llms.txt lists, and every link between its files reaches one", () => {
    const pages = [...files.keys()].filter((path) => path.startsWith("docs/"));
    expect(pages).toContain("docs/components/button.md");
    expect(pages).toContain("docs/layout/the-layout-contract.md");
    expect(fileLinks(files.get("llms.txt") ?? "").sort()).toEqual(
      [...pages].sort(),
    );
    for (const [path, contents] of files) {
      for (const link of fileLinks(contents)) {
        expect(
          files.has(posix.join(posix.dirname(path), link)),
          `${path} links to ${link}`,
        ).toBe(true);
      }
    }
  });

  it("puts every page in llms-full.txt, its links from beside llms.txt, and names the version there and in llms.txt", () => {
    const full = files.get("llms-full.txt") ?? "";
    expect(full).toContain("\n# Button\n");
    expect(full).toContain("(docs/components/icon-button.md)");
    expect(files.get("docs/components/button.md")).toContain(
      "(icon-button.md)",
    );
    expect(files.get("llms.txt")).toContain(
      "These are the docs of buttery 1.2.3, the version installed here",
    );
    expect(full).toContain(
      "These are the docs of buttery 1.2.3, the version installed here, every page in one file.",
    );
  });
});

describe("what @butteryui/react ships for agents", () => {
  const knowledge = repoKnowledge();
  const files = reactFiles(knowledge);
  const manifest = manifestOf(knowledge);
  const core = coreFiles(root, knowledge.version);

  it("lists every component in manifest.json with the line that imports it and its docs, on the site and as Markdown", () => {
    expect(manifest.version).toBe(knowledge.version);
    expect(manifest.components.map((component) => component.name)).toEqual(
      knowledge.components.map((component) => component.name),
    );
    const button = manifest.components.find(
      (component) => component.name === "Button",
    );
    expect(button?.import).toBe('import { Button } from "@butteryui/react";');
    expect(button?.docs).toBe(`${SITE}/components/button`);
    expect(button?.markdown).toBe(
      "@butteryui/core/dist/docs/components/button.md",
    );
    expect(
      manifest.components.find((component) => component.name === "Stack")
        ?.import,
    ).toBe('import { Stack } from "@butteryui/core";');
    for (const component of manifest.components) {
      const page = component.markdown
        .replace("@butteryui/core/dist/", "")
        .split("#")[0];
      expect(core.has(page ?? ""), component.name).toBe(true);
    }
  });

  it("writes each example to the file manifest.json names, with the code its page shows", () => {
    for (const component of knowledge.components) {
      const listed = manifest.components.find(
        (entry) => entry.name === component.name,
      );
      expect(listed?.examples.length, component.name).toBe(
        component.examples.length,
      );
      for (const [index, example] of component.examples.entries()) {
        const file = listed?.examples[index]?.file ?? "";
        expect(file).toBe(`examples/${component.name}/${example.name}.tsx`);
        expect(files.get(file), file).toBe(`${example.code.trimEnd()}\n`);
      }
    }
  });

  it("writes manifest.json, and the knowledge the MCP server answers from for this version", () => {
    expect(JSON.parse(files.get("manifest.json") ?? "")).toEqual(manifest);
    expect(JSON.parse(files.get("knowledge.json") ?? "")).toEqual(knowledge);
  });
});
