import type { ReactElement } from "react";
import { Button, EmptyState } from "@buttery/react";

/** An empty canvas with the two ways to begin. */
export function EmptyCanvas({
  onNew,
  onHelp,
}: {
  readonly onNew: () => void;
  readonly onHelp: () => void;
}): ReactElement {
  return (
    <EmptyState
      title="Add a card"
      description="Start from a template, or paste text with ⌘V."
      actions={
        <>
          <Button variant="primary" onClick={onNew}>
            New card
          </Button>
          <Button variant="secondary" onClick={onHelp}>
            How it works
          </Button>
        </>
      }
    />
  );
}
