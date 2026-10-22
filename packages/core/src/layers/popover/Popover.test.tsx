import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import type { MotionPreference } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { durations, easingCurves } from "../../tokens/motion.ts";
import type { FloatingEntrance } from "../floating-motion.tsx";
import { Popover } from "./Popover.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

async function gone(role: string): Promise<void> {
  await waitFor(() => {
    expect(screen.queryByRole(role)).toBeNull();
  });
}

function scrim(): Element | null {
  return document.querySelector('[data-bt="Scrim"]');
}

/** How opaque `element` draws: its own opacity times its ancestors'. */
function drawnOpacity(element: Element | null): number {
  let opacity = 1;
  for (let node = element; node; node = node.parentElement)
    opacity *= Number(getComputedStyle(node).opacity);
  return opacity;
}

/** The timing of the fade running on the scrim, or on the element around it that fades it. */
function scrimFade(): { readonly duration: unknown; readonly easing: string } {
  const covered = scrim();
  const fade = document.getAnimations().find((animation) => {
    const { effect } = animation;
    return (
      effect instanceof KeyframeEffect &&
      covered !== null &&
      effect.target?.contains(covered) === true
    );
  });
  const timing = fade?.effect?.getTiming();
  return { duration: timing?.duration, easing: timing?.easing ?? "none" };
}

async function nextFrame(): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

/** What's drawn at the window's bottom-right corner, where a press would land. */
function underCorner(): Element | null {
  return document.elementFromPoint(
    window.innerWidth - 4,
    window.innerHeight - 4,
  );
}

function Products({
  open,
  motion = "full",
  entrance,
}: {
  readonly open: boolean;
  readonly motion?: MotionPreference;
  readonly entrance?: FloatingEntrance;
}): ReactElement {
  return (
    <MotionPreferenceContext value={motion}>
      <Popover open={open} entrance={entrance}>
        <Popover.Trigger>Products</Popover.Trigger>
        <Popover.Content scrim="blur" aria-label="Products">
          <p>Card Studio</p>
        </Popover.Content>
      </Popover>
    </MotionPreferenceContext>
  );
}

function Sizes({
  onOpenChange,
}: {
  readonly onOpenChange?: (open: boolean) => void;
}): ReactElement {
  return (
    <Popover onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          style={{ marginBlockStart: "40px", marginInlineStart: "40px" }}
        >
          Canvas size
        </button>
      </Popover.Trigger>
      <Popover.Content aria-label="Canvas sizes">
        <button type="button">Square</button>
        <Popover.Close>Done</Popover.Close>
      </Popover.Content>
    </Popover>
  );
}

