import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createComponent, kebabCase } from "./component.ts";

function app(): string {
  const root = mkdtempSync(join(tmpdir(), "buttery-component-"));
  mkdirSync(join(root, "src"));
  return root;
}

describe("buttery create component", () => {
  it("names its CSS file and class in kebab case", () => {
    expect(kebabCase("OrderCard")).toBe("order-card");
    expect(kebabCase("KPIBadge")).toBe("kpi-badge");
    expect(kebabCase("Rating")).toBe("rating");
  });

  it("writes the component, its CSS, examples, a preview page and a spec", () => {
    const root = app();
    const made = createComponent(root, "OrderCard", "one order, as a card");
    expect(made).toEqual({
      files: [
        "src/components/OrderCard/OrderCard.tsx",
        "src/components/OrderCard/order-card.css",
        "src/components/OrderCard/OrderCard.examples.tsx",
        "src/components/OrderCard/preview.html",
        "src/components/OrderCard/preview.tsx",
        "e2e/order-card.spec.ts",
      ],
      preview: "/src/components/OrderCard/preview.html",
      spec: "e2e/order-card.spec.ts",
    });
    const component = readFileSync(
      join(root, "src/components/OrderCard/OrderCard.tsx"),
      "utf8",
    );
    expect(component).toContain(" * One order, as a card.\n");
    expect(component).toContain('import "./order-card.css";');
    expect(component).toContain('from "@butteryui/core";');
    expect(
      readFileSync(
        join(root, "src/components/OrderCard/order-card.css"),
        "utf8",
      ),
    ).toMatch(
      /^\.order-card \{\n {2}--bt-order-card-gap: var\(--bt-space-2\);/,
    );
    expect(
      readFileSync(join(root, "e2e/order-card.spec.ts"), "utf8"),
    ).toContain('const PREVIEW = "/src/components/OrderCard/preview.html";');
  });

  it("says how to fix a name, a missing purpose or a folder that's taken", () => {
    const root = app();
    expect(() => createComponent(root, "order-card", "A card.")).toThrow(
      /use PascalCase, such as OrderCard/,
    );
    expect(() => createComponent(root, "OrderCard", " ")).toThrow(
      /--purpose "One line on what it's for\."/,
    );
    createComponent(root, "OrderCard", "A card.");
    expect(() => createComponent(root, "OrderCard", "A card.")).toThrow(
      /src\/components\/OrderCard already exists/,
    );
    expect(() =>
      createComponent(
        mkdtempSync(join(tmpdir(), "no-src-")),
        "OrderCard",
        "A card.",
      ),
    ).toThrow(/There's no src folder here/);
  });
});
