import "@butteryui/core/styles.css";
import "../../styles.css";
import { FloatingLanes, Menu, publishSettled } from "@butteryui/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as browser } from "vitest/browser";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import { page } from "vitest/browser";
import { AppPage } from "../app-page/AppPage.tsx";
import { DataTable } from "./DataTable.tsx";
import type { DataTableColumn, DataTableSort } from "./DataTable.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly status: string;
  readonly total: number;
}

const ORDERS: readonly Order[] = Array.from({ length: 6 }, (_, index) => ({
  id: `ORD-${String(1040 + index)}`,
  customer:
    [
      "Ines Vale",
      "Tomas Reyes",
      "Mira Okafor",
      "Lena Park",
      "Omar Haddad",
      "Ana de la Cruz",
    ][index] ?? "",
  status: index % 2 === 0 ? "Paid" : "Refunded",
  total: 18.5 + index * 7,
}));

const COLUMNS: readonly DataTableColumn<Order>[] = [
  {
    id: "id",
    header: "Order",
    minWidth: "sm",
    cell: (order) => <DataTable.Id value={order.id} />,
  },
  {
    id: "customer",
    header: "Customer",
    minWidth: "md",
    grow: 2,
    sortable: true,
    cell: (order) => order.customer,
  },
  {
    id: "status",
    header: "Status",
    minWidth: "sm",
    skeleton: "badge",
    cell: (order) => order.status,
  },
  {
    id: "total",
    header: "Total",
    minWidth: "sm",
    align: "end",
    sortable: true,
    cell: (order) => <DataTable.Amount value={order.total} currency="USD" />,
  },
];

function Orders(
  props: Partial<Parameters<typeof DataTable<Order>>[0]> & {
    readonly width?: number;
  },
): ReactElement {
  const { width = 900, ...rest } = props;
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <DataTable<Order>
        label="Orders"
        columns={COLUMNS}
        rows={ORDERS}
        rowKey={(order) => order.id}
        rowLabel={(order) => order.id}
        {...rest}
      />
    </div>
  );
}

function textCell(row: HTMLElement | undefined): HTMLElement {
  const cell = row?.querySelector<HTMLElement>(
    '[role="cell"]:not([data-check])',
  );
  if (!cell) throw new Error("No cell.");
  return cell;
}

function rows(): HTMLElement[] {
  const table = screen.getByRole("table", { name: "Orders" });
  const [, body] = within(table).getAllByRole("rowgroup");
  if (!body) throw new Error("No body.");
  return within(body).getAllByRole("row");
}

