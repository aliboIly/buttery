import type { ReactElement } from "react";
import { Button, DropZone, EmptyState } from "@buttery/react";

/** An empty canvas that takes an image for its background, by drop, paste, ⌘O or the button. */
export function BackgroundDrop({
  onImage,
}: {
  readonly onImage: (image: File) => void;
}): ReactElement {
  return (
    <DropZone
      accept="image/*"
      onFiles={([image]) => {
        if (image) onImage(image);
      }}
    >
      <EmptyState
        title="Add a background"
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
