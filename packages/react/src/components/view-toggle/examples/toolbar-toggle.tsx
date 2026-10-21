import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { SearchField, ViewToggle } from "@buttery/react";

/** A list's toolbar: search on one side, the view on the other. */
export function ToolbarToggle(): ReactElement {
  return (
    <Inline gap={3} align="center">
      <SearchField label="Search coffees" />
      <ViewToggle defaultValue="list" />
    </Inline>
  );
}
