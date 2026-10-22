import "@buttery/core/styles.css";
import "./styles.css";
import { publishSettled } from "@buttery/core";
import type { ExamplePlay, ExamplePlayContext } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { toast } from "./components/toaster/Toaster.tsx";
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

const context: ExamplePlayContext = {
  press: async (role, name) => {
    const target = await screen.findByRole(role, { name });
    await userEvent.click(target);
    expect(
      target.matches(":disabled"),
      `Pressing the ${role} "${String(name)}" disabled it, which drops focus from it. Fix: mark it aria-disabled instead, which keeps it focusable and ignores presses.`,
    ).toBe(false);
  },
  type: async (label, text) => {
    await userEvent.type(await screen.findByLabelText(label), text);
  },
  key: async (key) => {
    await userEvent.keyboard(`{${key}}`);
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
