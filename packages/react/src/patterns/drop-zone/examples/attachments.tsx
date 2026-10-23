import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { DropZone, IconButton } from "@buttery/react";
import { X } from "lucide-react";

/** A deck's attachments: PDFs or pictures dropped or pasted onto the list join it, each with a button to remove it. */
export function Attachments(): ReactElement {
  const [files, setFiles] = useState<readonly string[]>([
    "q3-handout.pdf",
    "q3-chart.png",
  ]);
  return (
    <DropZone
      accept="application/pdf,image/*"
      multiple
      openShortcut={false}
      labels={{ drop: "Drop to attach" }}
      onFiles={(added) => {
        setFiles((current) => [
          ...current,
          ...added
            .map((file) => file.name)
            .filter((name) => !current.includes(name)),
        ]);
      }}
    >
      <Stack gap={2} padY={4}>
        <Text variant="label">
          {files.length === 1
            ? "1 attachment"
            : `${String(files.length)} attachments`}
        </Text>
        {files.map((name) => (
          <Inline key={name} gap={2} align="center">
            <Text variant="body-sm">{name}</Text>
            <IconButton
              icon={X}
              label={`Remove ${name}`}
              size="sm"
              onClick={() => {
                setFiles((current) => current.filter((file) => file !== name));
              }}
            />
          </Inline>
        ))}
        <Text variant="caption">
          Drop PDFs or pictures here, or paste them.
        </Text>
      </Stack>
    </DropZone>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("2 attachments");
  await press("button", "Remove q3-chart.png");
  await see("1 attachment");
};
