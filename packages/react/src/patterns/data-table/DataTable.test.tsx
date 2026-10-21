import "@buttery/core/styles.css";
import "../../styles.css";
import { FloatingLanes, Menu, publishSettled } from "@buttery/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
      '[data-bt-part="body"] > [data-bt-part="row"]',
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

  it("keeps the floating lanes above its pagination in a filled page, and its end clear of them", async () => {
    render(
      <>
        <FloatingLanes />
        <div style={{ display: "flex", blockSize: "520px" }}>
          <AppPage fill>
            <AppPage.Section>
              <Orders
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
        getComputedStyle(scroll ?? document.body).paddingBlockEnd,
      ),
    ).toBeGreaterThan(0);
  });

  it("isn't pinned outside a filled page", () => {
    render(<Orders />);
    expect(
      document.querySelector(".bt-data-table")?.hasAttribute("data-pinned"),
    ).toBe(false);
  });
});
