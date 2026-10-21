import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MorphMenu } from "./MorphMenu.tsx";
import type { MorphMenuLayout } from "./MorphMenu.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

/** Moves a mouse pointer onto `target`, out of `from` when it was on something else. */
function pointTo(target: Element, from?: Element): void {
  const mouse = { pointerType: "mouse", bubbles: true };
  if (from) fireEvent.pointerOut(from, { ...mouse, relatedTarget: target });
  fireEvent.pointerOver(target, { ...mouse, relatedTarget: from ?? null });
  fireEvent.pointerMove(target, mouse);
}

/** Moves fake time on, flushing what the timers set off. */
function advance(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function menu(layout: MorphMenuLayout = "bar"): void {
  render(
    <div style={{ inlineSize: "900px", paddingBlockEnd: "400px" }}>
      <MorphMenu layout={layout} data-testid="menu">
        <MorphMenu.Item
          label="Product"
          value="product"
          footer={<a href="#all">See all</a>}
        >
          <MorphMenu.Column title="Make">
            <MorphMenu.Entry
              href="#cards"
              title="Cards"
              caption="Titles, finishes and leans"
            />
            <MorphMenu.Entry
              href="#backdrops"
              title="Backdrops"
              caption="Blends and pictures"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Item label="Guides" value="guides">
          <MorphMenu.Column title="Learn">
            <MorphMenu.Entry href="#first" title="Your first card" />
          </MorphMenu.Column>
          <MorphMenu.Column title="Ideas">
            <MorphMenu.Entry href="#launch" title="Launch day" />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
      </MorphMenu>
    </div>,
  );
}

function trigger(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function panel(): HTMLElement | null {
  return document.querySelector('[data-bt-part="panel"]');
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("MorphMenu", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(<MorphMenu ref={ref} className="custom" data-testid="menu" />);
    expect(ref.current?.dataset["bt"]).toBe("MorphMenu");
    expect(ref.current?.dataset["testid"]).toBe("menu");
    expect(ref.current?.className).toContain("bt-morph-menu custom");
  });

  it("is a navigation named Main that opens a menu from its trigger and closes it on Escape, back on the trigger", async () => {
    menu();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
    await userEvent.click(trigger("Product"));
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
    expect(await screen.findByRole("link", { name: /Cards/ })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger("Product"));
    // The fold runs on animation frames, which a busy test browser can hold back for a moment.
    await waitFor(
      () => {
        expect(panel()).toBeNull();
      },
      { timeout: 3000 },
    );
  });

  it("opens once the pointer has rested on a trigger for 150ms", () => {
    menu();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    pointTo(trigger("Product"));
    advance(149);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
    advance(1);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
  });

  it("switches to another menu at once while one is open", async () => {
    menu();
    const user = userEvent.setup();
    await user.click(trigger("Product"));
    await user.hover(trigger("Guides"));
    await wait(40);
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("true");
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
  });

  it("closes 100ms after the pointer leaves, before Radix's own 150ms", () => {
    menu();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const pricing = screen.getByRole("link", { name: "Pricing" });
    pointTo(trigger("Product"));
    advance(150);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
    pointTo(pricing, trigger("Product"));
    advance(99);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
    advance(1);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
  });

  it("reaches up behind the triggers without covering them, centered under its trigger and inside the row", async () => {
    menu();
    await userEvent.click(trigger("Guides"));
    await waitFor(() => {
      const surface = panel();
      if (!surface) throw new Error("No panel.");
      const row = screen.getByTestId("menu").getBoundingClientRect();
      const box = surface.getBoundingClientRect();
      const target = trigger("Guides").getBoundingClientRect();
      expect(box.top).toBe(row.top);
      expect(box.left).toBeGreaterThanOrEqual(row.left);
      expect(box.right).toBeLessThanOrEqual(row.right + 0.5);
      const center = target.left + target.width / 2;
      const clamped = Math.min(
        Math.max(center - box.width / 2, row.left),
        row.right - box.width,
      );
      expect(Math.abs(box.left - clamped)).toBeLessThanOrEqual(1);
    });
    await settled();
    const target = trigger("Guides").getBoundingClientRect();
    const hit = document.elementFromPoint(
      target.left + target.width / 2,
      target.top + target.height / 2,
    );
    expect(trigger("Guides").contains(hit)).toBe(true);
  });

  it("unfolds to the open menu's size below the row", async () => {
    menu();
    await userEvent.click(trigger("Product"));
    await waitFor(() => {
      const surface = panel();
      const content = document.querySelector(
        '[data-bt-part="content"][data-state="open"]',
      );
      if (!surface || !content) throw new Error("No panel.");
      const body = surface.querySelector('[data-bt-part="body"]');
      const size = content.getBoundingClientRect();
      expect(
        Math.abs((body?.getBoundingClientRect().height ?? 0) - size.height),
      ).toBeLessThan(1);
      expect(
        Math.abs(surface.getBoundingClientRect().width - size.width),
      ).toBeLessThan(1);
    });
  });

  it("takes Tab from an open trigger into its menu, back to the trigger, and on to the next trigger", async () => {
    menu();
    const user = userEvent.setup();
    await user.click(trigger("Product"));
    await screen.findByRole("link", { name: /Cards/ });
    trigger("Product").focus();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: /Cards/ }),
    );
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(trigger("Product"));
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "See all" }),
    );
    await user.tab();
    expect(document.activeElement).toBe(trigger("Guides"));
  });

  it("keeps Radix's hidden focus sentinel out of the tab order", async () => {
    menu();
    await userEvent.click(trigger("Product"));
    await screen.findByRole("link", { name: /Cards/ });
    const sentinel = trigger("Product").nextElementSibling;
    expect(sentinel?.getAttribute("aria-hidden")).toBe("true");
    expect(sentinel?.getAttribute("tabindex")).toBe("-1");
  });

  it("closes when an entry is chosen", async () => {
    menu();
    await userEvent.click(trigger("Product"));
    await userEvent.click(
      await screen.findByRole("link", { name: /Backdrops/ }),
    );
    await waitFor(() => {
      expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("lists its menus as sections that open in place in a stack", async () => {
    menu("stack");
    const section = trigger("Product");
    expect(section.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(section);
    expect(section.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: /Cards/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Pricing" })).toBeTruthy();
    await userEvent.click(trigger("Guides"));
    expect(section.getAttribute("aria-expanded")).toBe("false");
  });
});
