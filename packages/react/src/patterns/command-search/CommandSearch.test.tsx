import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { CommandSearch } from "./CommandSearch.tsx";
import type { CommandSearchProps } from "./CommandSearch.tsx";
import { matchesSearch, pageSource } from "./search.ts";
import type {
  LocalSearchSource,
  RemoteSearchSource,
  SearchFilter,
  SearchItem,
} from "./search.ts";

const PAGES = pageSource({
  pages: [
    { label: "Orders", href: "#orders" },
    { label: "Payouts", href: "#payouts" },
    { label: "Team notifications", path: ["Settings"], href: "#settings-team" },
    { label: "Profile", path: ["Settings"], href: "#settings-profile" },
    { label: "Stock", href: "#stock" },
    { label: "Subscriptions", href: "#subscriptions" },
  ],
});

const CUSTOMERS: LocalSearchSource = {
  id: "customers",
  label: "Customers",
  search: (query) =>
    ["Ines Vale", "Oskar Lind", "Setareh Amini"]
      .filter((name) => matchesSearch(query.text, name))
      .map((name) => ({ id: name, label: name, href: `#customer-${name}` })),
};

const FILTERS: readonly SearchFilter[] = [
  {
    key: "status",
    example: "shipped",
    description: "where an order has got to",
    values: ["paid", "roasting", "shipped", "refunded"],
  },
  {
    key: "email",
    example: "ines@example.com",
    description: "a customer's email",
  },
];

beforeEach(async () => {
  publishSettled();
  window.localStorage.removeItem("buttery:command-search-recent:test-search");
  await page.viewport(1280, 800);
});

afterEach(cleanup);

function Search(props: Partial<CommandSearchProps>): ReactElement {
  return (
    <ButteryProvider>
      <button type="button">Elsewhere</button>
      <div style={{ padding: "16px" }}>
        <CommandSearch
          sources={[PAGES, CUSTOMERS]}
          filters={FILTERS}
          {...props}
        />
      </div>
    </ButteryProvider>
  );
}

function field(): HTMLElement {
  return screen.getByRole("combobox", { name: "Search" });
}

function box(): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    '[data-bt="CommandSearch"]',
  );
  if (!element) throw new Error("No field.");
  return element;
}

function group(name: string): HTMLElement {
  return within(screen.getByRole("listbox")).getByRole("group", { name });
}

function options(name: string): readonly string[] {
  return within(group(name))
    .queryAllByRole("option")
    .map((option) => option.textContent);
}

