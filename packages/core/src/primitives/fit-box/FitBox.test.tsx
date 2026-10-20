import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FitBox } from "./FitBox.tsx";

afterEach(cleanup);

function content(): DOMRect {
  const box = screen.getByTestId("fit").querySelector("[data-bt-part=content]");
  if (!box) throw new Error("FitBox rendered no content box");
  return box.getBoundingClientRect();
}

describe("FitBox", () => {
  it("fills the width when the space is taller than the ratio", () => {
    render(
      <div style={{ display: "grid", inlineSize: "400px", blockSize: "300px" }}>
        <FitBox ratio={16 / 9} data-testid="fit" />
      </div>,
    );
    expect(content().width).toBe(400);
    expect(content().height).toBe(225);
  });

  it("fills the height when the space is wider, centered, inside its inset", () => {
    render(
      <div style={{ display: "grid", inlineSize: "400px", blockSize: "300px" }}>
        <FitBox ratio={1 / 2} inset={8} data-testid="fit" />
      </div>,
    );
    const box = content();
    expect(box.height).toBe(236);
    expect(box.width).toBe(118);
    const fit = screen.getByTestId("fit").getBoundingClientRect();
    expect(box.left - fit.left).toBe(141);
    expect(box.top - fit.top).toBe(32);
  });

  it("stretches its child over the whole content box", () => {
    render(
      <div style={{ display: "grid", inlineSize: "400px", blockSize: "300px" }}>
        <FitBox ratio={4 / 3} data-testid="fit">
          <div data-testid="child" />
        </FitBox>
      </div>,
    );
    const child = screen.getByTestId("child").getBoundingClientRect();
    expect(child.width).toBe(400);
    expect(child.height).toBe(300);
  });

  it("rejects a ratio that isn't a positive number", () => {
    expect(() => render(<FitBox ratio={0} />)).toThrow(/positive number/);
  });
});
