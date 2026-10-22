import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Slider } from "@buttery/react";

/** An opacity in percent, saved when a drag ends or a key press lands rather than on every frame. */
export function OpacityRow(): ReactElement {
  const [saved, setSaved] = useState(80);
  return (
    <Stack gap={3}>
      <Slider
        label="Opacity"
        defaultValue={80}
        format="%"
        onValueCommit={setSaved}
      />
      <Text variant="body" tone="secondary">
        Saved at {saved}%
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ key, see }) => {
  await key("Tab");
  await key("ArrowLeft");
  await see("79%");
  await see("Saved at 79%");
};
