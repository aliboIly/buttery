import type { ReactElement, ReactNode } from "react";
import { DropZone } from "@buttery/react";

/** A list that takes several PDFs or images at once, without its own shortcut. */
export function Attachments({
  children,
  onAdd,
}: {
  readonly children: ReactNode;
  readonly onAdd: (files: readonly File[]) => void;
}): ReactElement {
  return (
    <DropZone
      accept="application/pdf,image/*"
      multiple
      openShortcut={false}
      onFiles={onAdd}
      labels={{ drop: "Drop to attach" }}
    >
      {children}
    </DropZone>
  );
}
