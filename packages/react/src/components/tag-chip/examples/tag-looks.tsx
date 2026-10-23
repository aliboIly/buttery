import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { TagChip } from "@butteryui/react";

/** A coffee's tags in each look: outlined by default, soft to carry the tone in its words, solid to stand out. */
export function TagLooks(): ReactElement {
  return (
    <Inline gap={2} align="center" wrap>
      <TagChip tone="info">Single origin</TagChip>
      <TagChip tone="success" variant="soft">
        Organic
      </TagChip>
      <TagChip tone="warning" variant="solid">
        Last bags
      </TagChip>
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Single origin");
  await see("Organic");
  await see("Last bags");
};
