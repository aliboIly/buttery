import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { NumberField } from "@butteryui/react";

/** A batch's weights in small soft fields for a dense panel, and its price in a large one beside large fields. */
export function SizesAndSoft(): ReactElement {
  const [green, setGreen] = useState(12);
  const [roasted, setRoasted] = useState(10);
  const loss = green === 0 ? 0 : Math.round(((green - roasted) / green) * 100);
  return (
    <Stack gap={4}>
      <Inline gap={4} wrap>
        <NumberField
          label="Green"
          unit="kg"
          size="sm"
          variant="soft"
          min={0}
          value={green}
          onValueChange={setGreen}
        />
        <NumberField
          label="Roasted"
          unit="kg"
          size="sm"
          variant="soft"
          min={0}
          value={roasted}
          onValueChange={setRoasted}
        />
      </Inline>
      <NumberField label="Price" unit="$" size="lg" min={0} defaultValue={19} />
      <Text variant="body-sm" tone="secondary">
        {`${String(loss)}% lost in the roast`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ focus, key, see }) => {
  await see("17% lost in the roast");
  await focus("spinbutton", "Roasted");
  await key("ArrowDown");
  await see("25% lost in the roast");
};
