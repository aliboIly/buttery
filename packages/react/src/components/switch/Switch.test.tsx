import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { contrastRatio } from "@butteryui/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Switch } from "./Switch.tsx";

afterEach(cleanup);

function thumb(): HTMLElement {
  const part = document.querySelector<HTMLElement>('[data-bt-part="thumb"]');
  if (!part) throw new Error("No thumb.");
  return part;
}

/** `rgb(r, g, b)` as `#rrggbb`. */
function hexOf(rgb: string): string {
  const [r = 0, g = 0, b = 0] = (rgb.match(/\d+/g) ?? []).map(Number);
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

describe("Switch", () => {
  it("stamps its class and data-bt on the field, and its ref on the switch", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref} label="Snap to the grid" className="custom" />);
    const root = ref.current?.closest('[data-bt="Switch"]');
    expect(root?.className).toBe("bt-switch bt-form-field custom");
    expect(ref.current?.getAttribute("role")).toBe("switch");
  });

  it("is a switch named by its label, flipped by a press on the label or Space", async () => {
    const change = vi.fn();
    render(<Switch label="Snap to the grid" onCheckedChange={change} />);
    await expect
      .element(
        page.getByRole("switch", { name: "Snap to the grid", exact: true }),
      )
      .toBeInTheDocument();
    await userEvent.click(screen.getByText("Snap to the grid"));
    expect(change).toHaveBeenLastCalledWith(true);
    screen.getByRole("switch").focus();
    await userEvent.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith(false);
  });

  it("moves its thumb to the far end when on, landing at once with reduced motion", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="always">
        <Switch label="Snap to the grid" />
      </ButteryProvider>,
    );
    const track = screen.getByRole("switch");
    const startRight = track.getBoundingClientRect().right;
    await userEvent.click(track);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(Math.round(startRight - thumb().getBoundingClientRect().right)).toBe(
      2,
    );
  });

  it("slides its thumb over with full motion", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="never">
        <Switch label="Snap to the grid" />
      </ButteryProvider>,
    );
    const track = screen.getByRole("switch");
    const start = thumb().getBoundingClientRect().left;
    await userEvent.click(track);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const moving = thumb().getBoundingClientRect().left;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const end = thumb().getBoundingClientRect().left;
    expect(moving).toBeGreaterThan(start);
    expect(moving).toBeLessThan(end);
    expect(
      Math.round(
        track.getBoundingClientRect().right -
          thumb().getBoundingClientRect().right,
      ),
    ).toBe(2);
  });

  it("has a 20px track with a 3:1 edge while off and a 24px target", () => {
    render(<Switch label="Snap to the grid" />);
    const track = screen.getByRole("switch");
    expect(track.getBoundingClientRect().height).toBe(20);
    expect(getComputedStyle(track).boxShadow).toContain("rgb(133, 133, 133)");
    const hit = track.querySelector("[data-bt-hit]");
    expect(hit?.getBoundingClientRect().height).toBe(24);
  });

  it("draws a 26×16 track with a 12px thumb at sm, 14 tall in compact, its target still 24px, beside 13px words that flip it", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="always">
        <Switch label="Snap to the grid" size="sm" />
        <div data-bt-density="compact">
          <Switch label="Show rulers" size="sm" />
        </div>
      </ButteryProvider>,
    );
    const track = screen.getByRole("switch", { name: "Snap to the grid" });
    const compact = screen.getByRole("switch", { name: "Show rulers" });
    const knob = track.querySelector<HTMLElement>('[data-bt-part="thumb"]');
    const words = screen.getByText("Snap to the grid");
    expect(track.getBoundingClientRect().width).toBe(26);
    expect(track.getBoundingClientRect().height).toBe(16);
    expect(compact.getBoundingClientRect().height).toBe(14);
    expect(knob?.getBoundingClientRect().height).toBe(12);
    expect(
      track.querySelector("[data-bt-hit]")?.getBoundingClientRect().height,
    ).toBe(24);
    expect(getComputedStyle(words).fontSize).toBe("13px");
    expect(
      Math.round(
        words.getBoundingClientRect().left -
          track.getBoundingClientRect().right,
      ),
    ).toBe(6);
    await userEvent.click(words);
    expect(track.getAttribute("aria-checked")).toBe("true");
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(
      Math.round(
        track.getBoundingClientRect().right -
          (knob?.getBoundingClientRect().right ?? 0),
      ),
    ).toBe(2);
  });

  it("draws its thumb 3:1 against its track while off, in light and dark, with no shadow to lean on", () => {
    for (const colorScheme of ["light", "dark"] as const) {
      render(
        <ButteryProvider colorScheme={colorScheme} layoutGuard={false}>
          <Switch label="Snap to the grid" />
        </ButteryProvider>,
      );
      const fill = hexOf(getComputedStyle(thumb()).backgroundColor);
      const track = hexOf(
        getComputedStyle(screen.getByRole("switch")).backgroundColor,
      );
      expect(contrastRatio(fill, track), colorScheme).toBeGreaterThanOrEqual(3);
      cleanup();
    }
  });
});
