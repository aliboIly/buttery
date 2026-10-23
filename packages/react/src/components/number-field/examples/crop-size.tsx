import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { NumberField } from "@buttery/react";

/** A crop's width and height in pixels, side by side, each kept in state with the size it makes. */
export function CropSize(): ReactElement {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(630);
  return (
    <Stack gap={3} align="start">
      <Inline gap={4} wrap>
        <NumberField
          label="W"
          unit="px"
          min={1}
          value={width}
          onValueChange={setWidth}
        />
        <NumberField
          label="H"
          unit="px"
          min={1}
          value={height}
          onValueChange={setHeight}
        />
      </Inline>
      <Text variant="caption" tone="secondary">
        {`Crops to ${String(width)} × ${String(height)} px`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("spinbutton", "W");
  await key("ArrowUp");
  await see("Crops to 1201 × 630 px");
  await press("spinbutton", "H");
  await key("ArrowDown");
  await see("Crops to 1201 × 629 px");
};
