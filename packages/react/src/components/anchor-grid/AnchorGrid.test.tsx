import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { AnchorGrid } from "./AnchorGrid.tsx";

afterEach(cleanup);

function cell(name: string): HTMLElement {
  return screen.getByRole("radio", { name });
}

describe("AnchorGrid", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AnchorGrid
        ref={ref}
        label="Anchor"
        className="custom"
        data-testid="grid"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("AnchorGrid");
    expect(ref.current?.className).toBe("bt-anchor-grid custom");
    expect(ref.current?.dataset["testid"]).toBe("grid");
  });

  it("is a 43px radio group of nine named positions, the whole box one target", () => {
    render(<AnchorGrid label="Anchor" />);
    const group = screen.getByRole("radiogroup", { name: "Anchor" });
    expect(group.getBoundingClientRect().width).toBe(43);
    expect(group.dataset["btTarget"]).toBe("group");
    expect(screen.getAllByRole("radio")).toHaveLength(9);
    expect(cell("Center").getAttribute("aria-checked")).toBe("true");
    const topLeft = cell("Top left").getBoundingClientRect();
    const top = cell("Top").getBoundingClientRect();
    expect(top.left - topLeft.left).toBeCloseTo(11.5, 1);
  });

  it("moves in two dimensions with the arrow keys, choosing as it goes, and stops at the edges", async () => {
    const onValueChange = vi.fn();
    render(<AnchorGrid label="Anchor" onValueChange={onValueChange} />);
    await userEvent.tab();
    expect(document.activeElement).toBe(cell("Center"));
    await userEvent.keyboard("{ArrowUp}{ArrowRight}");
    expect(document.activeElement).toBe(cell("Top right"));
    expect(onValueChange).toHaveBeenLastCalledWith("top-right");
    await userEvent.keyboard("{ArrowRight}{ArrowUp}");
    expect(document.activeElement).toBe(cell("Top right"));
    await userEvent.keyboard("{End}");
    expect(cell("Bottom right").getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{Home}");
    expect(cell("Top left").getAttribute("aria-checked")).toBe("true");
  });

  it("picks the nearest dot to a press anywhere in the box", async () => {
    const onValueChange = vi.fn();
    render(<AnchorGrid label="Anchor" onValueChange={onValueChange} />);
    const box = screen.getByRole("radiogroup");
    const { width } = box.getBoundingClientRect();
    await browser.click(box, { position: { x: width / 2, y: 2 } });
    expect(onValueChange).toHaveBeenLastCalledWith("top");
    expect(document.activeElement).toBe(cell("Top"));
    await browser.click(box, { position: { x: 2, y: width / 2 } });
    expect(onValueChange).toHaveBeenLastCalledWith("left");
  });

  it("draws the chosen dot as a 10px knob and hides its idle dot", () => {
    render(<AnchorGrid label="Anchor" defaultValue="left" />);
    const knob = cell("Left").querySelector<HTMLElement>(
      '[data-bt-part="indicator"]',
    );
    expect(knob?.getBoundingClientRect().width).toBe(10);
    expect(knob && getComputedStyle(knob).backgroundImage).toContain(
      "radial-gradient",
    );
    const dot = cell("Left").querySelector<HTMLElement>('[data-bt-part="dot"]');
    expect(dot && getComputedStyle(dot).visibility).toBe("hidden");
  });
});