describe("CommandSearch", () => {
  it("is a combobox named Search that takes the ref, its class and style on the field", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Search ref={ref} className="custom" style={{ order: 2 }} />);
    expect(ref.current).toBe(field());
    expect(field().getAttribute("aria-expanded")).toBe("false");
    expect(box().className).toBe("bt-command-search custom");
    expect(box().style.order).toBe("2");
  });

  it("widens from 360 to 600 as it takes focus, and back as it lets go", async () => {
    render(<Search />);
    expect(box().getBoundingClientRect().width).toBe(360);
    await userEvent.click(field());
    await waitFor(() => {
      expect(box().getBoundingClientRect().width).toBe(600);
    });
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    await waitFor(() => {
      expect(box().getBoundingClientRect().width).toBe(360);
    });
  });

  it("opens a panel as wide as the field, 8px under it, suggesting the filters while it's empty", async () => {
    render(<Search filtersHref="#filters" />);
    await userEvent.click(field());
    expect(field().getAttribute("aria-expanded")).toBe("true");
    expect(options("Suggested filters")).toEqual([
      "status:status:shippedwhere an order has got to",
      "email:email:ines@example.coma customer's email",
    ]);
    const listbox = screen.getByRole("listbox");
    expect(field().getAttribute("aria-controls")).toBe(listbox.id);
    const panel = listbox.closest<HTMLElement>(".bt-command-search-panel");
    if (!panel) throw new Error("No panel.");
    await waitFor(() => {
      expect(panel.getBoundingClientRect().width).toBe(
        box().getBoundingClientRect().width,
      );
    });
    expect(panel.getBoundingClientRect().top).toBe(
      box().getBoundingClientRect().bottom + 8,
    );
    expect(
      screen
        .getByRole("link", { name: "View more filters" })
        .getAttribute("href"),
    ).toBe("#filters");
  });

  it("shows a group for each source that found something as the query changes, the matches highlighted", async () => {
    render(<Search />);
    await userEvent.click(field());
    await userEvent.keyboard("set");
    expect(options("Go to")).toEqual([
      "SettingsTeam notifications",
      "SettingsProfile",
    ]);
    expect(options("Customers")).toEqual(["Setareh Amini"]);
    expect(
      within(group("Customers"))
        .getAllByText("Set", { selector: "mark" })
        .map((mark) => mark.textContent),
    ).toEqual(["Set"]);
    await userEvent.keyboard("areh");
    expect(
      within(screen.getByRole("listbox")).queryByRole("group", {
        name: "Go to",
      }),
    ).toBeNull();
    expect(options("Customers")).toEqual(["Setareh Amini"]);
  });

  it("moves through the rows across groups with the arrow keys, and Enter opens the one it's on", async () => {
    const onSelect = vi.fn();
    const pick: LocalSearchSource = {
      id: "orders",
      label: "Orders",
      search: () => [{ id: "1042", label: "Order 1042", onSelect }],
    };
    render(<Search sources={[CUSTOMERS, pick]} />);
    await userEvent.click(field());
    await userEvent.keyboard("i");
    const rows = screen.getAllByRole("option");
    expect(rows.map((row) => row.textContent)).toEqual([
      "Ines Vale",
      "Oskar Lind",
      "Setareh Amini",
      "Order 1042",
    ]);
    await userEvent.keyboard("{ArrowUp}");
    expect(field().getAttribute("aria-activedescendant")).toBe(rows[3]?.id);
    expect(rows[3]?.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{ArrowDown}");
    expect(field().getAttribute("aria-activedescendant")).toBe(rows[0]?.id);
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    expect(field().getAttribute("aria-expanded")).toBe("false");
  });

  it("clears on the first Escape and closes on the second, keeping focus", async () => {
    render(<Search />);
    await userEvent.click(field());
    await userEvent.keyboard("pay");
    await userEvent.keyboard("{Escape}");
    expect(field()).toHaveProperty("value", "");
    expect(field().getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{Escape}");
    expect(field().getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(field());
  });

  it("completes a key with Tab, turns a finished filter into a chip and takes it back with Backspace", async () => {
    const onValueChange = vi.fn();
    render(<Search onValueChange={onValueChange} />);
    await userEvent.click(field());
    await userEvent.keyboard("sta{Tab}");
    expect(field()).toHaveProperty("value", "status:");
    expect(options("Suggested filters")).toEqual([
      "status:paid",
      "status:roasting",
      "status:shipped",
      "status:refunded",
    ]);
    await userEvent.keyboard("sh");
    expect(options("Suggested filters")).toEqual(["status:shipped"]);
    await userEvent.keyboard("ipped ");
    expect(field()).toHaveProperty("value", "");
    expect(onValueChange).toHaveBeenLastCalledWith("status:shipped ");
    const chips = document.querySelectorAll('[data-bt-part="chip"]');
    expect([...chips].map((chip) => chip.textContent)).toEqual([
      "status:shipped",
    ]);
    await userEvent.keyboard("{Backspace}");
    expect(document.querySelectorAll('[data-bt-part="chip"]')).toHaveLength(0);
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("asks a remote source once typing pauses, keeping its rows and a spinner row in its group until new ones arrive", async () => {
    const asked: string[] = [];
    const help: RemoteSearchSource = {
      id: "help",
      label: "Help",
      remote: true,
      search: async (query) => {
        asked.push(query.text);
        await new Promise((resolve) => setTimeout(resolve, 40));
        const items: readonly SearchItem[] = [
          { id: query.text, label: `Help: ${query.text}` },
        ];
        return items;
      },
    };
    render(<Search sources={[CUSTOMERS, help]} />);
    await userEvent.click(field());
    await userEvent.keyboard("os");
    expect(options("Customers")).toEqual(["Oskar Lind"]);
    expect(options("Help")).toEqual(["Searching help"]);
    expect(asked).toEqual([]);
    await waitFor(() => {
      expect(options("Help")).toEqual(["Help: os"]);
    });
    expect(asked).toEqual(["os"]);
    await userEvent.keyboard("k");
    expect(options("Help")).toEqual(["Help: os", "Searching help"]);
    await waitFor(() => {
      expect(options("Help")).toEqual(["Help: osk"]);
    });
    expect(asked).toEqual(["os", "osk"]);
  });

  it("keeps its size when nothing matches, and shows the suggestions again the moment it's cleared", async () => {
    render(<Search />);
    await userEvent.click(field());
    await userEvent.keyboard("s");
    const scroll = document.querySelector<HTMLElement>(
      '.bt-command-search-panel [data-bt-part="scroll"]',
    );
    if (!scroll) throw new Error("No panel.");
    const height = scroll.getBoundingClientRect().height;
    await userEvent.keyboard("zzz");
    expect(screen.getByText('No results for "szzz"')).toBeTruthy();
    expect(scroll.getBoundingClientRect().height).toBe(height);
    await userEvent.keyboard("{Escape}");
    expect(options("Suggested filters")).toHaveLength(2);
  });

  it("takes focus from / and ⌘K anywhere", async () => {
    render(<Search />);
    await userEvent.keyboard("/");
    expect(document.activeElement).toBe(field());
    expect(field()).toHaveProperty("value", "");
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    await userEvent.keyboard("{Control>}k{/Control}");
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(document.activeElement).toBe(field());
  });

  it("searches everything on Enter with no row chosen, remembering the search under its storage key", async () => {
    const onSearch = vi.fn();
    render(
      <Search
        storageKey="test-search"
        onSearch={onSearch}
        resultsHref={(query) => `#search?q=${query.text}`}
      />,
    );
    await userEvent.click(field());
    await userEvent.keyboard("ines");
    expect(
      screen
        .getByRole("link", { name: "View all results" })
        .getAttribute("href"),
    ).toBe("#search?q=ines");
    await userEvent.keyboard("{Enter}");
    expect(onSearch).toHaveBeenCalledWith({ text: "ines", filters: [] });
    await userEvent.click(field());
    expect(options("Recent searches")).toEqual(["ines"]);
  });
});
