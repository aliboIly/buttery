import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Layer,
  Pressable,
  Scrim,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection } from "@buttery/core";

function ScrimToggle({
  variant,
}: {
  readonly variant: "dim" | "blur";
}): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onClick={() => {
          setOpen(true);
        }}
      >
        <Surface level="raised" padX={4} padY={2}>
          <Text variant="button">Show {variant}</Text>
        </Surface>
      </Pressable>
      {open ? (
        <Layer band="modal">
          <Scrim
            variant={variant}
            onClick={() => {
              setOpen(false);
            }}
          />
          <Center style={{ blockSize: "100%" }}>
            <Surface level="dialog" pad={6} role="status">
              <Text variant="label">
                The {variant} scrim. Click outside to close.
              </Text>
            </Surface>
          </Center>
        </Layer>
      ) : null}
    </>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Variants",
    description:
      "Dim behind modals; blur under a light wash behind menus over content.",
    render: () => (
      <Inline gap={2}>
        <ScrimToggle variant="dim" />
        <ScrimToggle variant="blur" />
      </Inline>
    ),
  },
];
