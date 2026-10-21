import "../../styles/index.css";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as browser } from "vitest/browser";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publishSettled } from "../../motion/settle.ts";
import { FloatingEntranceContext } from "../floating-motion.tsx";
import { Popover } from "../popover/Popover.tsx";
import { Menu } from "./Menu.tsx";

beforeEach(() => {
  publishSettled();
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

function CardActions({
  onDuplicate = () => undefined,
  onOpenChange,
}: {
  readonly onDuplicate?: () => void;
  readonly onOpenChange?: (open: boolean) => void;
}): ReactElement {
  return (
    <>
      <Menu onOpenChange={onOpenChange}>
        <Menu.Trigger
          style={{ marginBlockStart: "40px", marginInlineStart: "240px" }}
        >
          Card actions
        </Menu.Trigger>
        <Menu.Content aria-label="Card actions">
          <Menu.Item onSelect={onDuplicate}>Duplicate</Menu.Item>
          <Menu.Item>Rename</Menu.Item>
          <Menu.Separator />
          <Menu.Item disabled>Delete</Menu.Item>
        </Menu.Content>
      </Menu>
      <button type="button">Export</button>
    </>
  );
}

function trigger(): HTMLElement {
  return screen.getByRole("button", { name: "Card actions" });
}

describe("Menu", () => {
  it("shows an item's shortcut and dot at its end, its name and aria-keyshortcuts saying so", async () => {
    render(
      <Menu>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item shortcut="e">Export</Menu.Item>
          <Menu.Item dot>Notifications</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const exporting = await screen.findByRole("menuitem", { name: "Export" });
    expect(exporting.getAttribute("aria-keyshortcuts")).toBe("E");
    const keys = exporting.querySelector<HTMLElement>(
      '[data-bt-part="shortcut"]',
    );
    expect(keys?.textContent).toBe("E");
    const label = exporting.querySelector<HTMLElement>(
      '[data-bt-part="label"]',
    );
    expect(keys?.offsetLeft).toBeGreaterThan(
      (label?.offsetLeft ?? 0) + (label?.offsetWidth ?? 0),
    );
    const notifications = screen.getByRole("menuitem", {
      name: "Notifications, new",
    });
    const dot = notifications.querySelector<HTMLElement>(
      '[data-bt-part="dot"]',
    );
    expect(dot?.offsetWidth).toBe(8);
    expect(getComputedStyle(dot ?? notifications).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  });

  it("opens as a menu in the dropdown layer, 8px from its trigger and lined up with its end", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Menu defaultOpen>
        <Menu.Trigger
          style={{ marginBlockStart: "40px", marginInlineStart: "240px" }}
        >
          Card actions
        </Menu.Trigger>
        <Menu.Content ref={ref} className="custom">
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    const menu = await screen.findByRole("menu");
    expect(ref.current).toBe(menu);
    expect(menu.dataset["bt"]).toBe("Menu");
    expect(menu.className).toBe("bt-surface bt-menu custom");
    expect(menu.closest("[data-bt-layer]")?.getAttribute("data-bt-layer")).toBe(
      "dropdown",
    );
    await settled();
    const box = menu.getBoundingClientRect();
    const anchor = trigger().getBoundingClientRect();
    expect(box.top - anchor.bottom).toBe(8);
    expect(Math.round(box.right)).toBe(Math.round(anchor.right));
  });

  it("grows in from its trigger's side", async () => {
    render(<CardActions />);
    await userEvent.click(trigger());
    const menu = screen.getByRole("menu");
    expect(new DOMMatrix(getComputedStyle(menu).transform).a).toBeLessThan(1);
    expect(menu.style.transformOrigin).toBe(
      "var(--radix-dropdown-menu-content-transform-origin)",
    );
    await settled();
    expect(new DOMMatrix(getComputedStyle(menu).transform).a).toBe(1);
  });

  it("moves through its items with the arrow keys, skips disabled ones, and chooses with Enter", async () => {
    const onDuplicate = vi.fn();
    render(<CardActions onDuplicate={onDuplicate} />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await settled();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Duplicate" }),
    );
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Rename" }),
    );
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger());
  });

  it("hands focus back the moment it closes, and lets presses through while it fades", async () => {
    render(<CardActions />);
    await userEvent.click(trigger());
    await settled();
    const menu = screen.getByRole("menu");
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger());
    expect(menu.dataset["state"]).toBe("closed");
    expect(getComputedStyle(menu).pointerEvents).toBe("none");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.activeElement).toBe(trigger());
  });

  it("reports one close for Escape, for choosing an item and for its trigger pressed again", async () => {
    const onOpenChange = vi.fn();
    render(<CardActions onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(trigger());
    await settled();
    await userEvent.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    await userEvent.click(trigger());
    await settled();
    await userEvent.click(trigger());
    expect(onOpenChange.mock.calls).toEqual([
      [true],
      [false],
      [true],
      [false],
      [true],
      [false],
    ]);
  });

  it("passes presses on its spot to the page while it fades out", async () => {
    render(<CardActions />);
    await userEvent.click(trigger());
    await settled();
    const box = screen.getByRole("menu").getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("menu").dataset["state"]).toBe("closed");
    const under = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    expect(under?.closest("[data-bt-layer]")).toBeNull();
  });

  it("hands focus back to its trigger when its owner closes it", async () => {
    function Owned(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Menu open={open} onOpenChange={setOpen}>
          <Menu.Trigger>Card actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item
              onSelect={(event) => {
                event.preventDefault();
                setOpen(false);
              }}
            >
              Duplicate
            </Menu.Item>
          </Menu.Content>
        </Menu>
      );
    }
    render(<Owned />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await settled();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Duplicate" }),
    );
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("menu").dataset["state"]).toBe("closed");
    expect(document.activeElement).toBe(trigger());
  });

  it("leaves focus where it went when Tab moves on as it fades", async () => {
    render(<CardActions />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.keyboard("{Escape}");
    await userEvent.tab();
    const exportButton = screen.getByRole("button", { name: "Export" });
    expect(document.activeElement).toBe(exportButton);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.activeElement).toBe(exportButton);
  });

  it("doesn't take focus back when a press elsewhere closes it", async () => {
    render(<CardActions />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.activeElement).not.toBe(trigger());
  });

  it("checks the chosen item in a radio group, named by its heading", async () => {
    const onValueChange = vi.fn();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Sort</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup
            label="Sort by"
            defaultValue="newest"
            onValueChange={onValueChange}
          >
            <Menu.RadioItem value="newest">Newest first</Menu.RadioItem>
            <Menu.RadioItem value="name">Name</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>,
    );
    expect(await screen.findByRole("group", { name: "Sort by" })).toBeTruthy();
    const newest = screen.getByRole("menuitemradio", { name: "Newest first" });
    expect(newest.getAttribute("aria-checked")).toBe("true");
    expect(newest.querySelector("svg")).not.toBeNull();
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Name" }));
    expect(onValueChange).toHaveBeenCalledWith("name");
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <output>{open ? "open" : "closed"}</output>
          <Menu open={open} onOpenChange={setOpen}>
            <Menu.Trigger>Card actions</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Duplicate</Menu.Item>
            </Menu.Content>
          </Menu>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(trigger());
    expect(screen.getByText("open")).toBeTruthy();
    await userEvent.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    expect(screen.getByText("closed")).toBeTruthy();
  });

  it("draws a danger item in danger, highlighted or not, and a disabled one as disabled", async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Conversation</Menu.Trigger>
        <Menu.Content aria-label="Conversation">
          <Menu.Item>Copy the link</Menu.Item>
          <Menu.Item tone="danger">Start over</Menu.Item>
          <Menu.Item tone="danger" disabled>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    const probe = document.createElement("span");
    probe.style.color = "var(--bt-danger)";
    document.body.append(probe);
    const danger = getComputedStyle(probe).color;
    probe.remove();
    const startOver = await screen.findByRole("menuitem", {
      name: "Start over",
    });
    expect(getComputedStyle(startOver).color).toBe(danger);
    expect(
      getComputedStyle(screen.getByRole("menuitem", { name: "Copy the link" }))
        .color,
    ).not.toBe(danger);
    expect(
      getComputedStyle(screen.getByRole("menuitem", { name: "Delete" })).color,
    ).not.toBe(danger);
    startOver.focus();
    await waitFor(() => {
      expect(startOver.hasAttribute("data-highlighted")).toBe(true);
    });
    expect(getComputedStyle(startOver).color).toBe(danger);
  });

  it("puts a separator between groups and a heading on a group", async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Export</Menu.Trigger>
        <Menu.Content>
          <Menu.Group label="Image">
            <Menu.Item>PNG</Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Item>Copy link</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    expect(await screen.findByRole("group", { name: "Image" })).toBeTruthy();
    expect(screen.getByRole("separator").offsetHeight).toBe(13);
  });

  it("says how to fix a part rendered outside a Menu", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Menu.Trigger>Orphan</Menu.Trigger>)).toThrow(
      /\[buttery:Menu\] Menu\.Trigger has to be inside a <Menu>\. Fix:/,
    );
  });

  it("shows complete in its first frame and goes at once with entrance instant", async () => {
    render(
      <Menu entrance="instant">
        <Menu.Trigger>Card actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(trigger());
    const menu = screen.getByRole("menu");
    expect(getComputedStyle(menu).opacity).toBe("1");
    expect(new DOMMatrix(getComputedStyle(menu).transform).a).toBe(1);
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("lets an Escape right after the one that closed it reach the layer beneath, with entrance instant", async () => {
    render(
      <Popover entrance="instant">
        <Popover.Trigger>Settings</Popover.Trigger>
        <Popover.Content aria-label="Settings">
          <Menu entrance="instant">
            <Menu.Trigger>Card actions</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Duplicate</Menu.Item>
            </Menu.Content>
          </Menu>
        </Popover.Content>
      </Popover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Settings" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Card actions" }),
    );
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("takes its entrance from around it unless it sets its own", async () => {
    render(
      <FloatingEntranceContext value="instant">
        <Menu>
          <Menu.Trigger>Card actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Duplicate</Menu.Item>
          </Menu.Content>
        </Menu>
        <Menu entrance="grow">
          <Menu.Trigger>Order actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Refund</Menu.Item>
          </Menu.Content>
        </Menu>
      </FloatingEntranceContext>,
    );
    await userEvent.click(trigger());
    expect(
      new DOMMatrix(getComputedStyle(screen.getByRole("menu")).transform).a,
    ).toBe(1);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Order actions" }),
    );
    expect(
      new DOMMatrix(getComputedStyle(screen.getByRole("menu")).transform).a,
    ).toBeLessThan(1);
  });

  function Workspaces({
    onSwitch = () => undefined,
  }: {
    readonly onSwitch?: (name: string) => void;
  }): ReactElement {
    return (
      <Menu>
        <Menu.Trigger>Workspace</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Settings</Menu.Item>
          <Menu.Sub>
            <Menu.SubTrigger>Switch workspace</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item
                onSelect={() => {
                  onSwitch("Harbor Beans");
                }}
              >
                Harbor Beans
              </Menu.Item>
              <Menu.Item>Northside Roasters</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>
    );
  }

  it("opens a submenu with ArrowRight beside its item, whose items act and close the menu", async () => {
    const onSwitch = vi.fn();
    render(<Workspaces onSwitch={onSwitch} />);
    await userEvent.click(screen.getByRole("button", { name: "Workspace" }));
    const item = screen.getByRole("menuitem", { name: "Switch workspace" });
    expect(item.getAttribute("aria-haspopup")).toBe("menu");
    item.focus();
    await userEvent.keyboard("{ArrowRight}");
    const [, submenu] = await screen.findAllByRole("menu");
    if (!submenu) throw new Error("No submenu.");
    expect(item.getAttribute("aria-expanded")).toBe("true");
    await settled();
    const first = screen.getByRole("menuitem", { name: "Harbor Beans" });
    expect(Math.round(first.getBoundingClientRect().top)).toBe(
      Math.round(item.getBoundingClientRect().top),
    );
    expect(submenu.getBoundingClientRect().left).toBeGreaterThan(
      item.getBoundingClientRect().right,
    );
    await userEvent.keyboard("{Enter}");
    expect(onSwitch).toHaveBeenCalledWith("Harbor Beans");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("opens a submenu once the pointer has rested on its item for 40ms", async () => {
    render(<Workspaces />);
    await userEvent.click(screen.getByRole("button", { name: "Workspace" }));
    const item = screen.getByRole("menuitem", { name: "Switch workspace" });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    fireEvent.pointerMove(item, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(39);
    });
    expect(item.getAttribute("aria-expanded")).toBe("false");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(item.getAttribute("aria-expanded")).toBe("true");
  });

  it("waits for the pointer to rest: each move on its item starts the 40ms again", async () => {
    render(<Workspaces />);
    await userEvent.click(screen.getByRole("button", { name: "Workspace" }));
    const item = screen.getByRole("menuitem", { name: "Switch workspace" });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    fireEvent.pointerMove(item, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(30);
    });
    fireEvent.pointerMove(item, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(item.getAttribute("aria-expanded")).toBe("false");
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(item.getAttribute("aria-expanded")).toBe("true");
  });

  it("leaves a submenu shut if its item loses its highlight before the delay ends", async () => {
    render(<Workspaces />);
    await userEvent.click(screen.getByRole("button", { name: "Workspace" }));
    const item = screen.getByRole("menuitem", { name: "Switch workspace" });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    fireEvent.pointerMove(item, { pointerType: "mouse" });
    act(() => {
      screen.getByRole("menuitem", { name: "Settings" }).focus();
    });
    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(item.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps a submenu open while the pointer crosses the next submenu's item on its way in", async () => {
    render(
      <Menu>
        <Menu.Trigger>Workspace</Menu.Trigger>
        <Menu.Content>
          <Menu.Sub>
            <Menu.SubTrigger>Switch workspace</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Harbor Beans</Menu.Item>
              <Menu.Item>Northside Roasters</Menu.Item>
              <Menu.Item>Southport Coffee</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Sub>
            <Menu.SubTrigger>Move to</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Archive</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Workspace" }));
    const workspaces = screen.getByRole("menuitem", {
      name: "Switch workspace",
    });
    const move = screen.getByRole("menuitem", { name: "Move to" });
    await browser.hover(workspaces);
    await waitFor(() => {
      expect(workspaces.getAttribute("aria-expanded")).toBe("true");
    });
    await settled();
    const from = workspaces.getBoundingClientRect();
    const target = screen
      .getByRole("menuitem", { name: "Southport Coffee" })
      .getBoundingClientRect();
    const crossing = move.getBoundingClientRect();
    const start = { x: from.right - 24, y: from.top + from.height / 2 };
    const end = { x: target.left + 24, y: target.top + target.height / 2 };
    const steps = 8;
    let crossed = false;
    for (let step = 1; step <= steps; step += 1) {
      const x = start.x + ((end.x - start.x) * step) / steps;
      const y = start.y + ((end.y - start.y) * step) / steps;
      crossed ||=
        x > crossing.left &&
        x < crossing.right &&
        y > crossing.top &&
        y < crossing.bottom;
      const page = document.documentElement.getBoundingClientRect();
      await browser.hover(document.documentElement, {
        position: { x: Math.round(x - page.left), y: Math.round(y - page.top) },
      });
    }
    expect(crossed).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(move.getAttribute("aria-expanded")).toBe("false");
    expect(workspaces.getAttribute("aria-expanded")).toBe("true");
  });

  it("never opens a disabled submenu on hover", async () => {
    render(
      <Menu>
        <Menu.Trigger>Workspace</Menu.Trigger>
        <Menu.Content>
          <Menu.Sub>
            <Menu.SubTrigger disabled>Switch workspace</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Harbor Beans</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Workspace" }));
    const item = screen.getByRole("menuitem", { name: "Switch workspace" });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    fireEvent.pointerMove(item, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(item.getAttribute("aria-expanded")).toBe("false");
  });

  it("follows a link item with Enter, running its click handler, and closes", async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(
      <Menu>
        <Menu.Trigger>Help</Menu.Trigger>
        <Menu.Content>
          <Menu.Link href="#guides" onClick={onClick}>
            Guides
          </Menu.Link>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Help" }));
    const link = screen.getByRole("menuitem", { name: "Guides" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("#guides");
    link.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
