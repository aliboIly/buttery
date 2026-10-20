import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Surface } from "../surface/Surface.tsx";
import { Stack } from "./Stack.tsx";

afterEach(cleanup);

describe("Stack", () => {
  it("stacks children in a column with a gap from the scale", () => {
    render(
      <Stack gap={4} data-testid="stack">
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
    const stack = screen.getByTestId("stack");
    expect(stack.dataset["bt"]).toBe("Stack");
    const style = getComputedStyle(stack);
    expect(style.flexDirection).toBe("column");
    expect(style.rowGap).toBe("16px");
  });

  it("accepts half steps as strings or numbers", () => {
    render(
      <>
        <Stack gap="0.5" data-testid="string" />
        <Stack gap={1.5} data-testid="number" />
      </>,
    );
    expect(getComputedStyle(screen.getByTestId("string")).rowGap).toBe("2px");
    expect(getComputedStyle(screen.getByTestId("number")).rowGap).toBe("6px");
  });

  it("pads from the scale, with padX and padY winning over pad", () => {
    render(<Stack pad={4} padX={2} data-testid="stack" />);
    const style = getComputedStyle(screen.getByTestId("stack"));
    expect(style.paddingTop).toBe("16px");
    expect(style.paddingLeft).toBe("8px");
  });

  it("lets children shrink so long text can't widen the column", () => {
    render(
      <div style={{ inlineSize: "100px" }}>
        <Stack align="start">
          <span data-testid="child">{"x".repeat(200)}</span>
        </Stack>
      </div>,
    );
    expect(getComputedStyle(screen.getByTestId("child")).minWidth).toBe("0px");
  });

  it("forwards refs, spreads props and renders its child with asChild", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <>
        <Stack ref={ref} aria-label="Settings" className="custom" />
        <Stack asChild gap={2}>
          <ul data-testid="list">
            <li>One</li>
          </ul>
        </Stack>
      </>,
    );
    expect(ref.current?.getAttribute("aria-label")).toBe("Settings");
    expect(ref.current?.className).toBe("bt-stack custom");
    const list = screen.getByTestId("list");
    expect(list.tagName).toBe("UL");
    expect(list.dataset["bt"]).toBe("Stack");
    expect(getComputedStyle(list).rowGap).toBe("8px");
  });

  it("keeps its layout when composed onto another primitive", () => {
    render(
      <Stack asChild gap={3}>
        <Surface level="card" pad={4} data-testid="card">
          <span>Title</span>
          <span>Body</span>
        </Surface>
      </Stack>,
    );
    const card = screen.getByTestId("card");
    const style = getComputedStyle(card);
    expect(card.dataset["bt"]).toBe("Surface");
    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
    expect(style.rowGap).toBe("12px");
    expect(style.paddingTop).toBe("16px");
    expect(style.borderTopLeftRadius).toBe("12px");
  });
});
