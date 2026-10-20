import { Dialog } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Layer,
  Popover,
  Pressable,
  Scrim,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection } from "@buttery/core";

function DimDemo(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Dialog.Trigger asChild>
          <Pressable>
            <Text variant="button">Show dim</Text>
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
              <Surface
                level="dialog"
                pad={6}
                style={{ maxInlineSize: "var(--bt-w-dialog)" }}
              >
                <Dialog.Title asChild>
                  <Text variant="label">
                    The dim scrim. Escape or a click outside closes it.
                  </Text>
                </Dialog.Title>
              </Surface>
            </Dialog.Content>
          </Center>
        </Layer>
      ) : null}
    </Dialog.Root>
  );
}

function BlurDemo(): ReactElement {
  return (
    <Popover>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Popover.Trigger asChild>
          <Pressable>
            <Text variant="button">Show blur</Text>
          </Pressable>
        </Popover.Trigger>
      </Surface>
      <Popover.Content scrim="blur" align="start" aria-label="Blur scrim">
        <Stack padX={2} padY={1}>
          <Text variant="menu">The blur scrim, under a menu.</Text>
        </Stack>
      </Popover.Content>
    </Popover>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Variants",
    description:
      "Dim behind modals; blur under a light wash behind menus over content.",
    render: () => (
      <Inline gap={2}>
        <DimDemo />
        <BlurDemo />
      </Inline>
    ),
  },
];
