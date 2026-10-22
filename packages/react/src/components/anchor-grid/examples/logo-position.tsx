import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AnchorGrid } from "@buttery/react";
import type { Anchor } from "@buttery/react";

/** An anchor grid that starts at the center and reports each pick, by press or with the arrow keys. */
export function LogoPosition(): ReactElement {
  const [placed, setPlaced] = useState<Anchor>("center");
  return (
    <Inline gap={3} align="center">
      <AnchorGrid label="Logo position" onValueChange={setPlaced} />
      <Text variant="body" tone="secondary">
        {`Logo anchored ${placed.replace("-", " ")}`}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await see("Logo anchored center");
  await press("radio", "Bottom right");
  await see("Logo anchored bottom right");
  await key("ArrowUp");
  await see("Logo anchored right");
};
