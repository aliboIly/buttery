import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Trash2, Undo2 } from "lucide-react";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { HeaderBar } from "./HeaderBar.tsx";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-bt-platform");
});

function Editor({
  width,
  onCrop = () => undefined,
}: {
  readonly width: string;
  readonly onCrop?: () => void;
}): ReactElement {
  return (
    <div data-testid="frame" style={{ inlineSize: width }}>
      <HeaderBar
        title="Launch card"
        mark={<svg width="24" height="24" aria-hidden="true" />}
        dragRegion
      >
        <HeaderBar.Actions>
          <HeaderBar.Action label="Crop" priority={2} onSelect={onCrop} />
          <HeaderBar.Action label="Duplicate" onSelect={() => undefined} />
          <HeaderBar.Action
            label="Delete"
            icon={Trash2}
            iconOnly
            priority={1}
            onSelect={() => undefined}
          />
        </HeaderBar.Actions>
        <HeaderBar.Separator />
        <IconButton icon={Undo2} label="Undo" />
      </HeaderBar>
    </div>
  );
}

describe("HeaderBar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <HeaderBar
        ref={ref}
        title="Launch card"
        className="custom"
        data-testid="bar"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("HeaderBar");
    expect(ref.current?.className).toBe("bt-header-bar custom");
    expect(ref.current?.dataset["testid"]).toBe("bar");
  });

  it("is 56px tall with its 24px mark and title at the start and its actions at the end", () => {
    render(<Editor width="900px" />);
    const bar = document.querySelector<HTMLElement>('[data-bt="HeaderBar"]');
    expect(bar?.getBoundingClientRect().height).toBe(56);
    const mark = document.querySelector<HTMLElement>('[data-bt-part="mark"]');
    expect(mark?.getBoundingClientRect().width).toBe(24);
    const undo = screen
      .getByRole("button", { name: "Undo" })
      .getBoundingClientRect();
    expect(
      Math.round((bar?.getBoundingClientRect().right ?? 0) - undo.right),
    ).toBe(16);
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  it("folds its lowest-priority actions into a More menu as it narrows, and brings them back", async () => {
    const onCrop = vi.fn();
    const { rerender } = render(<Editor width="900px" onCrop={onCrop} />);
    expect(screen.queryByRole("button", { name: "More actions" })).toBeNull();
    rerender(<Editor width="300px" onCrop={onCrop} />);
    const more = await screen.findByRole("button", { name: "More actions" });
    expect(screen.queryByRole("button", { name: "Duplicate" })).toBeNull();
    await userEvent.click(more);
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Crop" }),
    );
    expect(onCrop).toHaveBeenCalledTimes(1);
    rerender(<Editor width="900px" onCrop={onCrop} />);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "More actions" })).toBeNull();
    });
    expect(screen.getByRole("button", { name: "Duplicate" })).toBeTruthy();
  });

  it("lets the desktop app drag its window from the bar and clears the window controls", () => {
    document.documentElement.setAttribute("data-bt-platform", "desktop");
    render(<Editor width="900px" />);
    const bar = document.querySelector<HTMLElement>('[data-bt="HeaderBar"]');
    expect(bar?.getAttribute("data-tauri-drag-region")).toBe("deep");
    expect(bar && getComputedStyle(bar).paddingInlineStart).toBe("84px");
  });

  it("separates groups with a decorative 1 × 24 line", () => {
    render(<Editor width="900px" />);
    const separator = document.querySelector<HTMLElement>(
      '[data-bt-part="separator"]',
    );
    const box = separator?.getBoundingClientRect();
    expect(box?.width).toBe(1);
    expect(box?.height).toBe(24);
    expect(separator?.getAttribute("role")).toBe("none");
  });

  it("keeps keyboard focus on an action that disables itself, such as the last Delete", async () => {
    function Deleting(): ReactElement {
      const [cards, setCards] = useState(1);
      return (
        <HeaderBar title="Launch card">
          <HeaderBar.Actions>
            <HeaderBar.Action
              label="Delete"
              icon={Trash2}
              iconOnly
              disabled={cards === 0}
              onSelect={() => {
                setCards(cards - 1);
              }}
            />
          </HeaderBar.Actions>
        </HeaderBar>
      );
    }
    render(<Deleting />);
    const remove = screen.getByRole("button", { name: "Delete" });
    remove.focus();
    await userEvent.keyboard("{Enter}");
    expect(remove.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(remove);
    await userEvent.keyboard("{Enter}");
    expect(remove.getAttribute("aria-disabled")).toBe("true");
  });
});
