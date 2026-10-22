import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as browser } from "vitest/browser";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function thumb(): HTMLElement {
  return screen.getByRole("slider");
}

/** The thumb has focus after a pointer press, without the ring keyboard focus shows. */
function expectPressFocus(): void {
  expect(document.activeElement).toBe(thumb());
  expect(thumb().matches(":focus-visible")).toBe(false);
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
    expectPressFocus();
  });

  it("focuses the thumb when a track press lands on the value it has", async () => {
    const change = vi.fn();
    const { container } = render(
      <Slider
        label="Scale"
        defaultValue={50}
        step={50}
        onValueChange={change}
      />,
    );
    const track = trackOf(container);
    await browser.click(track, { position: along(track, 0.3) });
    expect(change).not.toHaveBeenCalled();
    expectPressFocus();
  });

  it("keeps its value and focuses the thumb when the thumb is pressed, anywhere in its hit area", async () => {
    const change = vi.fn();
    render(<Slider label="Scale" onValueChange={change} />);
    await browser.click(thumb());
    expect(change).not.toHaveBeenCalled();
    expectPressFocus();
    thumb().blur();
    await browser.click(thumb(), { position: { x: 28, y: 12 } });
    expect(change).not.toHaveBeenCalled();
    expectPressFocus();
    cleanup();

    render(<Slider label="Scale" defaultValue={50} onValueChange={change} />);
    await browser.click(thumb());
    expect(change).not.toHaveBeenCalled();
    expectPressFocus();
  });

  it("moves with a drag that starts on the thumb", async () => {
    const change = vi.fn();
    const { container } = render(
      <Slider label="Scale" onValueChange={change} />,
    );
    const track = trackOf(container);
    await browser.dragAndDrop(thumb(), track, {
      targetPosition: along(track, 0.6),
    });
    expect(change).toHaveBeenLastCalledWith(expect.closeTo(60, -1));
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

  it("commits a key step after the change it makes", async () => {
    const calls: string[] = [];
    render(
      <Slider
        label="Scale"
        defaultValue={40}
        onValueChange={(next) => calls.push(`change ${String(next)}`)}
        onValueCommit={(next) => calls.push(`commit ${String(next)}`)}
      />,
    );
    thumb().focus();
    await browser.keyboard("{ArrowRight}");
    await browser.keyboard("{End}");
    expect(calls).toEqual([
      "change 41",
      "commit 41",
      "change 100",
      "commit 100",
    ]);
  });

  it("commits each drag once on release, even one that ends where it started", async () => {
    const commit = vi.fn();
    const { container } = render(
      <Slider label="Scale" defaultValue={50} onValueCommit={commit} />,
    );
    const track = trackOf(container);
    await browser.dragAndDrop(thumb(), track, {
      targetPosition: along(track, 0.8),
    });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenLastCalledWith(expect.closeTo(80, -1));
    cleanup();

    const unchanged = vi.fn();
    render(
      <Slider
        label="Scale"
        defaultValue={50}
        step={50}
        onValueCommit={unchanged}
      />,
    );
    await browser.click(thumb());
    expect(unchanged).toHaveBeenCalledTimes(1);
    expect(unchanged).toHaveBeenLastCalledWith(50);
  });

  it("resets on a double-click of its label or badge, or Backspace on the thumb, and commits the reset", async () => {
    const change = vi.fn();
    const commit = vi.fn<(value: number) => void>();
    render(
      <Slider
        label="Rotation"
        min={-180}
        max={180}
        defaultValue={45}
        resetValue={0}
        format="°"
        onValueChange={change}
        onValueCommit={commit}
      />,
    );
    await userEvent.dblClick(screen.getByText("Rotation"));
    expect(change).toHaveBeenLastCalledWith(0);
    expect(commit).toHaveBeenLastCalledWith(0);
    thumb().focus();
    await browser.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(1);
    await browser.keyboard("{Backspace}");
    expect(change).toHaveBeenLastCalledWith(0);
    await browser.keyboard("{ArrowRight}");
    await userEvent.dblClick(
      screen.getByText("1°", { selector: '[data-bt-part="value"]' }),
    );
    expect(change).toHaveBeenLastCalledWith(0);
    expect(commit.mock.calls.map(([committed]) => committed)).toEqual([
      0, 1, 0, 1, 0,
    ]);
  });

  it("warns, with the fix, when a controlled slider would reset to its minimum", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Slider
        label="Rotation"
        min={-180}
        max={180}
        value={20}
        onValueChange={() => undefined}
      />,
    );
    expect(warn).toHaveBeenCalledWith(
      '[buttery:Slider] The "Rotation" slider is controlled without resetValue or defaultValue, so double-click and Backspace reset it to its minimum, -180. Fix: pass the value it should go back to, such as resetValue={0}.',
    );
  });

  it("has a 24px thumb on a 14px track with a 36px hit area", () => {
    const { container } = render(<Slider label="Scale" />);
    expect(thumb().getBoundingClientRect().height).toBe(24);
    expect(trackOf(container).getBoundingClientRect().height).toBe(14);
    expect(
      thumb().querySelector("[data-bt-hit]")?.getBoundingClientRect().height,
    ).toBe(36);
  });

  it("commits nothing when a disabled slider is pressed", async () => {
    const commit = vi.fn();
    render(
      <Slider
        label="Depth"
        defaultValue={30}
        disabled
        onValueCommit={commit}
      />,
    );
    await browser.click(thumb(), { force: true });
    expect(commit).not.toHaveBeenCalled();
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
