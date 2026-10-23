import "@buttery/core/styles.css";
import "../../styles.css";
import { isApplePlatform, publishSettled } from "@buttery/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode, createRef, useState } from "react";
import type { ReactElement } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import { page, userEvent } from "vitest/browser";
import { ContextMenu } from "./ContextMenu.tsx";

// The real pointer stays where an earlier test left it, and a menu drawn under it gets pointer events from the
// browser on top of the ones a test sends, so each test starts with it in the window's bottom-left corner.
async function parkPointer(): Promise<void> {
  const spot = document.createElement("div");
  spot.style.cssText =
    "position: fixed; left: 0; bottom: 0; width: 4px; height: 4px";
  document.body.append(spot);
  await userEvent.hover(spot, { force: true });
  spot.remove();
}

beforeEach(async () => {
  publishSettled();
  await parkPointer();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
});

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

const MOD = isApplePlatform() ? "Meta" : "Control";

function File({
  onDuplicate = () => undefined,
  onRename = () => undefined,
  onOpenChange,
}: {
  readonly onDuplicate?: () => void;
  readonly onRename?: () => void;
  readonly onOpenChange?: (open: boolean) => void;
}): ReactElement {
  return (
    <>
      <button type="button">Before</button>
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenu.Trigger asChild>
          <button
            type="button"
            style={{
              marginBlockStart: "40px",
              marginInlineStart: "40px",
              inlineSize: "120px",
              blockSize: "60px",
            }}
          >
            Roast plan.pdf
          </button>
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Roast plan.pdf">
          <ContextMenu.Item shortcut="mod+d" onSelect={onDuplicate}>
            Duplicate
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={onRename}>Rename</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item tone="danger" disabled>
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <button type="button">After</button>
    </>
  );
}

function file(): HTMLElement {
  return screen.getByRole("button", { name: "Roast plan.pdf" });
}

