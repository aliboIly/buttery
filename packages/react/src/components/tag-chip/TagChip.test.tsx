import "@butteryui/core/styles.css";
import "../../styles.css";
import { contrastRatio } from "@butteryui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { TagChip } from "./TagChip.tsx";

afterEach(cleanup);

function colorOf(variable: string): string {
  const probe = document.createElement("span");
  probe.style.backgroundColor = `var(${variable})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

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

function tagOf(text: string): HTMLElement {
  const tag = screen.getByText(text).parentElement;
  if (!tag) throw new Error(`No tag for ${text}.`);
  return tag;
}

function dotOf(tag: HTMLElement): HTMLElement {
  const dot = tag.querySelector<HTMLElement>('[data-bt-part="dot"]');
  if (!dot) throw new Error("No dot.");
  return dot;
}

describe("TagChip", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <TagChip ref={ref} className="custom" data-testid="tag">
        New
      </TagChip>,
    );
    expect(ref.current?.dataset["bt"]).toBe("TagChip");
    expect(ref.current?.dataset["testid"]).toBe("tag");
    expect(ref.current?.className).toBe("bt-tag-chip custom");
  });

  it("is a 20px outlined tag with a 6px dot in its tone's color, the dot hidden from screen readers", () => {
    render(<TagChip tone="success">Free trial</TagChip>);
    const tag = screen.getByText("Free trial").parentElement;
    if (!tag) throw new Error("No tag.");
    expect(tag.getBoundingClientRect().height).toBe(20);
    expect(getComputedStyle(tag).borderTopWidth).toBe("1px");
    const dot = tag.querySelector<HTMLElement>('[data-bt-part="dot"]');
    if (!dot) throw new Error("No dot.");
    expect(dot.getBoundingClientRect().width).toBe(6);
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(dot).backgroundColor).toBe(colorOf("--bt-success"));
  });

  it("colors its dot by tone", () => {
    render(
      <>
        <TagChip tone="info">New</TagChip>
        <TagChip tone="warning">Popular</TagChip>
        <TagChip>Easy setup</TagChip>
      </>,
    );
    const dot = (text: string): string => {
      const element = screen
        .getByText(text)
        .parentElement?.querySelector<HTMLElement>('[data-bt-part="dot"]');
      if (!element) throw new Error("No dot.");
      return getComputedStyle(element).backgroundColor;
    };
    expect(dot("New")).toBe(colorOf("--bt-accent"));
    expect(dot("Popular")).toBe(colorOf("--bt-warning"));
    expect(dot("Easy setup")).toBe(colorOf("--bt-text-tertiary"));
  });

  it("is outlined unless told, with no fill", () => {
    render(<TagChip tone="info">New</TagChip>);
    const tag = tagOf("New");
    expect(tag.dataset["variant"]).toBe("outline");
    expect(getComputedStyle(tag).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(tag).borderTopColor).toBe(
      colorIn(document.body, "--bt-border"),
    );
  });

  it("draws a soft tag on its tone's subtle background, its words and dot in the tone, at the outlined tag's size", async () => {
    render(
      <>
        <TagChip tone="success" data-testid="outline">
          Free trial
        </TagChip>
        <TagChip tone="success" variant="soft" data-testid="soft">
          Free trial
        </TagChip>
      </>,
    );
    await document.fonts.ready;
    const outline = screen.getByTestId("outline");
    const soft = screen.getByTestId("soft");
    const style = getComputedStyle(soft);
    expect(style.backgroundColor).toBe(
      colorIn(document.body, "--bt-success-subtle"),
    );
    expect(style.color).toBe(colorIn(document.body, "--bt-success"));
    expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(dotOf(soft)).backgroundColor).toBe(
      colorIn(document.body, "--bt-success"),
    );
    expect(soft.getBoundingClientRect().height).toBe(
      outline.getBoundingClientRect().height,
    );
    expect(soft.getBoundingClientRect().width).toBe(
      outline.getBoundingClientRect().width,
    );
  });

  it("fills a solid tag with its tone's strong color, its words and dot in the surface's color at AA, in light and dark", () => {
    const tones = [
      ["neutral", "--bt-text-secondary"],
      ["info", "--bt-accent-text"],
      ["success", "--bt-success"],
      ["warning", "--bt-warning"],
      ["danger", "--bt-danger"],
    ] as const;
    for (const theme of ["light", "dark"] as const) {
      render(
        <div data-bt-theme={theme} data-testid="scope">
          {tones.map(([tone]) => (
            <TagChip key={tone} tone={tone} variant="solid">
              {tone}
            </TagChip>
          ))}
        </div>,
      );
      const scope = screen.getByTestId("scope");
      for (const [tone, strong] of tones) {
        const tag = tagOf(tone);
        const style = getComputedStyle(tag);
        const label = `${tone} in ${theme}`;
        expect(style.backgroundColor, label).toBe(colorIn(scope, strong));
        expect(style.color, label).toBe(colorIn(scope, "--bt-bg-surface"));
        expect(getComputedStyle(dotOf(tag)).backgroundColor, label).toBe(
          style.color,
        );
        expect(
          contrastRatio(hexOf(style.color), hexOf(style.backgroundColor)),
          label,
        ).toBeGreaterThanOrEqual(4.5);
      }
      cleanup();
    }
  });
});
