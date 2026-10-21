import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import { FilterBar, FilterPill } from "@buttery/react";

/** Several filters applied at once: the pills wrap, and Clear filters takes them all away. */
export function AppliedFilters(): ReactElement {
  return (
    <FilterBar onClearAll={() => undefined}>
      <FilterPill label="Status" value="Unpaid" onRemove={() => undefined}>
        <Text variant="body-sm">Pick a status</Text>
      </FilterPill>
      <FilterPill label="Origin" value="Ethiopia" onRemove={() => undefined}>
        <Text variant="body-sm">Pick an origin</Text>
      </FilterPill>
      <FilterPill label="Placed" value="Last 7 days" onRemove={() => undefined}>
        <Text variant="body-sm">Pick a range</Text>
      </FilterPill>
      <FilterPill label="Customer">
        <Text variant="body-sm">Search customers</Text>
      </FilterPill>
    </FilterBar>
  );
}
