import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { InitialsTile } from "@butteryui/react";

/** A workspace's tile beside its name, as in a sidebar's workspace switcher. */
export function WorkspaceName(): ReactElement {
  return (
    <Inline gap={2} align="center">
      <InitialsTile name="Northside Roasters" size="xs" />
      <Text variant="title-sm" truncate>
        Northside Roasters
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("NR");
  await see("Northside Roasters");
};
