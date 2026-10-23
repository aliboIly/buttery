import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";
import { Popover } from "../popover/Popover.tsx";
import { FloatingLanes, useFloatingObstacle } from "./FloatingLanes.tsx";
import { notifyObstacleMoved } from "./lanes-store.ts";

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

  it("stacks the bottom lanes as one column at the end when they'd touch, toasts above", async () => {
    await page.viewport(520, 800);
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item>
          <Toast>Saved</Toast>
        </FloatingLanes.Item>
        <FloatingLanes.Item lane="bottom-end">
          <div style={{ inlineSize: "288px", blockSize: "100px" }}>Guide</div>
        </FloatingLanes.Item>
      </>,
    );
    await waitFor(() => {
      const toast = screen.getByText("Saved").getBoundingClientRect();
      const guide = screen.getByText("Guide").getBoundingClientRect();
      expect(guide.top - toast.bottom).toBeCloseTo(8, 0);
      expect(toast.right).toBeCloseTo(guide.right, 0);
    });
    await page.viewport(1200, 800);
    await waitFor(() => {
      const toast = screen.getByText("Saved").getBoundingClientRect();
      const guide = screen.getByText("Guide").getBoundingClientRect();
      expect(toast.bottom).toBeCloseTo(guide.bottom, 0);
      expect(toast.left + toast.width / 2).toBeCloseTo(
        document.documentElement.clientWidth / 2,
        0,
      );
    });
  });

  it("keeps guidance under dialogs and notices above them", async () => {
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item>
          <Toast>Saved</Toast>
        </FloatingLanes.Item>
        <FloatingLanes.Item lane="bottom-end">
          <div style={{ inlineSize: "288px", blockSize: "100px" }}>Guide</div>
        </FloatingLanes.Item>
      </>,
    );
    const band = (text: string): string | null | undefined =>
      screen
        .getByText(text)
        .closest("[data-bt-layer]")
        ?.getAttribute("data-bt-layer");
    expect(await screen.findByText("Guide")).toBeTruthy();
    expect(band("Guide")).toBe("floating");
    expect(band("Saved")).toBe("toast");
  });

  it("clears a centered obstacle as soon as the lanes stop stacking", async () => {
    await page.viewport(520, 800);
    render(
      <>
        <FloatingLanes />
        <Toolbar />
        <FloatingLanes.Item>
          <Toast>Saved</Toast>
        </FloatingLanes.Item>
        <FloatingLanes.Item lane="bottom-end">
          <div style={{ inlineSize: "288px", blockSize: "100px" }}>Guide</div>
        </FloatingLanes.Item>
      </>,
    );
    await waitFor(() => {
      const toast = screen.getByText("Saved").getBoundingClientRect();
      const guide = screen.getByText("Guide").getBoundingClientRect();
      expect(toast.right).toBeCloseTo(guide.right, 0);
    });
    await page.viewport(1200, 800);
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    const toolbar = screen.getByTestId("toolbar").getBoundingClientRect();
    const toast = screen.getByText("Saved").getBoundingClientRect();
    expect(toast.bottom).toBeLessThanOrEqual(toolbar.top - 8 + 0.5);
  });

  it("publishes how far the bottom lanes reach, plus 8px, on <html>, and 0 while they're empty", async () => {
    const clearance = (): string =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--bt-lane-clearance",
      );
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item>
          <Toast>Saved</Toast>
        </FloatingLanes.Item>
      </>,
    );
    await waitFor(() => {
      expect(clearance()).toBe("68px");
    });
    cleanup();
    render(<FloatingLanes />);
    await waitFor(() => {
      expect(clearance()).toBe("0px");
    });
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

  it("moves the end lanes in past an obstacle that runs the window's height along its end, centering toasts in the room left", async () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    onTestFinished(async () => {
      await page.viewport(width, height);
    });
    await page.viewport(1200, 800);
    function Panel(): ReactElement {
      const obstacle = useFloatingObstacle();
      return (
        <div
          ref={obstacle}
          data-testid="panel"
          style={{
            position: "fixed",
            insetBlock: 0,
            insetInlineEnd: 0,
            inlineSize: "360px",
          }}
        />
      );
    }
    render(
      <>
        <FloatingLanes />
        <Panel />
        <FloatingLanes.Item lane="bottom-end">
          <Toast>Setup guide</Toast>
        </FloatingLanes.Item>
        <FloatingLanes.Item lane="top-end">
          <Toast>Saved</Toast>
        </FloatingLanes.Item>
        <FloatingLanes.Item>
          <Toast>Card deleted</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const panel = screen.getByTestId("panel").getBoundingClientRect();
    await waitFor(() => {
      const guide = screen.getByText("Setup guide").getBoundingClientRect();
      expect(panel.left - guide.right).toBe(24);
    });
    const saved = screen.getByText("Saved").getBoundingClientRect();
    expect(panel.left - saved.right).toBe(24);
    expect(saved.top).toBe(24);
    const toast = screen.getByText("Card deleted").getBoundingClientRect();
    expect(
      Math.abs((toast.left + toast.right) / 2 - panel.left / 2),
    ).toBeLessThanOrEqual(0.5);
  });

  it("moves the end lanes in past a tall obstacle in the window's end half that stops short of the edge, as a centered editor's inspector does", async () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    onTestFinished(async () => {
      await page.viewport(width, height);
    });
    await page.viewport(1280, 800);
    function Inspector(): ReactElement {
      const obstacle = useFloatingObstacle();
      return (
        <div
          ref={obstacle}
          data-testid="inspector"
          style={{
            position: "fixed",
            insetBlock: "8px",
            insetInlineEnd: "120px",
            inlineSize: "320px",
          }}
        />
      );
    }
    render(
      <>
        <FloatingLanes />
        <Inspector />
        <FloatingLanes.Item lane="bottom-end">
          <Toast>Setup guide</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const inspector = screen.getByTestId("inspector").getBoundingClientRect();
    await waitFor(() => {
      const guide = screen.getByText("Setup guide").getBoundingClientRect();
      expect(inspector.left - guide.right).toBe(24);
    });
  });

  it("lifts the lanes above a tall obstacle across the window's whole width, as a drawer is, rather than moving them in past it", async () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    onTestFinished(async () => {
      await page.viewport(width, height);
    });
    await page.viewport(1200, 800);
    function Drawer(): ReactElement {
      const obstacle = useFloatingObstacle();
      return (
        <div
          ref={obstacle}
          data-testid="drawer"
          style={{
            position: "fixed",
            insetInline: 0,
            insetBlockEnd: 0,
            blockSize: "600px",
          }}
        />
      );
    }
    render(
      <>
        <FloatingLanes />
        <Drawer />
        <FloatingLanes.Item lane="bottom-end">
          <Toast>Setup guide</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const drawer = screen.getByTestId("drawer").getBoundingClientRect();
    await waitFor(() => {
      const guide = screen.getByText("Setup guide").getBoundingClientRect();
      expect(drawer.top - guide.bottom).toBe(8);
    });
    const guide = screen.getByText("Setup guide").getBoundingClientRect();
    expect(1200 - guide.right).toBe(24);
  });

  it("takes in an obstacle that mounts inside a ResizeObserver callback without a ResizeObserver loop", async () => {
    const loops: string[] = [];
    const onError = (event: ErrorEvent): void => {
      if (event.message.includes("ResizeObserver loop"))
        loops.push(event.message);
    };
    window.addEventListener("error", onError);
    onTestFinished(() => {
      window.removeEventListener("error", onError);
    });
    function Panel(): ReactElement {
      const obstacle = useFloatingObstacle();
      return (
        <div
          ref={obstacle}
          data-testid="panel"
          style={{
            position: "fixed",
            insetBlock: 0,
            insetInlineEnd: 0,
            inlineSize: "320px",
          }}
        />
      );
    }
    function Switcher(): ReactElement {
      const box = useRef<HTMLDivElement>(null);
      const [wide, setWide] = useState(false);
      useLayoutEffect(() => {
        const element = box.current;
        if (!element) return undefined;
        const observer = new ResizeObserver(() => {
          flushSync(() => {
            setWide(element.clientWidth > 300);
          });
        });
        observer.observe(element);
        return () => {
          observer.disconnect();
        };
      }, []);
      // Deep in the page, as an app shell's header is, so the lanes it sets off are shallower than it.
      return (
        <div>
          <div>
            <div>
              <div>
                <div
                  ref={box}
                  data-testid="box"
                  style={{ inlineSize: "200px" }}
                >
                  {wide ? <Panel /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    render(
      <>
        <FloatingLanes />
        <Switcher />
        <FloatingLanes.Item lane="bottom-end">
          <Toast>Setup guide</Toast>
        </FloatingLanes.Item>
      </>,
    );
    screen.getByTestId("box").style.inlineSize = "400px";
    const panel = await screen.findByTestId("panel");
    await waitFor(() => {
      const guide = screen.getByText("Setup guide").getBoundingClientRect();
      expect(panel.getBoundingClientRect().left - guide.right).toBe(24);
    });
    expect(loops).toEqual([]);
  });

  it("follows an obstacle that moves without changing size once told", async () => {
    render(
      <>
        <FloatingLanes />
        <Toolbar />
        <FloatingLanes.Item>
          <Toast>Card deleted</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const toolbar = screen.getByTestId("toolbar");
    await waitFor(() => {
      const toast = screen.getByText("Card deleted").getBoundingClientRect();
      expect(toolbar.getBoundingClientRect().top - toast.bottom).toBe(8);
    });
    toolbar.style.insetBlockEnd = "96px";
    notifyObstacleMoved();
    await waitFor(() => {
      const toast = screen.getByText("Card deleted").getBoundingClientRect();
      expect(toolbar.getBoundingClientRect().top - toast.bottom).toBe(8);
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
