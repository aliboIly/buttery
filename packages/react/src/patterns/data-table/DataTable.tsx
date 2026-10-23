import {
  Icon,
  Menu,
  Skeleton,
  Slot,
  cx,
  hasContent,
  useControllableState,
  useFloatingObstacle,
  warnOnce,
} from "@butteryui/core";
import type { CssVariables } from "@butteryui/core";
import { ArrowDown, ArrowUp, ChevronsUpDown, Ellipsis } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { isValidElement, useCallback, useEffect, useState } from "react";
import type {
  AnimationEvent,
  CSSProperties,
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import { Checkbox } from "../../components/checkbox/Checkbox.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { Tooltip } from "../../components/tooltip/Tooltip.tsx";
import { useAppPage } from "../app-page/app-page-context.ts";

/** A column's least width: `xs` 64, `sm` 96, `md` 144, `lg` 192 or `xl` 256. */
export type ColumnWidth = "xs" | "sm" | "md" | "lg" | "xl";

/** The shape a column's cells take while its rows load. */
export type SkeletonShape = "text" | "badge" | "number";

/** One column of a `DataTable`. */
export interface DataTableColumn<Row> {
  /** Names the column for sorting and keys. */
  readonly id: string;
  /** The header's text. */
  readonly header: string;
  /** What a row shows in this column. Text truncates with its full text on hover. */
  readonly cell: (row: Row) => ReactNode;
  /** The least the column takes before the table scrolls sideways. Defaults to `"sm"`. */
  readonly minWidth?: ColumnWidth | undefined;
  /** Its share of the table's width against the other columns' `grow`, never less than its least width. Defaults to 1. */
  readonly grow?: number | undefined;
  /** `"start"` (the default), or `"end"` for numbers, which also sets them tabular. */
  readonly align?: "start" | "end" | undefined;
  /** Whether the header sorts the table. */
  readonly sortable?: boolean | undefined;
  /** What its cells look like while rows load. Defaults to `"text"` (`"number"` when aligned to the end). */
  readonly skeleton?: SkeletonShape | undefined;
}

/** Which column sorts the table, and which way. */
export interface DataTableSort {
  /** The id of the column that sorts the table. */
  readonly column: string;
  /** Which way: `"ascending"` or `"descending"`. */
  readonly direction: "ascending" | "descending";
}

/** Where the rows shown sit among all of them, for the pagination under the table. */
export interface DataTablePagination {
  /** The page shown, from 1. */
  readonly page: number;
  /** How many rows a page holds. */
  readonly pageSize: number;
  /** How many rows there are in all. */
  readonly total: number;
  /** Called with the page Previous or Next goes to. */
  readonly onPageChange: (page: number) => void;
}

/** The words a `DataTable` uses, for other languages. */
export interface DataTableLabels {
  /** Names the header's checkbox, which selects the page. */
  readonly selectAll: string;
  /** Names a row's checkbox, from the row's label. */
  readonly selectRow: (row: string) => string;
  /** Names the actions column for screen readers. */
  readonly actions: string;
  /** Names a row's "…" button, from the row's label. */
  readonly actionsFor: (row: string) => string;
  /** The button that goes back a page. */
  readonly previous: string;
  /** The button that goes on a page. */
  readonly next: string;
  /** Which rows show, such as "1–14 of 42". */
  readonly range: (first: number, last: number, total: number) => string;
  /** The title of the row shown when filters leave nothing. */
  readonly noResults: string;
  /** The line under it. */
  readonly noResultsBody: string;
  /** The button that clears the filters. */
  readonly clearAll: string;
  /** What screen readers hear while the rows load. */
  readonly loading: string;
}

const LABELS: DataTableLabels = {
  selectAll: "Select all rows on this page",
  selectRow: (row) => `Select ${row}`,
  actions: "Actions",
  actionsFor: (row) => `Actions for ${row}`,
  previous: "Previous",
  next: "Next",
  range: (first, last, total) =>
    total === 0
      ? "0 results"
      : `${first.toLocaleString()}–${last.toLocaleString()} of ${total.toLocaleString()}`,
  noResults: "No results",
  noResultsBody: "Try other filters or a different search.",
  clearAll: "Clear all",
  loading: "Loading rows",
};

/** Props for `DataTable`. */
export interface DataTableProps<Row> extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** Names the table for screen readers, such as "Orders". */
  readonly label: string;
  /** The columns, in order. */
  readonly columns: readonly DataTableColumn<Row>[];
  /** The rows to show: the current page, sorted and filtered as you want them. */
  readonly rows: readonly Row[];
  /** A stable key for each row, also what selection holds. */
  readonly rowKey: (row: Row) => string;
  /** A short name for each row, for its checkbox and its actions, such as the order number. */
  readonly rowLabel?: ((row: Row) => string) | undefined;
  /** Adds a checkbox column. Defaults to `false`; `size="compact"` never has one. */
  readonly selectable?: boolean | undefined;
  /** The selected rows' keys. Pair with `onSelectedChange` to control them. */
  readonly selected?: ReadonlySet<string> | undefined;
  /** The rows selected at first when uncontrolled. */
  readonly defaultSelected?: ReadonlySet<string> | undefined;
  /** Called with the new selection. */
  readonly onSelectedChange?:
    ((selected: ReadonlySet<string>) => void) | undefined;
  /** The current sort, or `null` for none. Sorting the rows is up to you. */
  readonly sort?: DataTableSort | null | undefined;
  /** Called when a sortable header is pressed: ascending, then descending, then none. */
  readonly onSortChange?: ((sort: DataTableSort | null) => void) | undefined;
  /**
   * A row's actions, as `Menu.Item`s, behind a "…" button in its last cell. Return `null` for a row with
   * nothing to do: its cell stays empty, with no button.
   */
  readonly rowActions?: ((row: Row) => ReactNode) | undefined;
  /** Shows skeleton rows shaped like each column while the rows load. */
  readonly loading?: boolean | undefined;
  /** The pagination under the table. `size="compact"` never has one. */
  readonly pagination?: DataTablePagination | undefined;
  /** What shows in the table's place when there's no data at all, usually an `EmptyState`. */
  readonly empty?: ReactNode;
  /** When filters leave no rows: a row across the table with "Clear all", which calls this. */
  readonly onClearAll?: (() => void) | undefined;
  /**
   * `"default"`, or `"compact"` for short lists such as recent activity: the table takes compact density's
   * heights, so its rows are 32px whatever the app's density, and has no selection or pagination.
   */
  readonly size?: "default" | "compact" | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<DataTableLabels> | undefined;
}

