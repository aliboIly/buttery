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
          body="Pick a backdrop, round the corners and add depth."
          caption="Tip: hold Shift for finer steps."
        />
      </Stack>
      <Stack gap={3}>
        <Text variant="caption">empty</Text>
        <TextStack
          size="empty"
          titleAs="p"
          title="Your canvas is empty"
          body="Start a fresh card, or open one from your library."
        />
      </Stack>
      <Stack gap={3}>
        <Text variant="caption">section</Text>
        <TextStack
          size="section"
          titleAs="p"
          title="Every card, one place"
          body="Keep your designs together and pick up where you left off."
        />
      </Stack>
      <Stack gap={3}>
        <Text variant="caption">feature</Text>
        <TextStack
          size="feature"
          titleAs="p"
          title="Print at the counter"
          body="Send any card to the shop's printer from wherever you are."
        />
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Every card, one place");
  await see("Print at the counter");
};
