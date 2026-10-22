import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { SetupGuide } from "./SetupGuide.tsx";
import type { SetupGuideProps, SetupTask } from "./SetupGuide.tsx";

const TASKS: readonly SetupTask[] = [
  { id: "coffee", title: "Add your first coffee", done: true },
  {
    id: "shipping",
    title: "Set shipping rates",
    description: "What a bag costs to send.",
    action: { label: "Set rates", href: "#shipping" },
  },
  { id: "bank", title: "Connect your bank" },
];

const GROUPED: readonly SetupTask[] = [
  {
    id: "coffee",
    title: "Add your first coffee",
    done: true,
    group: "Stock the shop",
  },
  { id: "photos", title: "Add photos", done: true, group: "Stock the shop" },
  {
    id: "shipping",
    title: "Set shipping rates",
    group: "Take orders",
    action: { label: "Set rates", href: "#shipping" },
  },
  { id: "bank", title: "Connect your bank", group: "Get paid" },
];

function groupHead(name: string): HTMLElement {
  return within(guide()).getByRole("button", { name });
}

beforeEach(() => {
  for (const key of [
    "buttery:setup-guide:test-setup",
    "buttery:setup-guide-open:test-setup",
    "buttery:setup-guide-groups:test-setup",
  ])
    window.localStorage.removeItem(key);
  publishSettled();
});

afterEach(cleanup);

function Guide(props: Partial<SetupGuideProps>): ReactElement {
  return (
    <ButteryProvider>
      <SetupGuide tasks={TASKS} {...props} />
    </ButteryProvider>
  );
}

function guide(): HTMLElement {
  return screen.getByRole("region", { name: "Setup guide" });
}

