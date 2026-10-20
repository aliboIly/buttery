import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import { DropZone } from "@buttery/react";

/** A list that takes several PDFs or images at once, without its own shortcut. */
export function Attachments(): ReactElement {
  const [files, setFiles] = useState<readonly string[]>([]);
  return (
    <DropZone
      accept="application/pdf,image/*"
      multiple
      openShortcut={false}
      labels={{ drop: "Drop to attach" }}
      onFiles={(added) => {
        setFiles([...files, ...added.map((file) => file.name)]);
      }}
    >
      <Stack gap={1} padY={4}>
        {files.length === 0 ? (
          <Text variant="caption">Drop PDFs or images to attach them.</Text>
        ) : (
          files.map((name) => (
            <Text key={name} variant="label">
              {name}
            </Text>
          ))
        )}
      </Stack>
    </DropZone>
  );
}
