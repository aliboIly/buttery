import "../../styles/index.css";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { Presence } from "../presence/Presence.tsx";
import { Loop } from "./Loop.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function holds(milliseconds = 250): Promise<string | undefined> {
  const before = step();
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
  expect(step()).toBe(before);
  return before;
}

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
    // A busy test machine can hold timers back well past the 60ms steps; the order is what's checked.
    const busy = { timeout: 3000 };
    await waitFor(() => {
      expect(step()).toBe("1");
    }, busy);
    await waitFor(() => {
      expect(step()).toBe("2");
    }, busy);
    await waitFor(() => {
      expect(step()).toBe("0");
    }, busy);
  });

  it("holds still while the pointer is over it or focus is inside it", async () => {
    render(
      <Loop steps={3} interval={60} data-testid="loop">
        {(current) => (
          <button type="button">{`Step ${String(current)}`}</button>
        )}
      </Loop>,
    );
    const loop = screen.getByTestId("loop");
    fireEvent.pointerEnter(loop);
    const held = await holds();
    fireEvent.pointerLeave(loop);
    await waitFor(() => {
      expect(step()).not.toBe(held);
    });
    screen.getByRole("button").focus();
    const focused = await holds();
    screen.getByRole("button").blur();
    await waitFor(() => {
      expect(step()).not.toBe(focused);
    });
  });

  it("stays held when it unpauses under the pointer or with focus inside it", async () => {
    function Demo({ paused }: { readonly paused: boolean }): ReactElement {
      return (
        <Loop steps={3} interval={60} paused={paused} data-testid="loop">
          {(current) => (
            <button type="button">{`Step ${String(current)}`}</button>
          )}
        </Loop>
      );
    }
    const { rerender } = render(<Demo paused />);
    screen.getByRole("button").focus();
    rerender(<Demo paused={false} />);
    await holds();
    screen.getByRole("button").blur();
    rerender(<Demo paused />);
    await userEvent.hover(screen.getByTestId("loop"));
    rerender(<Demo paused={false} />);
    const held = await holds();
    await userEvent.unhover(screen.getByTestId("loop"));
    await waitFor(() => {
      expect(step()).not.toBe(held);
    });
  });

  it("holds still while paused or while the page is hidden", async () => {
    const { rerender } = render(
      <Loop steps={3} interval={60} paused data-testid="loop">
        {(current) => `Step ${String(current)}`}
      </Loop>,
    );
    await holds();
    rerender(
      <Loop steps={3} interval={60} data-testid="loop">
        {(current) => `Step ${String(current)}`}
      </Loop>,
    );
    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    const hidden = await holds();
    visibility.mockRestore();
    document.dispatchEvent(new Event("visibilitychange"));
    await waitFor(() => {
      expect(step()).not.toBe(hidden);
    });
  });

  it("says how to fix an interval outside 3 to 5 seconds", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Loop steps={3} interval={800}>
        {(current) => current}
      </Loop>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[buttery:Loop] interval={800} steps too quickly or too slowly for a living demo. Fix: keep it between 3000 and 5000",
      ),
    );
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
