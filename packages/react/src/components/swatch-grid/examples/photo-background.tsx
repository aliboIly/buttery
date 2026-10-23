import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { solids } from "@butteryui/core/palettes";
import { SwatchGrid, Switch } from "@butteryui/react";
import type { Swatch } from "@butteryui/react";

const SWATCHES: readonly Swatch[] = solids.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: preset.hex,
}));

/** A disabled grid: no swatch can be chosen while a picture covers the slide's fill. */
export function PhotoBackground(): ReactElement {
  const [picture, setPicture] = useState(true);
  const [fill, setFill] = useState("paper");
  const name = SWATCHES.find((swatch) => swatch.value === fill)?.label ?? fill;
  return (
    <Stack gap={4}>
      <Switch
        label="Use a picture"
        checked={picture}
        onCheckedChange={setPicture}
      />
      <SwatchGrid
        label="Fill"
        swatches={SWATCHES}
        value={fill}
        onValueChange={setFill}
        disabled={picture}
      />
      <Text variant="body" tone="secondary">
        {picture ? "The picture covers the fill" : `Filled with ${name}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("The picture covers the fill");
  await press("switch", "Use a picture");
  await press("radio", "Fog");
  await see("Filled with Fog");
};
