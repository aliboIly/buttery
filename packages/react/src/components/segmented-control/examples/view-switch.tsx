import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SegmentedControl } from "@buttery/react";

type View = "list" | "grid";

const COFFEES = [
  "Ethiopia Guji",
  "Kenya Nyeri",
  "Colombia Huila",
  "Peru Cajamarca",
];

/** A shop's coffee list with an icon-only view switch in its toolbar, each icon's label in its tooltip and name. */
export function ViewSwitch(): ReactElement {
  const [view, setView] = useState<View>("list");
  return (
    <Stack gap={4}>
      <Inline gap={3} align="center" justify="between">
        <Stack gap={1}>
          <Text variant="title-sm">Coffees</Text>
          <Text variant="caption" tone="secondary">
            {`Showing ${String(COFFEES.length)} coffees as a ${view}`}
          </Text>
        </Stack>
        <SegmentedControl<View>
          label="View"
          iconOnly
          options={[
            { value: "list", label: "List", icon: List },
            { value: "grid", label: "Grid", icon: LayoutGrid },
          ]}
          value={view}
          onValueChange={setView}
        />
      </Inline>
      {view === "grid" ? (
        <Grid columns={2} gap={2}>
          {COFFEES.map((coffee) => (
            <Surface key={coffee} level="card" pad={3}>
              <Text variant="label">{coffee}</Text>
            </Surface>
          ))}
        </Grid>
      ) : (
        <Stack gap={2}>
          {COFFEES.map((coffee) => (
            <Text key={coffee} variant="label">
              {coffee}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Grid");
  await see("Showing 4 coffees as a grid");
  await press("radio", "List");
  await see("Showing 4 coffees as a list");
};
