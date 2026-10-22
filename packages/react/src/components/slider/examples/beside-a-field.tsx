import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { NumberField, Slider } from "@buttery/react";

/** A slider with its label on top, beside a number field with its label on top, so the two controls start on one line. */
export function BesideAField(): ReactElement {
  const [width, setWidth] = useState(1600);
  const [quality, setQuality] = useState(80);
  return (
    <Stack gap={4}>
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <NumberField
          label="Width"
          labelPosition="top"
          unit="px"
          min={320}
          max={4000}
          step={10}
          value={width}
          onValueChange={setWidth}
        />
        <Slider
          label="Quality"
          labelPosition="top"
          min={10}
          max={100}
          step={5}
          format="%"
          resetValue={80}
          value={quality}
          onValueChange={setQuality}
        />
      </Grid>
      <Text variant="body-sm" tone="secondary">
        {`Exports at ${String(width)} px wide and ${String(quality)}% quality`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ focus, key, see }) => {
  await focus("slider", "Quality");
  await key("ArrowRight");
  await see("85%");
  await see("Exports at 1600 px wide and 85% quality");
};