describe("SetupGuide", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Guide ref={ref} className="custom" id="setup" />);
    expect(ref.current?.dataset["bt"]).toBe("SetupGuide");
    expect(ref.current?.className).toBe("bt-setup-guide custom");
    expect(ref.current?.id).toBe("setup");
  });

  it("floats in the bottom-end lane, 288 wide", () => {
    render(<Guide />);
    expect(guide().closest('[data-lane="bottom-end"]')).not.toBeNull();
    expect(guide().getBoundingClientRect().width).toBe(288);
  });

  it("shows its progress and the next task as a link while folded", async () => {
    render(<Guide />);
    const bar = within(guide()).getByRole("progressbar", {
      name: "Setup guide",
    });
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuetext")).toBe("1 of 3 done");
    expect(
      within(guide()).getByText("Next:", { exact: false }).textContent,
    ).toBe("Next: Set shipping rates");
    expect(
      within(guide())
        .getByRole("link", { name: "Set shipping rates" })
        .getAttribute("href"),
    ).toBe("#shipping");
    await waitFor(() => {
      const fill = guide().querySelector<HTMLElement>('[data-bt-part="fill"]');
      expect(fill?.getBoundingClientRect().width).toBeCloseTo(
        (bar.getBoundingClientRect().width * 1) / 3,
        0,
      );
    });
  });

  it("unfolds to every task, read as done or to do, with the next one's action", async () => {
    render(<Guide />);
    const expand = within(guide()).getByRole("button", {
      name: "Show all steps",
    });
    expect(expand.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(expand);
    const collapse = within(guide()).getByRole("button", {
      name: "Hide steps",
    });
    expect(collapse.getAttribute("aria-expanded")).toBe("true");
    const list = document.getElementById(
      collapse.getAttribute("aria-controls") ?? "",
    );
    expect(
      within(list ?? guide())
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Done: Add your first coffee",
      "To do: Set shipping ratesWhat a bag costs to send.Set rates",
      "To do: Connect your bank",
    ]);
    expect(
      within(guide()).getByRole("link", { name: "Set rates" }).dataset[
        "variant"
      ],
    ).toBe("soft");
  });

  it("remembers being unfolded and being dismissed under its storage key", async () => {
    const onDismiss = vi.fn();
    render(<Guide storageKey="test-setup" onDismiss={onDismiss} />);
    await userEvent.click(
      within(guide()).getByRole("button", { name: "Show all steps" }),
    );
    cleanup();
    render(<Guide storageKey="test-setup" onDismiss={onDismiss} />);
    expect(
      within(guide()).getByRole("button", { name: "Hide steps" }),
    ).toBeTruthy();
    await userEvent.click(
      within(guide()).getByRole("button", { name: "Dismiss" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("region", { name: "Setup guide" })).toBeNull();
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    cleanup();
    render(<Guide storageKey="test-setup" />);
    expect(screen.queryByRole("region", { name: "Setup guide" })).toBeNull();
  });

  it("hands keyboard focus back to where it was as it's dismissed, without scrolling the page", async () => {
    render(
      <ButteryProvider>
        <input aria-label="Search" />
        <div style={{ blockSize: "300vh" }} />
        <button type="button">Last on the page</button>
        <SetupGuide tasks={TASKS} />
      </ButteryProvider>,
    );
    const search = screen.getByRole("textbox", { name: "Search" });
    await browser.keyboard("{Shift}");
    search.focus();
    const dismiss = within(guide()).getByRole("button", { name: "Dismiss" });
    dismiss.focus();
    const scrolled = window.scrollY;
    await browser.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.queryByRole("region", { name: "Setup guide" })).toBeNull();
    });
    expect(document.activeElement).toBe(search);
    expect(window.scrollY).toBe(scrolled);
  });

  it("lets the keyboard reach and scroll its steps while they overflow with nothing in them to focus", async () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      id: `task-${String(index)}`,
      title: `Finish part ${String(index + 1)} of the shop`,
      description: "A line or two about what it takes.",
      done: true,
    }));
    render(<Guide tasks={many} defaultOpen />);
    const steps = within(guide()).getByRole("region", { name: "Steps" });
    expect(steps.scrollHeight).toBeGreaterThan(steps.clientHeight);
    await waitFor(() => {
      expect(steps.tabIndex).toBe(0);
    });
    cleanup();
    render(<Guide defaultOpen />);
    expect(
      within(guide())
        .getByRole("region", { name: "Steps" })
        .hasAttribute("tabindex"),
    ).toBe(false);
  });

  it("shows its steps' ring whole, the edge fade off while it's focused", async () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      id: `task-${String(index)}`,
      title: `Finish part ${String(index + 1)} of the shop`,
      done: true,
    }));
    render(<Guide tasks={many} defaultOpen />);
    const steps = within(guide()).getByRole("region", { name: "Steps" });
    await waitFor(() => {
      expect(steps.tabIndex).toBe(0);
    });
    expect(getComputedStyle(steps).maskImage).not.toBe("none");
    await browser.keyboard("{Shift}");
    steps.focus();
    expect(getComputedStyle(steps).maskImage).toBe("none");
  });

  it("lists grouped tasks under headers that fold, the next task's group open and tinted", () => {
    render(<Guide tasks={GROUPED} defaultOpen />);
    expect(groupHead("Stock the shop").getAttribute("aria-expanded")).toBe(
      "false",
    );
    expect(groupHead("Take orders").getAttribute("aria-expanded")).toBe("true");
    expect(groupHead("Get paid").getAttribute("aria-expanded")).toBe("false");
    expect(within(guide()).getByText("Set shipping rates")).toBeTruthy();
    expect(within(guide()).queryByText("Add your first coffee")).toBeNull();
    const tint = (name: string): string => {
      const group = groupHead(name).parentElement;
      if (!group) throw new Error(`No ${name} group.`);
      return getComputedStyle(group).backgroundColor;
    };
    expect(tint("Take orders")).not.toBe(tint("Get paid"));
    expect(tint("Get paid")).toBe("rgba(0, 0, 0, 0)");
  });

  it("opens and folds a group from its header, and remembers its choice under its storage key", async () => {
    const { unmount } = render(
      <Guide tasks={GROUPED} defaultOpen storageKey="test-setup" />,
    );
    await browser.click(groupHead("Stock the shop"));
    expect(groupHead("Stock the shop").getAttribute("aria-expanded")).toBe(
      "true",
    );
    expect(
      await within(guide()).findByText("Add your first coffee"),
    ).toBeTruthy();
    await browser.click(groupHead("Take orders"));
    expect(groupHead("Take orders").getAttribute("aria-expanded")).toBe(
      "false",
    );
    await waitFor(() => {
      expect(within(guide()).queryByText("Set shipping rates")).toBeNull();
    });
    unmount();
    render(<Guide tasks={GROUPED} defaultOpen storageKey="test-setup" />);
    expect(groupHead("Stock the shop").getAttribute("aria-expanded")).toBe(
      "true",
    );
    expect(groupHead("Take orders").getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("opens the group holding the next task as tasks get done, unless it was folded by hand", () => {
    const { rerender } = render(<Guide tasks={GROUPED} defaultOpen />);
    const doneShipping = GROUPED.map((task) =>
      task.id === "shipping" ? { ...task, done: true } : task,
    );
    rerender(
      <ButteryProvider>
        <SetupGuide tasks={doneShipping} defaultOpen />
      </ButteryProvider>,
    );
    expect(groupHead("Get paid").getAttribute("aria-expanded")).toBe("true");
    expect(groupHead("Take orders").getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("draws a done task's circle filled with its check knocked out, and a task to do as a ring", () => {
    render(<Guide defaultOpen />);
    const circle = (title: string): SVGCircleElement => {
      const element = within(guide())
        .getByText(title)
        .closest('[data-bt-part="setup-guide-step"]')
        ?.querySelector<SVGCircleElement>(
          '[data-bt-part="setup-guide-check"] circle',
        );
      if (!element) throw new Error(`No check for ${title}.`);
      return element;
    };
    const done = circle("Add your first coffee");
    const doneIcon = done.closest("svg");
    if (!doneIcon) throw new Error("No icon.");
    expect(getComputedStyle(done).fill).toBe(getComputedStyle(doneIcon).color);
    expect(getComputedStyle(circle("Connect your bank")).fill).toBe("none");
  });

  it("shows its footer under a hairline only while it's unfolded", async () => {
    render(<Guide footer={<a href="#help">Ask support</a>} />);
    expect(
      within(guide()).queryByRole("link", {
        name: "Ask support",
      }),
    ).toBeNull();
    await userEvent.click(
      within(guide()).getByRole("button", { name: "Show all steps" }),
    );
    const link = await within(guide()).findByRole("link", {
      name: "Ask support",
    });
    const footer = link.closest('[data-bt-part="setup-guide-footer"]');
    if (!(footer instanceof HTMLElement)) throw new Error("No footer.");
    expect(getComputedStyle(footer).borderTopWidth).toBe("1px");
  });

  it("keeps a next task's button in its line, taking presses from a 24px band", () => {
    render(
      <Guide
        tasks={[
          { id: "coffee", title: "Add your first coffee", done: true },
          {
            id: "bank",
            title: "Connect your bank",
            action: { label: "Connect", onClick: () => undefined },
          },
        ]}
      />,
    );
    const button = within(guide()).getByRole("button", {
      name: "Connect your bank",
    });
    const line = button.closest('[data-bt-part="next"]');
    const hit = button.querySelector('[data-bt-part="hit"]');
    if (!line || !hit) throw new Error("No line or hit area.");
    const box = button.getBoundingClientRect();
    const around = line.getBoundingClientRect();
    expect(box.top).toBeGreaterThanOrEqual(around.top - 0.5);
    expect(box.bottom).toBeLessThanOrEqual(around.bottom + 0.5);
    expect(hit.getBoundingClientRect().height).toBe(24);
  });

  it("says it's all set once every task is done", () => {
    render(<Guide tasks={TASKS.map((task) => ({ ...task, done: true }))} />);
    expect(within(guide()).getByText("You're all set.")).toBeTruthy();
  });
});
