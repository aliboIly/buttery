import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Layer, Pressable, Scrim, Surface, Text } from "@buttery/core";

/** A blocking "Saving…" panel in the modal layer, announced as a status. */
export function SavingOverlay(): ReactElement {
  const [saving, setSaving] = useState(false);
  return (
    <>
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
      {saving ? (
        <Layer band="modal">
          <Scrim />
          <Center style={{ blockSize: "100%" }}>
            <Surface level="dialog" padX={6} padY={4} role="status">
              <Text variant="label">Saving…</Text>
            </Surface>
          </Center>
        </Layer>
      ) : null}
    </>
  );
}
