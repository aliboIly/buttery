import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, EmptyState } from "@buttery/react";

/** An empty canvas with the two ways to begin, a primary and a secondary pill. */
export function EmptyCanvas(): ReactElement {
  const [status, setStatus] = useState("Nothing open yet");
  return (
    <Stack gap={4} align="center">
      <EmptyState
        title="An empty canvas"
        description="Start a fresh card, or open one from your library."
        actions={
          <>
            <Button
              variant="primary"
              onClick={() => {
                setStatus("Started a new card");
              }}
            >
              New card
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setStatus("Opened your library");
              }}
            >
              Open library
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
  await press("button", "Open library");
  await see("Opened your library");
  await press("button", "New card");
  await see("Started a new card");
};
