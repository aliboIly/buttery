import "@buttery/core/styles.css";
import "./styles.css";
import { publishSettled } from "@buttery/core";
import type { ExamplePlay, ExamplePlayContext } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "./components/button/Button.tsx";
import { celebrate } from "./components/confetti/Confetti.tsx";
import {
  getBursts,
  removeBurst,
} from "./components/confetti/confetti-store.ts";
import { LineChart } from "./components/line-chart/LineChart.tsx";
import { SegmentedControl } from "./components/segmented-control/SegmentedControl.tsx";
import { toast } from "./components/toaster/Toaster.tsx";
import { Tooltip } from "./components/tooltip/Tooltip.tsx";
import { ButteryProvider } from "./provider/ButteryProvider.tsx";

const modules = import.meta.glob<Readonly<Record<string, unknown>>>(
  "./**/examples/*.tsx",
  { eager: true },
);

function isPlay(value: unknown): value is ExamplePlay {
  return typeof value === "function";
}

function isComponent(value: unknown): value is ComponentType {
  return typeof value === "function";
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

function clips(overflow: string): boolean {
  return overflow === "hidden" || overflow === "clip";
}

/**
 * Whether a sighted person can see the text in `element`: it's drawn and not transparent, and no element
 * around it clips it to nothing, as a screen-reader-only box of 1px or a folded-away section does.
 */
function inSight(element: Element): boolean {
  if (
    !element.checkVisibility({
      visibilityProperty: true,
      opacityProperty: true,
    })
  )
    return false;
  const range = document.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  let { left, top, right, bottom } =
    text.width > 0 && text.height > 0 ? text : element.getBoundingClientRect();
  for (let node: Element | null = element; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const box = node.getBoundingClientRect();
    if (clips(style.overflowX)) {
      left = Math.max(left, box.left);
      right = Math.min(right, box.right);
    }
    if (clips(style.overflowY)) {
      top = Math.max(top, box.top);
      bottom = Math.min(bottom, box.bottom);
    }
  }
  return right - left > 1 && bottom - top > 1;
}

const context: ExamplePlayContext = {
  press: async (role, name) => {
    const target = await screen.findByRole(role, { name });
    await userEvent.click(target);
    expect(
      target.matches(":disabled"),
      `Pressing the ${role} "${String(name)}" disabled it, which drops focus from it. Fix: mark it aria-disabled instead, which keeps it focusable and ignores presses.`,
    ).toBe(false);
  },
  hover: async (role, name) => {
    await userEvent.hover(await screen.findByRole(role, { name }));
  },
  focus: async (role, name) => {
    const target = await screen.findByRole(role, { name });
    // A key first, as Tab presses one: a tooltip stays shut for focus that follows a click.
    await userEvent.keyboard("{Shift}");
    target.focus();
  },
  type: async (label, text) => {
    await userEvent.type(await screen.findByLabelText(label), text);
  },
  key: async (key) => {
    // Radix picks a radio as its delayed focus lands only while the arrow key is still down.
    await userEvent.keyboard(`{${key}>}`);
    await nextFrame();
    await nextFrame();
    await userEvent.keyboard(`{/${key}}`);
  },
  see: async (text) => {
    await waitFor(
      () => {
        const found = screen.queryAllByText(text);
        const quoted = typeof text === "string" ? `"${text}"` : String(text);
        expect(
          found.some(inSight),
          found.length === 0
            ? `Nothing on the page says ${quoted}.`
            : `${quoted} is on the page but out of sight: screen-reader-only, clipped away or transparent. Fix: see what a person sees, or open what shows it first, such as hovering or focusing a tooltip's element.`,
        ).toBe(true);
      },
      { timeout: 3000 },
    );
  },
};

/** `slider/opacity-row` for `./components/slider/examples/opacity-row.tsx`: whole, so `-t` can pick out a folder. */
function testName(path: string): string {
  return path.replace(/^.*\/([^/]+)\/examples\/([^/]+)\.tsx$/, "$1/$2");
}

const played = Object.entries(modules).flatMap(([path, module]) => {
  const { play, ...rest } = module;
  if (!isPlay(play)) return [];
  const Example = Object.values(rest).find(isComponent);
  return Example === undefined ? [] : [{ name: testName(path), play, Example }];
});

beforeEach(() => {
  publishSettled();
});

function endExample(): void {
  cleanup();
  toast.dismiss();
  for (const burst of getBursts()) removeBurst(burst.id);
  vi.restoreAllMocks();
}

afterEach(endExample);

describe("examples", () => {
  it("finds the package's examples", () => {
    expect(Object.keys(modules).length).toBeGreaterThan(0);
  });

  it("names each example's test after its folder and file, whole", ({
    task,
  }) => {
    const names = task.suite?.tasks.map((test) => test.name) ?? [];
    const expected = Object.entries(modules)
      .filter(([, module]) => isPlay(module["play"]))
      .map(([path]) =>
        path.replace(/^.*\/([^/]+)\/examples\/([^/]+)\.tsx$/, "$1/$2"),
      );
    expect(new Set(expected).size).toBe(expected.length);
    expect(names).toEqual(expect.arrayContaining(expected));
  });

  it("starts each example without the confetti the one before left", async () => {
    render(<ButteryProvider />);
    celebrate();
    await nextFrame();
    expect(document.querySelector('[data-bt="Confetti"]')).not.toBeNull();
    endExample();
    render(<ButteryProvider />);
    await nextFrame();
    expect(document.querySelector('[data-bt="Confetti"]')).toBeNull();
  });

  it("starts each example without the toasts the one before left", async () => {
    render(<ButteryProvider />);
    toast("Card exported");
    await context.see("Card exported");
    endExample();
    render(<ButteryProvider />);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(screen.queryByText("Card exported")).toBeNull();
  });

  for (const { name, play, Example } of played) {
    it(name, async () => {
      const logged = [vi.spyOn(console, "error"), vi.spyOn(console, "warn")];
      render(
        <ButteryProvider>
          <Example />
        </ButteryProvider>,
      );
      await play(context);
      for (const spy of logged) expect(spy).not.toHaveBeenCalled();
    });
  }
});

describe("the play actions", () => {
  it("see only what a sighted person can, not a chart's screen-reader table", async () => {
    render(
      <LineChart
        label="Sales"
        labels={["Mon", "Tue"]}
        series={[{ key: "now", label: "This week", values: [1420, 1560] }]}
      />,
    );
    expect(screen.getAllByText("1,420").length).toBeGreaterThan(0);
    await expect(context.see("1,420")).rejects.toThrow();
  });

  it("open a tooltip by resting the pointer on its element", async () => {
    render(
      <ButteryProvider>
        <Tooltip label="Saves a copy">
          <Button>Export</Button>
        </Tooltip>
      </ButteryProvider>,
    );
    await context.hover("button", "Export");
    await context.see("Saves a copy");
  });

  it("open a tooltip by focusing its element, even after a click", async () => {
    render(
      <ButteryProvider>
        <Button>Got it</Button>
        <Tooltip label="Saves a copy">
          <Button>Export</Button>
        </Tooltip>
      </ButteryProvider>,
    );
    await context.press("button", "Got it");
    await context.focus("button", "Export");
    await context.see("Saves a copy");
  });

  it("hold a key down long enough for a radio group to choose with it", async () => {
    render(<SegmentedControl label="Fit" options={["Fit", "Fill", "Crop"]} />);
    screen.getByRole("radio", { name: "Fit" }).focus();
    await context.key("ArrowRight");
    expect(
      screen.getByRole("radio", { name: "Fill" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});
