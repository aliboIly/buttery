import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as browser } from "vitest/browser";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider.tsx";

afterEach(cleanup);

function thumb(): HTMLElement {
  return screen.getByRole("slider");
}

function trackOf(container: HTMLElement): HTMLElement {
  const track = container.querySelector<HTMLElement>('[data-bt-part="track"]');
  if (!track) throw new Error("no track");
  return track;
}

/** Where `share` of the track's width falls, relative to the track. */
function along(
  track: HTMLElement,
  share: number,
): { readonly x: number; readonly y: number } {
  const { width, height } = track.getBoundingClientRect();
  return { x: width * share, y: height / 2 };
}

describe("Slider", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Slider
        ref={ref}
        label="Rotation"
        className="custom"
        data-testid="rotation"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Slider");
    expect(ref.current?.dataset["testid"]).toBe("rotation");
    expect(ref.current?.className).toBe("bt-slider custom");
  });

  it("is a slider named by its label, with the formatted value for screen readers and the badge", () => {
    render(
      <Slider
        label="Rotation"
        min={-180}
        max={180}
        defaultValue={12}
        format="°"
      />,
    );
    expect(thumb().getAttribute("aria-valuenow")).toBe("12");
    expect(thumb().getAttribute("aria-valuetext")).toBe("12°");
    expect(screen.getByRole("slider", { name: "Rotation" })).toBe(thumb());
    expect(document.querySelector('[data-bt-part="value"]')?.textContent).toBe(
      "12°",
    );
  });

  it("steps with the arrow keys, ten at a time with Shift", async () => {
    const change = vi.fn();
    render(<Slider label="Scale" defaultValue={50} onValueChange={change} />);
    thumb().focus();
    await browser.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(51);
    await browser.keyboard("{Shift>}{ArrowRight}{/Shift}");
    expect(change).toHaveBeenLastCalledWith(61);
    await browser.keyboard("{End}");
    expect(change).toHaveBeenLastCalledWith(100);
  });

  it("jumps to where the track is pressed", async () => {
    const change = vi.fn();
    const { container } = render(
      <Slider label="Scale" onValueChange={change} />,
    );
    const track = trackOf(container);
    await browser.click(track, { position: along(track, 0.75) });
    expect(change).toHaveBeenLastCalledWith(expect.closeTo(75, -1));
  });

  it("catches a drag within 2% of a detent, but lets keys pass it", async () => {
    const change = vi.fn();
    const { container } = render(
      <Slider
        label="Rotation"
        min={-180}
        max={180}
        defaultValue={-90}
        detents={[0]}
        onValueChange={change}
      />,
    );
    const track = trackOf(container);
    await browser.dragAndDrop(thumb(), track, {
      targetPosition: along(track, 0.505),
    });
    expect(change).toHaveBeenLastCalledWith(0);
    thumb().focus();
    await browser.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(1);
  });

  it("resets on a double-click of its label or badge, or Backspace on the thumb", async () => {
    const change = vi.fn();
    render(
      <Slider
        label="Rotation"
        min={-180}
        max={180}
        defaultValue={45}
        resetValue={0}
        onValueChange={change}
      />,
    );
    await userEvent.dblClick(screen.getByText("Rotation"));
    expect(change).toHaveBeenLastCalledWith(0);
    thumb().focus();
    await browser.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(1);
    await browser.keyboard("{Backspace}");
    expect(change).toHaveBeenLastCalledWith(0);
  });

  it("has a 24px thumb on a 14px track with a 36px hit area", () => {
    const { container } = render(<Slider label="Scale" />);
    expect(thumb().getBoundingClientRect().height).toBe(24);
    expect(trackOf(container).getBoundingClientRect().height).toBe(14);
    expect(
      thumb().querySelector("[data-bt-hit]")?.getBoundingClientRect().height,
    ).toBe(36);
  });

  it("holds its value when disabled", async () => {
    const change = vi.fn();
    render(
      <Slider
        label="Depth"
        defaultValue={30}
        disabled
        onValueChange={change}
      />,
    );
    await userEvent.dblClick(screen.getByText("Depth"));
    expect(change).not.toHaveBeenCalled();
  });
});
