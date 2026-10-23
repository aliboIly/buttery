import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SegmentedControl } from "@butteryui/react";

type View = "list" | "grid";

const SLIDES = ["Title slide", "Agenda", "Q3 in numbers", "Thank you"];

/** A deck's slides with an icon-only view switch in its toolbar, each icon's label in its tooltip and name. */
export function ViewSwitch(): ReactElement {
  const [view, setView] = useState<View>("list");
  return (
    <Stack gap={4}>
      <Inline gap={3} align="center" justify="between">
        <Stack gap={1}>
          <Text variant="title-sm" asChild>
            <h3>Quarterly review</h3>
          </Text>
          <Text variant="caption" tone="secondary">
            {`Showing ${String(SLIDES.length)} slides as a ${view}`}
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
        <Grid columns={2} gap={2} asChild>
          <ul role="list">
            {SLIDES.map((slide) => (
              <Surface key={slide} level="card" pad={3} asChild>
                <li>
                  <Text variant="label">{slide}</Text>
                </li>
              </Surface>
            ))}
          </ul>
        </Grid>
      ) : (
        <Stack gap={2} asChild>
          <ul role="list">
            {SLIDES.map((slide) => (
              <Text key={slide} variant="label" asChild>
                <li>{slide}</li>
              </Text>
            ))}
          </ul>
        </Stack>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Grid");
  await see("Showing 4 slides as a grid");
  await press("radio", "List");
  await see("Showing 4 slides as a list");
};
