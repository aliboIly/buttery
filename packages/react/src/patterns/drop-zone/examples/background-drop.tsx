import { useState } from "react";
import type { ReactElement } from "react";
import { Button, DropZone, EmptyState } from "@buttery/react";

/** An empty canvas that takes a picture for its backdrop: dropped, pasted, opened with ⌘O or picked with the button. */
export function BackgroundDrop(): ReactElement {
  const [image, setImage] = useState<string | null>(null);
  return (
    <DropZone
      accept="image/*"
      onFiles={([file]) => {
        if (file) setImage(file.name);
      }}
    >
      <EmptyState
        title={image ?? "Add a backdrop"}
        description="Drag a picture onto the canvas, or paste it from your clipboard."
        actions={
          <DropZone.Open>
            <Button variant="primary">Pick a picture</Button>
          </DropZone.Open>
        }
      />
    </DropZone>
  );
}
