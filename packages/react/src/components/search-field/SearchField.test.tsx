import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchField } from "./SearchField.tsx";

afterEach(cleanup);

function box(): HTMLElement {
  const field = document.querySelector<HTMLElement>('[data-bt="SearchField"]');
  if (!field) throw new Error("No field.");
  return field;
}

describe("SearchField", () => {
  it("stamps its class and data-bt, forwards its ref to the input and spreads props", () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchField ref={ref} className="custom" data-testid="search" />);
    expect(box().className).toBe("bt-search-field custom");
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
});
