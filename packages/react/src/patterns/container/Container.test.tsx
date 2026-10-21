import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Page } from "../page/Page.tsx";
import { Container } from "./Container.tsx";

afterEach(cleanup);

function padding(element: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(element).paddingInlineStart);
}

describe("Container", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Container ref={ref} className="custom" data-testid="column" />);
    expect(ref.current?.dataset["bt"]).toBe("Container");
    expect(ref.current?.dataset["testid"]).toBe("column");
    expect(ref.current?.className).toBe("bt-container custom");
  });

  it("pads its sides 16, 24 or 32px with the page, and centers 1200px past that", () => {
    for (const [width, side] of [
      [400, 16],
      [800, 24],
      [1100, 32],
    ] as const) {
      render(
        <div style={{ inlineSize: `${String(width)}px` }}>
          <Page>
            <Container>Content</Container>
          </Page>
        </div>,
      );
      expect(padding(screen.getByText("Content"))).toBe(side);
      cleanup();
    }
    render(
      <div style={{ inlineSize: "1400px" }}>
        <Page>
          <Container>Content</Container>
        </Page>
      </div>,
    );
    const column = screen.getByText("Content");
    expect(padding(column)).toBe(100);
    expect(column.getBoundingClientRect().width - 2 * padding(column)).toBe(
      1200,
    );
  });
});
