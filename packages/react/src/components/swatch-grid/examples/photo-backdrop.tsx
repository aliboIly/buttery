import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { solids } from "@buttery/core/palettes";
import { SwatchGrid, Switch } from "@buttery/react";
import type { Swatch } from "@buttery/react";

const SWATCHES: readonly Swatch[] = solids.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: preset.hex,
}));

/** A disabled grid: no swatch can be chosen while a photo covers the card's fill. */
export function PhotoBackdrop(): ReactElement {
  const [photo, setPhoto] = useState(true);
  const [fill, setFill] = useState("paper");
  const name = SWATCHES.find((swatch) => swatch.value === fill)?.label ?? fill;
  return (
    <Stack gap={4}>
      <Switch label="Use a photo" checked={photo} onCheckedChange={setPhoto} />
      <SwatchGrid
        label="Fill"
        swatches={SWATCHES}
        value={fill}
        onValueChange={setFill}
        disabled={photo}
      />
      <Text variant="body" tone="secondary">
        {photo ? "The photo covers the fill" : `Filled with ${name}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("The photo covers the fill");
  await press("switch", "Use a photo");
  await press("radio", "Fog");
  await see("Filled with Fog");
};
