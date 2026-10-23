import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Switch } from "@butteryui/react";

/** A switch with a hint about what it does, which follows it as it's flipped. */
export function CloudSync(): ReactElement {
  const [sync, setSync] = useState(true);
  return (
    <Switch
      label="Sync to the cloud"
      hint={
        sync
          ? "Orders and stock back up as you work."
          : "Orders and stock stay on this computer."
      }
      checked={sync}
      onCheckedChange={setSync}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Orders and stock back up as you work.");
  await press("switch", "Sync to the cloud");
  await see("Orders and stock stay on this computer.");
};
