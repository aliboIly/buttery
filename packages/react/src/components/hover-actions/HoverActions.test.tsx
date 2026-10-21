import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Settings } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { IconButton } from "../icon-button/IconButton.tsx";
import { HoverActions } from "./HoverActions.tsx";

afterEach(cleanup);

function Rows(): ReactElement {
  return (
    <div style={{ inlineSize: "480px" }}>
      <button type="button">Notifications</button>
      <HoverActions
        data-testid="payouts"
        actions={
          <IconButton icon={Settings} label="Settings for payouts" size="sm" />
        }
      >
        Payouts
      </HoverActions>
    </div>
  );
}

function row(): HTMLElement {
  return screen.getByTestId("payouts");
}

function part(name: string): HTMLElement {
  const element = row().querySelector<HTMLElement>(`[data-bt-part="${name}"]`);
  if (!element) throw new Error(`No ${name}.`);
  return element;
}

async function shown(name: string, visible: boolean): Promise<void> {
  await waitFor(() => {
    expect(getComputedStyle(part(name)).opacity).toBe(visible ? "1" : "0");
  });
}

describe("HoverActions", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <HoverActions
        ref={ref}
        actions={null}
        className="custom"
        data-testid="row"
      >
        Payouts
      </HoverActions>,
    );
    expect(ref.current?.dataset["bt"]).toBe("HoverActions");
    expect(ref.current?.dataset["testid"]).toBe("row");
    expect(ref.current?.className).toBe("bt-hover-actions custom");
  });

  it("keeps its actions and bar out of sight at rest, its actions still in the tab order", async () => {
    render(<Rows />);
    await shown("actions", false);
    await shown("bar", false);
    expect(
      screen.getByRole("button", { name: "Settings for payouts" }).tabIndex,
    ).toBe(0);
  });

  it("shows its actions, a 2px bar at its start and a tint on hover", async () => {
    render(<Rows />);
    const resting = getComputedStyle(row()).backgroundColor;
    await userEvent.hover(row());
    await shown("actions", true);
    await shown("bar", true);
    expect(getComputedStyle(row()).backgroundColor).not.toBe(resting);
    const bar = part("bar").getBoundingClientRect();
    expect(bar.width).toBe(2);
    expect(bar.left).toBe(row().getBoundingClientRect().left);
  });

  it("shows them while its action holds keyboard focus", async () => {
    render(<Rows />);
    await userEvent.keyboard("{Shift}");
    screen.getByRole("button", { name: "Settings for payouts" }).focus();
    await shown("actions", true);
    await shown("bar", true);
  });

  it("puts them away once the pointer leaves, even with a clicked action still focused", async () => {
    render(<Rows />);
    await userEvent.click(
      screen.getByRole("button", { name: "Settings for payouts" }),
    );
    await userEvent.hover(
      screen.getByRole("button", { name: "Notifications" }),
    );
    await shown("actions", false);
    await shown("bar", false);
  });

  it("shows its bar at once, fading only its actions", () => {
    render(<Rows />);
    expect(getComputedStyle(part("bar")).transitionDuration).toBe("0s");
    expect(getComputedStyle(part("actions")).transitionDuration).not.toBe("0s");
  });

  it("fades its actions in over dur-fast, and 100ms with reduced motion", () => {
    render(
      <>
        <Rows />
        <div data-bt-motion="reduced">
          <HoverActions data-testid="reduced" actions={null}>
            Stock
          </HoverActions>
        </div>
      </>,
    );
    expect(getComputedStyle(part("actions")).transitionDuration).toBe("0.12s");
    const reduced = screen
      .getByTestId("reduced")
      .querySelector<HTMLElement>('[data-bt-part="actions"]');
    if (!reduced) throw new Error("No actions.");
    expect(getComputedStyle(reduced).transitionDuration).toBe("0.1s");
  });
});
