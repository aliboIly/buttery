import "@buttery/core/styles.css";
import "../../styles.css";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext, publishSettled } from "@buttery/core";
import { celebrate, Confetti } from "./Confetti.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function pieces(): NodeListOf<HTMLElement> {
  return document.querySelectorAll<HTMLElement>(
    '[data-bt="Confetti"] [data-bt-part="piece"]',
  );
}

describe("Confetti", () => {
  it("bursts 28 to 40 pieces from the element's middle, in the toast layer", () => {
    render(
      <>
        <Confetti />
        <button type="button" style={{ margin: "120px" }}>
          Finish
        </button>
      </>,
    );
    const button = screen.getByRole("button", { name: "Finish" });
    act(() => {
      celebrate(button);
    });
    expect(pieces().length).toBeGreaterThanOrEqual(28);
    expect(pieces().length).toBeLessThanOrEqual(40);
    const burst = document.querySelector<HTMLElement>('[data-bt="Confetti"]');
    const rect = button.getBoundingClientRect();
    expect(burst?.getBoundingClientRect().left).toBe(
      rect.left + rect.width / 2,
    );
    expect(
      burst?.closest("[data-bt-layer]")?.getAttribute("data-bt-layer"),
    ).toBe("toast");
    expect(burst?.getAttribute("aria-hidden")).toBe("true");
  });

  it("throws the pieces up, then clears them after about 900ms", async () => {
    render(<Confetti />);
    act(() => {
      celebrate();
    });
    expect(root.hasAttribute("data-bt-settled")).toBe(false);
    const start = pieces()[0]?.getBoundingClientRect().top ?? 0;
    await waitFor(() => {
      expect(pieces()[0]?.getBoundingClientRect().top ?? start).toBeLessThan(
        start,
      );
    });
    await waitFor(
      () => {
        expect(pieces()).toHaveLength(0);
        expect(root.hasAttribute("data-bt-settled")).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it("does nothing when motion is reduced", () => {
    render(
      <MotionPreferenceContext value="reduced">
        <Confetti />
      </MotionPreferenceContext>,
    );
    act(() => {
      celebrate();
    });
    expect(pieces()).toHaveLength(0);
  });
});
