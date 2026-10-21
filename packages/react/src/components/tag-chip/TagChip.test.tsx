import "@buttery/core/styles.css";
import "../../styles.css";
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
});
