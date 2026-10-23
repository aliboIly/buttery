import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ViewToggle } from "@buttery/react";
import type { ViewMode } from "@buttery/react";

/** A catalog that shows its coffees as cards or as rows. */
export function CatalogView(): ReactElement {
  const [view, setView] = useState<ViewMode>("grid");
  return (
    <Inline gap={3} align="center">
      <ViewToggle
        label="Show coffees as"
        value={view}
        onValueChange={setView}
      />
      <Text variant="body-sm">{view === "grid" ? "Cards" : "Rows"}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Cards");
  await press("radio", "List");
  await see("Rows");
};
