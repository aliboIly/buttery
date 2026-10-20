import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Layer,
  Pressable,
  Scrim,
  Stack,
  Surface,
  Text,
} from "@buttery/core";

/** A dim scrim behind a panel; clicking the scrim closes it. */
export function DimBehindPanel(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onClick={() => {
          setOpen(true);
        }}
      >
        <Text variant="button">Show the panel</Text>
      </Pressable>
      {open ? (
        <Layer band="modal">
          <Scrim
            onClick={() => {
              setOpen(false);
            }}
          />
          <Center style={{ blockSize: "100%" }}>
            <Surface level="dialog" pad={6} role="status">
              <Stack gap={2}>
                <Text variant="dialog-title">Your card is ready</Text>
                <Text variant="body">Click anywhere outside to close.</Text>
              </Stack>
            </Surface>
          </Center>
        </Layer>
      ) : null}
    </>
  );
}
