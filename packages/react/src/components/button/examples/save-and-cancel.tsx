import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { Button } from "@buttery/react";

/** A form's closing pair: the main action in primary, the way out in soft. */
export function SaveAndCancel(): ReactElement {
  return (
    <Inline gap={2}>
      <Button>Cancel</Button>
      <Button variant="primary">Save changes</Button>
    </Inline>
  );
}
