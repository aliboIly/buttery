import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Sparkline } from "./Sparkline.tsx";

afterEach(cleanup);

function dot(): DOMRect | undefined {
  return document
    .querySelector('[data-bt-part="dot"]')
    ?.getBoundingClientRect();
}

describe("Sparkline", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Sparkline
        ref={ref}
        label="Orders"
        values={[1, 2, 3]}
        className="custom"
        id="trend"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Sparkline");
    expect(ref.current?.className).toBe("bt-sparkline custom");
    expect(ref.current?.id).toBe("trend");
  });

  it("is an image named by its label, 24px tall, filling its container", () => {
    render(
      <div style={{ inlineSize: "160px" }}>
        <Sparkline label="Orders, last 14 days" values={[42, 38, 51, 47, 63]} />
      </div>,
    );
    const image = screen
      .getByRole("img", { name: "Orders, last 14 days" })
      .getBoundingClientRect();
    expect(image.height).toBe(24);
    expect(image.width).toBe(160);
  });

  it("marks its last value at the end, inside its 4px padding", () => {
    render(
      <div style={{ inlineSize: "160px" }}>
        <Sparkline label="Orders" values={[10, 30, 20]} />
      </div>,
    );
    const box = screen.getByRole("img").getBoundingClientRect();
    const last = dot();
    expect(last?.right).toBeLessThanOrEqual(box.right);
    expect((last?.left ?? 0) + (last?.width ?? 0) / 2).toBeCloseTo(
      box.right - 4,
      0,
    );
    expect(last?.top).toBeGreaterThanOrEqual(box.top);
    expect((last?.top ?? 0) + (last?.height ?? 0) / 2).toBeCloseTo(
      box.top + box.height / 2,
      0,
    );
  });

  it("draws a flat run through the middle and leaves a gap for missing values", () => {
    render(<Sparkline label="Orders" values={[5, 5, null, 5]} />);
    const path = document.querySelector("path")?.getAttribute("d");
    expect(path?.match(/M/g)).toHaveLength(2);
    expect(path).toContain(" 50");
  });

  it("leaves a gap for a value that isn't a finite number", () => {
    render(
      <Sparkline label="Orders" values={[4, Number.NaN, 9, 6, 2, 8, 5]} />,
    );
    const path = document.querySelector("path")?.getAttribute("d");
    expect(path).not.toContain("NaN");
    expect(path?.match(/M/g)).toHaveLength(2);
    expect(Number.isFinite(dot()?.top)).toBe(true);
  });

  it("draws nothing to mark with no values", () => {
    render(<Sparkline label="Orders" values={[null, null]} />);
    expect(document.querySelector("path")?.getAttribute("d")).toBe("");
    expect(dot()).toBeUndefined();
  });
});
