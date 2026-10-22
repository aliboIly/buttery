import type { ReactElement } from "react";
import { Center, FitBox, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A 9:16 story preview that fills the height of a wide area without overflowing it. */
export function PortraitPreview(): ReactElement {
  return (
    <Surface level="section" style={{ blockSize: "var(--bt-bento-row)" }}>
      <FitBox ratio={9 / 16} inset={4}>
        <Surface asChild level="raised">
          <Center>
            <Text variant="label">Story, 9:16</Text>
          </Center>
        </Surface>
      </FitBox>
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Story, 9:16");
};
