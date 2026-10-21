import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Page } from "../page/Page.tsx";
import { SplitHero } from "./SplitHero.tsx";

afterEach(cleanup);

function hero(width: number, visualSide?: "start" | "end"): void {
  render(
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Page>
        <SplitHero
          title="Cards that look finished."
          titleMore="Write a title and export."
          visualSide={visualSide}
          visual={<div>Visual</div>}
        />
      </Page>
    </div>,
  );
}

function box(part: string): DOMRect {
  const element = document.querySelector(`[data-bt-part="${part}"]`);
  if (!element) throw new Error(`no ${part}`);
  return element.getBoundingClientRect();
}

describe("SplitHero", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <SplitHero
        ref={ref}
        title="Launch"
        visual={null}
        className="custom"
        data-testid="hero"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SplitHero");
    expect(ref.current?.dataset["testid"]).toBe("hero");
    expect(ref.current?.className).toBe("bt-split-hero custom");
  });

  it("is a region named by its two-tone headline, an h1", () => {
    hero(1200);
    const region = screen.getByRole("region", {
      name: "Cards that look finished. Write a title and export.",
    });
    expect(region.querySelector("h1")).not.toBeNull();
  });

  it("renders its headline as the heading titleAs names", () => {
    render(<SplitHero title="Launch" titleAs="h2" visual={null} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Launch",
    );
  });

  it("puts the words on 7 columns and the visual on 5, side by side past 1024px", () => {
    hero(1200);
    const words = box("words");
    const visual = box("visual");
    expect(
      Math.abs(words.top + words.height / 2 - (visual.top + visual.height / 2)),
    ).toBeLessThan(1);
    expect(visual.left).toBeGreaterThan(words.right);
    expect(words.width / visual.width).toBeCloseTo(
      (7 * 64 + 6 * 24) / (5 * 64 + 4 * 24),
      0,
    );
  });

  it("swaps the sides with visualSide", () => {
    hero(1200, "start");
    expect(box("visual").right).toBeLessThan(box("words").left);
  });

  it("spaces the visual's pieces 12px apart when they come as a fragment", () => {
    render(
      <SplitHero
        title="Launch"
        visual={
          <>
            <div data-testid="first">First</div>
            <div data-testid="second">Second</div>
          </>
        }
      />,
    );
    const first = screen.getByTestId("first").getBoundingClientRect();
    const second = screen.getByTestId("second").getBoundingClientRect();
    expect(second.top - first.bottom).toBe(12);
  });

  it("stacks the words over the visual below 1024px", () => {
    hero(700);
    expect(box("visual").top).toBeGreaterThan(box("words").bottom);
  });
});
