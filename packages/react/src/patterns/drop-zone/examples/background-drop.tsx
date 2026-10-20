import { useState } from "react";
import type { ReactElement } from "react";
import { Button, DropZone, EmptyState } from "@buttery/react";

/** An empty canvas that takes an image for its background, by drop, paste, ⌘O or the button. */
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
        title={image ?? "Add a background"}
        description="Drop an image here, or paste one with ⌘V."
        actions={
          <DropZone.Open>
            <Button variant="primary">Choose image</Button>
          </DropZone.Open>
        }
      />
    </DropZone>
  );
}
