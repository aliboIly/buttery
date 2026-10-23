import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { OptionTiles } from "./OptionTiles.tsx";

afterEach(cleanup);

const NEEDS = [
  { value: "shop", label: "Sell online", description: "A shop of your own" },
  { value: "wholesale", label: "Sell to cafés" },
  { value: "subscriptions", label: "Run subscriptions" },
  { value: "tax", label: "Collect tax", disabled: true },
] as const;

function tile(name: string): HTMLElement {
  return screen.getByRole("checkbox", { name });
}

function colorIn(scope: Element, variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  scope.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function partOf(element: HTMLElement, part: string): HTMLElement {
  const found = element.querySelector<HTMLElement>(
    `[data-bt-part="${part}"], [data-role="${part}"]`,
  );
  if (!found) throw new Error(`No ${part}.`);
  return found;
}

describe("OptionTiles", () => {
  it("is a group named by its label that takes the ref, class and other props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <OptionTiles
        ref={ref}
        label="What you need"
        options={NEEDS}
        className="custom"
        data-testid="needs"
      />,
    );
    const group = screen.getByRole("group", { name: "What you need" });
    expect(ref.current).toBe(group);
    expect(group.dataset["bt"]).toBe("OptionTiles");
    expect(group.dataset["testid"]).toBe("needs");
    expect(group.className).toBe("bt-option-tiles custom");
  });

  it("makes each tile a checkbox named by its words and described by its line", () => {
    render(<OptionTiles label="What you need" options={NEEDS} />);
    expect(tile("Sell online")).toHaveAccessibleDescription(
      "A shop of your own",
    );
    expect(tile("Sell to cafés").getAttribute("aria-checked")).toBe("false");
    expect(tile("Collect tax").hasAttribute("disabled")).toBe(true);
  });

  it("ticks a tile from a press anywhere on it, reporting every choice in order, and draws it chosen", async () => {
    const onValueChange = vi.fn();
    render(
      <OptionTiles
        label="What you need"
        options={NEEDS}
        defaultValue={["subscriptions"]}
        onValueChange={onValueChange}
      />,
    );
    const resting = getComputedStyle(tile("Sell online")).boxShadow;
    await userEvent.click(screen.getByText("Sell online"));
    expect(onValueChange).toHaveBeenLastCalledWith(["shop", "subscriptions"]);
    expect(tile("Sell online").getAttribute("aria-checked")).toBe("true");
    expect(getComputedStyle(tile("Sell online")).boxShadow).not.toBe(resting);
    await userEvent.click(tile("Run subscriptions"));
    expect(onValueChange).toHaveBeenLastCalledWith(["shop"]);
  });

  it("draws a disabled tile disabled in both themes: its words in text-disabled on bg-control-subtle, its box as a disabled checkbox's", () => {
    for (const theme of ["light", "dark"] as const) {
      render(
        <div data-bt-theme={theme} data-testid="scope">
          <OptionTiles
            label="Roast days"
            defaultValue={["sunday"]}
            options={[
              {
                value: "monday",
                label: "Monday",
                description: "Espresso blends",
              },
              {
                value: "saturday",
                label: "Saturday",
                description: "Closed for cleaning",
                disabled: true,
              },
              {
                value: "sunday",
                label: "Sunday",
                description: "Kept for wholesale",
                disabled: true,
              },
            ]}
          />
        </div>,
      );
      const scope = screen.getByTestId("scope");
      const disabledText = colorIn(scope, "--bt-text-disabled");
      const enabled = tile("Monday");
      for (const name of ["Saturday", "Sunday"]) {
        const off = tile(name);
        expect(getComputedStyle(off).backgroundColor).toBe(
          colorIn(scope, "--bt-bg-control-subtle"),
        );
        expect(getComputedStyle(off).boxShadow).toBe("none");
        expect(getComputedStyle(partOf(off, "label")).color).toBe(disabledText);
        expect(getComputedStyle(partOf(off, "description")).color).toBe(
          disabledText,
        );
        expect(getComputedStyle(partOf(off, "label")).color).not.toBe(
          getComputedStyle(partOf(enabled, "label")).color,
        );
        const box = getComputedStyle(partOf(off, "box"));
        expect(box.borderTopColor).toBe(colorIn(scope, "--bt-border-strong"));
        expect(box.backgroundColor).toBe(
          colorIn(scope, "--bt-bg-control-subtle"),
        );
        expect(box.color).toBe(disabledText);
      }
      expect(partOf(tile("Sunday"), "mark")).toBeTruthy();
      cleanup();
    }
  });

  it("lays tiles in two columns from 480px of room, a one-line tile 40 tall", () => {
    render(
      <div style={{ inlineSize: "640px" }}>
        <OptionTiles label="What you need" options={NEEDS} />
      </div>,
    );
    const first = tile("Sell online").getBoundingClientRect();
    const second = tile("Sell to cafés").getBoundingClientRect();
    expect(second.top).toBe(first.top);
    expect(second.left).toBeGreaterThan(first.right);
    expect(tile("Run subscriptions").getBoundingClientRect().height).toBe(40);
    cleanup();
    render(
      <div style={{ inlineSize: "360px" }}>
        <OptionTiles label="What you need" options={NEEDS} />
      </div>,
    );
    expect(tile("Sell to cafés").getBoundingClientRect().top).toBeGreaterThan(
      tile("Sell online").getBoundingClientRect().bottom,
    );
  });
});
