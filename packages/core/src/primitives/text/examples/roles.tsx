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
        Pick a theme, choose a background and set the fonts. Every change shows
        up right away.
      </Text>
      <Text variant="caption">Tip: press T to try the next theme.</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Make it yours");
  await see("Tip: press T to try the next theme.");
};
