import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { Presence } from "../presence/Presence.tsx";
import { Loop } from "./Loop.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function step(): string | undefined {
  return screen.getByTestId("loop").dataset["step"];
}

describe("Loop", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Loop steps={3} ref={ref} aria-label="Chart" className="custom">
        {(current) => current}
      </Loop>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Loop");
    expect(ref.current?.getAttribute("aria-label")).toBe("Chart");
    expect(ref.current?.className).toBe("bt-loop custom");
  });

  it("cycles through its steps while it's on screen", async () => {
    render(
      <Loop steps={3} interval={60} data-testid="loop">
        {(current) => `Step ${String(current)}`}
      </Loop>,
    );
    expect(screen.getByText("Step 0")).toBeTruthy();
    await waitFor(() => {
      expect(step()).toBe("1");
    });
    await waitFor(() => {
      expect(step()).toBe("2");
    });
    await waitFor(() => {
      expect(step()).toBe("0");
    });
  });

  it("stays put while it's off screen", async () => {
    render(
      <>
        <div style={{ blockSize: "3000px" }} />
        <Loop steps={3} interval={60} data-testid="loop">
          {(current) => current}
        </Loop>
      </>,
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(step()).toBe("0");
  });

  it("stays on the first step when motion is reduced", async () => {
    render(
      <MotionPreferenceContext value="reduced">
        <Loop steps={3} interval={60} data-testid="loop">
          {(current) => current}
        </Loop>
      </MotionPreferenceContext>,
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(step()).toBe("0");
  });

  it("doesn't hold buttery's settled flag while its content animates", async () => {
    render(
      <Loop steps={2} interval={60} data-testid="loop">
        {(current) => (
          <Presence show={current === 1} preset="rise">
            New row
          </Presence>
        )}
      </Loop>,
    );
    const states = new Set<boolean>();
    const sample = window.setInterval(() => {
      states.add(root.hasAttribute("data-bt-settled"));
    }, 5);
    await waitFor(() => {
      expect(screen.getByText("New row")).toBeTruthy();
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    window.clearInterval(sample);
    expect([...states]).toEqual([true]);
  });
});