describe("DataTable", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DataTable<Order>
        ref={ref}
        label="Orders"
        columns={COLUMNS}
        rows={ORDERS}
        rowKey={(order) => order.id}
        className="custom"
        data-testid="table"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("DataTable");
    expect(ref.current?.dataset["testid"]).toBe("table");
    expect(ref.current?.className).toBe("bt-data-table custom");
  });

  it("is a table named by its label, 36px rows, numbers at the end in tabular figures", () => {
    render(<Orders />);
    const table = screen.getByRole("table", { name: "Orders" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Order", "Customer", "Status", "Total"]);
    const [first] = rows();
    expect(first?.getBoundingClientRect().height).toBe(36);
    const total = within(first ?? table).getAllByRole("cell")[3];
    expect(total?.textContent).toBe("$18.50USD");
    expect(getComputedStyle(total ?? table).justifyContent).toBe("flex-end");
    expect(getComputedStyle(total ?? table).fontVariantNumeric).toBe(
      "tabular-nums",
    );
  });

  it("shares its width among the columns by their grow, never below their least, and scrolls sideways inside itself when they don't fit", () => {
    render(<Orders width={900} />);
    const [order, customer, status] = screen.getAllByRole("columnheader");
    expect(order?.getBoundingClientRect().width).toBeCloseTo(180, 0);
    expect(customer?.getBoundingClientRect().width).toBeCloseTo(360, 0);
    expect(status?.getBoundingClientRect().width).toBeCloseTo(180, 0);
    cleanup();
    render(<Orders width={300} />);
    const scroll = document.querySelector<HTMLElement>(
      '[data-bt-part="scroll"]',
    );
    if (!scroll) throw new Error("No scroll area.");
    expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  });

  it("keeps its first column in place while it scrolls sideways, drawing an edge beside it", async () => {
    render(<Orders width={300} selectable />);
    const scroll = document.querySelector<HTMLElement>(
      '[data-bt-part="scroll"]',
    );
    if (!scroll) throw new Error("No scroll area.");
    const firstCell = within(rows()[0] ?? document.body).getAllByRole(
      "cell",
    )[1];
    const before = firstCell?.getBoundingClientRect().left ?? 0;
    scroll.scrollLeft = 120;
    await waitFor(() => {
      expect(scroll.hasAttribute("data-scrolled-aside")).toBe(true);
    });
    expect(firstCell?.getBoundingClientRect().left).toBe(before);
    expect(
      getComputedStyle(firstCell ?? document.body, "::after").content,
    ).toBe('""');
  });

  it("selects rows, the header box taking the whole page and showing mixed when only some are", async () => {
    const onSelectedChange = vi.fn();
    render(<Orders selectable onSelectedChange={onSelectedChange} />);
    const all = screen.getByRole("checkbox", {
      name: "Select all rows on this page",
    });
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select ORD-1041" }),
    );
    expect(all.getAttribute("aria-checked")).toBe("mixed");
    expect(rows()[1]?.hasAttribute("data-selected")).toBe(true);
    await userEvent.click(all);
    expect(onSelectedChange).toHaveBeenLastCalledWith(
      new Set(ORDERS.map((order) => order.id)),
    );
    expect(all.getAttribute("aria-checked")).toBe("true");
  });

  it("sorts from its headers, ascending, then descending, then none", async () => {
    function Sorted(): ReactElement {
      const [sort, setSort] = useState<DataTableSort | null>(null);
      return (
        <>
          <Orders sort={sort} onSortChange={setSort} />
          <output>
            {sort === null ? "none" : `${sort.column} ${sort.direction}`}
          </output>
        </>
      );
    }
    render(<Sorted />);
    const header = screen.getByRole("columnheader", { name: /Customer/ });
    expect(header.getAttribute("aria-sort")).toBe("none");
    const button = within(header).getByRole("button");
    await userEvent.click(button);
    expect(header.getAttribute("aria-sort")).toBe("ascending");
    await userEvent.click(button);
    expect(screen.getByRole("status").textContent).toBe("customer descending");
    await userEvent.click(button);
    expect(header.getAttribute("aria-sort")).toBe("none");
  });

  it("opens a row's actions from its … button, named for the row", async () => {
    const onRefund = vi.fn();
    render(
      <Orders
        rowActions={(order) => (
          <Menu.Item
            onSelect={() => {
              onRefund(order.id);
            }}
          >
            Refund
          </Menu.Item>
        )}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Actions for ORD-1042" }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Refund" }),
    );
    expect(onRefund).toHaveBeenCalledWith("ORD-1042");
  });

  it("leaves a row's last cell empty when its actions come back empty", () => {
    render(
      <Orders
        rowActions={(order) =>
          order.id === "ORD-1042" ? <Menu.Item>Refund</Menu.Item> : null
        }
      />,
    );
    expect(
      screen.getByRole("button", { name: "Actions for ORD-1042" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /^Actions for/ }),
    ).toHaveLength(1);
    for (const row of rows()) {
      expect(within(row).getAllByRole("cell")).toHaveLength(COLUMNS.length + 1);
    }
  });

  it("fades its end edge while more of it lies to the side, and stops once scrolled to the end", async () => {
    render(<Orders width={300} />);
    const scroll = document.querySelector<HTMLElement>(
      '[data-bt-part="scroll"]',
    );
    if (!scroll) throw new Error("No scroll area.");
    await waitFor(() => {
      expect(scroll.hasAttribute("data-more-aside")).toBe(true);
    });
    expect(getComputedStyle(scroll).maskImage).toContain("linear-gradient");
    scroll.scrollLeft = scroll.scrollWidth;
    await waitFor(() => {
      expect(scroll.hasAttribute("data-more-aside")).toBe(false);
    });
    expect(getComputedStyle(scroll).maskImage).toBe("none");
    cleanup();
    render(<Orders width={900} />);
    const wide = document.querySelector<HTMLElement>('[data-bt-part="scroll"]');
    expect(wide?.hasAttribute("data-more-aside")).toBe(false);
  });

  it("links a row to its own page from a cell, in the row's text color, tall enough to hit", () => {
    render(
      <Orders
        columns={[
          {
            id: "customer",
            header: "Customer",
            minWidth: "md",
            cell: (order) => (
              <DataTable.Link href={`#customers/${order.id}`}>
                {order.customer}
              </DataTable.Link>
            ),
          },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: "Mira Okafor" });
    expect(link.getAttribute("href")).toBe("#customers/ORD-1042");
    expect(link.dataset["btPart"]).toBe("data-table-link");
    expect(link.getBoundingClientRect().height).toBe(28);
    const cell = link.closest<HTMLElement>("[role='cell']");
    if (!cell) throw new Error("No cell.");
    expect(getComputedStyle(link).color).toBe(getComputedStyle(cell).color);
    expect(getComputedStyle(link).textDecorationLine).toBe("none");
  });

  it("is a region named by its label that takes focus when its columns overflow, so the keyboard can scroll it", () => {
    render(<Orders width={320} size="compact" />);
    const region = screen.getByRole("region", { name: "Orders" });
    expect(region.tabIndex).toBe(0);
    expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    cleanup();
    render(<Orders width={900} size="compact" />);
    expect(
      screen.getByRole("region", { name: "Orders" }).hasAttribute("tabindex"),
    ).toBe(false);
  });

  it("shows skeleton rows shaped like its columns while it loads, as many as a page holds", () => {
    render(
      <Orders
        loading
        selectable
        pagination={{
          page: 1,
          pageSize: 5,
          total: 42,
          onPageChange: () => undefined,
        }}
      />,
    );
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");
    const skeletonRows = document.querySelectorAll(
      '[data-bt-part="data-table-body"] > [data-bt-part="data-table-row"]',
    );
    expect(skeletonRows).toHaveLength(5);
    expect(skeletonRows[0]?.getBoundingClientRect().height).toBe(36);
    expect(
      skeletonRows[0]?.querySelector('[data-shape="badge"]'),
    ).not.toBeNull();
  });

  it("paginates under the table, Previous held back on the first page", async () => {
    const onPageChange = vi.fn();
    render(
      <Orders pagination={{ page: 1, pageSize: 6, total: 42, onPageChange }} />,
    );
    expect(screen.getByText("1–6 of 42")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Previous" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("offers Clear all when filters leave no rows, and shows the empty state when there's no data", async () => {
    const onClearAll = vi.fn();
    render(<Orders rows={[]} onClearAll={onClearAll} />);
    expect(screen.getByText("No results")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
    cleanup();
    render(<Orders rows={[]} empty={<p>No orders yet</p>} />);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("No orders yet")).toBeTruthy();
  });

  it("lines its no-results row up with the columns, its text over the first one's and Clear all ending with the last one's", () => {
    render(<Orders rows={[]} onClearAll={() => undefined} />);
    const headers = screen.getAllByRole("columnheader");
    const label = (header: HTMLElement | undefined): DOMRect => {
      const text = header?.querySelector(".bt-truncate");
      if (!text) throw new Error("No header text.");
      return text.getBoundingClientRect();
    };
    const words = document.createRange();
    words.selectNodeContents(screen.getByText("No results"));
    expect(words.getBoundingClientRect().left).toBe(label(headers[0]).left);
    expect(
      screen.getByRole("button", { name: "Clear all" }).getBoundingClientRect()
        .right,
    ).toBe(label(headers.at(-1)).right);
  });

  it("drops selection and pagination when compact", () => {
    render(
      <Orders
        size="compact"
        selectable
        pagination={{
          page: 1,
          pageSize: 6,
          total: 42,
          onPageChange: () => undefined,
        }}
      />,
    );
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("takes compact density's shorter rows when compact, in a comfortable app", () => {
    render(<Orders />);
    expect(rows()[0]?.getBoundingClientRect().height).toBe(36);
    cleanup();
    render(<Orders size="compact" />);
    expect(rows()[0]?.getBoundingClientRect().height).toBe(32);
    expect(
      screen
        .getAllByRole("columnheader")[0]
        ?.parentElement?.getBoundingClientRect().height,
    ).toBe(32);
  });

  it("keeps the floating lanes above its pagination in a filled page, and its end clear of them", async () => {
    render(
      <>
        <FloatingLanes />
        <div style={{ display: "flex", blockSize: "520px" }}>
          <AppPage fill>
            <AppPage.Section>
              <DataTable<Order>
                label="Orders"
                columns={COLUMNS}
                rows={ORDERS}
                rowKey={(order) => order.id}
                rowLabel={(order) => order.id}
                pagination={{
                  page: 1,
                  pageSize: 6,
                  total: 42,
                  onPageChange: () => undefined,
                }}
              />
            </AppPage.Section>
          </AppPage>
        </div>
        <FloatingLanes.Item>
          <div style={{ inlineSize: "240px", blockSize: "36px" }}>
            Order refunded
          </div>
        </FloatingLanes.Item>
      </>,
    );
    const table = document.querySelector<HTMLElement>(".bt-data-table");
    expect(table?.hasAttribute("data-pinned")).toBe(true);
    const pagination = document.querySelector('[data-bt-part="pagination"]');
    await waitFor(() => {
      const toast = screen.getByText("Order refunded").getBoundingClientRect();
      expect(toast.bottom).toBeLessThanOrEqual(
        (pagination?.getBoundingClientRect().top ?? 0) - 8 + 0.5,
      );
    });
    const scroll = table?.querySelector<HTMLElement>('[data-bt-part="scroll"]');
    expect(
      Number.parseFloat(
        getComputedStyle(scroll ?? document.body, "::after").blockSize,
      ),
    ).toBeGreaterThan(0);
  });

  it("keeps its pagination in place in a filled page however far the lanes reach", async () => {
    const { innerWidth, innerHeight } = window;
    await page.viewport(800, 500);
    onTestFinished(async () => {
      await page.viewport(innerWidth, innerHeight);
    });
    render(
      <>
        <FloatingLanes />
        <div style={{ display: "flex", blockSize: "500px" }}>
          <AppPage fill>
            <AppPage.Section>
              <DataTable<Order>
                label="Orders"
                columns={COLUMNS}
                rows={ORDERS}
                rowKey={(order) => order.id}
                rowLabel={(order) => order.id}
                pagination={{
                  page: 1,
                  pageSize: 6,
                  total: 42,
                  onPageChange: () => undefined,
                }}
              />
            </AppPage.Section>
          </AppPage>
        </div>
        <FloatingLanes.Item>
          <div style={{ inlineSize: "240px", blockSize: "400px" }}>
            Set up your shop
          </div>
        </FloatingLanes.Item>
      </>,
    );
    const table = document.querySelector<HTMLElement>(".bt-data-table");
    const pagination = document.querySelector('[data-bt-part="pagination"]');
    const scroll = table?.querySelector<HTMLElement>('[data-bt-part="scroll"]');
    if (!table || !pagination || !scroll) throw new Error("No table.");
    await waitFor(() => {
      const guide = screen
        .getByText("Set up your shop")
        .getBoundingClientRect();
      expect(guide.bottom).toBeLessThanOrEqual(
        pagination.getBoundingClientRect().top - 8 + 0.5,
      );
    });
    const before = pagination.getBoundingClientRect().top;
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(table.scrollHeight).toBe(table.clientHeight);
    expect(pagination.getBoundingClientRect().top).toBe(before);
    expect(pagination.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      table.getBoundingClientRect().bottom + 0.5,
    );
    const reach = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--bt-lane-clearance",
      ),
    );
    expect(reach).toBeGreaterThan(scroll.clientHeight);
    expect(scroll.scrollHeight).toBeGreaterThan(reach);
  });

  it("keeps its header over the sticky first column while it scrolls down", () => {
    render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          inlineSize: "900px",
          blockSize: "160px",
        }}
      >
        <DataTable<Order>
          label="Orders"
          columns={COLUMNS}
          rows={ORDERS}
          rowKey={(order) => order.id}
          selectable
        />
      </div>,
    );
    const scroll = document.querySelector<HTMLElement>(
      '[data-bt-part="scroll"]',
    );
    if (!scroll) throw new Error("No scroll area.");
    expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight);
    scroll.scrollTop = 60;
    const selectAll = screen.getByRole("checkbox", {
      name: "Select all rows on this page",
    });
    const box = selectAll.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    expect(selectAll.closest('[role="columnheader"]')?.contains(hit)).toBe(
      true,
    );
  });

  it("keeps only rows in its body while it loads, the loading words in a row of their own", () => {
    render(<Orders loading />);
    const table = screen.getByRole("table", { name: "Orders" });
    const body = table.querySelector('[data-bt-part="data-table-body"]');
    if (!body) throw new Error("No body.");
    for (const child of body.children)
      expect(child.getAttribute("role")).toBe("row");
    expect(
      within(table).getByRole("cell", { name: "Loading rows" }),
    ).toBeTruthy();
  });

  it("lets focus rings show above and below what's in a cell, and rings only what has focus", async () => {
    render(<Orders selectable />);
    const cell = screen
      .getByRole("checkbox", { name: "Select ORD-1040" })
      .closest<HTMLElement>('[role="cell"]');
    if (!cell) throw new Error("No cell.");
    expect(getComputedStyle(cell).overflowY).toBe("visible");
    screen.getByRole("checkbox", { name: "Select ORD-1040" }).focus();
    await browser.keyboard("{Shift>}{Tab}{/Shift}");
    await browser.keyboard("{Tab}");
    const scroll = document.querySelector<HTMLElement>(
      '[data-bt-part="scroll"]',
    );
    if (!scroll) throw new Error("No scroll area.");
    expect(getComputedStyle(scroll).outlineStyle).toBe("none");
  });

  it("lifts a row holding focus above the next in compact density, so its button's ring shows whole", async () => {
    render(
      <div data-bt-density="compact">
        <Orders
          rowActions={() => (
            <Menu.Item onSelect={() => undefined}>Refund</Menu.Item>
          )}
        />
      </div>,
    );
    const button = screen.getByRole("button", {
      name: /^Actions for ORD-1040/,
    });
    const [first, second] = rows();
    if (!first || !second) throw new Error("No rows.");
    await browser.keyboard("{Shift}");
    button.focus();
    const ring =
      button.getBoundingClientRect().bottom +
      Number.parseFloat(getComputedStyle(button).outlineOffset) +
      Number.parseFloat(getComputedStyle(button).outlineWidth);
    expect(ring).toBeGreaterThan(first.getBoundingClientRect().bottom);
    expect(getComputedStyle(first).zIndex).toBe("10");
    expect(getComputedStyle(second).zIndex).toBe("auto");
  });

  it("fades arriving rows in over 100ms with reduced motion", () => {
    const { rerender } = render(
      <div data-bt-motion="reduced">
        <Orders loading />
      </div>,
    );
    rerender(
      <div data-bt-motion="reduced">
        <Orders />
      </div>,
    );
    const [first] = rows();
    if (!first) throw new Error("No rows.");
    expect(getComputedStyle(first).animationDuration).toBe("0.1s");
  });

  it("shows a selected row's tint while hovered", async () => {
    render(<Orders selectable defaultSelected={new Set(["ORD-1041"])} />);
    const [, second] = rows();
    if (!second) throw new Error("No second row.");
    const cell = second.querySelector<HTMLElement>(
      '[role="cell"]:not([data-check])',
    );
    if (!cell) throw new Error("No cell.");
    const resting = getComputedStyle(cell).backgroundColor;
    await browser.hover(cell);
    expect(getComputedStyle(cell).backgroundColor).toBe(resting);
  });

  it("shades every second body row with the section's gray when striped, selection and a hover still painting over it", async () => {
    render(
      <Orders
        variant="striped"
        selectable
        defaultSelected={new Set(["ORD-1043"])}
      />,
    );
    const body = rows();
    const fill = (index: number): string =>
      getComputedStyle(textCell(body[index])).backgroundColor;
    expect(fill(0)).toBe("rgb(255, 255, 255)");
    expect(fill(1)).toBe("rgb(247, 247, 247)");
    expect(fill(2)).toBe("rgb(255, 255, 255)");
    expect(fill(3)).toBe("rgb(233, 240, 253)");
    expect(fill(5)).toBe("rgb(247, 247, 247)");
    const [, customer] = screen.getAllByRole("columnheader");
    expect(getComputedStyle(customer ?? document.body).backgroundColor).toBe(
      "rgb(255, 255, 255)",
    );
    const hovered = (index: number): string =>
      getComputedStyle(textCell(body[index])).backgroundImage;
    await browser.hover(textCell(body[2]));
    expect(hovered(2)).toContain("rgb(241, 241, 241)");
    await browser.hover(textCell(body[1]));
    expect(hovered(1)).toContain("rgb(241, 241, 241)");
    expect(body[0]?.getBoundingClientRect().height).toBe(36);
  });

  it("draws a line between its cells inside a 1px frame with 12px corners when bordered, its rows the height they always are", () => {
    render(<Orders variant="bordered" selectable />);
    const [first] = rows();
    const cells = first?.querySelectorAll('[role="cell"]') ?? [];
    const [check, id] = [...cells].map((cell) => getComputedStyle(cell));
    expect(check?.borderLeftWidth).toBe("0px");
    expect(id?.borderLeftWidth).toBe("1px");
    expect(id?.borderLeftColor).toBe("rgb(235, 235, 235)");
    const [, order] = screen.getAllByRole("columnheader");
    expect(getComputedStyle(order ?? document.body).borderLeftWidth).toBe(
      "1px",
    );
    const scroll = document.querySelector('[data-bt-part="scroll"]');
    if (!scroll) throw new Error("No scroll area.");
    const frame = getComputedStyle(scroll);
    expect(frame.outlineStyle).toBe("solid");
    expect(frame.outlineWidth).toBe("1px");
    expect(frame.outlineOffset).toBe("-1px");
    expect(frame.outlineColor).toBe("rgb(235, 235, 235)");
    expect(frame.borderTopLeftRadius).toBe("12px");
    expect(first?.getBoundingClientRect().height).toBe(36);
    cleanup();
    render(<Orders variant="bordered" size="compact" />);
    const [compact] = rows();
    expect(compact?.getBoundingClientRect().height).toBe(32);
    expect(
      getComputedStyle(
        compact?.querySelectorAll('[role="cell"]')[1] ??
          compact ??
          document.body,
      ).borderLeftWidth,
    ).toBe("1px");
  });

  it("rings a bordered table's scroll area on keyboard focus in place of its frame, and keeps its header over the first column as it scrolls", async () => {
    render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          inlineSize: "320px",
          blockSize: "160px",
        }}
      >
        <DataTable<Order>
          label="Orders"
          columns={COLUMNS.map((column) => ({
            ...column,
            sortable: false,
            cell: (order: Order) => order.customer,
          }))}
          rows={ORDERS}
          rowKey={(order) => order.id}
          variant="bordered"
        />
      </div>,
    );
    const scroll = screen.getByRole("region", { name: "Orders" });
    expect(getComputedStyle(scroll).outlineColor).toBe("rgb(235, 235, 235)");
    expect(getComputedStyle(scroll).outlineWidth).toBe("1px");
    await browser.keyboard("{Tab}");
    expect(document.activeElement).toBe(scroll);
    const ring = getComputedStyle(scroll);
    expect(ring.outlineColor).toBe("rgb(40, 98, 224)");
    expect(ring.outlineWidth).toBe("2px");
    scroll.scrollTop = 60;
    const header = screen.getAllByRole("columnheader")[0];
    if (!header) throw new Error("No header.");
    const box = header.getBoundingClientRect();
    expect(box.top).toBe(scroll.getBoundingClientRect().top);
    expect(
      header.contains(
        document.elementFromPoint(box.left + 8, box.top + box.height / 2),
      ),
    ).toBe(true);
  });

  it("keeps Clear all in view when filters leave nothing in a table wider than its box", () => {
    render(<Orders width={320} rows={[]} onClearAll={() => undefined} />);
    const scroll = document.querySelector<HTMLElement>(
      '[data-bt-part="scroll"]',
    );
    const clear = screen.getByRole("button", { name: "Clear all" });
    if (!scroll) throw new Error("No scroll area.");
    expect(clear.getBoundingClientRect().right).toBeLessThanOrEqual(
      scroll.getBoundingClientRect().right + 0.5,
    );
  });

  it("draws the first column's edge once scrolled sideways right to left", () => {
    render(
      <div dir="rtl">
        <Orders width={320} />
      </div>,
    );
    const scroll = document.querySelector<HTMLElement>(
      '[data-bt-part="scroll"]',
    );
    if (!scroll) throw new Error("No scroll area.");
    scroll.scrollLeft = -80;
    scroll.dispatchEvent(new Event("scroll"));
    return waitFor(() => {
      expect(scroll.hasAttribute("data-scrolled-aside")).toBe(true);
    });
  });

  it("keeps its style when it shows the empty state", () => {
    render(
      <DataTable<Order>
        label="Orders"
        columns={COLUMNS}
        rows={[]}
        rowKey={(order) => order.id}
        empty={<p>No orders yet</p>}
        style={{ minBlockSize: "120px" }}
      />,
    );
    expect(
      document.querySelector<HTMLElement>(".bt-data-table")?.style.minBlockSize,
    ).toBe("120px");
  });

  it("fades rows in only as they replace skeleton rows, not when they re-sort", async () => {
    const { rerender } = render(<Orders loading />);
    rerender(<Orders />);
    const body = () =>
      document.querySelector<HTMLElement>('[data-bt-part="data-table-body"]');
    expect(body()?.hasAttribute("data-arrived")).toBe(true);
    await waitFor(() => {
      expect(body()?.hasAttribute("data-arrived")).toBe(false);
    });
    rerender(<Orders rows={[...ORDERS].reverse()} />);
    expect(body()?.hasAttribute("data-arrived")).toBe(false);
  });

  it("titles a router link with its text when it renders as the child", () => {
    render(
      <Orders
        columns={[
          {
            id: "customer",
            header: "Customer",
            minWidth: "md",
            cell: (order) => (
              <DataTable.Link asChild>
                <a href={`#${order.id}`}>{order.customer}</a>
              </DataTable.Link>
            ),
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Mira Okafor" }).getAttribute("title"),
    ).toBe("Mira Okafor");
  });

  it("lines an end-aligned sortable header up with its numbers, its arrow 14px", () => {
    render(<Orders />);
    const header = screen.getByRole("columnheader", { name: /Total/ });
    const label = header.querySelector<HTMLElement>(".bt-truncate");
    const amount = document.querySelector<HTMLElement>(
      '[data-bt-part="data-table-body"] [data-bt-part="data-table-amount"]',
    );
    if (!label || !amount) throw new Error("No label or amount.");
    expect(
      Math.abs(
        label.getBoundingClientRect().right -
          amount.getBoundingClientRect().right,
      ),
    ).toBeLessThanOrEqual(1);
    const arrow = header.querySelector('[data-bt-part="sort"] svg');
    expect(arrow?.getBoundingClientRect().width).toBe(14);
  });

  it("says 0 results when there's nothing to page through", () => {
    render(
      <Orders
        rows={[]}
        onClearAll={() => undefined}
        pagination={{
          page: 1,
          pageSize: 6,
          total: 0,
          onPageChange: () => undefined,
        }}
      />,
    );
    expect(screen.getByText("0 results")).toBeTruthy();
  });

  it("forwards refs and classes on its amount and id parts", () => {
    const amount = createRef<HTMLSpanElement>();
    const id = createRef<HTMLSpanElement>();
    render(
      <>
        <DataTable.Amount
          ref={amount}
          className="price"
          value={12}
          currency="USD"
        />
        <DataTable.Id ref={id} className="code" value="ORD-1" />
      </>,
    );
    expect(amount.current?.classList.contains("price")).toBe(true);
    expect(id.current?.classList.contains("code")).toBe(true);
  });

  it("isn't pinned outside a filled page", () => {
    render(<Orders />);
    expect(
      document.querySelector(".bt-data-table")?.hasAttribute("data-pinned"),
    ).toBe(false);
  });
});

describe("DataTable size compact", () => {
  it("warns, with the fix, when it's given pagination or selection, which a compact table leaves out", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Orders
        label="Recent orders"
        size="compact"
        pagination={{
          page: 1,
          pageSize: 2,
          total: ORDERS.length,
          onPageChange: () => undefined,
        }}
      />,
    );
    expect(warn).toHaveBeenCalledWith(
      '[buttery:DataTable] The "Recent orders" table is size="compact", which leaves out pagination, so its later pages can\'t be reached. Fix: use size="default" for a table people page through, or show every row without pagination.',
    );
    warn.mockRestore();
  });
});
