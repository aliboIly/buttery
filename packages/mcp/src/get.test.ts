import { beforeAll, describe, expect, it } from "vitest";
import { repoKnowledge } from "../scripts/fixture.ts";
import {
  CALL_BUDGET,
  entryText,
  fitted,
  idOf,
  resolve,
  sectionOf,
} from "./get.ts";
import type { Entry } from "./get.ts";
import type { Knowledge } from "./knowledge.ts";
import { createSearcher } from "./search.ts";
import { suggestionFor } from "./suggest.ts";

let knowledge: Knowledge;

beforeAll(() => {
  knowledge = repoKnowledge();
});

function entry(id: string): Entry {
  const found = resolve(knowledge, id);
  if (found === null) throw new Error(`Nothing has the id ${id}.`);
  return found;
}

describe("buttery_get", () => {
  it("takes the ids search gives and the looser forms agents write", () => {
    for (const id of [
      "component/Dialog",
      "Dialog",
      "dialog",
      "pattern/Dialog",
      "component/Dialog.Content",
      "/components/dialog",
      "page/components/dialog",
      "https://aliboily.github.io/buttery/components/dialog",
    ]) {
      expect(idOf(entry(id)), id).toBe("component/Dialog");
    }
    expect(idOf(entry("--bt-space-4"))).toBe("tokens/space");
    expect(idOf(entry("token/space"))).toBe("tokens/space");
    expect(idOf(entry("rule/overlap"))).toBe("check/overlap");
    expect(idOf(entry("rule/flow-layout-only"))).toBe("rule/flow-layout-only");
    expect(idOf(entry("page/layout/responsive#container-queries"))).toBe(
      "page/layout/responsive#container-queries",
    );
    expect(resolve(knowledge, "component/Nothing")).toBeNull();
  });

  it("gives a component's import, props with their defaults, the token values they take and an example", () => {
    const text = entryText(knowledge, entry("component/Stack"), "summary");
    expect(text).toContain('import { Stack } from "@butteryui/core";');
    expect(text).toContain("`gap?: SpaceValue`");
    expect(text).toMatch(
      /`SpaceValue` \(a spacing step[^)]*\): 0 \| 0\.5 \| 1/,
    );
    expect(text).toContain("```tsx");
    expect(text).toContain(
      `Docs: ${knowledge.site}/layout/stack-inline-and-grid#stack`,
    );
  });

  it("adds every part's props, accessibility, keyboard, motion and the examples' ids at full detail", () => {
    const text = entryText(knowledge, entry("component/Menu"), "full");
    expect(text).toContain("Props of `Menu.Item`");
    expect(text).toContain("Accessibility:");
    expect(text).toContain("Keyboard:");
    expect(text).toContain("Motion:");
    expect(text).toMatch(/- example\/Menu\/[a-z-]+: /);
  });

  it("keeps every component's summary to about 1,600 tokens and its full entry to one call's", () => {
    for (const component of knowledge.components) {
      const found: Entry = { type: "component", component };
      expect(
        entryText(knowledge, found, "summary").length,
        component.name,
      ).toBeLessThanOrEqual(6_400);
      expect(
        entryText(knowledge, found, "full").length,
        component.name,
      ).toBeLessThanOrEqual(CALL_BUDGET);
    }
  });

  it("gives one section of a page by its anchor, down to the next heading as high", () => {
    const section = sectionOf(
      entry("page/layout/the-layout-contract").type === "page"
        ? (knowledge.pages.find(
            (page) => page.route === "layout/the-layout-contract",
          )?.markdown ?? "")
        : "",
      "the-13-rules",
    );
    expect(section).toMatch(/^## The 13 rules/);
    expect(section).not.toContain("## Do and don't");
  });

  it("cuts a long page at the room it has and names the sections to ask for instead", () => {
    const page = entry("page/patterns/marketing-page");
    const text = fitted(entryText(knowledge, page, "summary"), 3_000, page);
    expect(text.length).toBeLessThanOrEqual(3_000);
    expect(text).toMatch(
      /\[Cut at 3000 characters\. Get one section at a time: page\/patterns\/marketing-page#/,
    );
  });

  it("suggests the id meant for a misspelling or another library's name", () => {
    const searcher = createSearcher(knowledge);
    expect(suggestionFor(knowledge, searcher, "component/Dailog")).toBe(
      "component/Dialog",
    );
    expect(suggestionFor(knowledge, searcher, "component/Modal")).toBe(
      "component/Dialog",
    );
    expect(suggestionFor(knowledge, searcher, "tokens/spacing")).toBe(
      "tokens/space",
    );
  });
});
