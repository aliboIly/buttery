import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SearchField, ViewToggle } from "@butteryui/react";
import type { ViewMode } from "@butteryui/react";

const COFFEES: readonly {
  readonly name: string;
  readonly origin: string;
  readonly price: string;
}[] = [
  { name: "House blend", origin: "Brazil and Colombia", price: "$16" },
  { name: "Single origin", origin: "Ethiopia", price: "$19" },
  { name: "Decaf", origin: "Colombia", price: "$17" },
];

/** A list's toolbar: search on one side and the view on the other, over the coffees as cards or as rows. */
export function ToolbarToggle(): ReactElement {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const shown = COFFEES.filter((coffee) =>
    coffee.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Stack gap={4}>
      <Inline gap={3} justify="between">
        <SearchField
          label="Search coffees"
          value={query}
          onValueChange={setQuery}
        />
        <ViewToggle value={view} onValueChange={setView} />
      </Inline>
      <Text variant="caption" tone="secondary">
        {shown.length === 1 ? "1 coffee" : `${String(shown.length)} coffees`}
      </Text>
      {view === "grid" ? (
        <Grid columns={3} gap={4}>
          {shown.map((coffee) => (
            <Surface key={coffee.name} level="card" pad={4}>
              <Stack gap={2}>
                <Text variant="title">{coffee.name}</Text>
                <Text variant="caption" tone="secondary">
                  {coffee.origin}
                </Text>
              </Stack>
            </Surface>
          ))}
        </Grid>
      ) : (
        <Stack gap={3}>
          {shown.map((coffee) => (
            <Inline key={coffee.name} gap={3} justify="between">
              <Text truncate>{coffee.name}</Text>
              <Text tone="secondary">{`${coffee.origin} · ${coffee.price}`}</Text>
            </Inline>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await see("Ethiopia · $19");
  await press("radio", "Grid");
  await see("Ethiopia");
  await type("Search coffees", "decaf");
  await see("1 coffee");
};
