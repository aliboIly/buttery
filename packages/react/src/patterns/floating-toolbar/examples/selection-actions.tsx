import type { ReactElement, RefObject } from "react";
import { FloatingToolbar } from "@buttery/react";

/** Actions for a selection, shown while something is selected. */
export function SelectionActions({
  selection,
  count,
  onDuplicate,
  onDelete,
}: {
  readonly selection: RefObject<HTMLElement | null>;
  readonly count: number;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
}): ReactElement {
  return (
    <FloatingToolbar
      anchor={selection}
      label="Selection"
      meta={`${String(count)} selected`}
      open={count > 0}
    >
      <FloatingToolbar.Button variant="ghost" onClick={onDuplicate}>
        Duplicate
      </FloatingToolbar.Button>
      <FloatingToolbar.Button onClick={onDelete}>Delete</FloatingToolbar.Button>
    </FloatingToolbar>
  );
}
