import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publishSettled } from "../../motion/settle.ts";
import { FloatingEntranceContext } from "../floating-motion.tsx";
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
});
