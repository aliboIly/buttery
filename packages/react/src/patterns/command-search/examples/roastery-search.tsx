import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { CommandSearch, matchesSearch, pageSource } from "@buttery/react";
import type { LocalSearchSource } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

const CUSTOMERS = [
  { name: "Ines Vale", email: "ines@example.com" },
  { name: "Oskar Lind", email: "oskar@example.com" },
];

/** A search across a roastery's pages and customers that remembers recent searches. */
export function RoasterySearch(): ReactElement {
  const [opened, setOpened] = useState("");
  const customers: LocalSearchSource = {
    id: "customers",
    label: "Customers",
    search: (query) =>
      CUSTOMERS.filter((customer) =>
        matchesSearch(query.text, customer.name, customer.email),
      ).map((customer) => ({
        id: customer.email,
        label: customer.name,
        detail: customer.email,
        onSelect: () => {
          setOpened(customer.name);
        },
      })),
  };
  return (
    <Stack gap={3}>
      <CommandSearch
        storageKey="example-roastery-search"
        sources={[
          pageSource({
            pages: [
              { label: "Orders", href: "#orders" },
              { label: "Profile", path: ["Settings"], href: "#settings" },
            ],
          }),
          customers,
        ]}
      />
      <Text variant="caption">
        {opened === "" ? "Nothing opened yet" : `Opened ${opened}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("combobox", "Search");
  await type("Search", "ines");
  await press("option", "Ines Vale ines@example.com");
  await see("Opened Ines Vale");
};
