import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AnchorGrid, Switch } from "@buttery/react";

/** An anchor grid that's disabled while its layer is locked, with the switch that unlocks it. */
export function LockedLayer(): ReactElement {
  const [locked, setLocked] = useState(true);
  return (
    <Stack gap={3} align="start">
      <Switch
        label="Lock the logo"
        checked={locked}
        onCheckedChange={setLocked}
      />
      <Inline gap={3} align="center">
        <AnchorGrid
          label="Logo position"
          defaultValue="top-right"
          disabled={locked}
        />
        <Text variant="body" tone="secondary">
          {locked ? "Unlock the logo to move it" : "Pick where the logo sits"}
        </Text>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Unlock the logo to move it");
  await press("switch", "Lock the logo");
  await see("Pick where the logo sits");
};
