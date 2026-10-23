import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SearchField } from "@butteryui/react";

const ORIGINS = [
  "Ethiopia Guji",
  "Kenya Nyeri",
  "Colombia Huila",
  "Guatemala Antigua",
  "Peru Cajamarca",
];

/** A toolbar search that narrows a list as you type. */
export function FilterList(): ReactElement {
  const [query, setQuery] = useState("");
  const shown = ORIGINS.filter((origin) =>
    origin.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Stack gap={3}>
      <SearchField
        label="Filter origins"
        value={query}
        onValueChange={setQuery}
      />
      <Text variant="caption" tone="secondary">
        {`${String(shown.length)} of ${String(ORIGINS.length)} origins`}
      </Text>
      <Stack gap={3}>
        {shown.length === 0 ? (
          <Text variant="body-sm">No origins match.</Text>
        ) : (
          shown.map((origin) => (
            <Text key={origin} variant="label">
              {origin}
            </Text>
          ))
        )}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ type, see }) => {
  await see("5 of 5 origins");
  await type("Filter origins", "kenya");
  await see("1 of 5 origins");
};
