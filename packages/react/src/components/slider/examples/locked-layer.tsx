import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Slider, Switch } from "@buttery/react";

/** A disabled slider: the logo's opacity holds while its layer is locked and moves again once it's unlocked. */
export function LockedLayer(): ReactElement {
  const [locked, setLocked] = useState(true);
  return (
    <Stack gap={4}>
      <Switch
        label="Lock the logo layer"
        checked={locked}
        onCheckedChange={setLocked}
      />
      <Slider
        label="Logo opacity"
        defaultValue={60}
        format="%"
        disabled={locked}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("switch", "Lock the logo layer");
  await key("Tab");
  await key("ArrowRight");
  await see("61%");
};
