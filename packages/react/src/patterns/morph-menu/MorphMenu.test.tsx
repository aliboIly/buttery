import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled, watchFocusHistory } from "@butteryui/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import { userEvent as browser } from "vitest/browser";
import { MorphMenu } from "./MorphMenu.tsx";
import type { MorphMenuLayout } from "./MorphMenu.tsx";

// The real pointer stays where an earlier test left it, and a menu drawn under it gets pointer events from the
// browser on top of the ones a test fires, so each test starts with it in the window's bottom-left corner.
async function parkPointer(): Promise<void> {
  const spot = document.createElement("div");
  spot.style.cssText =
    "position: fixed; left: 0; bottom: 0; width: 4px; height: 4px";
  document.body.append(spot);
  await browser.hover(spot, { force: true });
  spot.remove();
}

beforeEach(async () => {
  publishSettled();
  await parkPointer();
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

/** Fakes the timers MorphMenu times the pointer with, `performance.now()` included. */
function fakeTime(): void {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
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
              href="#slides"
              title="Slides"
              caption="Layouts and notes"
            />
            <MorphMenu.Entry
              href="#themes"
              title="Themes"
              caption="Fonts and colors"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Item label="Guides" value="guides">
          <MorphMenu.Column title="Learn">
            <MorphMenu.Entry href="#first" title="Your first deck" />
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

/** Opens a trigger's menu and waits for its card to unfold to the menu's size. */
async function openCard(name: string): Promise<HTMLElement> {
  await userEvent.click(trigger(name));
  return waitFor(() => {
    const card = panel()?.querySelector<HTMLElement>('[data-bt-part="body"]');
    const content = document.querySelector(
      '[data-bt-part="content"][data-state="open"]',
    );
    if (!card || !content) throw new Error("No card yet.");
    const box = card.getBoundingClientRect();
    const size = content.getBoundingClientRect();
    if (
      Math.abs(box.width - size.width) > 1 ||
      Math.abs(box.height - size.height) > 1
    )
      throw new Error("The card hasn't unfolded yet.");
    return card;
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
    expect(await screen.findByRole("link", { name: /Slides/ })).toBeTruthy();
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

  it("opens a closed menu with the Down arrow, and the next Down arrow goes into it", async () => {
    menu();
    trigger("Guides").focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(trigger("Guides"));
    await screen.findByRole("link", { name: /Your first deck/ });
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("link", { name: /Your first deck/ }),
      );
    });
  });

  it("opens once the pointer has rested on a trigger for 150ms", () => {
    menu();
    fakeTime();
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

  it("closes 100ms after the pointer leaves", () => {
    menu();
    fakeTime();
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

  it("stays closed after a click or Escape closes it while a hover was still timing, until the pointer leaves", () => {
    menu();
    fakeTime();
    const product = trigger("Product");
    const pricing = screen.getByRole("link", { name: "Pricing" });
    pointTo(product);
    advance(50);
    act(() => {
      fireEvent.click(product);
    });
    expect(product.getAttribute("aria-expanded")).toBe("true");
    act(() => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    expect(product.getAttribute("aria-expanded")).toBe("false");
    advance(300);
    expect(product.getAttribute("aria-expanded")).toBe("false");
    fireEvent.pointerMove(product, { pointerType: "mouse", bubbles: true });
    advance(300);
    expect(product.getAttribute("aria-expanded")).toBe("false");
    pointTo(pricing, product);
    pointTo(product, pricing);
    advance(149);
    expect(product.getAttribute("aria-expanded")).toBe("false");
    advance(1);
    expect(product.getAttribute("aria-expanded")).toBe("true");
    act(() => {
      fireEvent.click(product);
    });
    advance(300);
    expect(product.getAttribute("aria-expanded")).toBe("false");
  });

  it("reopens at once within 300ms of a close by the pointer leaving, and only then", () => {
    menu();
    fakeTime();
    const pricing = screen.getByRole("link", { name: "Pricing" });
    pointTo(trigger("Product"));
    advance(150);
    pointTo(pricing, trigger("Product"));
    advance(100);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
    advance(199);
    pointTo(trigger("Guides"), pricing);
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("true");
    pointTo(pricing, trigger("Guides"));
    advance(100);
    advance(300);
    pointTo(trigger("Guides"), pricing);
    advance(149);
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("false");
    advance(1);
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("true");
  });

  it("waits for the hover intent again after a click or Escape closes a menu", () => {
    menu();
    fakeTime();
    const product = trigger("Product");
    act(() => {
      fireEvent.click(product);
    });
    expect(product.getAttribute("aria-expanded")).toBe("true");
    act(() => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    expect(product.getAttribute("aria-expanded")).toBe("false");
    advance(50);
    pointTo(trigger("Guides"));
    advance(149);
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("false");
    advance(1);
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("true");
    act(() => {
      fireEvent.click(trigger("Guides"));
    });
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("false");
    pointTo(product, trigger("Guides"));
    advance(149);
    expect(product.getAttribute("aria-expanded")).toBe("false");
    advance(1);
    expect(product.getAttribute("aria-expanded")).toBe("true");
  });

  it("waits for the hover intent again after a click and an Escape follow a close by the pointer leaving", () => {
    menu();
    fakeTime();
    const pricing = screen.getByRole("link", { name: "Pricing" });
    pointTo(trigger("Product"));
    advance(150);
    pointTo(pricing, trigger("Product"));
    advance(100);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
    act(() => {
      fireEvent.click(trigger("Guides"));
    });
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("true");
    act(() => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("false");
    pointTo(trigger("Product"), pricing);
    advance(149);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
    advance(1);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
  });

  it("leaves a menu open while keyboard focus is in it, whatever the pointer does", async () => {
    onTestFinished(watchFocusHistory());
    menu();
    await userEvent.click(trigger("Product"));
    const slides = await screen.findByRole("link", { name: /Slides/ });
    await browser.keyboard("{Shift}");
    slides.focus();
    const pricing = screen.getByRole("link", { name: "Pricing" });
    pointTo(trigger("Product"));
    pointTo(pricing, trigger("Product"));
    await wait(200);
    pointTo(trigger("Guides"), pricing);
    await wait(200);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
    expect(trigger("Guides").getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(slides);
  });

  it("hands focus a click left in the menu back to its trigger when the pointer closes it", async () => {
    onTestFinished(watchFocusHistory());
    menu();
    await userEvent.click(trigger("Product"));
    const all = await screen.findByRole("link", { name: "See all" });
    fireEvent.pointerDown(all);
    all.focus();
    const pricing = screen.getByRole("link", { name: "Pricing" });
    pointTo(trigger("Product"));
    pointTo(pricing, trigger("Product"));
    await waitFor(() => {
      expect(trigger("Product").getAttribute("aria-expanded")).toBe("false");
    });
    expect(document.activeElement).toBe(trigger("Product"));
  });

  it("hands focus a click left in the menu to the next menu's trigger when the pointer switches to it", async () => {
    onTestFinished(watchFocusHistory());
    menu();
    await userEvent.click(trigger("Product"));
    const all = await screen.findByRole("link", { name: "See all" });
    fireEvent.pointerDown(all);
    all.focus();
    pointTo(trigger("Guides"), all);
    await waitFor(() => {
      expect(trigger("Guides").getAttribute("aria-expanded")).toBe("true");
    });
    expect(document.activeElement).toBe(trigger("Guides"));
  });

  it("stays open while the pointer crosses from its trigger into the panel, however slowly", () => {
    menu();
    fakeTime();
    pointTo(trigger("Product"));
    advance(150);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
    const reach = document.querySelector('[data-bt-part="reach"]');
    if (!reach) throw new Error("No panel.");
    pointTo(reach, trigger("Product"));
    advance(400);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
  });

  it("opens its card 8px under the row, centered under its trigger and inside the row, never over a trigger", async () => {
    menu();
    const card = await openCard("Guides");
    const row = screen.getByTestId("menu").getBoundingClientRect();
    const box = card.getBoundingClientRect();
    expect(box.top).toBe(row.bottom + 8);
    expect(box.left).toBeGreaterThanOrEqual(row.left);
    expect(box.right).toBeLessThanOrEqual(row.right + 0.5);
    const target = trigger("Guides").getBoundingClientRect();
    const center = target.left + target.width / 2;
    const clamped = Math.min(
      Math.max(center - box.width / 2, row.left),
      row.right - box.width,
    );
    expect(Math.abs(box.left - clamped)).toBeLessThanOrEqual(1);
    expect(getComputedStyle(card).boxShadow).not.toBe("none");
    expect(getComputedStyle(panel() ?? card).backgroundColor).toBe(
      "rgba(0, 0, 0, 0)",
    );
    const stops = [
      trigger("Product"),
      trigger("Guides"),
      screen.getByRole("link", { name: "Pricing" }),
    ];
    for (const stop of stops) {
      const { left, top, width, height } = stop.getBoundingClientRect();
      expect(
        stop.contains(
          document.elementFromPoint(left + width / 2, top + height / 2),
        ),
        stop.textContent,
      ).toBe(true);
    }
  });

  it("lines its footer link up with the words of the entries above it", async () => {
    menu();
    const card = await openCard("Product");
    const startOf = (element: Element): number => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects()[0]?.left ?? Number.NaN;
    };
    const entry = within(card).getByText("Slides");
    const footer = within(card).getByRole("link", { name: "See all" });
    expect(Math.abs(startOf(footer) - startOf(entry))).toBeLessThanOrEqual(1);
  });

  it("keeps the pointer inside the menu all the way from its trigger down to the card", async () => {
    menu();
    const card = await openCard("Guides");
    const target = trigger("Guides").getBoundingClientRect();
    const x = target.left + target.width / 2;
    const top = card.getBoundingClientRect().top;
    for (let y = target.top + 1; y < top + 4; y += 2) {
      const hit = document.elementFromPoint(x, y);
      expect(
        trigger("Guides").contains(hit) || (panel()?.contains(hit) ?? false),
        `at ${String(y)}`,
      ).toBe(true);
    }
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
    await screen.findByRole("link", { name: /Slides/ });
    trigger("Product").focus();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: /Slides/ }),
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

  it("takes Tab past the last menu's last link to what follows the menu", async () => {
    render(
      <div>
        <MorphMenu>
          <MorphMenu.Item label="Guides" value="guides">
            <MorphMenu.Column>
              <MorphMenu.Entry href="#first" title="Your first deck" />
            </MorphMenu.Column>
          </MorphMenu.Item>
        </MorphMenu>
        <button type="button">After the menu</button>
      </div>,
    );
    await userEvent.click(trigger("Guides"));
    await screen.findByRole("link", { name: /Your first deck/ });
    trigger("Guides").focus();
    // The browser's own Tab, so its tab order (not a simulation of it) decides where focus goes.
    await browser.keyboard("{Tab}");
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: /Your first deck/ }),
    );
    await browser.keyboard("{Tab}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After the menu" }),
    );
  });

  it("keeps Radix's hidden focus sentinel out of the tab order", async () => {
    menu();
    await userEvent.click(trigger("Product"));
    await screen.findByRole("link", { name: /Slides/ });
    const sentinel = trigger("Product").nextElementSibling;
    expect(sentinel?.getAttribute("aria-hidden")).toBe("true");
    expect(sentinel?.getAttribute("tabindex")).toBe("-1");
  });

  it("closes when an entry is chosen", async () => {
    menu();
    await userEvent.click(trigger("Product"));
    await userEvent.click(await screen.findByRole("link", { name: /Themes/ }));
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
    expect(screen.getByRole("link", { name: /Slides/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Pricing" })).toBeTruthy();
    await userEvent.click(trigger("Guides"));
    expect(section.getAttribute("aria-expanded")).toBe("false");
  });
});
