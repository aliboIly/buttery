import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { Presence } from "./Presence.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

describe("Presence", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Presence show ref={ref} aria-label="Saved" className="custom">
        Saved
      </Presence>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Presence");
    expect(ref.current?.getAttribute("aria-label")).toBe("Saved");
    expect(ref.current?.className).toBe("bt-presence custom");
  });

  it("fades in, then plays its exit before it unmounts", async () => {
    const { rerender } = render(
      <Presence show data-testid="note">
        Saved
      </Presence>,
    );
    const note = screen.getByTestId("note");
    expect(Number(getComputedStyle(note).opacity)).toBeLessThan(1);
    await waitFor(() => {
      expect(getComputedStyle(note).opacity).toBe("1");
    });
    rerender(
      <Presence show={false} data-testid="note">
        Saved
      </Presence>,
    );
    expect(screen.getByTestId("note")).toBe(note);
    await waitFor(() => {
      expect(screen.queryByTestId("note")).toBeNull();
    });
  });

  it("rises 8px as it arrives", () => {
    render(
      <Presence show preset="rise" data-testid="note">
        Saved
      </Presence>,
    );
    const { transform } = getComputedStyle(screen.getByTestId("note"));
    expect(new DOMMatrix(transform).m42).toBeGreaterThan(0);
  });

  it("holds buttery's settled flag while it animates", async () => {
    render(<Presence show>Saved</Presence>);
    await waitFor(() => {
      expect(root.hasAttribute("data-bt-settled")).toBe(false);
    });
    await waitFor(() => {
      expect(root.hasAttribute("data-bt-settled")).toBe(true);
    });
  });

  it("lands in place when motion becomes reduced mid-entrance", async () => {
    const { rerender } = render(
      <MotionPreferenceContext value="full">
        <Presence show preset="rise" data-testid="note">
          Saved
        </Presence>
      </MotionPreferenceContext>,
    );
    await new Promise((resolve) => setTimeout(resolve, 40));
    rerender(
      <MotionPreferenceContext value="reduced">
        <Presence show preset="rise" data-testid="note">
          Saved
        </Presence>
      </MotionPreferenceContext>,
    );
    await new Promise((resolve) =>
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      }),
    );
    const { transform } = getComputedStyle(screen.getByTestId("note"));
    expect(transform === "none" ? 0 : new DOMMatrix(transform).m42).toBe(0);
    await waitFor(() => {
      expect(root.hasAttribute("data-bt-settled")).toBe(true);
    });
  });

  it("only fades, and briefly, when motion is reduced", async () => {
    const start = performance.now();
    render(
      <MotionPreferenceContext value="reduced">
        <Presence show preset="rise" data-testid="note">
          Saved
        </Presence>
      </MotionPreferenceContext>,
    );
    const note = screen.getByTestId("note");
    expect(getComputedStyle(note).transform).toBe("none");
    await waitFor(() => {
      expect(getComputedStyle(note).opacity).toBe("1");
    });
    expect(performance.now() - start).toBeLessThan(300);
  });
});
