import "@butteryui/core/styles.css";
import "../../styles.css";
import { contrastRatio, formatHex } from "@butteryui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Page } from "../page/Page.tsx";
import { CenteredHero } from "./CenteredHero.tsx";

afterEach(cleanup);

function hexOf(color: string): string {
  const [r = 0, g = 0, b = 0] = (color.match(/\d+/g) ?? []).map(Number);
  return formatHex({ r: r / 255, g: g / 255, b: b / 255 });
}

function box(part: string): DOMRect {
  const element = document.querySelector(`[data-bt-part="${part}"]`);
  if (!element) throw new Error(`no ${part}`);
  return element.getBoundingClientRect();
}

describe("CenteredHero", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <CenteredHero
        ref={ref}
        title="Launch"
        className="custom"
        data-testid="hero"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("CenteredHero");
    expect(ref.current?.dataset["testid"]).toBe("hero");
    expect(ref.current?.className).toBe("bt-centered-hero custom");
  });

  it("is a region named by its headline, centered over a visual as wide as the column", () => {
    render(
      <div style={{ inlineSize: "1200px" }}>
        <Page>
          <CenteredHero
            title="One card."
            titleMore="Every size."
            visual={<div>Visual</div>}
          />
        </Page>
      </div>,
    );
    expect(
      screen.getByRole("region", { name: "One card. Every size." }),
    ).toBeTruthy();
    const words = box("centered-hero-words");
    const visual = box("centered-hero-visual");
    const column = document.querySelector('[data-bt="Container"]');
    const columnBox = column?.getBoundingClientRect();
    if (!columnBox) throw new Error("no column");
    expect(
      Math.abs(
        words.left + words.width / 2 - (columnBox.left + columnBox.width / 2),
      ),
    ).toBeLessThan(1);
    expect(visual.top - words.bottom).toBe(64);
  });

  it("sets its band on the palette tint when tinted, every part of its words keeping AA contrast on it", () => {
    render(
      <CenteredHero
        variant="tinted"
        eyebrow="New this week"
        title="One deck."
        titleMore="Every screen it plays on."
        body="Wide for a talk, square for a post, tall for a phone."
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

  it("opens with an h1 and takes an h2 for a closing band", () => {
    render(
      <>
        <CenteredHero title="One card." />
        <CenteredHero title="Make yours." titleAs="h2" />
      </>,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "One card.",
    );
    expect(
      screen.getByRole("region", { name: "Make yours." }).querySelector("h2"),
    ).not.toBeNull();
  });
});
