import "@butteryui/core/styles.css";
import "../../styles.css";
import { MotionPreferenceContext, publishSettled } from "@butteryui/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { Catalog } from "./Catalog.tsx";
import type {
  CatalogCardVariant,
  CatalogColumns,
  CatalogFilters,
  CatalogLayout,
  CatalogMediaPosition,
} from "./Catalog.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

interface Coffee {
  readonly name: string;
  readonly roast: string;
  readonly origin: string;
  readonly notes: string;
  readonly price: number;
}

const COFFEES: readonly Coffee[] = [
  {
    name: "Guji",
    roast: "Light",
    origin: "Ethiopia",
    notes: "Peach, jasmine",
    price: 19,
  },
  {
    name: "Huila",
    roast: "Medium",
    origin: "Colombia",
    notes: "Red apple, cocoa",
    price: 17,
  },
  {
    name: "Cerrado",
    roast: "Medium",
    origin: "Brazil",
    notes: "Hazelnut, molasses",
    price: 15,
  },
  {
    name: "Nyeri",
    roast: "Light",
    origin: "Kenya",
    notes: "Blackcurrant, honey",
    price: 21,
  },
  {
    name: "House",
    roast: "Dark",
    origin: "Blend",
    notes: "Cocoa, toffee",
    price: 14,
  },
];

function box(element: Element | null | undefined): DOMRect {
  if (!element) throw new Error("Not there.");
  return element.getBoundingClientRect();
}

function names(): string[] {
  return screen
    .queryAllByRole("article")
    .map((card) => card.getAttribute("aria-labelledby") ?? "")
    .map((id) => document.getElementById(id)?.textContent ?? "");
}

function Art(): ReactElement {
  return (
    <div data-testid="art" style={{ inlineSize: "100%", blockSize: "100%" }} />
  );
}

