import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { matchesSearch, pageSource } from "../command-search/search.ts";
import type {
  LocalSearchSource,
  RemoteSearchSource,
  SearchItem,
} from "../command-search/search.ts";
import { SearchResults } from "./SearchResults.tsx";

const PAGES = pageSource({
  pages: [
    { label: "Team notifications", path: ["Settings"], href: "#settings-team" },
    { label: "Profile", path: ["Settings"], href: "#settings-profile" },
    { label: "Orders", href: "#orders" },
  ],
});

const CUSTOMERS: LocalSearchSource = {
  id: "customers",
  label: "Customers",
  search: (query) =>
    ["Ines Vale", "Setareh Amini"]
      .filter((name) => matchesSearch(query.text, name))
      .map((name) => ({
        id: name,
        label: name,
        detail: "4 orders",
        href: `#customer-${name}`,
      })),
};

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

/** How far `element`'s text runs past its own end edge, in px: past zero, it ends in an ellipsis. */
function overrun(element: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(element);
  return (
    range.getBoundingClientRect().right - element.getBoundingClientRect().right
  );
}

/** The room between a highlighted match and the text after it, in px: none while they read as one word. */
function gapAfter(mark: HTMLElement): number {
  const rest = mark.nextSibling;
  if (rest?.nodeType !== Node.TEXT_NODE) throw new Error("No text after it.");
  const range = document.createRange();
  range.selectNodeContents(rest);
  return (
    range.getBoundingClientRect().left - mark.getBoundingClientRect().right
  );
}

