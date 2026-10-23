import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, EmptyState } from "@butteryui/react";
import { ImagePlus } from "lucide-react";

/** A small dashed empty state in a product's photos panel, where the photos will go. */
export function EmptyPanel(): ReactElement {
  const [asked, setAsked] = useState(false);
  return (
    <Surface level="card" pad={4}>
      <Stack gap={4}>
        <Text variant="title">Photos</Text>
        <EmptyState
          size="sm"
          variant="dashed"
          icon={ImagePlus}
          title="No photos yet"
          titleAs="h3"
          description="Add a photo of the bag and one of the beans."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAsked(true);
              }}
            >
              Add photos
            </Button>
          }
        />
        {asked ? <Text variant="caption">Opened your photos</Text> : null}
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("No photos yet");
  await press("button", "Add photos");
  await see("Opened your photos");
};
