import type { ReactElement } from "react";
import { Button, EmptyState } from "@buttery/react";

/** The empty canvas the playground's surface and text pages show. */
export function StarterEmptyState(): ReactElement {
  return (
    <EmptyState
      data-testid="empty-state"
      title="Your canvas is empty"
      description="Start a fresh card, or open one from your library."
      actions={
        <>
          <Button variant="primary">Import photo</Button>
          <Button variant="secondary">Blank card</Button>
        </>
      }
    />
  );
}
