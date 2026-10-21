import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import { SearchField } from "@buttery/react";

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
      <Stack gap={1}>
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
