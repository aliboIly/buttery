import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SwatchGrid } from "./SwatchGrid.tsx";
import type { Swatch } from "./SwatchGrid.tsx";

afterEach(cleanup);

const SWATCHES: readonly Swatch[] = [
  "Cream",
  "Peach",
  "Blush",
  "Lilac",
  "Mist",
  "Mint",
  "Honey",
  "Apricot",
  "Rose",
].map((name, index) => ({
  value: name.toLowerCase(),
  label: name,
  fill: `hsl(${String(index * 40)} 70% 80%)`,
}));

function swatch(name: string): HTMLElement {
  return screen.getByRole("radio", { name });
}

describe("SwatchGrid", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SwatchGrid
        ref={ref}
        label="Backdrop"
        swatches={SWATCHES}
        className="custom"
        data-testid="grid"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SwatchGrid");
    expect(ref.current?.className).toBe("bt-swatch-grid custom");
    expect(ref.current?.dataset["testid"]).toBe("grid");
  });

  it("is a radio group of named swatches, six to a row, each square and painted", () => {
    render(
      <div style={{ inlineSize: "296px" }}>
        <SwatchGrid label="Backdrop" swatches={SWATCHES} defaultValue="peach" />
      </div>,
    );
    expect(screen.getByRole("radiogroup", { name: "Backdrop" })).toBeTruthy();
    expect(swatch("Peach").getAttribute("aria-checked")).toBe("true");
    const first = swatch("Cream").getBoundingClientRect();
    const seventh = swatch("Honey").getBoundingClientRect();
    expect(first.width).toBeCloseTo(first.height, 1);
    expect(first.width).toBeCloseTo((296 - 5 * 8) / 6, 1);
    expect(seventh.left).toBeCloseTo(first.left, 1);
    expect(seventh.top - first.bottom).toBeCloseTo(8, 1);
    expect(getComputedStyle(swatch("Cream")).backgroundImage).toBe("none");
    expect(getComputedStyle(swatch("Cream")).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  });

  it("rings the chosen swatch at once", async () => {
    render(
      <SwatchGrid label="Backdrop" swatches={SWATCHES} defaultValue="cream" />,
    );
    await userEvent.click(swatch("Rose"));
    expect(swatch("Rose").getAttribute("aria-checked")).toBe("true");
    expect(getComputedStyle(swatch("Rose")).boxShadow).toContain("3.5px");
    expect(getComputedStyle(swatch("Rose")).transitionDuration).toBe("0s");
  });

  it("moves across rows and up and down columns with the arrow keys, choosing as it goes", async () => {
    const onValueChange = vi.fn();
    render(
      <SwatchGrid
        label="Backdrop"
        swatches={SWATCHES}
        defaultValue="peach"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(swatch("Peach"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(swatch("Apricot"));
    expect(onValueChange).toHaveBeenLastCalledWith("apricot");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(swatch("Apricot"));
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(swatch("Cream"));
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(swatch("Rose"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(swatch("Cream"));
    await userEvent.keyboard("{End}");
    expect(swatch("Rose").getAttribute("aria-checked")).toBe("true");
  });

  it("is one tab stop, on the chosen swatch", async () => {
    render(
      <>
        <SwatchGrid label="Backdrop" swatches={SWATCHES} defaultValue="mist" />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(swatch("Mist"));
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" }),
    );
  });

  it("takes no choice while disabled", async () => {
    const onValueChange = vi.fn();
    render(
      <SwatchGrid
        label="Backdrop"
        swatches={SWATCHES}
        disabled
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(swatch("Blush"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
