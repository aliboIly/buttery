import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Field, SegmentedControl } from "@butteryui/react";

const EVERY = ["Week", "2 weeks", "4 weeks"] as const;
const UNITS = ["oz", "g"] as const;

/** A small control in a header beside a full-width one that spans its form with layout="fill". */
export function SizesAndFill(): ReactElement {
  const [every, setEvery] = useState<(typeof EVERY)[number]>("2 weeks");
  const [unit, setUnit] = useState<(typeof UNITS)[number]>("oz");
  return (
    <Stack gap={4}>
      <Inline gap={3} justify="between" align="center">
        <Text variant="label">Your subscription</Text>
        <SegmentedControl
          label="Units"
          size="sm"
          options={UNITS}
          value={unit}
          onValueChange={setUnit}
        />
      </Inline>
      <Field label="Delivered every">
        {(control) => (
          <SegmentedControl
            {...control}
            label="Delivered every"
            layout="fill"
            options={EVERY}
            value={every}
            onValueChange={setEvery}
          />
        )}
      </Field>
      <Text variant="body-sm" tone="secondary">
        {`A ${unit === "oz" ? "12 oz" : "340 g"} bag every ${every === "Week" ? "week" : every}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("A 12 oz bag every 2 weeks");
  await press("radio", "4 weeks");
  await see("A 12 oz bag every 4 weeks");
  await press("radio", "g");
  await see("A 340 g bag every 4 weeks");
};
