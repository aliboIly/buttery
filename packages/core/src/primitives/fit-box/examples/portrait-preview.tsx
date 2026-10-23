import type { ReactElement } from "react";
import { Center, FitBox, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A tall 9:16 slide's preview that fills the height of a wide area without overflowing it. */
export function PortraitPreview(): ReactElement {
  return (
    <Surface level="section" style={{ blockSize: "var(--bt-bento-row)" }}>
      <FitBox ratio={9 / 16} inset={4}>
        <Surface asChild level="raised">
          <Center>
            <Text variant="label">Tall, 9:16</Text>
          </Center>
        </Surface>
      </FitBox>
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Tall, 9:16");
};
