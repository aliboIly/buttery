import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ColorPicker, Switch } from "@buttery/react";

/** A picker that's disabled while its card is locked, with the switch that unlocks it. */
export function LockedFill(): ReactElement {
  const [locked, setLocked] = useState(true);
  return (
    <Stack gap={3}>
      <Switch
        label="Lock the card"
        checked={locked}
        onCheckedChange={setLocked}
      />
      <ColorPicker label="Card fill" defaultValue="#a5b4fc" disabled={locked} />
      <Text variant="caption" tone="secondary">
        {locked ? "Unlock the card to change its fill" : "Pick the card's fill"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Unlock the card to change its fill");
  await press("switch", "Lock the card");
  await see("Pick the card's fill");
};
