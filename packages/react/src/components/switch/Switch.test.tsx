import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
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
});
