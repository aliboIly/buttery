import type { ReactElement } from "react";
import { Skeleton, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** Three lines standing in for a paragraph that's still loading under its heading, the last one shorter. */
export function LoadingLines(): ReactElement {
  return (
    <Stack gap={3} aria-busy="true">
      <Text variant="label">Tasting notes</Text>
      <Stack gap={2}>
        <Skeleton variant="body" />
        <Skeleton variant="body" />
        <Skeleton
          variant="body"
          text="Roasted on Tuesday, shipped the same afternoon"
        />
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Tasting notes");
};
