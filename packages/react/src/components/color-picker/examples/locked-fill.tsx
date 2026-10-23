import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ColorPicker, Switch } from "@buttery/react";

/** A picker that's disabled while its shape is locked, with the switch that unlocks it. */
export function LockedFill(): ReactElement {
  const [locked, setLocked] = useState(true);
  return (
    <Stack gap={3}>
      <Switch
        label="Lock the shape"
        checked={locked}
        onCheckedChange={setLocked}
      />
      <ColorPicker
        label="Shape fill"
        defaultValue="#a5b4fc"
        disabled={locked}
      />
      <Text variant="caption" tone="secondary">
        {locked
          ? "Unlock the shape to change its fill"
          : "Pick the shape's fill"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Unlock the shape to change its fill");
  await press("switch", "Lock the shape");
  await see("Pick the shape's fill");
};
