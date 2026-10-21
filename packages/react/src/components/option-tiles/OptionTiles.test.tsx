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
