import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../button/Button.tsx";
import { Tooltip } from "./Tooltip.tsx";

afterEach(cleanup);

function tooltip(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-bt="Tooltip"]');
}

describe("Tooltip", () => {
  it("stamps its class and data-bt and renders in the tooltip layer", () => {
    render(
      <Tooltip label="Export" defaultOpen className="custom">
        <Button>Export</Button>
      </Tooltip>,
    );
    expect(tooltip()?.className).toContain("bt-tooltip");
    expect(tooltip()?.className).toContain("custom");
    expect(tooltip()?.closest('[data-bt-layer="tooltip"]')).not.toBeNull();
  });

  it("opens once the pointer has rested on its element for 500ms", async () => {
    render(
      <Tooltip label="Saves a copy">
        <Button>Export</Button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole("button", { name: "Export" }));
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(tooltip()).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(tooltip()?.textContent).toBe("Saves a copy");
  });

  it("opens at once on keyboard focus, describes its element, and closes on Escape", async () => {
    render(
      <Tooltip label="Saves a copy">
        <Button>Export</Button>
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "Export" });
    await userEvent.keyboard("{Shift}");
    button.focus();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByRole("tooltip").textContent).toBe("Saves a copy");
    expect(button.getAttribute("aria-describedby")).toBe(
      screen.getByRole("tooltip").id,
    );
    await userEvent.keyboard("{Escape}");
    expect(tooltip()).toBeNull();
  });

  it("follows open when it's controlled", () => {
    const change = vi.fn();
    const { rerender } = render(
      <Tooltip label="Saves a copy" open={false} onOpenChange={change}>
        <Button>Export</Button>
      </Tooltip>,
    );
    expect(tooltip()).toBeNull();
    rerender(
      <Tooltip label="Saves a copy" open onOpenChange={change}>
        <Button>Export</Button>
      </Tooltip>,
    );
    expect(tooltip()).not.toBeNull();
  });
});
