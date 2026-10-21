import type { ReactElement } from "react";
import { Button, EmptyState, toast } from "@buttery/react";

/** An empty canvas with the two ways to begin. */
export function EmptyCanvas(): ReactElement {
  return (
    <EmptyState
      title="An empty canvas"
      description="Start a fresh card, or open one from your library."
      actions={
        <>
          <Button
            variant="primary"
            onClick={() => {
              toast("A new card would open here", { id: "new-card" });
            }}
          >
            New card
          </Button>
          <Button variant="secondary">Open library</Button>
        </>
      }
    />
  );
}
