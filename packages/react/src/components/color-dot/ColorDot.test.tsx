import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { ColorDot } from "./ColorDot.tsx";

afterEach(cleanup);

function input(): HTMLInputElement {
  const element = screen.getByLabelText("Start color");
  if (!(element instanceof HTMLInputElement)) throw new Error("No input.");
  return element;
}

describe("ColorDot", () => {
  it("stamps its class and data-bt, and forwards its ref to the color input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<ColorDot ref={ref} label="Start color" className="custom" />);
    const root = ref.current?.closest('[data-bt="ColorDot"]');
    expect(root?.className).toBe("bt-color-dot custom");
    expect(ref.current?.type).toBe("color");
  });

  it("is a color input named by its label, showing its color in a 22px dot with a 28px target", async () => {
    render(<ColorDot label="Start color" defaultValue="#a5b4fc" />);
    await expect
      .element(page.getByLabelText("Start color", { exact: true }))
      .toBeInTheDocument();
    expect(input().value).toBe("#a5b4fc");
    const dot = document.querySelector<HTMLElement>('[data-bt-part="dot"]');
    expect(dot && getComputedStyle(dot).backgroundColor).toBe(
      "rgb(165, 180, 252)",
    );
    expect(dot?.getBoundingClientRect().width).toBe(22);
    const root = input().closest('[data-bt="ColorDot"]');
    expect(root?.getBoundingClientRect().width).toBe(28);
  });

  it("reports each color picked", () => {
    const onValueChange = vi.fn();
    render(<ColorDot label="Start color" onValueChange={onValueChange} />);
    fireEvent.input(input(), { target: { value: "#f0abfc" } });
    expect(onValueChange).toHaveBeenCalledWith("#f0abfc");
  });

  it("rings the dot while the input has keyboard focus", () => {
    render(
      <>
        <button type="button">Before</button>
        <ColorDot label="Start color" />
      </>,
    );
    screen.getByRole("button", { name: "Before" }).focus();
    input().focus({ focusVisible: true });
    const dot = document.querySelector<HTMLElement>('[data-bt-part="dot"]');
    expect(dot && getComputedStyle(dot).outlineStyle).toBe("solid");
  });
});
