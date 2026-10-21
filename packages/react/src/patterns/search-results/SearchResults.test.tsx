import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
});
