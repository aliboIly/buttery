import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button } from "@buttery/react";

/** A save that takes a moment: the button shows a spinner and holds its width until it's done. */
export function Saving(): ReactElement {
  const [state, setState] = useState<"unsaved" | "saving" | "saved">("unsaved");
  return (
    <Inline gap={3} align="center">
      <Button
        variant="primary"
        loading={state === "saving"}
        onClick={() => {
          setState("saving");
          window.setTimeout(() => {
            setState("saved");
          }, 1200);
        }}
      >
        Save tasting notes
      </Button>
      <Text variant="body" tone="secondary">
        {state === "saved" ? "Saved just now" : "Not saved yet"}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Not saved yet");
  await press("button", "Save tasting notes");
  await see("Saved just now");
};
