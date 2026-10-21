import { Stack } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import {
  SearchResults,
  SegmentedControl,
  matchesSearch,
  pageSource,
} from "@buttery/react";
import type { LocalSearchSource } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

const PAGES = pageSource({
  pages: [
    { label: "Shipping rates", path: ["Settings"], href: "#settings-shipping" },
    { label: "Decaf blends", path: ["Stock"], href: "#stock-decaf" },
  ],
});

const ORDERS: LocalSearchSource = {
  id: "orders",
  label: "Orders",
  search: (query) =>
    [
      { id: "1042", label: "Order 1042, shipping today" },
      { id: "1043", label: "Order 1043, decaf beans" },
    ]
      .filter((order) => matchesSearch(query.text, order.label))
      .map((order) => ({ ...order, href: `#order-${order.id}` })),
};

/** Results for one of two searches, each section linking to every result. */
export function SwitchSearch(): ReactElement {
  const [search, setSearch] = useState("shipping");
  return (
    <Stack gap={4}>
      <SegmentedControl
        label="Search for"
        options={[
          { value: "shipping", label: "Shipping" },
          { value: "decaf", label: "Decaf" },
        ]}
        value={search}
        onValueChange={setSearch}
      />
      <SearchResults
        width="medium"
        query={{ text: search, filters: [] }}
        sources={[PAGES, ORDERS]}
      />
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Decaf");
  await see('Results for "decaf"');
};
