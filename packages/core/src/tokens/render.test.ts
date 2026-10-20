import { readFileSync } from "node:fs";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";
import { colors } from "./index.ts";
import {
  renderLayoutCss,
  renderSurfaceRecipeCss,
  renderTailwindCss,
  renderTextRecipeCss,
  renderTokensCss,
  renderTokensJson,
} from "./render.ts";

function file(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("generated files", () => {
  it("are up to date with the token source (run pnpm tokens if this fails)", () => {
    expect(file("./tokens.css")).toBe(renderTokensCss());
    expect(file("./tokens.json")).toBe(renderTokensJson());
    expect(file("../styles/recipes/surface.css")).toBe(
      renderSurfaceRecipeCss(),
    );
    expect(file("../styles/recipes/text.css")).toBe(renderTextRecipeCss());
    expect(file("../styles/tailwind.css")).toBe(renderTailwindCss());
    expect(file("../styles/primitives/layout.css")).toBe(renderLayoutCss());
  });

  it("emit every color in both themes", () => {
    const css = renderTokensCss();
    for (const [name, definition] of Object.entries(colors)) {
      expect(css).toContain(`--bt-${name}: ${definition.light};`);
      expect(css).toContain(`--bt-${name}: ${definition.dark};`);
    }
  });

  it("follow the system theme only when no explicit light theme is set", () => {
    expect(renderTokensCss()).toContain(':root:not([data-bt-theme="light"])');
  });

  it("trim stacked text roles and leave truncated text alone", () => {
    const css = renderTextRecipeCss();
    expect(css).toMatch(
      /\[data-role="body"\][^{]*:not\(\.bt-truncate\) \{\s*text-box: trim-both cap alphabetic;/,
    );
    expect(css).not.toMatch(/\[data-role="label"\][^{]*:not\(\.bt-truncate\)/);
  });
});

describe("Tailwind bridge", () => {
  it("maps utilities straight to buttery variables", async () => {
    const compiler = await compile(
      `${renderTailwindCss()}\n@tailwind utilities;`,
      {
        base: import.meta.dirname,
        loadStylesheet: (id) =>
          Promise.reject(new Error(`Unexpected stylesheet import: ${id}`)),
      },
    );
    const css = compiler.build([
      "bg-surface",
      "rounded-card",
      "shadow-floating",
      "h-control",
      "ease-buttery",
      "text-label",
    ]);
    expect(css).toContain("background-color: var(--bt-bg-surface);");
    expect(css).toContain("border-radius: var(--bt-r-lg);");
    expect(css).toContain("--tw-shadow: var(--bt-shadow-floating);");
    expect(css).toContain("height: var(--bt-h-control);");
    expect(css).toContain(
      "transition-timing-function: var(--bt-ease-standard);",
    );
    expect(css).toContain("font-size: var(--bt-text-label-size);");
  });
});
