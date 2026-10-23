import type { ReactElement } from "react";
import { Stack, Text, TextStack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** The four sizes: a dialog's copy with its tip, an empty state, a page section's heading and lede, and a feature intro. */
export function Sizes(): ReactElement {
  return (
    <Stack gap={10}>
      <Stack gap={3}>
        <Text variant="caption">dialog</Text>
        <TextStack
          titleAs="p"
          title="Make it yours"
          body="Pick a theme, choose a background and set the fonts."
          caption="Tip: press T to try the next theme."
        />
      </Stack>
      <Stack gap={3}>
        <Text variant="caption">empty</Text>
        <TextStack
          size="empty"
          titleAs="p"
          title="Your canvas is empty"
          body="Add a slide, or open a deck from your library."
        />
      </Stack>
      <Stack gap={3}>
        <Text variant="caption">section</Text>
        <TextStack
          size="section"
          titleAs="p"
          title="Every deck, one place"
          body="Find any deck in seconds and pick up where you left off."
        />
      </Stack>
      <Stack gap={3}>
        <Text variant="caption">feature</Text>
        <TextStack
          size="feature"
          titleAs="p"
          title="Present from any screen"
          body="Open a deck on the room's screen and keep your notes on your laptop."
        />
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Every deck, one place");
  await see("Present from any screen");
};
