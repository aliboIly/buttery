import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Popover } from "../popover/Popover.tsx";
import { FloatingLanes, useFloatingObstacle } from "./FloatingLanes.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Toast({ children }: { readonly children: string }): ReactElement {
  return (
    <div style={{ blockSize: "36px", inlineSize: "240px" }}>{children}</div>
  );
}

function Toolbar(): ReactElement {
  const obstacle = useFloatingObstacle();
  return (
    <div
      ref={obstacle}
      data-testid="toolbar"
      style={{
        position: "fixed",
        insetBlockEnd: "16px",
        insetInlineStart: "50%",
        inlineSize: "320px",
        blockSize: "48px",
        transform: "translateX(-50%)",
      }}
    />
  );
}

describe("FloatingLanes", () => {
  it("stacks items 8px apart, 24px above the bottom of the viewport", async () => {
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item>
          <Toast>Card deleted</Toast>
        </FloatingLanes.Item>
        <FloatingLanes.Item>
          <Toast>Exported</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const first = (
      await screen.findByText("Card deleted")
    ).getBoundingClientRect();
    const second = screen.getByText("Exported").getBoundingClientRect();
    expect(second.top - first.bottom).toBe(8);
    expect(window.innerHeight - second.bottom).toBe(24);
    expect(
      screen
        .getByText("Exported")
        .closest("[data-bt-layer]")
        ?.getAttribute("data-bt-layer"),
    ).toBe("toast");
  });

  it("moves a lane clear of a registered obstacle", async () => {
    render(
      <>
        <FloatingLanes />
        <Toolbar />
        <FloatingLanes.Item>
          <Toast>Card deleted</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const toolbar = screen.getByTestId("toolbar").getBoundingClientRect();
    await waitFor(() => {
      const toast = screen.getByText("Card deleted").getBoundingClientRect();
      expect(toolbar.top - toast.bottom).toBe(8);
    });
  });

  it("moves clear of an obstacle that mounts later", async () => {
    function Editor(): ReactElement {
      const [cropping, setCropping] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setCropping(true);
            }}
          >
            Crop
          </button>
          {cropping ? <Toolbar /> : null}
        </>
      );
    }
    render(
      <>
        <FloatingLanes />
        <Editor />
        <FloatingLanes.Item>
          <Toast>Card deleted</Toast>
        </FloatingLanes.Item>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Crop" }));
    const toolbar = screen.getByTestId("toolbar").getBoundingClientRect();
    await waitFor(() => {
      const toast = screen.getByText("Card deleted").getBoundingClientRect();
      expect(toolbar.top - toast.bottom).toBe(8);
    });
  });

  it("opens menus from a lane item above the lane", async () => {
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item>
          <Popover>
            <Popover.Trigger>Undo options</Popover.Trigger>
            <Popover.Content aria-label="Undo options">
              <p>Undo the deletion</p>
            </Popover.Content>
          </Popover>
        </FloatingLanes.Item>
      </>,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Undo options" }),
    );
    const menuLayer = screen
      .getByRole("dialog", { name: "Undo options" })
      .closest("[data-bt-layer]");
    const toastLayer = screen
      .getByRole("button", { name: "Undo options" })
      .closest("[data-bt-layer]");
    expect(menuLayer?.parentElement).toBe(toastLayer);
  });

  it("keeps an item with long text inside its lane, 24px from each side", async () => {
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item>
          <div className="bt-truncate" data-bt-truncate="">
            {"Exported 12 cards to the Downloads folder. ".repeat(12)}
          </div>
        </FloatingLanes.Item>
      </>,
    );
    const item = (
      await screen.findByText(/^Exported 12 cards/)
    ).getBoundingClientRect();
    expect(item.left).toBe(24);
    expect(window.innerWidth - item.right).toBe(24);
  });

  it("warns, with the fix, when a lane holds more than three items", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <>
        <FloatingLanes />
        {["One", "Two", "Three", "Four"].map((name) => (
          <FloatingLanes.Item key={name} lane="bottom-end">
            <Toast>{name}</Toast>
          </FloatingLanes.Item>
        ))}
      </>,
    );
    await screen.findByText("Four");
    expect(warn).toHaveBeenCalledWith(
      "[buttery:FloatingLanes] The bottom-end lane holds more than 3 items, so it can run off the screen. Fix: show toasts with toast() from @buttery/react, which keeps the newest three, or take older items out as new ones arrive.",
    );
  });

  it("puts items in the lane they ask for", async () => {
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item lane="top-end">
          <Toast>Update ready</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const notice = (
      await screen.findByText("Update ready")
    ).getBoundingClientRect();
    expect(notice.top).toBe(24);
    expect(window.innerWidth - notice.right).toBe(24);
  });
});
