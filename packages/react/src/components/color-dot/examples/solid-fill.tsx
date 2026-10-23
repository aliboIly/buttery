import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ColorDot } from "@butteryui/react";

/** One fill kept in state as `#rrggbb`, changed by the picker's hex code field or its area and hue. */
export function SolidFill(): ReactElement {
  const [fill, setFill] = useState("#a5b4fc");
  return (
    <Inline gap={3} align="center">
      <ColorDot label="Fill" value={fill} onValueChange={setFill} />
      <Text variant="body-sm" tone="secondary" tabular>
        {fill}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, type, key, see }) => {
  await press("button", "Fill, #a5b4fc");
  await type("Hex code", "{selectall}F97316");
  await key("Enter");
  await see("#f97316");
};
