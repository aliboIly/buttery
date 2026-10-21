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

beforeEach(() => {
  for (const key of [
    "buttery:setup-guide:test-setup",
    "buttery:setup-guide-open:test-setup",
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

  it("says it's all set once every task is done", () => {
    render(<Guide tasks={TASKS.map((task) => ({ ...task, done: true }))} />);
    expect(within(guide()).getByText("You're all set.")).toBeTruthy();
  });
});
