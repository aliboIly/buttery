import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { SearchField } from "./SearchField.tsx";

afterEach(cleanup);

function colorOf(variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function box(): HTMLElement {
  const field = document.querySelector<HTMLElement>('[data-bt="SearchField"]');
  if (!field) throw new Error("No field.");
  return field;
}

describe("SearchField", () => {
  it("stamps its class and data-bt, forwards its ref to the input and spreads props", () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchField ref={ref} className="custom" data-testid="search" />);
    expect(box().className).toBe("bt-search-field bt-form-field-box custom");
    expect(ref.current?.dataset["testid"]).toBe("search");
    expect(ref.current?.type).toBe("search");
  });

  it("is a 34px searchbox named Search, with its name as the placeholder", () => {
    render(<SearchField />);
    const input = screen.getByRole("searchbox", { name: "Search" });
    expect(input.getAttribute("placeholder")).toBe("Search");
    expect(box().getBoundingClientRect().height).toBe(34);
  });

  it("shows a clear button once it holds text, which clears it and keeps focus", async () => {
    const onValueChange = vi.fn();
    render(<SearchField label="Search orders" onValueChange={onValueChange} />);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    const input = screen.getByRole("searchbox", { name: "Search orders" });
    await userEvent.type(input, "ethiopia");
    expect(onValueChange).toHaveBeenLastCalledWith("ethiopia");
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(document.activeElement).toBe(input);
  });

  it("clears on Escape, keeping focus", async () => {
    function Controlled(): ReactElement {
      const [query, setQuery] = useState("kenya");
      return <SearchField value={query} onValueChange={setQuery} />;
    }
    render(<Controlled />);
    const input = screen.getByRole("searchbox");
    input.focus();
    await userEvent.keyboard("{Escape}");
    expect(input).toHaveValue("");
    expect(document.activeElement).toBe(input);
  });

  it("focuses from its shortcut, which shows only while it's empty", async () => {
    render(
      <>
        <input aria-label="Note" />
        <SearchField shortcut="/" />
      </>,
    );
    const input = screen.getByRole("searchbox");
    expect(input.getAttribute("aria-keyshortcuts")).toBe("/");
    expect(box().querySelector('[data-bt-part="shortcut"]')?.textContent).toBe(
      "/",
    );
    screen.getByRole("textbox", { name: "Note" }).focus();
    await userEvent.keyboard("/");
    expect(document.activeElement).not.toBe(input);
    const typing = document.activeElement;
    if (typing instanceof HTMLElement) typing.blur();
    await userEvent.keyboard("/");
    expect(document.activeElement).toBe(input);
    await userEvent.keyboard("roast");
    expect(input).toHaveValue("roast");
    expect(box().querySelector('[data-bt-part="shortcut"]')).toBeNull();
  });

  it("ends a placeholder or value that doesn't fit with an ellipsis", () => {
    render(
      <div style={{ inlineSize: "160px" }}>
        <SearchField
          label="Search orders and customers"
          placeholder="Search orders and customers"
          defaultValue="Orders from the harbor cafe last spring"
        />
      </div>,
    );
    const input = screen.getByRole("searchbox");
    expect(input.scrollWidth).toBeGreaterThan(input.clientWidth);
    expect(getComputedStyle(input).textOverflow).toBe("ellipsis");
  });

  it("takes the room a title beside it in an Inline leaves, keeping the title whole", () => {
    render(
      <Inline gap={4} style={{ inlineSize: "240px" }}>
        <Text variant="title-sm">Orders</Text>
        <SearchField label="Search orders" />
      </Inline>,
    );
    const title = screen.getByText("Orders");
    expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
    expect(
      title.getBoundingClientRect().width +
        16 +
        box().getBoundingClientRect().width,
    ).toBeCloseTo(240, 0);
  });

  it("sits on bg-control with no edge when soft, with a 1px edge when outlined", () => {
    render(
      <>
        <SearchField variant="soft" data-testid="soft" />
        <SearchField data-testid="outline" />
      </>,
    );
    const [soft, outline] = document.querySelectorAll<HTMLElement>(
      '[data-bt="SearchField"]',
    );
    if (!soft || !outline) throw new Error("No fields.");
    expect(getComputedStyle(soft).borderColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(outline).borderTopWidth).toBe("1px");
    expect(getComputedStyle(outline).borderColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("draws soft on bg-control, its edge showing only on hover and while it has focus", async () => {
    render(<SearchField variant="soft" label="Search everything" />);
    const edge = colorOf("--bt-control-border");
    expect(getComputedStyle(box()).backgroundColor).toBe(
      colorOf("--bt-bg-control"),
    );
    expect(getComputedStyle(box()).borderTopColor).toBe("rgba(0, 0, 0, 0)");
    await browser.hover(box());
    expect(getComputedStyle(box()).borderTopColor).toBe(edge);
    await browser.click(screen.getByRole("searchbox"));
    await browser.hover(document.body, { position: { x: 1, y: 1 } });
    expect(getComputedStyle(box()).borderTopColor).toBe(edge);
    expect(getComputedStyle(box()).outlineStyle).toBe("solid");
  });

  it("is 28px tall at sm, its clear button drawn at the badge height with a 28px target, and 48px with 16px text at lg", async () => {
    const { rerender } = render(
      <SearchField size="sm" label="Search orders" defaultValue="guji" />,
    );
    const clear = screen.getByRole("button", { name: "Clear search" });
    const hit = clear.querySelector("[data-bt-hit]");
    if (!hit) throw new Error("No hit area.");
    const outer = box().getBoundingClientRect();
    expect(outer.height).toBe(28);
    expect(clear.getBoundingClientRect().height).toBe(20);
    expect(clear.getBoundingClientRect().top).toBeGreaterThan(outer.top);
    expect(hit.getBoundingClientRect().height).toBe(28);
    expect(hit.getBoundingClientRect().width).toBe(28);
    await browser.click(clear);
    expect(screen.getByRole("searchbox")).toHaveValue("");
    rerender(<SearchField size="lg" label="Search orders" />);
    expect(box().getBoundingClientRect().height).toBe(48);
    const input = screen.getByRole("searchbox");
    expect(getComputedStyle(input).fontSize).toBe("16px");
    expect(getComputedStyle(input).paddingRight).toBe("16px");
  });
});
