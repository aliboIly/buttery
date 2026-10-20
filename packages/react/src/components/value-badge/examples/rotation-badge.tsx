import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { ValueBadge } from "@buttery/react";

/** A label with its current value, sized for the widest value it can show. */
export function RotationBadge(): ReactElement {
  return (
    <Inline gap={2} align="center">
      <Text variant="label">Rotation</Text>
      <ValueBadge reserve={["-180°", "180°"]}>12°</ValueBadge>
    </Inline>
  );
}
