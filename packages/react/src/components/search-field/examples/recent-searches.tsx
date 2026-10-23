import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SearchField } from "@buttery/react";

const CUSTOMERS = [
  "Blue Door Café",
  "Corner Café",
  "Pier 9 Kiosk",
  "Morning Bell Bakery",
  "Harbor Lights Deli",
];

const RECENT = ["Café", "Kiosk"];

/** A search whose text the page keeps in state, so a recent search can fill it in and the clear button empties it. */
export function RecentSearches(): ReactElement {
  const [query, setQuery] = useState("");
  const found = CUSTOMERS.filter((customer) =>
    customer.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Stack gap={3}>
      <SearchField
        label="Search customers"
        value={query}
        onValueChange={setQuery}
      />
      <Inline gap={2} align="center">
        <Text variant="caption" tone="secondary">
          Recent
        </Text>
        {RECENT.map((recent) => (
          <Button
            key={recent}
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery(recent);
            }}
          >
            {recent}
          </Button>
        ))}
      </Inline>
      <Text variant="body-sm" tone="secondary">
        {`${String(found.length)} of ${String(CUSTOMERS.length)} customers`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Café");
  await see("2 of 5 customers");
  await press("button", "Clear search");
  await see("5 of 5 customers");
};
