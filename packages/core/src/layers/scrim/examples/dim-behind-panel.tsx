import { Dialog } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Layer,
  Pressable,
  Scrim,
  Stack,
  Surface,
  Text,
} from "@buttery/core";

/** A dim scrim behind a modal panel; the dialog keeps focus inside and closes on Escape or a click outside. */
export function DimBehindPanel(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Dialog.Trigger asChild>
          <Pressable>
            <Text variant="button">Show the panel</Text>
          </Pressable>
        </Dialog.Trigger>
      </Surface>
      {open ? (
        <Layer band="modal">
          <Dialog.Overlay asChild>
            <Scrim />
          </Dialog.Overlay>
          <Center pad={4} style={{ blockSize: "100%" }}>
            <Dialog.Content asChild>
              <Surface level="dialog" pad={6}>
                <Stack gap={4}>
                  <Dialog.Title asChild>
                    <Text variant="dialog-title" asChild>
                      <h2>Your card is ready</h2>
                    </Text>
                  </Dialog.Title>
                  <Dialog.Description asChild>
                    <Text variant="body">
                      Export it as an image, or keep editing.
                    </Text>
                  </Dialog.Description>
                  <Inline justify="end">
                    <Surface
                      asChild
                      level="raised"
                      padX={4}
                      padY={2}
                      radius="full"
                    >
                      <Dialog.Close asChild>
                        <Pressable>
                          <Text variant="button">Keep editing</Text>
                        </Pressable>
                      </Dialog.Close>
                    </Surface>
                  </Inline>
                </Stack>
              </Surface>
            </Dialog.Content>
          </Center>
        </Layer>
      ) : null}
    </Dialog.Root>
  );
}
