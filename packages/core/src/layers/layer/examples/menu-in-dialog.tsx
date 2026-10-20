import { Dialog } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Layer,
  Popover,
  Pressable,
  Scrim,
  Stack,
  Surface,
  Text,
} from "@buttery/core";

const FORMATS = ["PNG", "JPEG", "WebP"] as const;

/** A menu opened inside a dialog mounts in the dialog's layer and stacks above it, with no z-index of its own. */
export function MenuInDialog(): ReactElement {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("PNG");
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Dialog.Trigger asChild>
          <Pressable>
            <Text variant="button">Export the card</Text>
          </Pressable>
        </Dialog.Trigger>
      </Surface>
      {open ? (
        <Layer band="modal">
          <Dialog.Overlay asChild>
            <Scrim />
          </Dialog.Overlay>
          <Center pad={4} style={{ blockSize: "100%" }}>
            <Dialog.Content asChild aria-describedby={undefined}>
              <Surface level="dialog" pad={6}>
                <Stack gap={4} align="start">
                  <Dialog.Title asChild>
                    <Text variant="dialog-title" asChild>
                      <h2>Export</h2>
                    </Text>
                  </Dialog.Title>
                  <Popover>
                    <Surface
                      asChild
                      level="raised"
                      padX={4}
                      padY={2}
                      radius="full"
                    >
                      <Popover.Trigger asChild>
                        <Pressable>
                          <Text variant="button">Format: {format}</Text>
                        </Pressable>
                      </Popover.Trigger>
                    </Surface>
                    <Popover.Content align="start" aria-label="Formats">
                      <Stack gap={1}>
                        {FORMATS.map((option) => (
                          <Surface
                            key={option}
                            asChild
                            level="app"
                            padX={3}
                            padY={2}
                            radius="md"
                          >
                            <Popover.Close asChild>
                              <Pressable
                                aria-pressed={option === format}
                                onClick={() => {
                                  setFormat(option);
                                }}
                              >
                                <Text variant="menu">{option}</Text>
                              </Pressable>
                            </Popover.Close>
                          </Surface>
                        ))}
                      </Stack>
                    </Popover.Content>
                  </Popover>
                </Stack>
              </Surface>
            </Dialog.Content>
          </Center>
        </Layer>
      ) : null}
    </Dialog.Root>
  );
}
