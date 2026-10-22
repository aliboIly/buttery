import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A dialog's title, body and caption, each in its role. */
export function Roles(): ReactElement {
  return (
    <Stack gap={4}>
      <Text variant="dialog-title" asChild>
        <h2>Make it yours</h2>
      </Text>
      <Text variant="body">
        Pick a backdrop, round the corners and add depth. Every change shows up
        right away.
      </Text>
      <Text variant="caption">Tip: hold Shift for finer steps.</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Make it yours");
  await see("Tip: hold Shift for finer steps.");
};
