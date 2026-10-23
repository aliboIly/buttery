import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SegmentedControl } from "@butteryui/react";

const RATIOS = [
  { value: "1:1", label: "Square" },
  { value: "4:3", label: "Classic" },
  { value: "16:9", label: "Wide" },
] as const;

type Ratio = (typeof RATIOS)[number]["value"];

/** A deck's slide shape, with labels that differ from the values the control reports. */
export function AspectPicker(): ReactElement {
  const [ratio, setRatio] = useState<Ratio>("4:3");
  return (
    <Stack gap={3} align="start">
      <SegmentedControl<Ratio>
        label="Aspect ratio"
        options={RATIOS}
        value={ratio}
        onValueChange={setRatio}
      />
      <Text variant="body-sm" tone="secondary">
        {`Every slide is ${ratio}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Wide");
  await see("Every slide is 16:9");
  await press("radio", "Square");
  await see("Every slide is 1:1");
};
