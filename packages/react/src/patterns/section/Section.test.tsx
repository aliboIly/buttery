import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Page } from "../page/Page.tsx";
import { Section } from "./Section.tsx";

afterEach(cleanup);

function paddingTop(element: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(element).paddingBlockStart);
}

describe("Section", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(<Section ref={ref} className="custom" data-testid="band" />);
    expect(ref.current?.dataset["bt"]).toBe("Section");
    expect(ref.current?.dataset["testid"]).toBe("band");
    expect(ref.current?.className).toBe("bt-section custom");
  });

  it("is a region named by its heading, an h2", () => {
    render(<Section title="Made for launch days">Content</Section>);
    const region = screen.getByRole("region", { name: "Made for launch days" });
    expect(region.querySelector("h2")?.textContent).toBe(
      "Made for launch days",
    );
  });

  it("takes 64, 96 or 128px of room by size, a step less on a phone", () => {
    for (const [width, size, room] of [
      [1100, "sm", 64],
      [1100, "md", 96],
      [1100, "lg", 128],
      [400, "md", 64],
      [400, "lg", 96],
    ] as const) {
      render(
        <div style={{ inlineSize: `${String(width)}px` }}>
          <Page>
            <Section size={size} data-testid="band" />
          </Page>
        </div>,
      );
      expect(paddingTop(screen.getByTestId("band"))).toBe(room);
      cleanup();
    }
  });

  it("puts its content in a Container unless told not to", () => {
    render(<Section data-testid="band">Content</Section>);
    expect(
      screen.getByText("Content").closest('[data-bt="Container"]'),
    ).not.toBeNull();
    cleanup();
    render(<Section contained={false}>Content</Section>);
    expect(
      screen.getByText("Content").closest('[data-bt="Container"]'),
    ).toBeNull();
  });
});
