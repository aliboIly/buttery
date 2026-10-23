import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SegmentedControl, ViewToggle } from "@buttery/react";
import type { ViewMode } from "@buttery/react";

type Shelf = "Beans" | "Gear";

/** Each shelf of the shop keeps its own view in state, so the toggle shows the view kept for the shelf that's open. */
export function ShelfViews(): ReactElement {
  const [shelf, setShelf] = useState<Shelf>("Beans");
  const [views, setViews] = useState<Readonly<Record<Shelf, ViewMode>>>({
    Beans: "grid",
    Gear: "list",
  });
  const view = views[shelf];
  return (
    <Stack gap={3}>
      <Inline gap={3} align="center" justify="between">
        <SegmentedControl<Shelf>
          label="Shelf"
          options={["Beans", "Gear"]}
          value={shelf}
          onValueChange={setShelf}
        />
        <ViewToggle
          label={`Show ${shelf.toLowerCase()} as`}
          value={view}
          onValueChange={(next) => {
            setViews({ ...views, [shelf]: next });
          }}
        />
      </Inline>
      <Text variant="body-sm" tone="secondary">
        {`${shelf} as ${view === "grid" ? "cards" : "rows"}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Beans as cards");
  await press("radio", "List");
  await see("Beans as rows");
  await press("radio", "Gear");
  await see("Gear as rows");
  await press("radio", "Grid");
  await see("Gear as cards");
  await press("radio", "Beans");
  await see("Beans as rows");
};
