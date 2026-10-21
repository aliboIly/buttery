import { useState } from "react";
import type { ReactElement } from "react";
import type { DemoSection } from "@buttery/core";
import { Button, DropZone, EmptyState } from "@buttery/react";

function ImageDrop(): ReactElement {
  const [name, setName] = useState<string | null>(null);
  return (
    <DropZone
      accept="image/*"
      onFiles={([file]) => {
        setName(file?.name ?? null);
      }}
      style={{ blockSize: "var(--bt-bento-row)" }}
    >
      <EmptyState
        title={name ?? "Add a backdrop"}
        description="Drag a picture onto the canvas, paste it from your clipboard, or open one with ⌘O."
        actions={
          <DropZone.Open>
            <Button variant="primary">Pick a picture</Button>
          </DropZone.Open>
        }
      />
    </DropZone>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Picture drop",
    description:
      "Hold a file over it to see the tint and dashed edge; only images reach onFiles.",
    render: () => <ImageDrop />,
  },
];
