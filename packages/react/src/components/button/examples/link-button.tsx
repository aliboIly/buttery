import type { ReactElement } from "react";
import { Button } from "@buttery/react";

/** A link dressed as a call to action, with the forward arrow. */
export function LinkButton(): ReactElement {
  return (
    <Button asChild variant="primary" size="cta" arrow="forward">
      <a href="#/surfaces">Start a new card</a>
    </Button>
  );
}
