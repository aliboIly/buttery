import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, EmptyState } from "@butteryui/react";

/** The gift card builder's empty canvas, with the two ways to begin: a primary and a secondary pill. */
export function EmptyCanvas(): ReactElement {
  const [status, setStatus] = useState("No design picked yet");
  return (
    <Stack gap={4} align="center">
      <EmptyState
        title="An empty gift card"
        description="Pick one of the shop's designs, or upload a photo of your own."
        actions={
          <>
            <Button
              variant="primary"
              onClick={() => {
                setStatus("Opened the designs");
              }}
            >
              Pick a design
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setStatus("Opened your photos");
              }}
            >
              Upload a photo
            </Button>
          </>
        }
      />
      <Text variant="caption">{status}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Upload a photo");
  await see("Opened your photos");
  await press("button", "Pick a design");
  await see("Opened the designs");
};
