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
import type { DemoSection } from "@buttery/core";

function NestedLayers(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Dialog.Trigger asChild>
          <Pressable>
            <Text variant="button">Open a modal with a menu inside</Text>
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
                      <h2>Modal layer (z 60)</h2>
                    </Text>
                  </Dialog.Title>
                  <Text variant="body">
                    The menu opens in the dropdown band, inside this layer, so
                    it stacks above the modal without a z-index of its own.
                  </Text>
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
                          <Text variant="button">Open the menu</Text>
                        </Pressable>
                      </Popover.Trigger>
                    </Surface>
                    <Popover.Content align="start" aria-label="Menu">
                      <Stack padX={2} padY={1}>
                        <Text variant="menu">
                          Dropdown layer, inside the modal
                        </Text>
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

export const demos: readonly DemoSection[] = [
  {
    title: "Nested layers",
    description:
      "A dropdown opened inside a modal mounts in the modal's container; a tooltip would go to the root.",
    render: () => <NestedLayers />,
  },
];
