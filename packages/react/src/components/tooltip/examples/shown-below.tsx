import type { ReactElement } from "react";
import { Button, Tooltip } from "@buttery/react";

/** A tooltip that opens under its button, for controls at the top of a window. */
export function ShownBelow(): ReactElement {
  return (
    <Tooltip label="Back to the last saved version" side="bottom">
      <Button variant="ghost">Revert</Button>
    </Tooltip>
  );
}
