import "@butteryui/core/styles.css";
import "../../styles.css";
import { contrastRatio, formatHex } from "@butteryui/core";
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

function hexOf(color: string): string {
  const [r = 0, g = 0, b = 0] = (color.match(/\d+/g) ?? []).map(Number);
  return formatHex({ r: r / 255, g: g / 255, b: b / 255 });
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

  it("sets its band on the palette tint when tinted, every part of its words keeping AA contrast on it", () => {
    render(
      <SplitHero
        variant="tinted"
        eyebrow="Halfmoon Roastery"
        title="Coffee roasted on Thursday."
        titleMore="At your door by Saturday."
        body="Small batches from three farms we visit every year."
        visual={null}
        data-testid="hero"
      />,
    );
    const hero = screen.getByTestId("hero");
    const band = getComputedStyle(hero).backgroundColor;
    expect(band).toBe("rgb(251, 244, 218)");
    for (const part of ["eyebrow", "title", "more", "body"]) {
      const words = hero.querySelector(`[data-bt-part="${part}"]`);
      if (!words) throw new Error(`no ${part}`);
      expect(
        contrastRatio(hexOf(getComputedStyle(words).color), hexOf(band)),
        part,
      ).toBeGreaterThanOrEqual(4.5);
    }
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
    const words = box("split-hero-words");
    const visual = box("split-hero-visual");
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
    expect(box("split-hero-visual").right).toBeLessThan(
      box("split-hero-words").left,
    );
  });

  it("sets its body's words 24px under the headline and its actions 24px under the body", () => {
    render(
      <SplitHero
        title="Slides that look finished."
        body="Pick a theme and every slide takes it."
        actions={<button type="button">Open the editor</button>}
        visual={<div>Visual</div>}
      />,
    );
    const contentTop = (part: string): number => {
      const element = document.querySelector(`[data-bt-part="${part}"]`);
      if (!element) throw new Error(`no ${part}`);
      return (
        element.getBoundingClientRect().top +
        Number.parseFloat(getComputedStyle(element).paddingTop)
      );
    };
    expect(contentTop("body") - box("title").bottom).toBe(24);
    expect(contentTop("actions") - box("body").bottom).toBe(24);
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
    expect(box("split-hero-visual").top).toBeGreaterThan(
      box("split-hero-words").bottom,
    );
  });
});
