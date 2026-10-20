import type { ReactElement } from "react";
import { Button, EmptyState, toast } from "@buttery/react";

/** An empty canvas with the two ways to begin. */
export function EmptyCanvas(): ReactElement {
  return (
    <EmptyState
      title="Add a card"
      description="Start from a template, or paste text with ⌘V."
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
          <Button variant="secondary">How it works</Button>
        </>
      }
    />
  );
}
