import "@buttery/core/styles.css";
import "../../styles.css";
import { isApplePlatform, publishSettled } from "@buttery/core";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef, useEffect, useState } from "react";
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
        .getByRole("option", { name: "View more filters" })
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

  it("lets a remote search finish while its parent re-renders with inline sources and filters", async () => {
    const asked: string[] = [];
    function Ticking(): ReactElement {
      const [, setTick] = useState(0);
      useEffect(() => {
        const timer = window.setInterval(() => {
          setTick((tick) => tick + 1);
        }, 30);
        return () => {
          window.clearInterval(timer);
        };
      }, []);
      return (
        <ButteryProvider>
          <CommandSearch
            filters={[...FILTERS]}
            sources={[
              {
                id: "help",
                label: "Help",
                remote: true,
                search: async (query) => {
                  asked.push(query.text);
                  await new Promise((resolve) => setTimeout(resolve, 200));
                  return [{ id: "a", label: `Help: ${query.text}` }];
                },
              },
            ]}
          />
        </ButteryProvider>
      );
    }
    render(<Ticking />);
    await userEvent.click(field());
    await userEvent.keyboard("os");
    await waitFor(
      () => {
        expect(options("Help")).toEqual(["Help: os"]);
      },
      { timeout: 2000 },
    );
    expect(asked).toEqual(["os"]);
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
    expect(within(scroll).getByText('No results for "szzz"')).toBeTruthy();
    expect(scroll.getBoundingClientRect().height).toBe(height);
    await userEvent.keyboard("{Escape}");
    expect(options("Suggested filters")).toHaveLength(2);
  });

  it("takes focus from / anywhere", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    await userEvent.keyboard("/");
    expect(document.activeElement).toBe(field());
    expect(field()).toHaveProperty("value", "");
  });

  it("takes focus from ⌘K on Apple platforms and Ctrl K elsewhere, and reopens its panel when already focused", async () => {
    render(<Search />);
    const mod = isApplePlatform() ? "Meta" : "Control";
    const other = isApplePlatform() ? "Control" : "Meta";
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    await userEvent.keyboard(`{${other}>}k{/${other}}`);
    expect(document.activeElement).not.toBe(field());
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`);
    expect(document.activeElement).toBe(field());
    await userEvent.keyboard("{Escape}");
    expect(field().getAttribute("aria-expanded")).toBe("false");
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`);
    expect(field().getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(field());
    expect(field().getAttribute("aria-expanded")).toBe("true");
  });

  it("gives every row its own id, so the arrows reach each one even when pages share an href", async () => {
    const twins = pageSource({
      pages: [
        { label: "Shop settings", href: "#same" },
        { label: "Shipping", href: "#same" },
        { label: "Stock", href: "#same" },
      ],
    });
    render(<Search sources={[twins]} filters={[]} />);
    await userEvent.click(field());
    await userEvent.keyboard("s");
    const rows = within(group("Go to")).getAllByRole("option");
    expect(new Set(rows.map((row) => row.id)).size).toBe(3);
    for (const row of rows) {
      await userEvent.keyboard("{ArrowDown}");
      expect(field().getAttribute("aria-activedescendant")).toBe(row.id);
    }
  });

  it("finishes a filter left at the end when the search is sent, and brings a chip-only search back as a chip", async () => {
    const onSearch = vi.fn();
    const asked: string[] = [];
    render(
      <Search
        storageKey="test-search"
        onSearch={onSearch}
        resultsHref={(query) => {
          asked.push(query.filters.map((token) => token.key).join());
          return "#search";
        }}
      />,
    );
    await userEvent.click(field());
    await userEvent.keyboard("status:shipped");
    expect(asked.at(-1)).toBe("status");
    await userEvent.keyboard("{Enter}");
    expect(onSearch).toHaveBeenCalledWith({
      text: "",
      filters: [{ key: "status", value: "shipped" }],
    });
    await userEvent.click(field());
    await userEvent.click(
      screen.getByRole("option", { name: "status:shipped" }),
    );
    expect(
      [...document.querySelectorAll('[data-bt-part="chip"]')].map(
        (chip) => chip.textContent,
      ),
    ).toEqual(["status:shipped"]);
    expect(field()).toHaveProperty("value", "");
  });

  it("keeps focus in the field when a press lands on it outside the input, and takes it at rest", async () => {
    render(<Search />);
    const icon = box().querySelector('[data-bt-part="icon"]');
    if (!icon) throw new Error("No icon.");
    await userEvent.click(icon);
    expect(document.activeElement).toBe(field());
    await userEvent.keyboard("ines");
    await userEvent.click(icon);
    expect(document.activeElement).toBe(field());
    expect(field().getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps focus in the field after choosing a row that stays on the page", async () => {
    const onSelect = vi.fn();
    const actions: LocalSearchSource = {
      id: "actions",
      label: "Actions",
      search: () => [{ id: "export", label: "Export orders", onSelect }],
    };
    render(<Search sources={[actions]} filters={[]} />);
    await userEvent.click(field());
    await userEvent.keyboard("exp{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(field());
    expect(field().getAttribute("aria-expanded")).toBe("false");
  });

  it("leaves the keys an input method composes with alone", async () => {
    const onSelect = vi.fn();
    const actions: LocalSearchSource = {
      id: "actions",
      label: "Actions",
      search: () => [{ id: "export", label: "Export orders", onSelect }],
    };
    render(<Search sources={[actions]} filters={[]} />);
    await userEvent.click(field());
    await userEvent.keyboard("e");
    fireEvent.compositionStart(field());
    fireEvent.keyDown(field(), { key: "ArrowDown", isComposing: true });
    expect(field().hasAttribute("aria-activedescendant")).toBe(false);
    fireEvent.compositionEnd(field());
    fireEvent.keyDown(field(), { key: "Escape" });
    expect(field()).toHaveProperty("value", "e");
    fireEvent.keyUp(field(), { key: "Escape" });
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("is a listbox in a plain panel: its filters described, what it found announced, every row reachable", async () => {
    render(<Search filtersHref="#filters" onSearch={() => undefined} />);
    await userEvent.click(field());
    const listbox = screen.getByRole("listbox");
    expect(listbox.closest('[role="dialog"]')).toBeNull();
    const rows = screen.getAllByRole("option");
    await userEvent.keyboard("{ArrowDown}".repeat(rows.length));
    const more = screen.getByRole("option", { name: "View more filters" });
    expect(field().getAttribute("aria-activedescendant")).toBe(more.id);
    await userEvent.keyboard("status:paid ines");
    const chip = screen.getByRole("button", { name: "Remove status:paid" });
    expect(chip.tabIndex).toBe(0);
    const described = field().getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(described)?.textContent).toBe(
      "Filtered by status:paid",
    );
    await waitFor(() => {
      expect(within(box()).getByRole("status").textContent).toBe(
        "Filtered by status:paid. 1 result",
      );
    });
    await userEvent.keyboard("zz");
    await waitFor(() => {
      expect(within(box()).getByRole("status").textContent).toBe(
        'Filtered by status:paid. No results for "ineszz"',
      );
    });
  });

  it("forgets a remote source's answers once the field is emptied", async () => {
    const help: RemoteSearchSource = {
      id: "help",
      label: "Help",
      remote: true,
      search: async (query) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return [{ id: query.text, label: `Help: ${query.text}` }];
      },
    };
    render(<Search sources={[help]} />);
    await userEvent.click(field());
    await userEvent.keyboard("payout");
    await waitFor(() => {
      expect(options("Help")).toEqual(["Help: payout"]);
    });
    await userEvent.keyboard("{Escape}decaf");
    expect(options("Help")).toEqual(["Searching help"]);
  });

  it("keeps an answer that comes late from replacing a newer one", async () => {
    const help: RemoteSearchSource = {
      id: "help",
      label: "Help",
      remote: true,
      search: (query) =>
        new Promise((resolve) => {
          window.setTimeout(
            () => {
              resolve([{ id: query.text, label: `Help: ${query.text}` }]);
            },
            query.text === "os" ? 600 : 20,
          );
        }),
    };
    render(<Search sources={[help]} />);
    await userEvent.click(field());
    await userEvent.keyboard("os");
    await new Promise((resolve) => setTimeout(resolve, 200));
    await userEvent.keyboard("k");
    await waitFor(() => {
      expect(options("Help")).toEqual(["Help: osk"]);
    });
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(options("Help")).toEqual(["Help: osk"]);
  });

  it("keeps its panel inside a short window", async () => {
    await page.viewport(1280, 360);
    const many: LocalSearchSource = {
      id: "many",
      label: "Many",
      limit: 20,
      search: () =>
        Array.from({ length: 20 }, (_, index) => ({
          id: String(index),
          label: `Result ${String(index)}`,
        })),
    };
    render(<Search sources={[many]} onSearch={() => undefined} />);
    await userEvent.click(field());
    await userEvent.keyboard("r");
    const panel = document.querySelector(".bt-command-search-panel");
    if (!panel) throw new Error("No panel.");
    await waitFor(() => {
      expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(360);
    });
  });

  it("opens its first empty answer no shorter than its steady minimum", async () => {
    render(<Search sources={[CUSTOMERS]} filters={[]} />);
    await userEvent.click(field());
    await userEvent.keyboard("zzz");
    const scroll = document.querySelector<HTMLElement>(
      '.bt-command-search-panel [data-bt-part="scroll"]',
    );
    expect(scroll?.getBoundingClientRect().height).toBeGreaterThanOrEqual(160);
  });

  it("keeps what's typed on Enter with nowhere to send it, and is inert while disabled", async () => {
    render(<Search />);
    await userEvent.click(field());
    await userEvent.keyboard("ines{Enter}");
    expect(field()).toHaveProperty("value", "ines");
    cleanup();
    render(<Search disabled defaultValue="status:paid ines" />);
    expect(
      screen
        .getByRole("button", { name: "Remove status:paid" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Clear search" })
        .hasAttribute("disabled"),
    ).toBe(true);
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
        .getByRole("option", { name: "View all results" })
        .getAttribute("href"),
    ).toBe("#search?q=ines");
    await userEvent.keyboard("{Enter}");
    expect(onSearch).toHaveBeenCalledWith({ text: "ines", filters: [] });
    await userEvent.click(field());
    expect(options("Recent searches")).toEqual(["ines"]);
  });
});
