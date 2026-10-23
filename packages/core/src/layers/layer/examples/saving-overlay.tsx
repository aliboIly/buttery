import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Layer,
  Pressable,
  Scrim,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A "Saving" panel in the modal layer, over a dim scrim, that holds the page until the save is done. */
export function SavingOverlay(): ReactElement {
  const [state, setState] = useState<"unsaved" | "saving" | "saved">("unsaved");
  useEffect(() => {
    if (state !== "saving") return undefined;
    const timer = window.setTimeout(() => {
      setState("saved");
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state]);
  return (
    <>
      <Inline gap={3} align="center">
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            aria-disabled={state === "saving"}
            onClick={() => {
              setState("saving");
            }}
          >
            <Text variant="button">Save the roast plan</Text>
          </Pressable>
        </Surface>
        <Text variant="body" tone="secondary">
          {state === "saved" ? "Saved just now" : "Not saved yet"}
        </Text>
      </Inline>
      {state === "saving" ? (
        <Layer band="modal">
          <Scrim />
          <Center pad={4} style={{ blockSize: "100%" }}>
            <Surface level="dialog" padX={6} padY={4} role="status">
              <Text variant="label">Saving the roast plan…</Text>
            </Surface>
          </Center>
        </Layer>
      ) : null}
    </>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Not saved yet");
  await press("button", "Save the roast plan");
  await see("Saving the roast plan…");
  await see("Saved just now");
};
