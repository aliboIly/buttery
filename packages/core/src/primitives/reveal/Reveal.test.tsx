import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, StrictMode } from "react";
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

/** Keeps the main thread busy, as the rest of a page's first render does. */
function busyFor(ms: number): number {
  const until = performance.now() + ms;
  let spins = 0;
  while (performance.now() < until) spins += 1;
  return spins;
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

  it("starts the fade on the first frame drawn, not during a long first render", async () => {
    render(<Reveal data-testid="hero">Your canvas is empty</Reveal>);
    busyFor(150);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(opacity("hero")).toBeLessThan(0.1);
    await waitFor(() => {
      expect(opacity("hero")).toBe(1);
    });
  });

  it("fades content that's in view under Strict Mode too", async () => {
    render(
      <StrictMode>
        <Reveal data-testid="hero">Your canvas is empty</Reveal>
      </StrictMode>,
    );
    expect(opacity("hero")).toBeLessThan(1);
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

  it("rises in content taller than the screen once 15% of the screen shows it", async () => {
    render(
      <>
        <div style={{ blockSize: "3000px" }} />
        <Reveal data-testid="tall" style={{ blockSize: "20000px" }}>
          A long article
        </Reveal>
      </>,
    );
    expect(opacity("tall")).toBe(0);
    const top =
      screen.getByTestId("tall").getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight / 2);
    await waitFor(() => {
      expect(opacity("tall")).toBe(1);
    });
  });

  it("rises in content a hundred and fifty screens tall", async () => {
    render(
      <>
        <div style={{ blockSize: "3000px" }} />
        <Reveal
          data-testid="tall"
          style={{ blockSize: `${String(window.innerHeight * 150)}px` }}
        >
          A very long article
        </Reveal>
      </>,
    );
    expect(opacity("tall")).toBe(0);
    const top =
      screen.getByTestId("tall").getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.95);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(opacity("tall")).toBe(0);
    window.scrollTo(0, top - window.innerHeight * 0.25);
    await waitFor(() => {
      expect(opacity("tall")).toBe(1);
    });
  });

  it("waits and rises in under Strict Mode, and keeps its own inline styles", async () => {
    render(
      <StrictMode>
        <div style={{ blockSize: "3000px" }} />
        <Reveal
          data-testid="section"
          style={{ blockSize: "200px", transform: "rotate(1deg)" }}
        >
          Templates
        </Reveal>
      </StrictMode>,
    );
    expect(opacity("section")).toBe(0);
    screen.getByTestId("section").scrollIntoView();
    await waitFor(() => {
      expect(opacity("section")).toBe(1);
      expect(root.hasAttribute("data-bt-settled")).toBe(true);
    });
    await waitFor(() => {
      expect(screen.getByTestId("section").style.transform).toBe(
        "rotate(1deg)",
      );
    });
  });

  it("never plays again once its content has shown, when motion settings change", async () => {
    const { rerender } = render(
      <MotionPreferenceContext value="reduced">
        <Reveal data-testid="section">Templates</Reveal>
      </MotionPreferenceContext>,
    );
    expect(opacity("section")).toBe(1);
    rerender(
      <MotionPreferenceContext value="full">
        <Reveal data-testid="section">Templates</Reveal>
      </MotionPreferenceContext>,
    );
    const seen: number[] = [];
    await new Promise<void>((resolve) => {
      let frames = 0;
      const tick = (): void => {
        seen.push(opacity("section"));
        frames += 1;
        if (frames < 10) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    expect(Math.min(...seen)).toBe(1);
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
