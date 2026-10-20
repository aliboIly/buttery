import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OverflowCluster } from "./OverflowCluster.tsx";

afterEach(cleanup);

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
});
