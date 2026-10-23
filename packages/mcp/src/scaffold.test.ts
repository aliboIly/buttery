import { beforeAll, describe, expect, it } from "vitest";
import { repoKnowledge } from "../scripts/fixture.ts";
import type { Knowledge } from "./knowledge.ts";
import {
  PAGE_KIND_NAMES,
  PAGE_KINDS,
  importedComponents,
  scaffold,
} from "./scaffold.ts";

let knowledge: Knowledge;

beforeAll(() => {
  knowledge = repoKnowledge();
});

describe("buttery_scaffold", () => {
  it("starts every page kind from an example its pattern has", () => {
    for (const page of PAGE_KIND_NAMES) {
      const [name, file] = PAGE_KINDS[page];
      const component = knowledge.components.find(
        (entry) => entry.name === name,
      );
      expect(
        component?.examples.map((example) => example.name),
        page,
      ).toContain(file);
    }
  });

  it("gives a page as a file to save, the ids of what it's built from and how to check it", () => {
    const text = scaffold(knowledge, { kind: "page", page: "settings" });
    expect(text).toMatch(
      /^## A settings page on buttery \d+\.\d+\.\d+: one group of settings/,
    );
    expect(text).toContain("```tsx\nimport");
    expect(text).toMatch(
      /Save it as a file of its own, such as src\/pages\/\w+\.tsx/,
    );
    expect(text).toMatch(/buttery_get\(\{"ids":\["component\//);
    expect(text).toContain('"component/SettingsPage"');
    expect(text).toContain("buttery_check_layout(");
  });

  it("gives the commands and setup for a new app", () => {
    const text = scaffold(knowledge, { kind: "app" });
    expect(text).toContain("pnpm new-app my-app --template dashboard");
    expect(text).toContain("npm install @butteryui/core @butteryui/react");
    expect(text).toContain("- dashboard: ");
  });

  it("names the buttery components a file imports, renamed or not", () => {
    expect(
      importedComponents(
        'import { Stack, type StackProps, Text as Words } from "@butteryui/core";\nimport { Button } from "@butteryui/react";\nimport { useState } from "react";',
      ),
    ).toEqual(["Stack", "Text", "Button"]);
  });
});
