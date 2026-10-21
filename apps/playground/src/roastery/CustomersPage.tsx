import { Menu, Stack } from "@buttery/core";
import {
  AppPage,
  Checkbox,
  DataTable,
  FilterBar,
  FilterPill,
  PageHeader,
  SavedViews,
  SearchField,
  StatusBadge,
  toast,
} from "@buttery/react";
import type { DataTableColumn, DataTableSort } from "@buttery/react";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { CUSTOMER_ROWS, isNew } from "./customers.ts";
import type { CustomerRow } from "./customers.ts";
import { number, since } from "./format.ts";
import { useSimulatedLoad } from "./loading.ts";
import { go } from "./navigation.ts";
import { RenameView } from "./rename-view.tsx";

const PAGE_SIZE = 25;

const VIEWS = [
  { id: "all", label: "All customers" },
  { id: "wholesale", label: "Wholesale" },
  { id: "subscribers", label: "Subscribers" },
  { id: "new", label: "New this month" },
  { id: "big", label: "Spent over $300" },
];

const COLUMNS: readonly DataTableColumn<CustomerRow>[] = [
  {
    id: "name",
    header: "Customer",
    cell: (row) => (
      <DataTable.Link href={`#/roastery/customers/${row.id}`}>
        {row.name}
      </DataTable.Link>
    ),
    minWidth: "md",
    grow: 2,
  },
  {
    id: "email",
    header: "Email",
    cell: (row) => row.email,
    minWidth: "lg",
    grow: 2,
  },
  {
    id: "kind",
    header: "Type",
    cell: (row) => (
      <StatusBadge tone={row.kind === "wholesale" ? "info" : "neutral"}>
        {row.kind === "wholesale" ? "Wholesale" : "Retail"}
      </StatusBadge>
    ),
    minWidth: "sm",
    skeleton: "badge",
  },
  { id: "city", header: "City", cell: (row) => row.city, minWidth: "sm" },
  {
    id: "orders",
    header: "Orders",
    cell: (row) => number(row.orders.length),
    minWidth: "sm",
    align: "end",
    sortable: true,
  },
  {
    id: "spent",
    header: "Spent",
    cell: (row) => <DataTable.Amount value={row.spent} currency="USD" />,
    minWidth: "md",
    align: "end",
    sortable: true,
  },
  {
    id: "since",
    header: "Customer since",
    cell: (row) => since(row.since),
    minWidth: "md",
    sortable: true,
  },
];

const CITIES = [...new Set(CUSTOMER_ROWS.map((row) => row.city))].sort();

function citiesValue(cities: ReadonlySet<string>): string | undefined {
  const [first] = cities;
  if (cities.size === 1) return first;
  return cities.size === 0 ? undefined : `${String(cities.size)} cities`;
}

function inView(view: string, row: CustomerRow): boolean {
  switch (view) {
    case "wholesale":
      return row.kind === "wholesale";
    case "subscribers":
      return row.subscribed;
    case "new":
      return isNew(row);
    case "big":
      return row.spent > 300;
    default:
      return true;
  }
}

function compare(
  sort: DataTableSort | null,
): (a: CustomerRow, b: CustomerRow) => number {
  const direction = sort?.direction === "ascending" ? 1 : -1;
  switch (sort?.column ?? "spent") {
    case "orders":
      return (a, b) => (a.orders.length - b.orders.length) * direction;
    case "since":
      return (a, b) => (a.since.getTime() - b.since.getTime()) * direction;
    default:
      return (a, b) => (a.spent - b.spent) * direction;
  }
}

/** Everyone who's ordered, in saved views, searchable. */
export function CustomersPage(): ReactElement {
  const [views, setViews] = useState(VIEWS);
  const [view, setView] = useState("all");
  const [renaming, setRenaming] = useState(false);
  const loading = useSimulatedLoad(view, 700);
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<ReadonlySet<string>>(new Set());
  const [sort, setSort] = useState<DataTableSort | null>({
    column: "spent",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const search = query.trim().toLowerCase();
  const matching = CUSTOMER_ROWS.filter(
    (row) =>
      inView(view, row) &&
      (cities.size === 0 || cities.has(row.city)) &&
      (search === "" ||
        row.name.toLowerCase().includes(search) ||
        row.email.includes(search)),
  ).sort(compare(sort));
  const clearCities = (): void => {
    setCities(new Set());
    setPage(1);
  };
  return (
    <AppPage
      fill
      header={
        <PageHeader
          title="Customers"
          value={number(CUSTOMER_ROWS.length)}
          actions={
            <PageHeader.Action
              label="Add customer"
              icon={UserPlus}
              variant="primary"
              onSelect={() => {
                toast("Customers join when they first order in this demo.");
              }}
            />
          }
        />
      }
    >
      <AppPage.Section>
        <SavedViews
          label="Customer views"
          views={views}
          value={view}
          onValueChange={(next) => {
            setView(next);
            setPage(1);
          }}
          actions={
            <Menu.Item
              onSelect={() => {
                setRenaming(true);
              }}
            >
              Rename view
            </Menu.Item>
          }
        />
        <RenameView
          open={renaming}
          onOpenChange={setRenaming}
          name={views.find((candidate) => candidate.id === view)?.label ?? ""}
          onRename={(label) => {
            setViews(
              views.map((candidate) =>
                candidate.id === view ? { ...candidate, label } : candidate,
              ),
            );
          }}
        />
        <FilterBar
          onClearAll={cities.size === 0 ? undefined : clearCities}
          actions={
            <SearchField
              label="Search customers"
              placeholder="Name or email"
              variant="outline"
              value={query}
              onValueChange={(next) => {
                setQuery(next);
                setPage(1);
              }}
            />
          }
        >
          <FilterPill
            label="City"
            value={citiesValue(cities)}
            onRemove={cities.size === 0 ? undefined : clearCities}
          >
            <Stack gap={2}>
              {CITIES.map((city) => (
                <Checkbox
                  key={city}
                  label={city}
                  checked={cities.has(city)}
                  onCheckedChange={(next) => {
                    const chosen = new Set(cities);
                    if (next === true) chosen.add(city);
                    else chosen.delete(city);
                    setCities(chosen);
                    setPage(1);
                  }}
                />
              ))}
            </Stack>
          </FilterPill>
        </FilterBar>
        <DataTable<CustomerRow>
          label="Customers"
          loading={loading}
          columns={COLUMNS}
          rows={matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
          rowKey={(row) => row.id}
          rowLabel={(row) => row.name}
          sort={sort}
          onSortChange={setSort}
          onClearAll={() => {
            setView("all");
            setQuery("");
            clearCities();
          }}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: matching.length,
            onPageChange: setPage,
          }}
          rowActions={(row) => (
            <Menu.Item
              onSelect={() => {
                go(`#/roastery/customers/${row.id}`);
              }}
            >
              View customer
            </Menu.Item>
          )}
        />
      </AppPage.Section>
    </AppPage>
  );
}
