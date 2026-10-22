import "@buttery/core/styles.css";
import "./styles.css";
import { publishSettled } from "@buttery/core";
import type { ExamplePlay, ExamplePlayContext } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "./components/button/Button.tsx";
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
        const shown = screen
          .queryAllByText(text)
          .filter((element) =>
            element.checkVisibility({ visibilityProperty: true }),
          );
        expect(shown.length).toBeGreaterThan(0);
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
