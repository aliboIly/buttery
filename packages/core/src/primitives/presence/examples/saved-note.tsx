import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Presence, Pressable, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A note that rises in after saving and fades out a moment later. */
export function SavedNote(): ReactElement {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return undefined;
    const timer = window.setTimeout(() => {
      setSaved(false);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [saved]);

  return (
    <Inline gap={3}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          onClick={() => {
            setSaved(true);
          }}
        >
          <Text variant="button">Save the deck</Text>
        </Pressable>
      </Surface>
      <div role="status">
        <Presence show={saved} preset="rise">
          <Text variant="caption">Saved</Text>
        </Presence>
      </div>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Save the deck");
  await see("Saved");
};