const NEXT_SORT: Readonly<
  Record<"none" | DataTableSort["direction"], DataTableSort["direction"] | null>
> = {
  none: "ascending",
  ascending: "descending",
  descending: null,
};

function trackOf<Row>(column: DataTableColumn<Row>): string {
  return `minmax(var(--bt-data-table-${column.minWidth ?? "sm"}), ${String(column.grow ?? 1)}fr)`;
}

function SortArrow({
  direction,
}: {
  readonly direction: DataTableSort["direction"] | null;
}): ReactElement {
  return (
    <span data-bt-part="sort" data-sorted={direction === null ? undefined : ""}>
      <Icon
        icon={
          direction === "ascending"
            ? ArrowUp
            : direction === "descending"
              ? ArrowDown
              : ChevronsUpDown
        }
      />
    </span>
  );
}

/** Text and numbers truncate in a cell with their full text on hover; anything else lays itself out. */
function CellContent({
  children,
}: {
  readonly children: ReactNode;
}): ReactNode {
  if (typeof children !== "string" && typeof children !== "number") {
    return children;
  }
  const text = String(children);
  return (
    <span className="bt-truncate" data-bt-truncate="" title={text}>
      {text}
    </span>
  );
}

function DataTableRoot<Row>({
  label,
  columns,
  rows,
  rowKey,
  rowLabel,
  selectable = false,
  selected,
  defaultSelected,
  onSelectedChange,
  sort = null,
  onSortChange,
  rowActions,
  loading = false,
  pagination,
  empty,
  onClearAll,
  size = "default",
  labels,
  className,
  style,
  ...rest
}: DataTableProps<Row>): ReactElement {
  const words = { ...LABELS, ...labels };
  const compact = size === "compact";
  const withSelection = selectable && !compact;
  const paged = pagination !== undefined;

  useEffect(() => {
    if (!compact) return;
    if (paged)
      warnOnce(
        "DataTable",
        `The "${label}" table is size="compact", which leaves out pagination, so its later pages can't be reached. Fix: use size="default" for a table people page through, or show every row without pagination.`,
      );
    if (selectable)
      warnOnce(
        "DataTable",
        `The "${label}" table is size="compact", which leaves out the checkbox column, so selectable does nothing. Fix: use size="default" for a table people select rows in, or drop selectable.`,
      );
  }, [compact, paged, selectable, label]);
  const withActions = rowActions !== undefined;
  const pinned = useAppPage()?.fill === true;
  const obstacle = useFloatingObstacle();
  const [chosen, choose] = useControllableState<ReadonlySet<string>>({
    value: selected,
    defaultValue: defaultSelected ?? new Set<string>(),
    onChange: onSelectedChange,
  });
  const [scrolledAside, setScrolledAside] = useState(false);
  const [moreAside, setMoreAside] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [wasLoading, setWasLoading] = useState(loading);

  if (loading !== wasLoading) {
    setWasLoading(loading);
    setArrived(!loading);
  }

  const settleArrival = (event: AnimationEvent<HTMLDivElement>): void => {
    if (event.animationName === "bt-data-table-arrive") setArrived(false);
  };

  const watchScroll = useCallback((element: HTMLDivElement | null) => {
    if (!element) return undefined;
    const scrolled = (): void => {
      const along = Math.abs(element.scrollLeft);
      setScrolledAside(along > 0);
      setMoreAside(along + element.clientWidth < element.scrollWidth - 1);
    };
    const measure = (): void => {
      scrolled();
      setOverflows(
        element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight,
      );
      // The no-results row spans what shows of a table wider than its box, so Clear all stays in view.
      element.style.setProperty(
        "--bt-data-table-shown",
        `${String(element.clientWidth)}px`,
      );
    };
    measure();
    element.addEventListener("scroll", scrolled, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => {
      element.removeEventListener("scroll", scrolled);
      observer.disconnect();
    };
  }, []);

  const keys = rows.map(rowKey);
  const chosenHere = keys.filter((key) => chosen.has(key));
  const allState =
    chosenHere.length === 0
      ? false
      : chosenHere.length === keys.length
        ? true
        : "indeterminate";
  const nameOf = (row: Row): string => rowLabel?.(row) ?? rowKey(row);
  const template = [
    withSelection ? "var(--bt-data-table-check)" : null,
    ...columns.map((column) => trackOf(column)),
    withActions ? "var(--bt-data-table-check)" : null,
  ]
    .filter((track) => track !== null)
    .join(" ");
  const least = [
    withSelection ? "var(--bt-data-table-check)" : null,
    ...columns.map(
      (column) => `var(--bt-data-table-${column.minWidth ?? "sm"})`,
    ),
    withActions ? "var(--bt-data-table-check)" : null,
  ]
    .filter((track) => track !== null)
    .join(" + ");
  const layout: CSSProperties & CssVariables = {
    ...style,
    "--bt-data-table-columns": template,
    "--bt-data-table-least": `calc(${least})`,
  };

  if (
    !loading &&
    rows.length === 0 &&
    hasContent(empty) &&
    onClearAll === undefined
  ) {
    return (
      <div
        {...rest}
        style={style}
        className={cx("bt-data-table", className)}
        data-bt="DataTable"
        data-empty=""
      >
        {empty}
      </div>
    );
  }

  const skeletonRows = Array.from(
    { length: pagination?.pageSize ?? 8 },
    (_, index) => index,
  );
  const first = pagination
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 1;
  const last = pagination
    ? Math.min(pagination.total, first + rows.length - 1)
    : rows.length;
  const pages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1;

  return (
    <div
      {...rest}
      style={layout}
      data-pinned={pinned ? "" : undefined}
      className={cx("bt-data-table", className)}
      data-bt="DataTable"
      data-size={size}
      data-bt-density={compact ? "compact" : undefined}
    >
      <div
        ref={watchScroll}
        role="region"
        aria-label={label}
        tabIndex={overflows ? 0 : undefined}
        data-bt-part="scroll"
        data-scrolled-aside={scrolledAside ? "" : undefined}
        data-more-aside={moreAside ? "" : undefined}
      >
        <div
          role="table"
          aria-label={label}
          aria-busy={loading || undefined}
          data-bt-part="table"
        >
          <div role="rowgroup" data-bt-part="data-table-head">
            <div role="row" data-bt-part="data-table-row">
              {withSelection ? (
                <div
                  role="columnheader"
                  data-bt-part="data-table-cell"
                  data-check=""
                  data-first=""
                >
                  <Checkbox
                    label={words.selectAll}
                    hideLabel
                    checked={allState}
                    disabled={loading || rows.length === 0}
                    onCheckedChange={(next) => {
                      const updated = new Set(chosen);
                      for (const key of keys) {
                        if (next === true) updated.add(key);
                        else updated.delete(key);
                      }
                      choose(updated);
                    }}
                  />
                </div>
              ) : null}
              {columns.map((column, index) => {
                const direction =
                  sort?.column === column.id ? sort.direction : null;
                return (
                  <div
                    key={column.id}
                    role="columnheader"
                    aria-sort={
                      column.sortable ? (direction ?? "none") : undefined
                    }
                    data-bt-part="data-table-cell"
                    data-align={column.align ?? "start"}
                    data-first={index === 0 && !withSelection ? "" : undefined}
                    data-after-check={
                      index === 0 && withSelection ? "" : undefined
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="bt-focus"
                        data-bt-part="sort-button"
                        onClick={() => {
                          const next = NEXT_SORT[direction ?? "none"];
                          onSortChange?.(
                            next === null
                              ? null
                              : { column: column.id, direction: next },
                          );
                        }}
                      >
                        <span
                          className="bt-truncate"
                          data-bt-truncate=""
                          title={column.header}
                        >
                          {column.header}
                        </span>
                        <SortArrow direction={direction} />
                      </button>
                    ) : (
                      <span
                        className="bt-truncate"
                        data-bt-truncate=""
                        title={column.header}
                      >
                        {column.header}
                      </span>
                    )}
                  </div>
                );
              })}
              {withActions ? (
                <div
                  role="columnheader"
                  data-bt-part="data-table-cell"
                  data-check=""
                >
                  <VisuallyHidden.Root>{words.actions}</VisuallyHidden.Root>
                </div>
              ) : null}
            </div>
          </div>
          <div
            role="rowgroup"
            data-bt-part="data-table-body"
            data-arrived={arrived && !loading ? "" : undefined}
            onAnimationEnd={settleArrival}
          >
            {loading ? (
              <>
                <VisuallyHidden.Root asChild>
                  <div role="row">
                    <div role="cell">{words.loading}</div>
                  </div>
                </VisuallyHidden.Root>
                {skeletonRows.map((index) => (
                  <div
                    key={index}
                    role="row"
                    data-bt-part="data-table-row"
                    aria-hidden="true"
                  >
                    {withSelection ? (
                      <div
                        role="cell"
                        data-bt-part="data-table-cell"
                        data-check=""
                        data-first=""
                      >
                        <Skeleton data-bt-part="skeleton" data-shape="badge" />
                      </div>
                    ) : null}
                    {columns.map((column, at) => (
                      <div
                        key={column.id}
                        role="cell"
                        data-bt-part="data-table-cell"
                        data-align={column.align ?? "start"}
                        data-first={at === 0 && !withSelection ? "" : undefined}
                        data-after-check={
                          at === 0 && withSelection ? "" : undefined
                        }
                      >
                        <Skeleton
                          data-bt-part="skeleton"
                          data-shape={
                            column.skeleton ??
                            (column.align === "end" ? "number" : "text")
                          }
                        />
                      </div>
                    ))}
                    {withActions ? (
                      <div
                        role="cell"
                        data-bt-part="data-table-cell"
                        data-check=""
                      />
                    ) : null}
                  </div>
                ))}
              </>
            ) : rows.length === 0 ? (
              <div role="row" data-bt-part="data-table-row" data-no-results="">
                <div role="cell" data-bt-part="no-results">
                  <span className="bt-text" data-role="label">
                    {words.noResults}
                  </span>
                  <span className="bt-text" data-role="body-sm">
                    {words.noResultsBody}
                  </span>
                  {onClearAll === undefined ? null : (
                    <Button variant="soft" size="sm" onClick={onClearAll}>
                      {words.clearAll}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              rows.map((row) => {
                const key = rowKey(row);
                const isChosen = chosen.has(key);
                return (
                  <div
                    key={key}
                    role="row"
                    data-bt-part="data-table-row"
                    data-selected={isChosen ? "" : undefined}
                  >
                    {withSelection ? (
                      <div
                        role="cell"
                        data-bt-part="data-table-cell"
                        data-check=""
                        data-first=""
                      >
                        <Checkbox
                          label={words.selectRow(nameOf(row))}
                          hideLabel
                          checked={isChosen}
                          onCheckedChange={(next) => {
                            const updated = new Set(chosen);
                            if (next === true) updated.add(key);
                            else updated.delete(key);
                            choose(updated);
                          }}
                        />
                      </div>
                    ) : null}
                    {columns.map((column, at) => (
                      <div
                        key={column.id}
                        role="cell"
                        data-bt-part="data-table-cell"
                        data-align={column.align ?? "start"}
                        data-first={at === 0 && !withSelection ? "" : undefined}
                        data-after-check={
                          at === 0 && withSelection ? "" : undefined
                        }
                      >
                        <CellContent>{column.cell(row)}</CellContent>
                      </div>
                    ))}
                    {withActions ? (
                      <div
                        role="cell"
                        data-bt-part="data-table-cell"
                        data-check=""
                      >
                        <RowActions
                          label={words.actionsFor(nameOf(row))}
                          actions={rowActions(row)}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {pagination && !compact ? (
        <div ref={pinned ? obstacle : undefined} data-bt-part="pagination">
          <span
            className="bt-text"
            data-role="body-sm"
            data-bt-part="data-table-range"
          >
            {rows.length === 0
              ? words.range(0, 0, pagination.total)
              : words.range(first, last, pagination.total)}
          </span>
          <div data-bt-part="pager">
            <Button
              variant="soft"
              size="sm"
              arrow="back"
              aria-disabled={pagination.page <= 1 || undefined}
              onClick={() => {
                if (pagination.page > 1)
                  pagination.onPageChange(pagination.page - 1);
              }}
            >
              {words.previous}
            </Button>
            <Button
              variant="soft"
              size="sm"
              arrow="forward"
              aria-disabled={pagination.page >= pages || undefined}
              onClick={() => {
                if (pagination.page < pages)
                  pagination.onPageChange(pagination.page + 1);
              }}
            >
              {words.next}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** A row's "…" menu, or nothing for a row whose actions came back empty. */
function RowActions({
  label,
  actions,
}: {
  readonly label: string;
  readonly actions: ReactNode;
}): ReactElement | null {
  return hasContent(actions) ? (
    <Menu>
      <Menu.Trigger asChild>
        <IconButton icon={Ellipsis} label={label} size="sm" />
      </Menu.Trigger>
      <Menu.Content>{actions}</Menu.Content>
    </Menu>
  ) : null;
}

/** Props for `DataTable.Amount`. */
export interface DataTableAmountProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** The amount. */
  readonly value: number;
  /**
   * Its ISO 4217 currency, such as `"USD"`: the number shows with the currency's symbol, and the code after
   * it in `text-tertiary`, as in "$14.50 USD".
   */
  readonly currency: string;
}

/** A money amount for an end-aligned column: the number with its symbol, tabular, then its currency code. */
export function DataTableAmount({
  value,
  currency,
  className,
  ...rest
}: DataTableAmountProps): ReactElement {
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(value);
  return (
    <span {...rest} className={className} data-bt-part="data-table-amount">
      <span
        className="bt-truncate"
        data-bt-truncate=""
        title={`${formatted} ${currency}`}
      >
        {formatted}
      </span>
      <span data-bt-part="currency">{currency}</span>
    </span>
  );
}

/** Props for `DataTable.Id`. */
export interface DataTableIdProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** The identifier, such as an order's. */
  readonly value: string;
}

/** An identifier in the mono font that truncates, with its full text in a tooltip. */
export function DataTableId({
  value,
  className,
  ...rest
}: DataTableIdProps): ReactElement {
  return (
    <Tooltip label={value}>
      <span
        {...rest}
        className={cx("bt-truncate", className)}
        data-bt-truncate=""
        data-bt-part="id"
      >
        {value}
      </span>
    </Tooltip>
  );
}

/** The text of a router link's children, for the title a truncated link shows in full. */
function textOf(children: ReactNode): string | undefined {
  if (!isValidElement<{ readonly children?: unknown }>(children))
    return undefined;
  const inner = children.props.children;
  return typeof inner === "string" ? inner : undefined;
}

/** Props for `DataTable.Link`. */
export interface DataTableLinkProps extends ComponentPropsWithRef<"a"> {
  /** Render the single child element (such as a router's link) as the link, with these styles merged in. */
  readonly asChild?: boolean | undefined;
}

/**
 * A cell's text as a link to the row's own page, such as a customer's name in a list of customers: `text`
 * that underlines on hover, truncating like the rest of the row, on a 28px line so it's easy to hit.
 */
export function DataTableLink({
  asChild = false,
  className,
  children,
  ...rest
}: DataTableLinkProps): ReactElement {
  const classes = cx("bt-truncate bt-focus", className);
  if (asChild) {
    return (
      <Slot
        title={textOf(children)}
        {...rest}
        className={classes}
        data-bt-truncate=""
        data-bt-part="data-table-link"
      >
        {children}
      </Slot>
    );
  }
  return (
    <a
      title={typeof children === "string" ? children : undefined}
      {...rest}
      className={classes}
      data-bt-truncate=""
      data-bt-part="data-table-link"
    >
      {children}
    </a>
  );
}

/** `DataTable` with its cell parts. */
export interface DataTableComponent {
  <Row>(props: DataTableProps<Row>): ReactElement;
  /** A money amount. */
  readonly Amount: typeof DataTableAmount;
  /** An identifier. */
  readonly Id: typeof DataTableId;
  /** A link to the row's own page. */
  readonly Link: typeof DataTableLink;
}

/**
 * A table of records on CSS grid rows that share one column template, so each column keeps its least
 * width and a share of the rest; when the least widths don't fit, it scrolls sideways inside itself while
 * the page never does. Rows are `--bt-h-table-row` tall with 1px dividers and never wrap. It offers a
 * checkbox column, sortable headers (`aria-sort`), a "…" menu of actions per row, a header and first column
 * that stick, skeleton rows while it loads, pagination, a row with "Clear all" when filters leave nothing,
 * and an empty state when there's no data. `DataTable.Amount` and `DataTable.Id` format money and ids, and
 * `DataTable.Link` links a row to its own page.
 *
 * @example
 * <DataTable
 *   label="Orders"
 *   columns={[
 *     { id: "id", header: "Order", cell: (order) => <DataTable.Id value={order.id} />, minWidth: "sm" },
 *     { id: "customer", header: "Customer", cell: (order) => <DataTable.Link href={`/customers/${order.customerId}`}>{order.customer}</DataTable.Link>, minWidth: "md", grow: 2 },
 *     { id: "total", header: "Total", align: "end", sortable: true, cell: (order) => <DataTable.Amount value={order.total} currency="USD" /> },
 *   ]}
 *   rows={orders}
 *   rowKey={(order) => order.id}
 *   selectable
 * />
 */
export const DataTable: DataTableComponent = Object.assign(DataTableRoot, {
  Amount: DataTableAmount,
  Id: DataTableId,
  Link: DataTableLink,
});
