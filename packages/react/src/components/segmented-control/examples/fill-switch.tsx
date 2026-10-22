import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SegmentedControl } from "@buttery/react";

type Fill = "Blend" | "Color";

/** Gradient or solid fill for a card background, kept in state so the swatches follow it and Reset can set it back. */
export function FillSwitch(): ReactElement {
  const [fill, setFill] = useState<Fill>("Blend");
  return (
    <Stack gap={3} align="start">
      <Inline gap={2} align="center">
        <SegmentedControl<Fill>
          label="Fill"
          options={["Blend", "Color"]}
          value={fill}
          onValueChange={setFill}
        />
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={fill === "Blend"}
          onClick={() => {
            setFill("Blend");
          }}
        >
          Reset
        </Button>
      </Inline>
      <Text variant="body-sm" tone="secondary">
        {`Showing ${fill.toLowerCase()} swatches.`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Color");
  await see("Showing color swatches.");
  await press("button", "Reset");
  await see("Showing blend swatches.");
};
