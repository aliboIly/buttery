import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { DropZone, Switch } from "@buttery/react";

/** A drop zone that takes no files while it's disabled, here while uploads are switched off. */
export function PausedUploads(): ReactElement {
  const [taking, setTaking] = useState(true);
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stack gap={3}>
      <Switch
        label="Take new pictures"
        checked={taking}
        onCheckedChange={setTaking}
      />
      <DropZone
        accept="image/*"
        disabled={!taking}
        onFiles={([file]) => {
          if (file) setLast(file.name);
        }}
      >
        <Stack gap={1} padY={6} align="center">
          <Text variant="label">
            {taking
              ? "Drop a picture for the title slide"
              : "Pictures are switched off"}
          </Text>
          <Text variant="caption">
            {last === null ? "No picture yet" : `Last added: ${last}`}
          </Text>
        </Stack>
      </DropZone>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Drop a picture for the title slide");
  await press("switch", "Take new pictures");
  await see("Pictures are switched off");
};
