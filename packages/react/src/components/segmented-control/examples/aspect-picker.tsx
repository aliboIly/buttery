import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SegmentedControl } from "@buttery/react";

const RATIOS = [
  { value: "1:1", label: "Square" },
  { value: "4:5", label: "Portrait" },
  { value: "16:9", label: "Wide" },
] as const;

type Ratio = (typeof RATIOS)[number]["value"];

/** A canvas aspect ratio, with labels that differ from the values the control reports. */
export function AspectPicker(): ReactElement {
  const [ratio, setRatio] = useState<Ratio>("4:5");
  return (
    <Stack gap={3} align="start">
      <SegmentedControl<Ratio>
        label="Aspect ratio"
        options={RATIOS}
        value={ratio}
        onValueChange={setRatio}
      />
      <Text variant="body-sm" tone="secondary">
        {`The canvas is ${ratio}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Wide");
  await see("The canvas is 16:9");
  await press("radio", "Square");
  await see("The canvas is 1:1");
};
