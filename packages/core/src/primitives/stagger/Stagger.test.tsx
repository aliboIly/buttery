import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { Stagger } from "./Stagger.tsx";

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

const ITEMS = ["one", "two", "three", "four"] as const;

describe("Stagger", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stagger ref={ref} aria-label="Cards" className="custom">
        <Stagger.Item data-testid="item">Card</Stagger.Item>
      </Stagger>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Stagger");
    expect(ref.current?.getAttribute("aria-label")).toBe("Cards");
    expect(ref.current?.className).toBe("bt-stagger custom");
    expect(screen.getByTestId("item").dataset["btPart"]).toBe("item");
  });

  it("brings its items in one after another", async () => {
    render(
      <Stagger>
        {ITEMS.map((item) => (
          <Stagger.Item key={item} data-testid={item}>
            {item}
          </Stagger.Item>
        ))}
      </Stagger>,
    );
    await waitFor(() => {
      expect(opacity("one")).toBeGreaterThan(0);
      expect(opacity("one")).toBeGreaterThan(opacity("four"));
    });
    await waitFor(() => {
      for (const item of ITEMS) expect(opacity(item)).toBe(1);
    });
  });

  it("waits until the group scrolls into view", async () => {
    render(
      <>
        <div style={{ blockSize: "3000px" }} />
        <Stagger data-testid="group">
          {ITEMS.map((item) => (
            <Stagger.Item key={item} data-testid={item}>
              {item}
            </Stagger.Item>
          ))}
        </Stagger>
      </>,
    );
    expect(opacity("one")).toBe(0);
    expect(screen.getByTestId("one").style.transform).toBe("");
    screen.getByTestId("group").scrollIntoView();
    await waitFor(() => {
      for (const item of ITEMS) {
        expect(opacity(item)).toBe(1);
        expect(screen.getByTestId(item).style.cssText).toBe("");
      }
    });
  });

  it("just shows its items when motion is reduced", () => {
    render(
      <MotionPreferenceContext value="reduced">
        <Stagger>
          {ITEMS.map((item) => (
            <Stagger.Item key={item} data-testid={item}>
              {item}
            </Stagger.Item>
          ))}
        </Stagger>
      </MotionPreferenceContext>,
    );
    for (const item of ITEMS) expect(opacity(item)).toBe(1);
  });

  it("never plays again once its items have shown, when motion settings change", async () => {
    const group = (preference: "full" | "reduced"): ReactElement => (
      <MotionPreferenceContext value={preference}>
        <Stagger>
          {ITEMS.map((item) => (
            <Stagger.Item key={item} data-testid={item}>
              {item}
            </Stagger.Item>
          ))}
        </Stagger>
      </MotionPreferenceContext>
    );
    const { rerender } = render(group("reduced"));
    rerender(group("full"));
    const lowest: number[] = [];
    await new Promise<void>((resolve) => {
      let frames = 0;
      const tick = (): void => {
        lowest.push(Math.min(...ITEMS.map((item) => opacity(item))));
        frames += 1;
        if (frames < 10) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    expect(Math.min(...lowest)).toBe(1);
  });
});
