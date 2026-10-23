import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A deck's tile that opens the deck on click, with press feedback, a hover lift and a focus ring. */
export function DeckTile(): ReactElement {
  return (
    <Stack style={{ maxInlineSize: "var(--bt-w-inspector)" }}>
      <Surface asChild level="card" pad={4}>
        <Pressable asChild className="bt-hover-lift">
          <a href="#spring-launch">
            <Stack gap={2}>
              <Text variant="label">Spring launch</Text>
              <Text variant="caption">Edited today</Text>
            </Stack>
          </a>
        </Pressable>
      </Surface>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Spring launch");
  await see("Edited today");
};