function Coffees({
  width = 960,
  layout,
  columns,
  variant,
  mediaPosition,
  filters,
  onFiltersChange,
  onLayoutChange,
  items = COFFEES,
  pageSize,
  withDetail = false,
  extra,
}: {
  readonly width?: number;
  readonly layout?: CatalogLayout;
  readonly columns?: CatalogColumns;
  readonly variant?: CatalogCardVariant;
  readonly mediaPosition?: CatalogMediaPosition;
  readonly filters?: CatalogFilters;
  readonly onFiltersChange?: (filters: CatalogFilters) => void;
  readonly onLayoutChange?: (layout: CatalogLayout) => void;
  readonly items?: readonly Coffee[];
  readonly pageSize?: number;
  readonly withDetail?: boolean;
  readonly extra?: ReactNode;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Catalog
        items={items}
        searchBy={(coffee) => [coffee.name, coffee.notes]}
        filterBy={{
          roast: (coffee) => coffee.roast,
          origin: (coffee) => coffee.origin,
        }}
        sortBy={{ low: (a, b) => a.price - b.price }}
        pageSize={pageSize}
        {...(layout === undefined ? {} : { defaultLayout: layout })}
        {...(filters === undefined ? {} : { filters })}
        {...(onFiltersChange === undefined ? {} : { onFiltersChange })}
        {...(onLayoutChange === undefined ? {} : { onLayoutChange })}
      >
        {(shown) => (
          <>
            <Catalog.Toolbar label="Find a coffee">
              <Catalog.Search label="Search coffees" />
              <Catalog.Filter
                name="roast"
                label="Roast"
                options={["Light", "Medium", "Dark"]}
              />
              <Catalog.Filter
                name="origin"
                label="Origin"
                options={["Ethiopia", "Colombia", "Brazil", "Kenya", "Blend"]}
                allLabel="All origins"
              />
              <Catalog.Count
                format={(count) =>
                  count === 1 ? "1 coffee" : `${String(count)} coffees`
                }
              />
              <Catalog.Sort
                options={[
                  { value: "featured", label: "Featured" },
                  { value: "low", label: "Price, low to high" },
                ]}
              />
              <Catalog.ViewToggle label="Show coffees as" />
            </Catalog.Toolbar>
            <Catalog.Items columns={columns}>
              {shown.map((coffee) => (
                <Catalog.Card
                  key={coffee.name}
                  title={coffee.name}
                  variant={variant}
                  mediaPosition={mediaPosition}
                  media={<Art />}
                  eyebrow={coffee.origin}
                  meta={coffee.notes}
                  price={`$${String(coffee.price)}`}
                  actions={
                    <Button size="sm" aria-label={`Add ${coffee.name}`}>
                      Add
                    </Button>
                  }
                  {...(withDetail
                    ? { detail: <p>{`More about ${coffee.name}`}</p> }
                    : {})}
                />
              ))}
            </Catalog.Items>
            <Catalog.NoResults title="No coffee matches" />
            <Catalog.Empty title="No coffees yet" />
            <Catalog.More label="Show more coffees" />
            {extra}
          </>
        )}
      </Catalog>
    </div>
  );
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("Catalog", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Catalog
        ref={ref}
        items={COFFEES}
        className="custom"
        data-testid="catalog"
      >
        {(shown) => <p>{`${String(shown.length)} shown`}</p>}
      </Catalog>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Catalog");
    expect(ref.current?.dataset["testid"]).toBe("catalog");
    expect(ref.current?.className).toBe("bt-catalog custom");
    expect(screen.getByText("5 shown")).toBeTruthy();
  });

  it("narrows its items to those holding every word searched for, and says how many as they change", async () => {
    render(<Coffees />);
    const count = screen.getByText("5 coffees");
    expect(count.getAttribute("aria-live")).toBe("polite");
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search coffees" }),
      "cocoa red",
    );
    expect(names()).toEqual(["Huila"]);
    expect(count.textContent).toBe("1 coffee");
    await userEvent.keyboard("{Escape}");
    expect(names()).toHaveLength(5);
  });

  it("filters with a segmented control for a few choices and a select for more, All clearing a filter", async () => {
    render(<Coffees />);
    const roast = screen.getByRole("radiogroup", { name: "Roast" });
    await userEvent.click(within(roast).getByRole("radio", { name: "Light" }));
    expect(names()).toEqual(["Guji", "Nyeri"]);
    await userEvent.click(
      screen.getByRole("combobox", { name: "Origin, All origins" }),
    );
    await userEvent.click(await screen.findByRole("option", { name: "Kenya" }));
    expect(names()).toEqual(["Nyeri"]);
    await userEvent.click(within(roast).getByRole("radio", { name: "All" }));
    expect(names()).toEqual(["Nyeri"]);
    expect(screen.getByText("1 coffee")).toBeTruthy();
  });

  it("moves its filter's choice with the arrow keys", async () => {
    render(<Coffees />);
    await userEvent.click(screen.getByRole("radio", { name: "All" }));
    await userEvent.keyboard("{ArrowRight>}");
    await userEvent.keyboard("{/ArrowRight}");
    expect(
      screen.getByRole("radio", { name: "Light" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(names()).toEqual(["Guji", "Nyeri"]);
  });

  it("tells a controlled owner every filter set", async () => {
    const onFiltersChange = vi.fn();
    render(
      <Coffees
        filters={{ origin: "Kenya" }}
        onFiltersChange={onFiltersChange}
      />,
    );
    expect(names()).toEqual(["Nyeri"]);
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(onFiltersChange).toHaveBeenCalledWith({
      origin: "Kenya",
      roast: "Dark",
    });
    expect(names()).toEqual(["Nyeri"]);
  });

  it("sorts by the option chosen, showing the first until then", async () => {
    render(<Coffees />);
    const sort = screen.getByRole("combobox", { name: "Sort by Featured" });
    expect(names()).toEqual(["Guji", "Huila", "Cerrado", "Nyeri", "House"]);
    await userEvent.click(sort);
    await userEvent.click(
      await screen.findByRole("option", { name: "Price, low to high" }),
    );
    expect(names()).toEqual(["House", "Cerrado", "Huila", "Guji", "Nyeri"]);
    expect(
      screen.getByRole("combobox", { name: "Sort by Price, low to high" }),
    ).toBeTruthy();
  });

  it("lays its items out as a grid or a list from its view toggle, the list putting each card's media at the start", async () => {
    const onLayoutChange = vi.fn();
    render(<Coffees onLayoutChange={onLayoutChange} />);
    const items = document.querySelector(".bt-catalog-items");
    expect(items?.getAttribute("data-layout")).toBe("grid");
    expect(screen.getAllByRole("article")[0]?.dataset["media"]).toBe("top");
    await userEvent.click(screen.getByRole("radio", { name: "Grid" }));
    await userEvent.keyboard("{ArrowRight>}");
    await userEvent.keyboard("{/ArrowRight}");
    expect(onLayoutChange).toHaveBeenLastCalledWith("list");
    expect(items?.getAttribute("data-layout")).toBe("list");
    const [first, second] = screen.getAllByRole("article");
    expect(first?.dataset["media"]).toBe("start");
    expect(box(second).top).toBeGreaterThan(box(first).bottom);
    expect(box(screen.getAllByTestId("art")[0]).width).toBe(48);
  });

  it("shows as many equal columns as fit, up to the columns asked for", () => {
    render(<Coffees width={1000} columns={3} />);
    const tops = (): number[] =>
      screen.getAllByRole("article").map((card) => Math.round(box(card).top));
    const [a, b, c, d] = screen.getAllByRole("article");
    expect(new Set(tops().slice(0, 3)).size).toBe(1);
    expect(box(d).top).toBeGreaterThan(box(a).bottom);
    expect(box(b).left - box(a).right).toBeCloseTo(16, 0);
    expect(box(c).width).toBeCloseTo(box(a).width, 0);
    cleanup();
    render(<Coffees width={300} columns={3} />);
    const [one, two] = screen.getAllByRole("article");
    expect(box(two).left).toBe(box(one).left);
  });

  it("draws each variant's surface: elevated a card, outline an edge, soft a fill, plain none", () => {
    const probe = (value: string): string => {
      const element = document.createElement("span");
      element.style.backgroundColor = value;
      document.body.append(element);
      const color = getComputedStyle(element).backgroundColor;
      element.remove();
      return color;
    };
    for (const variant of ["elevated", "outline", "soft", "plain"] as const) {
      render(<Coffees variant={variant} />);
      const card = screen.getAllByRole("article")[0];
      if (!card) throw new Error("No card.");
      const style = getComputedStyle(card);
      if (variant === "elevated") {
        expect(style.boxShadow).not.toBe("none");
        expect(style.backgroundColor).toBe(probe("var(--bt-bg-surface)"));
      }
      if (variant === "outline") {
        expect(style.borderTopWidth).toBe("1px");
        expect(style.boxShadow).toBe("none");
      }
      if (variant === "soft")
        expect(style.backgroundColor).toBe(probe("var(--bt-bg-control)"));
      if (variant === "plain") {
        expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
        const media = card.querySelector('[data-bt-part="catalog-card-media"]');
        expect(getComputedStyle(media ?? card).borderTopLeftRadius).not.toBe(
          "0px",
        );
      }
      cleanup();
    }
  });

  it("puts its media edge to edge at the top, as a tile at the start, or behind it with the words on a plate 8px in", () => {
    render(<Coffees mediaPosition="top" columns={2} />);
    let card = screen.getAllByRole("article")[0];
    let media = card?.querySelector('[data-bt-part="catalog-card-media"]');
    expect(box(media).top).toBe(box(card).top);
    expect(box(media).width).toBe(box(card).width);
    expect(box(media).height).toBeCloseTo((box(media).width * 3) / 4, 0);
    cleanup();
    render(<Coffees mediaPosition="start" columns={2} />);
    card = screen.getAllByRole("article")[0];
    media = card?.querySelector('[data-bt-part="catalog-card-media"]');
    const body = card?.querySelector('[data-bt-part="catalog-card-body"]');
    expect(box(media).width).toBe(48);
    expect(box(body).left - box(media).right).toBe(16);
    cleanup();
    render(<Coffees mediaPosition="background" columns={2} />);
    card = screen.getAllByRole("article")[0];
    media = card?.querySelector('[data-bt-part="catalog-card-media"]');
    const plate = card?.querySelector('[data-bt-part="catalog-card-body"]');
    expect(box(media)).toEqual(box(card));
    expect(box(plate).bottom).toBe(box(card).bottom - 8);
    expect(box(plate).left).toBe(box(card).left + 8);
  });

  it("lays rows out as one list with a hairline between them, the variant drawing the list's surface", () => {
    render(<Coffees layout="rows" />);
    const items = document.querySelector(".bt-catalog-items");
    const [first, second] = screen.getAllByRole("article");
    expect(getComputedStyle(second ?? document.body).borderTopWidth).toBe(
      "1px",
    );
    expect(getComputedStyle(first ?? document.body).boxShadow).toBe("none");
    expect(getComputedStyle(items ?? document.body).boxShadow).not.toBe("none");
    expect(first?.dataset["media"]).toBe("start");
  });

  it("opens a card into a dialog named by its title from its title's button, and goes back with focus on it", async () => {
    render(<Coffees withDetail />);
    const open = screen.getByRole("button", { name: "Huila" });
    open.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog", { name: "Huila" });
    expect(dialog.textContent).toContain("More about Huila");
    await settled();
    await waitFor(() => {
      const other = [
        ...document.querySelectorAll<HTMLElement>(".bt-catalog-card"),
      ].find((card) => card.textContent.includes("Guji"));
      expect(getComputedStyle(other ?? document.body).opacity).toBe("0");
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(open);
  });

  it("opens from a press anywhere on the card but its own buttons", async () => {
    render(<Coffees withDetail />);
    await userEvent.click(screen.getByRole("button", { name: "Add Guji" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.click(screen.getAllByTestId("art")[0] ?? document.body);
    expect(await screen.findByRole("dialog", { name: "Guji" })).toBeTruthy();
  });

  it("fades an open card's dialog in place with reduced motion", async () => {
    render(
      <MotionPreferenceContext value="reduced">
        <Coffees withDetail />
      </MotionPreferenceContext>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Guji" }));
    const dialog = await screen.findByRole("dialog", { name: "Guji" });
    await settled();
    expect(getComputedStyle(dialog).opacity).toBe("1");
    const [open, other] = document.querySelectorAll(".bt-catalog-card");
    expect(getComputedStyle(open ?? document.body).opacity).toBe("1");
    expect(getComputedStyle(other ?? document.body).opacity).toBe("0");
  });

  it("links a card's title to its page, a press elsewhere on it following the link, and a new-tab click left to the browser", async () => {
    const onNavigate = vi.fn(
      (_href: string, event: { preventDefault: () => void }) => {
        event.preventDefault();
      },
    );
    render(
      <Catalog.Items>
        <Catalog.Card
          title="Label printing"
          href="#labels"
          description="Print shipping labels at the counter."
          onNavigate={onNavigate}
        />
      </Catalog.Items>,
    );
    const link = screen.getByRole("link", { name: "Label printing" });
    expect(box(link).height).toBeGreaterThanOrEqual(24);
    await userEvent.click(
      screen.getByText("Print shipping labels at the counter."),
    );
    expect(onNavigate).toHaveBeenCalledWith("#labels", expect.anything());
    onNavigate.mockClear();
    link.addEventListener("click", (event) => {
      event.preventDefault();
    });
    await userEvent.keyboard("{Meta>}");
    await userEvent.click(link);
    await userEvent.keyboard("{/Meta}");
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("offers to clear a search that matches nothing, focus going to the toolbar's first control", async () => {
    render(<Coffees />);
    const search = screen.getByRole("searchbox", { name: "Search coffees" });
    await userEvent.type(search, "decaf");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(
      screen.getByRole("heading", { name: "No coffee matches" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "No coffees yet" }),
    ).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Clear filters" }),
    );
    expect(names()).toHaveLength(5);
    expect(document.activeElement).toBe(search);
  });

  it("shows its empty state only while it has no items", () => {
    render(<Coffees items={[]} />);
    expect(
      screen.getByRole("heading", { name: "No coffees yet" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "No coffee matches" }),
    ).toBeNull();
  });

  it("shows a page of items, the next one from Show more with focus on its first, and starts over when the search changes", async () => {
    render(<Coffees pageSize={2} />);
    expect(names()).toEqual(["Guji", "Huila"]);
    expect(screen.getByText("Showing 2 of 5")).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Show more coffees" }),
    );
    expect(names()).toEqual(["Guji", "Huila", "Cerrado", "Nyeri"]);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Add Cerrado" }),
    );
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search coffees" }),
      "o",
    );
    expect(names()).toHaveLength(2);
  });

  it("puts the search and filters at its toolbar's start and the count, sort and view at its end, stacking the filters under 640px", () => {
    render(<Coffees width={1200} />);
    const toolbar = screen.getByRole("group", { name: "Find a coffee" });
    const search = screen.getByRole("searchbox", { name: "Search coffees" });
    const view = screen.getByRole("radiogroup", { name: "Show coffees as" });
    expect(box(view).right).toBe(box(toolbar).right);
    expect(box(search.closest(".bt-search-field")).left).toBe(
      box(toolbar).left,
    );
    expect(
      screen
        .getByText("5 coffees")
        .closest("[data-bt-part]")
        ?.getAttribute("data-bt-part"),
    ).toBe("catalog-count");
    cleanup();
    render(<Coffees width={400} />);
    const narrow = screen.getByRole("group", { name: "Find a coffee" });
    const roast = screen.getByRole("radiogroup", { name: "Roast" });
    expect(box(roast).width).toBe(box(narrow).width);
    expect(box(roast).top).toBeGreaterThan(
      box(screen.getByRole("searchbox", { name: "Search coffees" })).bottom,
    );
  });

  it("says how to fix a part used outside a catalog", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Catalog.Search label="Search coffees" />)).toThrow(
      /Catalog.Search sits outside a Catalog. Fix:/,
    );
    vi.restoreAllMocks();
  });

  it("passes each part its ref, class and other props", () => {
    const refs = {
      toolbar: createRef<HTMLDivElement>(),
      items: createRef<HTMLDivElement>(),
      card: createRef<HTMLElement>(),
    };
    render(
      <Catalog items={COFFEES}>
        {() => (
          <>
            <Catalog.Toolbar
              ref={refs.toolbar}
              className="custom"
              data-testid="toolbar"
            />
            <Catalog.Items
              ref={refs.items}
              className="custom"
              data-testid="items"
            >
              <Catalog.Card
                ref={refs.card}
                title="Guji"
                className="custom"
                data-testid="card"
              />
            </Catalog.Items>
          </>
        )}
      </Catalog>,
    );
    expect(refs.toolbar.current?.className).toBe("bt-catalog-toolbar custom");
    expect(refs.items.current?.className).toBe("bt-catalog-items custom");
    expect(refs.card.current?.className).toBe("bt-catalog-card custom");
    for (const [name, ref] of Object.entries(refs))
      expect(ref.current).toBe(screen.getByTestId(name));
  });
});
