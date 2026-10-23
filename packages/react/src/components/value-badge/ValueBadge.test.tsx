import "@butteryui/core/styles.css";
import "../../styles.css";
import { contrastRatio } from "@butteryui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ValueBadge } from "./ValueBadge.tsx";

afterEach(cleanup);

function colorIn(scope: Element, variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  scope.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function hexOf(rgb: string): string {
  const [r = 0, g = 0, b = 0] = (rgb.match(/\d+/g) ?? []).map(Number);
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

describe("ValueBadge", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <ValueBadge ref={ref} className="custom" title="Rotation">
        12°
      </ValueBadge>,
    );
    expect(ref.current?.dataset["bt"]).toBe("ValueBadge");
    expect(ref.current?.getAttribute("title")).toBe("Rotation");
    expect(ref.current?.className).toBe("bt-value-badge custom");
  });

  it("keeps the same width whatever value it shows", async () => {
    const { rerender } = render(
      <ValueBadge reserve={["-180°", "180°"]} data-testid="badge">
        0°
      </ValueBadge>,
    );
    await document.fonts.ready;
    const badge = screen.getByTestId("badge");
    const width = badge.getBoundingClientRect().width;
    rerender(
      <ValueBadge reserve={["-180°", "180°"]} data-testid="badge">
        -180°
      </ValueBadge>,
    );
    expect(badge.getBoundingClientRect().width).toBe(width);
    expect(badge.getBoundingClientRect().height).toBe(20);
  });

  it("reads as its value alone", () => {
    render(
      <ValueBadge reserve={["0%", "100%"]} data-testid="badge">
        80%
      </ValueBadge>,
    );
    const hidden = screen
      .getByTestId("badge")
      .querySelectorAll('[aria-hidden="true"]');
    expect(hidden).toHaveLength(2);
  });

  it("is soft unless told: bg-control under text-secondary", () => {
    render(<ValueBadge data-testid="badge">80%</ValueBadge>);
    const badge = screen.getByTestId("badge");
    expect(badge.dataset["variant"]).toBe("soft");
    expect(getComputedStyle(badge).backgroundColor).toBe(
      colorIn(document.body, "--bt-bg-control"),
    );
    expect(getComputedStyle(badge).color).toBe(
      colorIn(document.body, "--bt-text-secondary"),
    );
  });

  it("fills a solid badge with text-secondary under the surface's color, at AA in light and dark", () => {
    for (const theme of ["light", "dark"] as const) {
      render(
        <div data-bt-theme={theme} data-testid="scope">
          <ValueBadge variant="solid" data-testid="badge">
            80%
          </ValueBadge>
        </div>,
      );
      const scope = screen.getByTestId("scope");
      const style = getComputedStyle(screen.getByTestId("badge"));
      expect(style.backgroundColor, theme).toBe(
        colorIn(scope, "--bt-text-secondary"),
      );
      expect(style.color, theme).toBe(colorIn(scope, "--bt-bg-surface"));
      expect(
        contrastRatio(hexOf(style.color), hexOf(style.backgroundColor)),
        theme,
      ).toBeGreaterThanOrEqual(4.5);
      cleanup();
    }
  });

  it("outlines a badge with a 1px border edge and no fill, keeping a soft badge's size", async () => {
    render(
      <>
        <ValueBadge reserve={["-180°", "180°"]} data-testid="soft">
          12°
        </ValueBadge>
        <ValueBadge
          reserve={["-180°", "180°"]}
          variant="outline"
          data-testid="outline"
        >
          12°
        </ValueBadge>
      </>,
    );
    await document.fonts.ready;
    const soft = screen.getByTestId("soft").getBoundingClientRect();
    const outline = screen.getByTestId("outline");
    const style = getComputedStyle(outline);
    expect(outline.getBoundingClientRect().width).toBe(soft.width);
    expect(outline.getBoundingClientRect().height).toBe(soft.height);
    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style.boxShadow).toContain("inset");
    expect(style.boxShadow).toContain(colorIn(document.body, "--bt-border"));
  });
});
