import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Sizes({
  onOpenChange,
}: {
  readonly onOpenChange?: (open: boolean) => void;
}): ReactElement {
  return (
    <Popover onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          style={{ marginBlockStart: "40px", marginInlineStart: "40px" }}
        >
          Canvas size
        </button>
      </Popover.Trigger>
      <Popover.Content aria-label="Canvas sizes">
        <button type="button">Square</button>
        <Popover.Close>Done</Popover.Close>
      </Popover.Content>
    </Popover>
  );
}

describe("Popover", () => {
  it("opens from its trigger into the dropdown layer, 8px away", async () => {
    render(<Sizes />);
    const trigger = screen.getByRole("button", { name: "Canvas size" });
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.click(trigger);
    const content = screen.getByRole("dialog", { name: "Canvas sizes" });
    expect(
      content.closest("[data-bt-layer]")?.getAttribute("data-bt-layer"),
    ).toBe("dropdown");
    expect(content.dataset["level"]).toBe("floating");
    expect(
      content.getBoundingClientRect().top -
        trigger.getBoundingClientRect().bottom,
    ).toBe(8);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const onOpenChange = vi.fn();
    render(<Sizes onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Canvas size" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Canvas size" }),
    );
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <>
          <output>{open ? "open" : "closed"}</output>
          <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger>Trigger</Popover.Trigger>
            <Popover.Content aria-label="Panel">
              <Popover.Close>Close</Popover.Close>
            </Popover.Content>
          </Popover>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("dialog", { name: "Panel" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByText("closed")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("puts a scrim under the content that closes it", async () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Products</Popover.Trigger>
        <Popover.Content scrim="blur" aria-label="Products">
          <p>Card Studio</p>
        </Popover.Content>
      </Popover>,
    );
    const content = await screen.findByRole("dialog", { name: "Products" });
    const scrim = content
      .closest("[data-bt-layer]")
      ?.querySelector<HTMLElement>('[data-bt="Scrim"]');
    expect(scrim?.dataset["variant"]).toBe("blur");
    expect(
      scrim &&
        scrim.compareDocumentPosition(content) &
          Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const corner = {
      x: window.innerWidth - 4,
      y: window.innerHeight - 4,
    };
    expect(document.elementFromPoint(corner.x, corner.y)).toBe(scrim);
    await userEvent.pointer({ keys: "[MouseLeft]", coords: corner });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("says how to fix content rendered outside a Popover", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<Popover.Content aria-label="Orphan">Sizes</Popover.Content>),
    ).toThrow(
      /\[buttery:Popover\] Popover\.Content has to be inside a <Popover>\. Fix:/,
    );
  });

  it("scrolls inside instead of running past the viewport", async () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Trigger</Popover.Trigger>
        <Popover.Content aria-label="Long">
          <div style={{ blockSize: "4000px" }} />
        </Popover.Content>
      </Popover>,
    );
    const content = await screen.findByRole("dialog", { name: "Long" });
    const rect = content.getBoundingClientRect();
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight - 8);
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
  });
});
