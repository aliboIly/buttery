import "./styles/index.css";
import { publishSettled } from "./motion/settle.ts";
import type { ExamplePlay, ExamplePlayContext } from "./meta.ts";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { RadioGroup, VisuallyHidden } from "radix-ui";
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

/**
 * The first heading on the page more than one level under the heading before it, such as `"h1 then h3"`:
 * a screen reader's list of headings reads the gap as a missing section.
 */
function skippedHeading(): string | undefined {
  const levels = [
    ...document.body.querySelectorAll<HTMLElement>(
      "h1, h2, h3, h4, h5, h6, [role='heading']",
    ),
  ]
    .filter(
      (heading) =>
        heading.checkVisibility() &&
        heading.closest("[aria-hidden='true']") === null,
    )
    .map((heading) =>
      heading.getAttribute("role") === "heading"
        ? Number(heading.getAttribute("aria-level") ?? "2")
        : Number(heading.tagName.slice(1)),
    );
  for (let index = 1; index < levels.length; index += 1) {
    const before = levels[index - 1] ?? 0;
    const level = levels[index] ?? 0;
    if (level > before + 1) return `h${String(before)} then h${String(level)}`;
  }
  return undefined;
}

function expectHeadingsInOrder(name: string): void {
  const skipped = skippedHeading();
  expect(
    skipped,
    `${name} skips a heading level (${String(skipped)}). Fix: give the lower heading the level after the one above it, through its titleAs or the element you pass it, or put it in a section with a heading of the level between.`,
  ).toBeUndefined();
}

const context: ExamplePlayContext = {
  press: async (role, name) => {
    await userEvent.click(await screen.findByRole(role, { name }));
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
      // A page's column is a size container, as the docs' example frames are.
      render(
        <div style={{ containerType: "inline-size" }}>
          <Example />
        </div>,
      );
      expectHeadingsInOrder(name);
      await play(context);
      expectHeadingsInOrder(name);
      for (const spy of logged) expect(spy).not.toHaveBeenCalled();
    });
  }
});

describe("the play actions", () => {
  it("see only what a sighted person can", async () => {
    render(
      <>
        <p>On the page</p>
        <VisuallyHidden.Root>Read out only</VisuallyHidden.Root>
        <div style={{ blockSize: 0, overflow: "hidden" }}>Folded away</div>
      </>,
    );
    await context.see("On the page");
    await Promise.all([
      expect(context.see("Read out only")).rejects.toThrow(),
      expect(context.see("Folded away")).rejects.toThrow(),
    ]);
  });

  it("rest the pointer on an element and move focus to it", async () => {
    const felt: string[] = [];
    render(
      <button
        type="button"
        onPointerEnter={() => {
          felt.push("pointer");
        }}
        onFocus={() => {
          felt.push("focus");
        }}
      >
        Export
      </button>,
    );
    await context.hover("button", "Export");
    await context.focus("button", "Export");
    expect(felt).toEqual(["pointer", "focus"]);
  });

  it("hold a key down long enough for a radio group to choose with it", async () => {
    render(
      <RadioGroup.Root aria-label="Fit" defaultValue="fit">
        <RadioGroup.Item value="fit" aria-label="Fit" />
        <RadioGroup.Item value="fill" aria-label="Fill" />
      </RadioGroup.Root>,
    );
    screen.getByRole("radio", { name: "Fit" }).focus();
    await context.key("ArrowRight");
    expect(
      screen.getByRole("radio", { name: "Fill" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});
