import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Switch } from "@buttery/react";

/** A switch with a hint about what it does, which follows it as it's flipped. */
export function CloudSync(): ReactElement {
  const [sync, setSync] = useState(true);
  return (
    <Switch
      label="Sync to the cloud"
      hint={
        sync
          ? "Your cards back up as you work."
          : "Your cards stay on this device."
      }
      checked={sync}
      onCheckedChange={setSync}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Your cards back up as you work.");
  await press("switch", "Sync to the cloud");
  await see("Your cards stay on this device.");
};
