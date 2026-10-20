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
import type { DemoSection } from "@buttery/core";

function NestedLayers(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Pressable
        onClick={() => {
          setOpen((current) => !current);
        }}
        aria-expanded={open}
      >
        <Surface level="raised" padX={4} padY={2}>
          <Text variant="button">
            {open ? "Close the layers" : "Open a modal with a menu inside"}
          </Text>
        </Surface>
      </Pressable>
      {open ? (
        <Layer band="modal">
          <Scrim
            onClick={() => {
              setOpen(false);
            }}
          />
          <Center style={{ blockSize: "100%" }}>
            <Surface level="dialog" pad={6}>
              <Stack gap={4}>
                <Text variant="dialog-title">Modal layer (z 60)</Text>
                <Text variant="body">
                  The dropdown layer below opens inside this one, so it stacks
                  above it without a new z-index.
                </Text>
                <Layer band="dropdown">
                  <Inline justify="center" padY={6}>
                    <Surface level="floating" padX={4} padY={2}>
                      <Text variant="label">
                        Dropdown layer (inside the modal)
                      </Text>
                    </Surface>
                  </Inline>
                </Layer>
              </Stack>
            </Surface>
          </Center>
        </Layer>
      ) : null}
    </Stack>
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
