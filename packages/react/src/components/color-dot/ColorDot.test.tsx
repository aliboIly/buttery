import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { ColorDot } from "./ColorDot.tsx";

afterEach(cleanup);

function input(): HTMLInputElement {
  const element = screen.getByLabelText("First hue");
  if (!(element instanceof HTMLInputElement)) throw new Error("No input.");
  return element;
}

describe("ColorDot", () => {
  it("stamps its class and data-bt, and forwards its ref to the color input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<ColorDot ref={ref} label="First hue" className="custom" />);
    const root = ref.current?.closest('[data-bt="ColorDot"]');
    expect(root?.className).toBe("bt-color-dot custom");
    expect(ref.current?.type).toBe("color");
  });

  it("is a color input named by its label, showing its color in a 24px dot with a 28px target", async () => {
    render(<ColorDot label="First hue" defaultValue="#a5b4fc" />);
    await expect
      .element(page.getByLabelText("First hue", { exact: true }))
      .toBeInTheDocument();
    expect(input().value).toBe("#a5b4fc");
    const dot = document.querySelector<HTMLElement>('[data-bt-part="dot"]');
    expect(dot && getComputedStyle(dot).backgroundColor).toBe(
      "rgb(165, 180, 252)",
    );
    expect(dot?.getBoundingClientRect().width).toBe(24);
    const root = input().closest('[data-bt="ColorDot"]');
    expect(root?.getBoundingClientRect().width).toBe(24);
    const hit = root?.querySelector("[data-bt-hit]");
    expect(hit?.getBoundingClientRect().width).toBe(28);
    expect(hit?.getBoundingClientRect().height).toBe(28);
  });

  it("takes presses past the dot's edge, inside its 28px target", () => {
    render(
      <div style={{ padding: "var(--bt-space-4)" }}>
        <ColorDot label="First hue" />
      </div>,
    );
    const root = input().closest<HTMLElement>('[data-bt="ColorDot"]');
    if (!root) throw new Error("No root.");
    const box = root.getBoundingClientRect();
    const pressed = document.elementFromPoint(
      box.left - 1,
      box.top + box.height / 2,
    );
    expect(pressed?.closest("label")).toBe(root);
  });

  it("commits once the picker closes on a color, not for each color passed", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <ColorDot
        label="First hue"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    );
    fireEvent.input(input(), { target: { value: "#f0abfc" } });
    fireEvent.input(input(), { target: { value: "#c084fc" } });
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueCommit).not.toHaveBeenCalled();
    input().dispatchEvent(new Event("change", { bubbles: true }));
    expect(onValueCommit).toHaveBeenCalledWith("#c084fc");
  });

  it("reports each color picked", () => {
    const onValueChange = vi.fn();
    render(<ColorDot label="First hue" onValueChange={onValueChange} />);
    fireEvent.input(input(), { target: { value: "#f0abfc" } });
    expect(onValueChange).toHaveBeenCalledWith("#f0abfc");
  });

  it("rings the dot while the input has keyboard focus", () => {
    render(
      <>
        <button type="button">Before</button>
        <ColorDot label="First hue" />
      </>,
    );
    screen.getByRole("button", { name: "Before" }).focus();
    input().focus({ focusVisible: true });
    const dot = document.querySelector<HTMLElement>('[data-bt-part="dot"]');
    expect(dot && getComputedStyle(dot).outlineStyle).toBe("solid");
  });
});
