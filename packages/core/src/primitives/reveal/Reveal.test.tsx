import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { Reveal } from "./Reveal.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
  window.scrollTo(0, 0);
});

afterEach(() => {
  cleanup();
  window.scrollTo(0, 0);
});

function opacity(id: string): number {
  return Number(getComputedStyle(screen.getByTestId(id)).opacity);
}

function offsetY(id: string): number {
  const { transform } = getComputedStyle(screen.getByTestId(id));
  return transform === "none" ? 0 : new DOMMatrix(transform).m42;
}

describe("Reveal", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Reveal ref={ref} aria-label="Features" className="custom">
        Features
      </Reveal>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Reveal");
    expect(ref.current?.getAttribute("aria-label")).toBe("Features");
    expect(ref.current?.className).toBe("bt-reveal custom");
  });

  it("only fades content that's in view when it mounts", async () => {
    render(<Reveal data-testid="hero">Your canvas is empty</Reveal>);
    expect(opacity("hero")).toBeLessThan(1);
    expect(offsetY("hero")).toBe(0);
    await waitFor(() => {
      expect(opacity("hero")).toBe(1);
    });
  });

  it("waits below the fold, then rises in once it scrolls into view", async () => {
    render(
      <>
        <div style={{ blockSize: "3000px" }} />
        <Reveal data-testid="section" style={{ blockSize: "200px" }}>
          Templates
        </Reveal>
      </>,
    );
    expect(opacity("section")).toBe(0);
    expect(offsetY("section")).toBe(0);
    screen.getByTestId("section").scrollIntoView();
    await waitFor(() => {
      expect(root.hasAttribute("data-bt-settled")).toBe(false);
      expect(offsetY("section")).toBeGreaterThan(0);
    });
    await waitFor(() => {
      expect(opacity("section")).toBe(1);
      expect(offsetY("section")).toBe(0);
      expect(root.hasAttribute("data-bt-settled")).toBe(true);
    });
    await waitFor(() => {
      const { style } = screen.getByTestId("section");
      expect(style.opacity).toBe("");
      expect(style.transform).toBe("");
    });
  });

  it("shows its content fully when motion becomes reduced mid-fade", async () => {
    const { rerender } = render(
      <MotionPreferenceContext value="full">
        <Reveal data-testid="section">Templates</Reveal>
      </MotionPreferenceContext>,
    );
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(opacity("section")).toBeLessThan(1);
    rerender(
      <MotionPreferenceContext value="reduced">
        <Reveal data-testid="section">Templates</Reveal>
      </MotionPreferenceContext>,
    );
    await new Promise((resolve) =>
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      }),
    );
    expect(opacity("section")).toBe(1);
    expect(offsetY("section")).toBe(0);
    expect(screen.getByTestId("section").style.cssText).toBe("");
  });

  it("just shows its content when motion is reduced", () => {
    render(
      <MotionPreferenceContext value="reduced">
        <div style={{ blockSize: "3000px" }} />
        <Reveal data-testid="section">Templates</Reveal>
      </MotionPreferenceContext>,
    );
    expect(opacity("section")).toBe(1);
    expect(offsetY("section")).toBe(0);
  });
});
