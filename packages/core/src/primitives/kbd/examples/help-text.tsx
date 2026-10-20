import type { ReactElement } from "react";
import { Inline, Kbd, Text } from "@buttery/core";

/** A hint that names the key to press. */
export function HelpText(): ReactElement {
  return (
    <Inline gap={1} align="center" wrap>
      <Text variant="body-sm">Press</Text>
      <Kbd>Esc</Kbd>
      <Text variant="body-sm">to leave crop mode.</Text>
    </Inline>
  );
}