describe("SearchResults", () => {
  it("is a page that stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <SearchResults
        ref={ref}
        query={{ text: "set", filters: [] }}
        sources={[PAGES]}
        className="custom"
        data-testid="results"
      />,
    );
    expect(ref.current).toBe(screen.getByRole("main"));
    expect(ref.current?.dataset["bt"]).toBe("SearchResults");
    expect(ref.current?.dataset["testid"]).toBe("results");
    expect(ref.current?.className).toBe("bt-app-page bt-search-results custom");
  });

  it("says what was searched and how much was found, with a section of linked rows for each source that found something", () => {
    render(
      <SearchResults
        query={{ text: "set", filters: [] }}
        sources={[PAGES, CUSTOMERS]}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: 'Results for "set"' }),
    ).toBeTruthy();
    expect(screen.getByText("3 results")).toBeTruthy();
    const pages = screen.getByRole("region", { name: "Go to" });
    expect(within(pages).getByText("2 results")).toBeTruthy();
    expect(
      within(pages)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["SettingsTeam notifications", "#settings-team"],
      ["SettingsProfile", "#settings-profile"],
    ]);
    const customers = screen.getByRole("region", { name: "Customers" });
    expect(within(customers).getByText("1 result")).toBeTruthy();
    expect(
      within(customers).getByText("Set", { selector: "mark" }),
    ).toBeTruthy();
  });

  it("cuts a long detail before a row's path and label", () => {
    const guides: LocalSearchSource = {
      id: "guides",
      label: "Guides",
      search: () => [
        {
          id: "dialog",
          label: "FullscreenDialog",
          path: ["Overlays"],
          detail:
            "A dialog that takes the whole window for one big question, such as what someone wants to build first.",
          href: "#fullscreen-dialog",
        },
      ],
    };
    render(
      <div style={{ inlineSize: "420px" }}>
        <SearchResults
          query={{ text: "dialog", filters: [] }}
          sources={[guides]}
        />
      </div>,
    );
    const row = within(
      screen.getByRole("region", { name: "Guides" }),
    ).getByRole("link");
    const label = row.querySelector<HTMLElement>(
      '[data-bt-part="search-results-label"]',
    );
    const detail = row.querySelector<HTMLElement>(
      '[data-bt-part="search-results-detail"]',
    );
    if (!label || !detail) throw new Error("No label or detail.");
    expect(overrun(label)).toBeLessThanOrEqual(0.001);
    expect(detail.scrollWidth).toBeGreaterThan(detail.clientWidth);
  });

  it("keeps a match in a row's path joined to the rest of its word", () => {
    render(
      <SearchResults
        query={{ text: "install", filters: [] }}
        sources={[
          pageSource({
            pages: [
              {
                label: "Start a new app",
                path: ["Installation"],
                href: "#install",
              },
            ],
          }),
        ]}
      />,
    );
    const mark = within(
      screen.getByRole("region", { name: "Go to" }),
    ).getByText("Install", {
      selector: '[data-bt-part="search-results-path"] mark',
    });
    expect(gapAfter(mark)).toBeCloseTo(0, 1);
  });

  it("keeps a remote source's section waiting until it answers", async () => {
    let answer: (items: readonly SearchItem[]) => void = () => undefined;
    const help: RemoteSearchSource = {
      id: "help",
      label: "Help",
      remote: true,
      search: () =>
        new Promise((resolve) => {
          answer = resolve;
        }),
    };
    render(
      <SearchResults
        query={{ text: "payouts", filters: [] }}
        sources={[help]}
      />,
    );
    const section = screen.getByRole("region", { name: "Help" });
    expect(within(section).queryByRole("link")).toBeNull();
    expect(screen.getByText("Searching")).toBeTruthy();
    answer([{ id: "payouts", label: "When payouts arrive", href: "#help" }]);
    expect(
      await within(section).findByRole("link", { name: "When payouts arrive" }),
    ).toBeTruthy();
    expect(screen.getAllByText("1 result")).toHaveLength(2);
  });

  it("asks a remote source once while its parent re-renders with an inline query", async () => {
    let asked = 0;
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
        <SearchResults
          query={{ text: "payouts", filters: [] }}
          sources={[
            {
              id: "help",
              label: "Help",
              remote: true,
              search: async () => {
                asked += 1;
                await new Promise((resolve) => setTimeout(resolve, 200));
                return [
                  {
                    id: "payouts",
                    label: "When payouts arrive",
                    href: "#help",
                  },
                ];
              },
            },
          ]}
        />
      );
    }
    render(<Ticking />);
    expect(
      await screen.findByRole(
        "link",
        { name: "When payouts arrive" },
        { timeout: 2000 },
      ),
    ).toBeTruthy();
    expect(asked).toBe(1);
  });

  it("names the filters in its title and says when nothing matched", () => {
    render(
      <SearchResults
        query={{
          text: "zzz",
          filters: [{ key: "status", value: "shipped" }],
        }}
        sources={[PAGES, CUSTOMERS]}
        emptyHint="Try another word."
      />,
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: 'Results for "status:shipped zzz"',
      }),
    ).toBeTruthy();
    expect(
      screen.getByText('No results for "status:shipped zzz"'),
    ).toBeTruthy();
    expect(screen.getByText("Try another word.")).toBeTruthy();
  });

  it("shows 50 rows of a long section at first, then 50 more at a time, counting every one", async () => {
    const orders: LocalSearchSource = {
      id: "orders",
      label: "Orders",
      search: () =>
        Array.from({ length: 120 }, (_, index) => ({
          id: String(index),
          label: `Order ${String(1000 + index)}`,
          href: `#order-${String(index)}`,
        })),
    };
    render(
      <SearchResults
        query={{ text: "order", filters: [] }}
        sources={[orders]}
      />,
    );
    const section = screen.getByRole("region", { name: "Orders" });
    expect(within(section).getByText("120 results")).toBeTruthy();
    expect(within(section).getAllByRole("link")).toHaveLength(50);
    await userEvent.click(
      within(section).getByRole("button", { name: "Show 50 more" }),
    );
    expect(within(section).getAllByRole("link")).toHaveLength(100);
    await userEvent.click(
      within(section).getByRole("button", { name: "Show 20 more" }),
    );
    expect(within(section).getAllByRole("link")).toHaveLength(120);
    expect(within(section).queryByRole("button")).toBeNull();
  });

  it("hands focus to the first row it shows, and starts over for a new search", async () => {
    const orders: LocalSearchSource = {
      id: "orders",
      label: "Orders",
      search: (query) =>
        Array.from({ length: 70 }, (_, index) => ({
          id: "same",
          label: `${query.text} order ${String(1000 + index)}`,
          href: `#order-${String(index)}`,
        })),
    };
    const errors = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { rerender } = render(
      <SearchResults
        query={{ text: "decaf", filters: [] }}
        sources={[orders]}
      />,
    );
    const section = screen.getByRole("region", { name: "Orders" });
    await userEvent.click(
      within(section).getByRole("button", { name: "Show 20 more" }),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "decaf order 1050" }),
    );
    expect(within(section).queryByRole("button")).toBeNull();
    rerender(
      <SearchResults
        query={{ text: "kenya", filters: [] }}
        sources={[orders]}
      />,
    );
    expect(
      within(screen.getByRole("region", { name: "Orders" })).getAllByRole(
        "link",
      ),
    ).toHaveLength(50);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
