import type { ReactElement } from "react";
import { Switch } from "@buttery/react";

/** A switch with a hint about what turning it on does. */
export function CloudSync(): ReactElement {
  return (
    <Switch
      label="Sync to the cloud"
      hint="Your cards back up as you work."
      defaultChecked
    />
  );
}
