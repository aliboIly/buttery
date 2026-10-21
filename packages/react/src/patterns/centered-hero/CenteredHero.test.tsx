import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Page } from "../page/Page.tsx";
import { CenteredHero } from "./CenteredHero.tsx";

afterEach(cleanup);

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
    const words = box("words");
    const visual = box("visual");
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
