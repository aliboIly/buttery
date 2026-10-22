import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, NumberField } from "@buttery/react";

/** An export panel: width and height fields with their labels on top, each filling its column, and the button that uses them. */
export function ExportSize(): ReactElement {
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1350);
  const [exported, setExported] = useState<string | undefined>(undefined);
  return (
    <Stack gap={4}>
      <Text variant="title-sm">Export the card</Text>
      <Grid columns={2} gap={2}>
        <NumberField
          label="Width"
          labelPosition="top"
          unit="px"
          min={1}
          max={8000}
          value={width}
          onValueChange={setWidth}
        />
        <NumberField
          label="Height"
          labelPosition="top"
          unit="px"
          min={1}
          max={8000}
          value={height}
          onValueChange={setHeight}
        />
      </Grid>
      <Inline gap={3} align="center">
        <Button
          variant="primary"
          onClick={() => {
            setExported(`Exported at ${String(width)} × ${String(height)} px`);
          }}
        >
          Export
        </Button>
        <Text variant="body-sm" tone="secondary">
          {exported ?? "Not exported yet"}
        </Text>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("spinbutton", "Width");
  await key("ArrowUp");
  await press("button", "Export");
  await see("Exported at 1081 × 1350 px");
};
