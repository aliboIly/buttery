import type { ReactElement } from "react";
import { Button, EmptyState } from "@buttery/react";

/** The empty canvas the playground's surface and text pages show. */
export function StarterEmptyState(): ReactElement {
  return (
    <EmptyState
      data-testid="empty-state"
      title="Your canvas is empty"
      description="Bring in a photo, or start from a blank card."
      actions={
        <>
          <Button variant="primary">Import photo</Button>
          <Button variant="secondary">Blank card</Button>
        </>
      }
    />
  );
}
