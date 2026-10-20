import { Dialog } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Layer, Pressable, Scrim, Surface, Text } from "@buttery/core";

/** A blocking "Saving…" panel in the modal layer: focus moves into it and the page waits until saving ends. */
export function SavingOverlay(): ReactElement {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog.Root open={saving}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          onClick={() => {
            setSaving(true);
            window.setTimeout(() => {
              setSaving(false);
            }, 1500);
          }}
        >
          <Text variant="button">Save the card</Text>
        </Pressable>
      </Surface>
      {saving ? (
        <Layer band="modal">
          <Dialog.Overlay asChild>
            <Scrim />
          </Dialog.Overlay>
          <Center pad={4} style={{ blockSize: "100%" }}>
            <Dialog.Content asChild aria-describedby={undefined}>
              <Surface level="dialog" padX={6} padY={4}>
                <Dialog.Title asChild>
                  <Text variant="label">Saving…</Text>
                </Dialog.Title>
              </Surface>
            </Dialog.Content>
          </Center>
        </Layer>
      ) : null}
    </Dialog.Root>
  );
}
