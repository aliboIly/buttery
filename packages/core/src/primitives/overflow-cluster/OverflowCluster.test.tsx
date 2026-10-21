import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { Inbox } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OverflowCluster } from "./OverflowCluster.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ACTIONS = [
  { label: "Undo", priority: 3 },
  { label: "Redo", priority: 3 },
  { label: "Share", priority: 1 },
  { label: "Help", priority: 0 },
] as const;

function Toolbar({
  width,
  onSelect,
}: {
  readonly width: number;
  readonly onSelect: (label: string) => void;
}): ReactElement {
  return (
    <div style={{ display: "flex", inlineSize: `${String(width)}px` }}>
      <OverflowCluster gap={1} moreLabel="More actions">
        {ACTIONS.map(({ label, priority }) => (
          <OverflowCluster.Item
            key={label}
            priority={priority}
            menuItem={{
              label,
              onSelect: () => {
                onSelect(label);
              },
            }}
          >
            <button
              type="button"
              style={{ inlineSize: "60px", blockSize: "36px" }}
            >
              {label}
            </button>
          </OverflowCluster.Item>
        ))}
      </OverflowCluster>
    </div>
  );
}

describe("OverflowCluster", () => {
  it("shows every item and no More button when there's room", () => {
    render(<Toolbar width={400} onSelect={vi.fn()} />);
    for (const { label } of ACTIONS)
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "More actions" })).toBeNull();
  });

  it("moves the lowest-priority items into the More menu without overflowing", async () => {
    const onSelect = vi.fn();
    render(<Toolbar width={200} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Help" })).toBeNull();
    });
    expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    const cluster = screen
      .getByRole("button", { name: "Undo" })
      .closest<HTMLElement>("[data-bt=OverflowCluster]");
    expect(cluster && cluster.scrollWidth <= cluster.clientWidth).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "More actions" }));
    const items = await screen.findAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(["Share", "Help"]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Help" }));
    expect(onSelect).toHaveBeenCalledWith("Help");
  });

  it("sizes the More button to match its items", async () => {
    render(
      <div style={{ display: "flex", inlineSize: "60px" }}>
        <OverflowCluster size="sm" moreLabel="More actions">
          {["Undo", "Redo", "Help"].map((label) => (
            <OverflowCluster.Item
              key={label}
              menuItem={{ label, onSelect: vi.fn() }}
            >
              <button
                type="button"
                style={{ inlineSize: "40px", blockSize: "28px" }}
              >
                {label}
              </button>
            </OverflowCluster.Item>
          ))}
        </OverflowCluster>
      </div>,
    );
    const more = await screen.findByRole("button", { name: "More actions" });
    const rect = more.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([28, 28]);
    expect(getComputedStyle(more).transitionProperty.split(", ")).toEqual(
      expect.arrayContaining(["scale", "background-color", "color"]),
    );
  });

  it("keeps one observer while its items re-render with new menu entries", async () => {
    const Native = window.ResizeObserver;
    let built = 0;
    window.ResizeObserver = class extends Native {
      constructor(callback: ResizeObserverCallback) {
        super(callback);
        built += 1;
      }
    };
    function Ticking(): ReactElement {
      const [count, setCount] = useState(0);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setCount(count + 1);
            }}
          >
            Tick
          </button>
          <OverflowCluster
            moreLabel="More actions"
            style={{ inlineSize: "400px" }}
          >
            {ACTIONS.map(({ label, priority }) => (
              <OverflowCluster.Item
                key={label}
                priority={priority}
                menuItem={{
                  label: `${label} ${String(count)}`,
                  onSelect: () => undefined,
                }}
              >
                <button type="button">{label}</button>
              </OverflowCluster.Item>
            ))}
          </OverflowCluster>
        </>
      );
    }
    try {
      render(<Ticking />);
      const before = built;
      for (let tick = 0; tick < 6; tick += 1) {
        await userEvent.click(screen.getByRole("button", { name: "Tick" }));
      }
      expect(built - before).toBe(0);
    } finally {
      window.ResizeObserver = Native;
    }
  });

  it("passes refs and props through to an item's element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <OverflowCluster>
        <OverflowCluster.Item
          ref={ref}
          className="custom"
          data-testid="item"
          menuItem={{ label: "Undo", onSelect: vi.fn() }}
        >
          <button type="button">Undo</button>
        </OverflowCluster.Item>
      </OverflowCluster>,
    );
    expect(ref.current).toBe(screen.getByTestId("item"));
    expect(ref.current?.className).toBe("custom");
    expect(ref.current?.dataset["btPart"]).toBe("item");
  });

  it("says how to fix an item rendered outside a cluster", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(
        <OverflowCluster.Item menuItem={{ label: "Undo", onSelect: vi.fn() }}>
          <button type="button">Undo</button>
        </OverflowCluster.Item>,
      ),
    ).toThrow(
      /\[buttery:OverflowCluster\] OverflowCluster\.Item has to be inside an <OverflowCluster>\. Fix:/,
    );
  });

  it("brings items back as the row grows", async () => {
    const { rerender } = render(<Toolbar width={150} onSelect={vi.fn()} />);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Redo" })).toBeNull();
    });
    rerender(<Toolbar width={400} onSelect={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Redo" })).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: "More actions" })).toBeNull();
  });

  it("lists only the items that say they're chosen as radio items, the rest keeping their icons, shortcuts and dots", async () => {
    render(
      <div style={{ display: "flex", inlineSize: "60px" }}>
        <OverflowCluster gap={1} moreLabel="More views">
          <OverflowCluster.Item
            priority={1}
            menuItem={{ label: "Unpaid", selected: true, onSelect: vi.fn() }}
          >
            <button type="button" style={{ inlineSize: "80px" }}>
              Unpaid
            </button>
          </OverflowCluster.Item>
          <OverflowCluster.Item
            menuItem={{
              label: "Inbox",
              icon: Inbox,
              shortcut: "i",
              dot: true,
              onSelect: vi.fn(),
            }}
          >
            <button type="button" style={{ inlineSize: "80px" }}>
              Inbox
            </button>
          </OverflowCluster.Item>
        </OverflowCluster>
      </div>,
    );
    const more = await screen.findByRole("button", { name: "More views, new" });
    expect(more.querySelector('[data-bt-part="dot"]')).not.toBeNull();
    await userEvent.click(more);
    const chosen = await screen.findByRole("menuitemradio", { name: "Unpaid" });
    expect(chosen.getAttribute("aria-checked")).toBe("true");
    const inbox = screen.getByRole("menuitem", { name: "Inbox, new" });
    expect(inbox.getAttribute("aria-keyshortcuts")).toBe("I");
    expect(inbox.querySelector("svg")).not.toBeNull();
  });

  it("closes the More menu when everything fits, so it doesn't open by itself later", async () => {
    const { rerender } = render(<Toolbar width={150} onSelect={vi.fn()} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "More actions" }),
    );
    expect(await screen.findByRole("menu")).toBeTruthy();
    rerender(<Toolbar width={400} onSelect={vi.fn()} />);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "More actions" })).toBeNull();
    });
    rerender(<Toolbar width={150} onSelect={vi.fn()} />);
    expect(
      await screen.findByRole("button", { name: "More actions" }),
    ).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
