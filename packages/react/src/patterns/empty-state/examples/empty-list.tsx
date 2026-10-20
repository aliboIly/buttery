import type { ReactElement } from "react";
import { EmptyState } from "@buttery/react";

/** A list that has nothing in it yet, with no action to take. */
export function EmptyList(): ReactElement {
  return (
    <EmptyState
      title="No exports yet"
      description="Cards you export show up here."
      titleAs="h3"
    />
  );
}
