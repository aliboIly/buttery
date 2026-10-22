import "./styles/index.css";
import { publishSettled } from "./motion/settle.ts";
import type { ExamplePlay, ExamplePlayContext } from "./meta.ts";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

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
    await userEvent.click(await screen.findByRole(role, { name }));
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

/** `menu/sort-order` for `./layers/menu/examples/sort-order.tsx`: whole, so `-t` can pick out a folder. */
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

  for (const { name, play, Example } of played) {
    it(name, async () => {
      const logged = [vi.spyOn(console, "error"), vi.spyOn(console, "warn")];
      render(<Example />);
      await play(context);
      for (const spy of logged) expect(spy).not.toHaveBeenCalled();
    });
  }
});
