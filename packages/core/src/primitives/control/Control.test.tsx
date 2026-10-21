import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Pressable } from "../pressable/Pressable.tsx";
import { Surface } from "../surface/Surface.tsx";
import { Control } from "./Control.tsx";
import type { ControlSize } from "./Control.tsx";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-bt-density");
});

const HEIGHTS: readonly (readonly [ControlSize, number, number])[] = [
  ["badge", 20, 18],
  ["sm", 28, 28],
  ["control", 34, 30],
  ["button", 36, 32],
  ["cta", 48, 40],
];

describe("Control", () => {
  it("stamps its class, data-bt and data-bt-control, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Control ref={ref} aria-label="Example" className="custom" />);
    expect(ref.current?.dataset["bt"]).toBe("Control");
    expect(ref.current?.hasAttribute("data-bt-control")).toBe(true);
    expect(ref.current?.getAttribute("aria-label")).toBe("Example");
    expect(ref.current?.className).toBe("bt-control custom");
  });

  it("takes its height from the height tokens, compact ones included", () => {
    for (const [size, comfortable] of HEIGHTS) {
      render(<Control size={size}>{size}</Control>);
      expect(screen.getByText(size).getBoundingClientRect().height).toBe(
        comfortable,
      );
      cleanup();
    }
    document.documentElement.dataset["btDensity"] = "compact";
    for (const [size, , compact] of HEIGHTS) {
      render(<Control size={size}>{size}</Control>);
      expect(screen.getByText(size).getBoundingClientRect().height).toBe(
        compact,
      );
      cleanup();
    }
  });

  it("keeps its height and padding under a surface's look", () => {
    render(
      <Surface level="section" radius="full" asChild>
        <Control size="sm">Roast</Control>
      </Surface>,
    );
    const control = screen.getByText("Roast");
    const style = getComputedStyle(control);
    expect(control.getBoundingClientRect().height).toBe(28);
    expect(style.paddingInlineStart).toBe("12px");
    expect(style.paddingBlockStart).toBe("0px");
    expect(style.paddingBlockEnd).toBe("0px");
    expect(control.classList.contains("bt-surface")).toBe(true);
  });

  it("makes its child the control with asChild, such as a Pressable button", () => {
    render(
      <Control size="button" asChild>
        <Pressable>Add a roast</Pressable>
      </Control>,
    );
    const button = screen.getByRole("button", { name: "Add a roast" });
    expect(button.classList.contains("bt-control")).toBe(true);
    expect(button.classList.contains("bt-pressable")).toBe(true);
    expect(button.dataset["size"]).toBe("button");
    expect(button.getBoundingClientRect().height).toBe(36);
  });
});
