import "@butteryui/core/styles.css";
import "../../styles.css";
import { contrastRatio } from "@butteryui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { ArrowUpRight } from "lucide-react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge.tsx";
import type { StatusTone } from "./StatusBadge.tsx";

afterEach(cleanup);

const TONES: readonly (readonly [StatusTone, string, string])[] = [
  ["neutral", "--bt-bg-control", "--bt-text-secondary"],
  ["info", "--bt-accent-subtle", "--bt-accent-text"],
  ["success", "--bt-success-subtle", "--bt-success"],
  ["warning", "--bt-warning-subtle", "--bt-warning"],
  ["danger", "--bt-danger-subtle", "--bt-danger"],
];

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

describe("StatusBadge", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <StatusBadge ref={ref} className="custom" data-testid="badge">
        Paid
      </StatusBadge>,
    );
    expect(ref.current?.dataset["bt"]).toBe("StatusBadge");
    expect(ref.current?.dataset["testid"]).toBe("badge");
    expect(ref.current?.className).toBe("bt-status-badge custom");
  });

  it("is 20px tall with its label in the badge role, neutral unless told", () => {
    render(<StatusBadge data-testid="badge">Draft</StatusBadge>);
    const badge = screen.getByTestId("badge");
    expect(badge.getBoundingClientRect().height).toBe(20);
    expect(badge.dataset["tone"]).toBe("neutral");
    expect(getComputedStyle(badge).fontSize).toBe("12px");
    expect(getComputedStyle(badge).borderRadius).toBe("6px");
  });

  it("colors each tone from its own subtle background and text, soft unless told", () => {
    for (const [tone, background, text] of TONES) {
      render(
        <StatusBadge tone={tone} data-testid={tone}>
          {tone}
        </StatusBadge>,
      );
      const badge = screen.getByTestId(tone);
      const style = getComputedStyle(badge);
      expect(badge.dataset["variant"], tone).toBe("soft");
      expect(style.backgroundColor, tone).toBe(
        colorIn(document.body, background),
      );
      expect(style.color, tone).toBe(colorIn(document.body, text));
    }
  });

  it("fills a solid badge with its tone's strong color under text in the surface's color, at AA in light and dark", () => {
    for (const theme of ["light", "dark"] as const) {
      render(
        <div data-bt-theme={theme} data-testid="scope">
          {TONES.map(([tone]) => (
            <StatusBadge
              key={tone}
              tone={tone}
              variant="solid"
              data-testid={tone}
            >
              {tone}
            </StatusBadge>
          ))}
        </div>,
      );
      const scope = screen.getByTestId("scope");
      for (const [tone, , strong] of TONES) {
        const style = getComputedStyle(screen.getByTestId(tone));
        const label = `${tone} in ${theme}`;
        expect(style.backgroundColor, label).toBe(colorIn(scope, strong));
        expect(style.color, label).toBe(colorIn(scope, "--bt-bg-surface"));
        expect(
          contrastRatio(hexOf(style.color), hexOf(style.backgroundColor)),
          label,
        ).toBeGreaterThanOrEqual(4.5);
      }
      cleanup();
    }
  });

  it("outlines a badge with a 1px border edge and no fill, at a soft badge's size, its words in the tone", async () => {
    render(
      <>
        <StatusBadge tone="warning" data-testid="soft">
          Low stock
        </StatusBadge>
        <StatusBadge tone="warning" variant="outline" data-testid="outline">
          Low stock
        </StatusBadge>
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
    expect(style.boxShadow).toContain("1px");
    expect(style.color).toBe(colorIn(document.body, "--bt-warning"));
  });

  it("truncates a long label inside a narrow cell, with its full text as its title", () => {
    render(
      <div style={{ inlineSize: "60px" }}>
        <StatusBadge data-testid="badge">Waiting on the roaster</StatusBadge>
      </div>,
    );
    const badge = screen.getByTestId("badge");
    expect(badge.getBoundingClientRect().width).toBeLessThanOrEqual(60);
    const label = badge.querySelector<HTMLElement>('[data-bt-part="label"]');
    expect(label?.scrollWidth).toBeGreaterThan(label?.clientWidth ?? 0);
    expect(getComputedStyle(label ?? badge).textOverflow).toBe("ellipsis");
    expect(label?.title).toBe("Waiting on the roaster");
  });

  it("puts a 12px icon before the label", () => {
    render(
      <StatusBadge tone="success" icon={ArrowUpRight} data-testid="badge">
        12%
      </StatusBadge>,
    );
    const icon = screen.getByTestId("badge").querySelector("svg");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(icon?.getBoundingClientRect().width).toBe(12);
    expect(screen.getByTestId("badge").textContent).toBe("12%");
  });
});
