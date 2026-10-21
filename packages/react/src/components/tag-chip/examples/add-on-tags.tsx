import { Inline, Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { TagChip } from "@buttery/react";
import type { ReactElement } from "react";

/** An add-on's name over the tags that say what kind it is. */
export function AddOnTags(): ReactElement {
  return (
    <Stack gap={2}>
      <Text variant="label">Label printing</Text>
      <Inline gap={2} align="center" wrap>
        <TagChip tone="info">New</TagChip>
        <TagChip tone="success">Free trial</TagChip>
      </Inline>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ see }) => {
  await see("Free trial");
};
