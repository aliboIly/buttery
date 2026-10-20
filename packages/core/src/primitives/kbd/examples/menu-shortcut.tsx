import type { ReactElement } from "react";
import { Inline, Kbd, Text } from "@buttery/core";

/** A command with its shortcut at the end of the row, as in a menu. */
export function MenuShortcut(): ReactElement {
  return (
    <Inline gap={6} align="center" justify="between">
      <Text variant="label">Duplicate card</Text>
      <Kbd keys={["mod", "D"]} />
    </Inline>
  );
}
