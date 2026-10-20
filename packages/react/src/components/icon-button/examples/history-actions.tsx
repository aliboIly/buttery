import { Redo2, Undo2 } from "lucide-react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { IconButton } from "@buttery/react";

/** Undo and redo in a header, redo disabled until there's something to redo. */
export function HistoryActions(): ReactElement {
  return (
    <Inline gap={1}>
      <IconButton icon={Undo2} label="Undo" />
      <IconButton icon={Redo2} label="Redo" disabled />
    </Inline>
  );
}
