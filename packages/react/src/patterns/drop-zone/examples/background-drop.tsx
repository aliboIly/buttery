import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, DropZone, EmptyState } from "@buttery/react";

/** An empty slide that takes a picture for its background: dropped, pasted, opened with ⌘O or picked with the button. */
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
        description="Drag a picture onto the slide, or paste it from your clipboard."
        actions={
          <DropZone.Open>
            <Button variant="primary">Pick a picture</Button>
          </DropZone.Open>
        }
      />
    </DropZone>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Add a background");
  await see("Drag a picture onto the slide, or paste it from your clipboard.");
};
