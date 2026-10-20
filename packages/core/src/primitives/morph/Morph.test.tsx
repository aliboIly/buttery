import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { Morph } from "./Morph.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Panel({
  tall,
  width = 200,
}: {
  readonly tall: boolean;
  readonly width?: number;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Morph contentKey={tall ? "tall" : "short"} data-testid="morph">
        <div
          data-testid={tall ? "tall" : "short"}
          style={{ blockSize: tall ? "120px" : "40px" }}
        />
      </Morph>
    </div>
  );
}

function height(): number {
  return screen.getByTestId("morph").getBoundingClientRect().height;
}

async function nextFrames(count: number): Promise<void> {
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

async function measured(value: number): Promise<void> {
  await waitFor(() => {
    expect(height()).toBe(value);
  });
}

describe("Morph", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Morph ref={ref} aria-label="Fill" className="custom">
        Gradient
      </Morph>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Morph");
    expect(ref.current?.getAttribute("aria-label")).toBe("Fill");
    expect(ref.current?.className).toBe("bt-morph custom");
  });

  it("follows swapped content's height with a spring while the content crossfades", async () => {
    const { rerender } = render(<Panel tall={false} />);
    await measured(40);
    rerender(<Panel tall />);
    await nextFrames(2);
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      true,
    );
    expect(height()).toBeLessThan(120);
    expect(screen.getByTestId("short")).toBeTruthy();
    expect(root.hasAttribute("data-bt-settled")).toBe(false);
    await waitFor(() => {
      expect(height()).toBe(120);
      expect(screen.queryByTestId("short")).toBeNull();
      expect(root.hasAttribute("data-bt-settled")).toBe(true);
    });
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      false,
    );
  });

  it("changes height at once when the container is resized", async () => {
    const { rerender } = render(
      <div style={{ inlineSize: "200px" }}>
        <Morph data-testid="morph">
          <p style={{ margin: 0, lineHeight: "20px" }}>
            Every card starts on a blank canvas and grows as you add to it.
          </p>
        </Morph>
      </div>,
    );
    await waitFor(() => {
      expect(height()).toBeGreaterThan(20);
    });
    const before = height();
    rerender(
      <div style={{ inlineSize: "600px" }}>
        <Morph data-testid="morph">
          <p style={{ margin: 0, lineHeight: "20px" }}>
            Every card starts on a blank canvas and grows as you add to it.
          </p>
        </Morph>
      </div>,
    );
    await waitFor(() => {
      expect(height()).toBeLessThan(before);
    });
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      false,
    );
  });

  it("sits at its natural height between changes, so rewrapped text never spills out", async () => {
    const paragraph = (
      <p style={{ margin: 0, lineHeight: "20px" }}>
        Every card starts on a blank canvas and grows as you add to it.
      </p>
    );
    const { rerender } = render(
      <div style={{ inlineSize: "200px" }}>
        <Morph data-testid="morph">{paragraph}</Morph>
      </div>,
    );
    await waitFor(() => {
      expect(height()).toBeGreaterThan(20);
    });
    rerender(
      <div style={{ inlineSize: "120px" }}>
        <Morph data-testid="morph">{paragraph}</Morph>
      </div>,
    );
    const content = screen
      .getByTestId("morph")
      .querySelector('[data-bt-part="content"]');
    expect(height()).toBe(content?.getBoundingClientRect().height);
    expect(screen.getByTestId("morph").style.height).toBe("auto");
  });

  it("keeps swapped-out content clipped until it has faded, with reduced motion too", async () => {
    function Reduced({ tall }: { readonly tall: boolean }): ReactElement {
      return (
        <MotionPreferenceContext value="reduced">
          <Panel tall={tall} />
        </MotionPreferenceContext>
      );
    }
    const { rerender } = render(<Reduced tall />);
    await measured(120);
    rerender(<Reduced tall={false} />);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId("tall")).toBeTruthy();
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      true,
    );
    await waitFor(() => {
      expect(screen.queryByTestId("tall")).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
        false,
      );
    });
  });

  it("jumps to the new height when motion is reduced", async () => {
    function Reduced({ tall }: { readonly tall: boolean }): ReactElement {
      return (
        <MotionPreferenceContext value="reduced">
          <Panel tall={tall} />
        </MotionPreferenceContext>
      );
    }
    const { rerender } = render(<Reduced tall={false} />);
    await measured(40);
    const start = performance.now();
    rerender(<Reduced tall />);
    await waitFor(() => {
      expect(height()).toBe(120);
    });
    expect(performance.now() - start).toBeLessThan(150);
  });
});
