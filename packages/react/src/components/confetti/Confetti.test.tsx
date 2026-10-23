import "@butteryui/core/styles.css";
import "../../styles.css";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionPreferenceContext, publishSettled } from "@butteryui/core";
import { gradients } from "@butteryui/core/palettes";
import { celebrate, Confetti } from "./Confetti.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

  it("uses the palette's fresh colors, never its neutrals or deeps", () => {
    render(<Confetti />);
    act(() => {
      celebrate();
    });
    const probe = document.createElement("span");
    document.body.append(probe);
    const rgb = (color: string): string => {
      probe.style.backgroundColor = color;
      return getComputedStyle(probe).backgroundColor;
    };
    const fresh = new Set(
      gradients
        .filter((preset) =>
          ["honey", "apricot", "rose", "violet", "sky", "sea"].includes(
            preset.id,
          ),
        )
        .flatMap((preset) => [rgb(preset.fromHex), rgb(preset.toHex)]),
    );
    probe.remove();
    for (const piece of pieces()) {
      expect(fresh).toContain(getComputedStyle(piece).backgroundColor);
    }
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

  it("does nothing when motion is reduced, and keeps nothing for later", () => {
    const { rerender } = render(
      <MotionPreferenceContext value="reduced">
        <Confetti />
      </MotionPreferenceContext>,
    );
    act(() => {
      celebrate();
      celebrate();
      celebrate();
    });
    expect(pieces()).toHaveLength(0);
    rerender(
      <MotionPreferenceContext value="full">
        <Confetti />
      </MotionPreferenceContext>,
    );
    expect(pieces()).toHaveLength(0);
  });

  it("says how to fix a celebration with no host, and keeps nothing for later", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    act(() => {
      celebrate();
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[buttery:Confetti] celebrate() ran with no <Confetti /> host",
      ),
    );
    render(<Confetti />);
    expect(pieces()).toHaveLength(0);
  });
});
