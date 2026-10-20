import type { ReactElement } from "react";
import { Button, Tooltip } from "@buttery/react";

/** A hint on a button whose label is short. */
export function ExportHint(): ReactElement {
  return (
    <Tooltip label="Saves a 2× PNG to your downloads">
      <Button variant="primary">Export</Button>
    </Tooltip>
  );
}
