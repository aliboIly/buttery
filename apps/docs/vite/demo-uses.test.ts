import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { demoUsesIn } from "./demo-uses.ts";
import { componentSources, pageMarkdown } from "./markdown.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));

describe("where the demos use each component", () => {
  const uses = demoUsesIn(root);

  it("finds a component on the demo screens that import it, each demo named as one", () => {
    expect(uses["DataTable"]).toContainEqual({
      demo: "the roastery demo",
      page: "orders",
      href: "/demos/roastery/orders",
    });
    expect(uses["SegmentedControl"]).toContainEqual({
      demo: "the Card Studio demo",
      href: "/demos/card-studio",
    });
    expect(uses["Bento"]).toContainEqual({
      demo: "the Halfmoon shop demo",
      href: "/demos/roastery-shop",
    });
  });

  it("leaves out a helper file of a demo with several pages", () => {
    expect(uses["DataTable"]?.map((screen) => screen.page)).not.toContain(
      "shell",
    );
  });

  it("links a part of every roastery screen, such as its shell or help panel, to the demo, unless a page of it uses the component too", () => {
    const pages = Object.values(uses)
      .flat()
      .map((screen) => screen.page);
    expect(pages).not.toContain("shell");
    expect(pages).not.toContain("help panel");
    expect(uses["Sidebar"]).toEqual([
      { demo: "the roastery demo", href: "/demos/roastery" },
    ]);
    expect(
      uses["Menu"]
        ?.filter((screen) => screen.demo === "the roastery demo")
        .map((screen) => screen.page),
    ).toEqual(["customers", "orders"]);
  });

  it("links a component's Markdown page to the demo screens that use it", () => {
    const markdown =
      pageMarkdown(root, "components/data-table", componentSources(root)) ?? "";
    expect(markdown).toMatch(
      /See it in the roastery demo's \[[a-z ]+\]\([^)]+\)(?:, \[[a-z ]+\]\([^)]+\))*(?: and \[[a-z ]+\]\([^)]+\))?\./,
    );
    expect(markdown).toContain("[orders](/demos/roastery/orders)");
    expect(
      pageMarkdown(root, "components/sidebar", componentSources(root)),
    ).toContain("See it in [the roastery demo](/demos/roastery).");
  });
});