describe("ContextMenu", () => {
  it("opens where the pointer right-clicks, as a menu in the dropdown layer drawn as Menu draws one", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ContextMenu>
        <ContextMenu.Trigger
          style={{ inlineSize: "320px", blockSize: "160px" }}
          tabIndex={0}
          aria-label="Board"
        >
          Board
        </ContextMenu.Trigger>
        <ContextMenu.Content ref={ref} className="custom">
          <ContextMenu.Item>Paste</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const board = screen.getByText("Board");
    await userEvent.click(board, {
      button: "right",
      position: { x: 60, y: 30 },
    });
    const menu = await screen.findByRole("menu");
    expect(ref.current).toBe(menu);
    expect(menu.dataset["bt"]).toBe("ContextMenu");
    expect(menu.className).toBe("bt-surface bt-menu bt-context-menu custom");
    expect(menu.closest("[data-bt-layer]")?.getAttribute("data-bt-layer")).toBe(
      "dropdown",
    );
    expect(menu.style.transformOrigin).toBe(
      "var(--radix-context-menu-content-transform-origin)",
    );
    expect(getComputedStyle(menu).minWidth).toBe("200px");
    await settled();
    const box = menu.getBoundingClientRect();
    const area = board.getBoundingClientRect();
    expect(Math.round(box.left - area.left)).toBe(62);
    expect(Math.round(box.top - area.top)).toBe(30);
    const item = screen.getByRole("menuitem", { name: "Paste" });
    expect(item.offsetHeight).toBe(36);
  });

  it("stays 8px inside the window when the right-click is near its corner", async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger
          tabIndex={0}
          style={{
            position: "fixed",
            insetInlineEnd: "0",
            insetBlockEnd: "0",
            inlineSize: "120px",
            blockSize: "60px",
          }}
        >
          Corner
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Corner">
          <ContextMenu.Item>Paste</ContextMenu.Item>
          <ContextMenu.Item>Select all</ContextMenu.Item>
          <ContextMenu.Item>Arrange</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const corner = screen.getByText("Corner");
    const area = corner.getBoundingClientRect();
    await userEvent.click(corner, {
      button: "right",
      position: { x: area.width - 4, y: area.height - 4 },
    });
    const menu = await screen.findByRole("menu");
    await settled();
    const box = menu.getBoundingClientRect();
    expect(box.right).toBeLessThanOrEqual(window.innerWidth - 8);
    expect(box.bottom).toBeLessThanOrEqual(window.innerHeight - 8);
    expect(box.right).toBeLessThanOrEqual(area.right - 4);
  });

  it("scrolls a list taller than the window inside itself, 8px from its top and bottom", async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger tabIndex={0} aria-label="Fonts" role="region">
          Fonts
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Fonts">
          {Array.from({ length: 40 }, (_, index) => (
            <ContextMenu.Item
              key={index}
            >{`Font ${String(index + 1)}`}</ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu>,
    );
    screen.getByRole("region", { name: "Fonts" }).focus();
    await userEvent.keyboard("{ContextMenu}");
    const menu = await screen.findByRole("menu", { name: "Fonts" });
    await settled();
    const box = menu.getBoundingClientRect();
    expect(box.top).toBeGreaterThanOrEqual(8);
    expect(box.bottom).toBeLessThanOrEqual(window.innerHeight - 8);
    expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
  });

  it("slides over its point to stay 8px inside a window too narrow for it on either side, and so does a submenu", async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger
          tabIndex={0}
          aria-label="Slide"
          role="region"
          style={{ inlineSize: "100%", blockSize: "120px" }}
        >
          Slide
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Slide">
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>New slide after</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item>Title</ContextMenu.Item>
              <ContextMenu.Item>Title and points</ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    expect(window.innerWidth).toBeLessThan(2 * (200 + 2 + 8));
    screen.getByRole("region", { name: "Slide" }).focus();
    await userEvent.keyboard("{ContextMenu}");
    const menu = await screen.findByRole("menu", { name: "Slide" });
    await settled();
    const inside = (box: DOMRect): void => {
      expect(box.left).toBeGreaterThanOrEqual(8);
      expect(box.right).toBeLessThanOrEqual(window.innerWidth - 8);
    };
    inside(menu.getBoundingClientRect());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(screen.getAllByRole("menu")).toHaveLength(2);
    });
    await settled();
    const [, submenu] = screen.getAllByRole("menu");
    if (!submenu) throw new Error("No submenu.");
    inside(submenu.getBoundingClientRect());
  });

  it("moves back 8px inside the window when the window shrinks past where it opened", async () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    onTestFinished(async () => {
      await page.viewport(width, height);
    });
    render(
      <ContextMenu>
        <ContextMenu.Trigger
          tabIndex={0}
          aria-label="Board"
          role="region"
          style={{
            marginBlockStart: "300px",
            inlineSize: "200px",
            blockSize: "120px",
          }}
        >
          Board
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Board">
          <ContextMenu.Item>Paste</ContextMenu.Item>
          <ContextMenu.Item>Select all</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const board = screen.getByText("Board");
    await userEvent.click(board, {
      button: "right",
      position: { x: 20, y: 110 },
    });
    const menu = await screen.findByRole("menu", { name: "Board" });
    await settled();
    const opened = menu.getBoundingClientRect();
    await page.viewport(width, Math.round(opened.top - 40));
    await waitFor(() => {
      expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        window.innerHeight - 8,
      );
    });
    expect(menu.getBoundingClientRect().top).toBeGreaterThanOrEqual(8);
  });

  it("opens at its point under StrictMode, which attaches its refs twice", async () => {
    render(
      <StrictMode>
        <File />
      </StrictMode>,
    );
    file().focus();
    await userEvent.keyboard("{ContextMenu}");
    const menu = await screen.findByRole("menu");
    await settled();
    const button = file().getBoundingClientRect();
    expect(
      Math.abs(
        menu.getBoundingClientRect().left -
          (button.left + button.width / 2 + 2),
      ),
    ).toBeLessThanOrEqual(1);
  });

  it("opens at the focused element with Shift+F10, focus on its first item", async () => {
    render(<File />);
    file().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    const menu = await screen.findByRole("menu", { name: "Roast plan.pdf" });
    await settled();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Duplicate" }),
    );
    const box = menu.getBoundingClientRect();
    const button = file().getBoundingClientRect();
    expect(
      Math.abs(box.left - (button.left + button.width / 2 + 2)),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(box.top - (button.top + button.height / 2)),
    ).toBeLessThanOrEqual(1);
  });

  it("opens with the context-menu key", async () => {
    render(<File />);
    file().focus();
    await userEvent.keyboard("{ContextMenu}");
    expect(
      await screen.findByRole("menu", { name: "Roast plan.pdf" }),
    ).toBeTruthy();
    await settled();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Duplicate" }),
    );
  });

  it("opens at the option a focused list points at with aria-activedescendant", async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger asChild>
          <div
            role="listbox"
            aria-label="Slides"
            tabIndex={0}
            aria-activedescendant="slide-3"
            style={{ display: "flex", gap: "8px", inlineSize: "max-content" }}
          >
            {["slide-1", "slide-2", "slide-3"].map((id) => (
              <div
                key={id}
                id={id}
                role="option"
                aria-selected={id === "slide-3"}
                style={{ inlineSize: "60px", blockSize: "34px" }}
              >
                {id}
              </div>
            ))}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Slide 3">
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    screen.getByRole("listbox", { name: "Slides" }).focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    const menu = await screen.findByRole("menu", { name: "Slide 3" });
    await settled();
    const option = screen
      .getByRole("option", { name: "slide-3" })
      .getBoundingClientRect();
    expect(
      Math.abs(
        menu.getBoundingClientRect().left -
          (option.left + option.width / 2 + 2),
      ),
    ).toBeLessThanOrEqual(1);
  });

  it("moves through its items with the arrow keys, skips disabled ones, and chooses with Enter or Space", async () => {
    const onDuplicate = vi.fn();
    const onRename = vi.fn();
    render(<File onDuplicate={onDuplicate} onRename={onRename} />);
    file().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await screen.findByRole("menu");
    await settled();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Rename" }),
    );
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Duplicate" }),
    );
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Rename" }),
    );
    await userEvent.keyboard("{Enter}");
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(file());
    await userEvent.keyboard("{ContextMenu}");
    await screen.findByRole("menu");
    await settled();
    await userEvent.keyboard(" ");
    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(file());
  });

  it("closes on Escape with focus back where it was, the moment it starts to leave", async () => {
    const onOpenChange = vi.fn();
    render(<File onOpenChange={onOpenChange} />);
    file().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    const menu = await screen.findByRole("menu");
    await settled();
    await userEvent.keyboard("{Escape}");
    expect(menu.dataset["state"]).toBe("closed");
    expect(document.activeElement).toBe(file());
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.activeElement).toBe(file());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("puts focus back on the element inside the trigger that had it", async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger role="region" aria-label="Order">
          <span>Order 1042</span>
          <button type="button">Refund</button>
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Order 1042">
          <ContextMenu.Item>Resend receipt</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const refund = screen.getByRole("button", { name: "Refund" });
    refund.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    const menu = await screen.findByRole("menu", { name: "Order 1042" });
    await settled();
    const button = refund.getBoundingClientRect();
    expect(
      Math.abs(
        menu.getBoundingClientRect().left - (button.left + button.width / 2),
      ),
    ).toBeLessThanOrEqual(3);
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(refund);
  });

  it("puts focus back on its trigger after a right-click opened it", async () => {
    render(<File />);
    await userEvent.click(file(), { button: "right" });
    const menu = await screen.findByRole("menu");
    await settled();
    expect(menu.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(file());
  });

  it("takes focus again when it opens while it's still fading out", async () => {
    render(<File />);
    file().focus();
    await userEvent.keyboard("{ContextMenu}");
    const menu = await screen.findByRole("menu");
    await settled();
    await userEvent.keyboard("{Escape}");
    expect(menu.dataset["state"]).toBe("closed");
    await userEvent.keyboard("{ContextMenu}");
    expect(screen.getByRole("menu")).toBe(menu);
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("menuitem", { name: "Duplicate" }),
      );
    });
  });

  it("doesn't take focus back when a press elsewhere closes it", async () => {
    render(<File />);
    file().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await screen.findByRole("menu");
    await settled();
    await userEvent.click(screen.getByRole("button", { name: "Before" }));
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.activeElement).not.toBe(file());
  });

  it("moves to where a second right-click is, as one menu", async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger
          tabIndex={0}
          style={{ inlineSize: "300px", blockSize: "200px" }}
        >
          Canvas
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Canvas">
          <ContextMenu.Item>Paste</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const canvas = screen.getByText("Canvas");
    await userEvent.click(canvas, {
      button: "right",
      position: { x: 20, y: 20 },
    });
    await screen.findByRole("menu");
    await userEvent.click(canvas, {
      button: "right",
      position: { x: 40, y: 140 },
    });
    await settled();
    const menus = screen.getAllByRole("menu");
    expect(menus).toHaveLength(1);
    const area = canvas.getBoundingClientRect();
    const box = menus[0]?.getBoundingClientRect();
    expect(Math.round((box?.left ?? 0) - area.left)).toBe(42);
    expect(Math.round((box?.top ?? 0) - area.top)).toBe(140);
  });

  it("runs an item's shortcut while focus is in the trigger and the menu is closed, and nowhere else", async () => {
    const onDuplicate = vi.fn();
    render(<File onDuplicate={onDuplicate} />);
    screen.getByRole("button", { name: "After" }).focus();
    await userEvent.keyboard(`{${MOD}>}d{/${MOD}}`);
    expect(onDuplicate).not.toHaveBeenCalled();
    file().focus();
    await userEvent.keyboard(`{${MOD}>}d{/${MOD}}`);
    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    const duplicate = await screen.findByRole("menuitem", {
      name: "Duplicate",
    });
    expect(duplicate.getAttribute("aria-keyshortcuts")).toBe(
      isApplePlatform() ? "Meta+D" : "Control+D",
    );
    expect(
      duplicate.querySelector('[data-bt-part="shortcut"]')?.textContent,
    ).toBe(isApplePlatform() ? "⌘CommandD" : "CtrlD");
  });

  it("leaves a shortcut to a key handler inside the trigger that took the key, and to fields typed in", async () => {
    const onArchive = vi.fn();
    const onInside = vi.fn();
    render(
      <ContextMenu>
        <ContextMenu.Trigger aria-label="Order" role="region">
          <button
            type="button"
            onKeyDown={(event) => {
              if (event.key !== "a") return;
              event.preventDefault();
              onInside();
            }}
          >
            Refund
          </button>
          <input aria-label="Note" />
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Order">
          <ContextMenu.Item shortcut="a" onSelect={onArchive}>
            Archive
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    screen.getByRole("button", { name: "Refund" }).focus();
    await userEvent.keyboard("a");
    expect(onInside).toHaveBeenCalledTimes(1);
    expect(onArchive).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("textbox", { name: "Note" }));
    await userEvent.keyboard("a");
    expect(onArchive).not.toHaveBeenCalled();
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "Note" }).value,
    ).toBe("a");
  });

  it("drops a shortcut while its item is disabled", async () => {
    const onDuplicate = vi.fn();
    function Toggle(): ReactElement {
      const [locked, setLocked] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setLocked(true);
            }}
          >
            Lock
          </button>
          <ContextMenu>
            <ContextMenu.Trigger tabIndex={0} aria-label="Card" role="region">
              Card
            </ContextMenu.Trigger>
            <ContextMenu.Content aria-label="Card">
              <ContextMenu.Item
                shortcut="mod+d"
                disabled={locked}
                onSelect={onDuplicate}
              >
                Duplicate
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
        </>
      );
    }
    render(<Toggle />);
    const card = screen.getByRole("region", { name: "Card" });
    card.focus();
    await userEvent.keyboard(`{${MOD}>}d{/${MOD}}`);
    expect(onDuplicate).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Lock" }));
    card.focus();
    await userEvent.keyboard(`{${MOD}>}d{/${MOD}}`);
    expect(onDuplicate).toHaveBeenCalledTimes(1);
  });

  it("opens a submenu with ArrowRight, chooses in it, and ArrowLeft goes back", async () => {
    const onLayout = vi.fn();
    render(
      <ContextMenu>
        <ContextMenu.Trigger tabIndex={0} aria-label="Slide" role="region">
          Slide
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Slide">
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>New slide after</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item
                onSelect={() => {
                  onLayout("title");
                }}
              >
                Title
              </ContextMenu.Item>
              <ContextMenu.Item
                onSelect={() => {
                  onLayout("quote");
                }}
              >
                Quote
              </ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    screen.getByRole("region", { name: "Slide" }).focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await screen.findByRole("menu", { name: "Slide" });
    await settled();
    await userEvent.keyboard("{ArrowDown}");
    const item = screen.getByRole("menuitem", { name: "New slide after" });
    expect(document.activeElement).toBe(item);
    expect(item.getAttribute("aria-haspopup")).toBe("menu");
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("menuitem", { name: "Title" }),
      );
    });
    expect(item.getAttribute("aria-expanded")).toBe("true");
    const [, submenu] = screen.getAllByRole("menu");
    expect(submenu?.closest("[data-bt-layer]")).not.toBeNull();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => {
      expect(document.activeElement).toBe(item);
    });
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("menuitem", { name: "Title" }),
      );
    });
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onLayout).toHaveBeenCalledWith("quote");
    expect(document.activeElement).toBe(
      screen.getByRole("region", { name: "Slide" }),
    );
    const [, leaving] = screen.getAllByRole("menu");
    expect(leaving?.inert).toBe(true);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.activeElement).toBe(
      screen.getByRole("region", { name: "Slide" }),
    );
  });

  it("runs a shortcut of an item inside a submenu or a group", async () => {
    const onFront = vi.fn();
    render(
      <ContextMenu>
        <ContextMenu.Trigger tabIndex={0} aria-label="Note" role="region">
          Note
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Note">
          <ContextMenu.Group label="Order">
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger>Arrange</ContextMenu.SubTrigger>
              <ContextMenu.SubContent>
                <ContextMenu.Item shortcut="mod+]" onSelect={onFront}>
                  Bring to front
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Sub>
          </ContextMenu.Group>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    screen.getByRole("region", { name: "Note" }).focus();
    await userEvent.keyboard(`{${MOD}>}]{/${MOD}}`);
    expect(onFront).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("checks a checkbox item while it's on, flips it when chosen, and its shortcut flips it too", async () => {
    function Board(): ReactElement {
      const [grid, setGrid] = useState(false);
      return (
        <>
          <output>{grid ? "Grid shown" : "Grid hidden"}</output>
          <ContextMenu>
            <ContextMenu.Trigger tabIndex={0} aria-label="Board" role="region">
              Board
            </ContextMenu.Trigger>
            <ContextMenu.Content aria-label="Board">
              <ContextMenu.CheckboxItem
                shortcut="mod+'"
                checked={grid}
                onCheckedChange={setGrid}
              >
                Show the grid
              </ContextMenu.CheckboxItem>
            </ContextMenu.Content>
          </ContextMenu>
        </>
      );
    }
    render(<Board />);
    const board = screen.getByRole("region", { name: "Board" });
    board.focus();
    await userEvent.keyboard("{ContextMenu}");
    const item = await screen.findByRole("menuitemcheckbox", {
      name: "Show the grid",
    });
    expect(item.getAttribute("aria-checked")).toBe("false");
    expect(item.querySelector("svg")).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Grid shown")).toBeTruthy();
    await userEvent.keyboard("{ContextMenu}");
    const again = await screen.findByRole("menuitemcheckbox", {
      name: "Show the grid",
    });
    expect(again.getAttribute("aria-checked")).toBe("true");
    expect(again.querySelector('[data-bt-part="check"] svg')).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.activeElement).toBe(board);
    await userEvent.keyboard(`{${MOD}>}'{/${MOD}}`);
    expect(screen.getByText("Grid hidden")).toBeTruthy();
  });

  it("checks the chosen item in a radio group, named by its heading", async () => {
    const onValueChange = vi.fn();
    render(
      <ContextMenu>
        <ContextMenu.Trigger tabIndex={0} aria-label="Slide" role="region">
          Slide
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Slide">
          <ContextMenu.RadioGroup
            label="Layout"
            value="title"
            onValueChange={onValueChange}
          >
            <ContextMenu.RadioItem value="title">Title</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="quote">Quote</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    screen.getByRole("region", { name: "Slide" }).focus();
    await userEvent.keyboard("{ContextMenu}");
    expect(await screen.findByRole("group", { name: "Layout" })).toBeTruthy();
    expect(
      screen
        .getByRole("menuitemradio", { name: "Title" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Quote" }));
    expect(onValueChange).toHaveBeenCalledWith("quote");
  });

  it("leaves a disabled trigger to the browser's own menu, its keys and shortcuts", async () => {
    const onDuplicate = vi.fn();
    const left: boolean[] = [];
    const browserMenu = (event: MouseEvent): void => {
      left.push(!event.defaultPrevented);
    };
    document.addEventListener("contextmenu", browserMenu);
    render(
      <ContextMenu>
        <ContextMenu.Trigger asChild disabled>
          <button type="button">Locked file</button>
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Locked file">
          <ContextMenu.Item shortcut="mod+d" onSelect={onDuplicate}>
            Duplicate
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const locked = screen.getByRole("button", { name: "Locked file" });
    await userEvent.click(locked, { button: "right" });
    document.removeEventListener("contextmenu", browserMenu);
    expect(left).toEqual([true]);
    locked.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await userEvent.keyboard(`{${MOD}>}d{/${MOD}}`);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(onDuplicate).not.toHaveBeenCalled();
    expect(locked.hasAttribute("data-disabled")).toBe(true);
  });

  it("opens at the middle of its trigger when its owner opens it, and closes when its owner says", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            Show actions
          </button>
          <output>{open ? "open" : "closed"}</output>
          <ContextMenu open={open} onOpenChange={setOpen}>
            <ContextMenu.Trigger
              tabIndex={0}
              aria-label="Board"
              role="region"
              style={{ inlineSize: "300px", blockSize: "120px" }}
            >
              Board
            </ContextMenu.Trigger>
            <ContextMenu.Content aria-label="Board">
              <ContextMenu.Item
                onSelect={(event) => {
                  event.preventDefault();
                  setOpen(false);
                }}
              >
                Paste
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
        </>
      );
    }
    const warn = vi.spyOn(console, "warn");
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Show actions" }));
    const menu = await screen.findByRole("menu", { name: "Board" });
    expect(screen.getByText("open")).toBeTruthy();
    await settled();
    const board = screen
      .getByRole("region", { name: "Board" })
      .getBoundingClientRect();
    const box = menu.getBoundingClientRect();
    expect(
      Math.abs(box.left - (board.left + board.width / 2 + 2)),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(box.top - (board.top + board.height / 2)),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(screen.getByRole("menuitem", { name: "Paste" }));
    expect(screen.getByText("closed")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it("starts open at its trigger with defaultOpen", async () => {
    render(
      <ContextMenu defaultOpen>
        <ContextMenu.Trigger tabIndex={0} aria-label="Board" role="region">
          Board
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Board">
          <ContextMenu.Item>Paste</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const menu = await screen.findByRole("menu", { name: "Board" });
    await settled();
    const board = screen
      .getByRole("region", { name: "Board" })
      .getBoundingClientRect();
    expect(menu.getBoundingClientRect().top).toBeGreaterThan(board.top);
  });

  it("opens on a long press on touch", async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger tabIndex={0} aria-label="Photo" role="region">
          Photo
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Photo">
          <ContextMenu.Item>Save</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    const photo = screen.getByRole("region", { name: "Photo" });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    fireEvent.pointerDown(photo, {
      pointerType: "touch",
      clientX: 20,
      clientY: 20,
    });
    act(() => {
      vi.advanceTimersByTime(699);
    });
    expect(screen.queryByRole("menu")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    vi.useRealTimers();
    expect(await screen.findByRole("menu", { name: "Photo" })).toBeTruthy();
  });

  it("shows complete in its first frame and goes at once with entrance instant", async () => {
    render(
      <ContextMenu entrance="instant">
        <ContextMenu.Trigger tabIndex={0} aria-label="Row" role="region">
          Row
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Row">
          <ContextMenu.Item>Refund</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    screen.getByRole("region", { name: "Row" }).focus();
    await userEvent.keyboard("{ContextMenu}");
    const menu = await screen.findByRole("menu");
    expect(getComputedStyle(menu).opacity).toBe("1");
    expect(new DOMMatrix(getComputedStyle(menu).transform).a).toBe(1);
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("grows in from where it opened", async () => {
    render(<File />);
    file().focus();
    await userEvent.keyboard("{ContextMenu}");
    const menu = await screen.findByRole("menu");
    expect(new DOMMatrix(getComputedStyle(menu).transform).a).toBeLessThan(1);
    await settled();
    expect(new DOMMatrix(getComputedStyle(menu).transform).a).toBe(1);
  });

  it("says how to fix a trigger the keyboard can't reach", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <ContextMenu>
        <ContextMenu.Trigger>Plain words</ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Words">
          <ContextMenu.Item>Copy</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[buttery:ContextMenu\] The trigger <div> can't take focus .* Fix: give it tabIndex=\{0\}/,
      ),
    );
  });

  it("says how to fix a checkbox item whose shortcut has no checked state to flip", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <ContextMenu>
        <ContextMenu.Trigger tabIndex={0} aria-label="Board" role="region">
          Board
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Board">
          <ContextMenu.CheckboxItem shortcut="mod+'">
            Show the grid
          </ContextMenu.CheckboxItem>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[buttery:Menu\] The checkbox item "Show the grid" has a shortcut but keeps its own checked state.* Fix: keep it in state and pass checked and onCheckedChange\.$/,
      ),
    );
  });

  it("says how to fix a part rendered outside a ContextMenu", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<ContextMenu.Trigger>Orphan</ContextMenu.Trigger>),
    ).toThrow(
      /\[buttery:ContextMenu\] ContextMenu\.Trigger has to be inside a <ContextMenu>\. Fix:/,
    );
  });
});
