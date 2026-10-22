import type { ReactElement } from "react";
import { Center, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A short status message in the middle of a panel while its content loads. */
export function LoadingPanel(): ReactElement {
  return (
    <Surface level="panel" style={{ blockSize: "var(--bt-bento-row)" }}>
      <Center style={{ blockSize: "100%" }}>
        <Text variant="body-sm" role="status">
          Loading your cards…
        </Text>
      </Center>
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Loading your cards…");
};