describe("Popover", () => {
  it("opens from its trigger into the dropdown layer, 8px away", async () => {
    render(<Sizes />);
    const trigger = screen.getByRole("button", { name: "Canvas size" });
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.click(trigger);
    const content = screen.getByRole("dialog", { name: "Canvas sizes" });
    expect(
      content.closest("[data-bt-layer]")?.getAttribute("data-bt-layer"),
    ).toBe("dropdown");
    expect(content.dataset["level"]).toBe("floating");
    await settled();
    expect(
      content.getBoundingClientRect().top -
        trigger.getBoundingClientRect().bottom,
    ).toBe(8);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes on Escape, handing focus back to the trigger at once, then fades out", async () => {
    const onOpenChange = vi.fn();
    render(<Sizes onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Canvas size" }));
    await settled();
    const content = screen.getByRole("dialog", { name: "Canvas sizes" });
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Canvas size" }),
    );
    expect(getComputedStyle(content).pointerEvents).toBe("none");
    await gone("dialog");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Canvas size" }),
    );
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("still hands focus back to its trigger after focus has been on the trigger while it was open", async () => {
    render(<Sizes />);
    const trigger = screen.getByRole("button", { name: "Canvas size" });
    await userEvent.click(trigger);
    await settled();
    trigger.focus();
    screen.getByRole("button", { name: "Square" }).focus();
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
    await gone("dialog");
    expect(document.activeElement).toBe(trigger);
  });

  it("grows in from its trigger's side", async () => {
    render(<Sizes />);
    await userEvent.click(screen.getByRole("button", { name: "Canvas size" }));
    const content = screen.getByRole("dialog", { name: "Canvas sizes" });
    expect(new DOMMatrix(getComputedStyle(content).transform).a).toBeLessThan(
      1,
    );
    await settled();
    expect(new DOMMatrix(getComputedStyle(content).transform).a).toBe(1);
  });

  it("shows complete in its first frame with entrance instant", async () => {
    render(
      <Popover entrance="instant">
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Content aria-label="Filters">Roast level</Popover.Content>
      </Popover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    const content = screen.getByRole("dialog", { name: "Filters" });
    expect(getComputedStyle(content).opacity).toBe("1");
    expect(new DOMMatrix(getComputedStyle(content).transform).a).toBe(1);
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <>
          <output>{open ? "open" : "closed"}</output>
          <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger>Trigger</Popover.Trigger>
            <Popover.Content aria-label="Panel">
              <Popover.Close>Close</Popover.Close>
            </Popover.Content>
          </Popover>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("dialog", { name: "Panel" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByText("closed")).toBeTruthy();
    await gone("dialog");
  });

  it("puts a scrim under the content that closes it", async () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Products</Popover.Trigger>
        <Popover.Content scrim="blur" aria-label="Products">
          <p>Card Studio</p>
        </Popover.Content>
      </Popover>,
    );
    const content = await screen.findByRole("dialog", { name: "Products" });
    const scrim = content
      .closest("[data-bt-layer]")
      ?.querySelector<HTMLElement>('[data-bt="Scrim"]');
    expect(scrim?.dataset["variant"]).toBe("blur");
    expect(
      scrim &&
        scrim.compareDocumentPosition(content) &
          Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const corner = {
      x: window.innerWidth - 4,
      y: window.innerHeight - 4,
    };
    expect(document.elementFromPoint(corner.x, corner.y)).toBe(scrim);
    await userEvent.pointer({ keys: "[MouseLeft]", coords: corner });
    expect(document.elementFromPoint(corner.x, corner.y)).not.toBe(scrim);
    await gone("dialog");
    expect(document.querySelector('[data-bt="Scrim"]')).toBeNull();
  });

  it("fades its scrim in over dur-fast and out over dur-fast, letting presses through as it goes", async () => {
    const { rerender } = render(<Products open={false} />);
    rerender(<Products open />);
    await nextFrame();
    expect(drawnOpacity(scrim())).toBeLessThan(1);
    expect(scrimFade()).toEqual({
      duration: durations.fast,
      easing: `cubic-bezier(${easingCurves.out.join(", ")})`,
    });
    await waitFor(() => {
      expect(drawnOpacity(scrim())).toBe(1);
    });
    rerender(<Products open={false} />);
    await nextFrame();
    expect(scrim()).not.toBeNull();
    expect(drawnOpacity(scrim())).toBeGreaterThan(0);
    expect(underCorner()).not.toBe(scrim());
    expect(scrimFade()).toEqual({
      duration: durations.fast,
      easing: `cubic-bezier(${easingCurves.in.join(", ")})`,
    });
    await waitFor(() => {
      expect(scrim()).toBeNull();
    });
  });

  it("fades its scrim over 100ms with reduced motion, and shows and drops it at once with an instant entrance", async () => {
    const { rerender } = render(<Products open={false} motion="reduced" />);
    rerender(<Products open motion="reduced" />);
    await nextFrame();
    expect(drawnOpacity(scrim())).toBeLessThan(1);
    expect(scrimFade()).toEqual({
      duration: durations.reduced,
      easing: "linear",
    });
    await waitFor(() => {
      expect(drawnOpacity(scrim())).toBe(1);
    });
    rerender(<Products open={false} motion="reduced" />);
    await nextFrame();
    expect(drawnOpacity(scrim())).toBeGreaterThan(0);
    expect(scrimFade()).toEqual({
      duration: durations.reduced,
      easing: "linear",
    });
    await waitFor(() => {
      expect(scrim()).toBeNull();
    });
    cleanup();

    const instant = render(<Products open={false} entrance="instant" />);
    instant.rerender(<Products open entrance="instant" />);
    await nextFrame();
    expect(drawnOpacity(scrim())).toBe(1);
    instant.rerender(<Products open={false} entrance="instant" />);
    expect(scrim()).toBeNull();
  });

  it("says how to fix content rendered outside a Popover", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<Popover.Content aria-label="Orphan">Sizes</Popover.Content>),
    ).toThrow(
      /\[buttery:Popover\] Popover\.Content has to be inside a <Popover>\. Fix:/,
    );
  });

  it("scrolls inside instead of running past the viewport", async () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Trigger</Popover.Trigger>
        <Popover.Content aria-label="Long">
          <div style={{ blockSize: "4000px" }} />
        </Popover.Content>
      </Popover>,
    );
    const content = await screen.findByRole("dialog", { name: "Long" });
    await settled();
    const rect = content.getBoundingClientRect();
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight - 8);
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
  });
});
