import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { InitialsTile } from "@buttery/react";

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
