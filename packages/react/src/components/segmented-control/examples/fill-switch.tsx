import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SegmentedControl } from "@buttery/react";

type Fill = "Gradient" | "Color";

/** Gradient or solid fill for a slide background, kept in state so the swatches follow it and Reset can set it back. */
export function FillSwitch(): ReactElement {
  const [fill, setFill] = useState<Fill>("Gradient");
  return (
    <Stack gap={3} align="start">
      <Inline gap={2} align="center">
        <SegmentedControl<Fill>
          label="Fill"
          options={["Gradient", "Color"]}
          value={fill}
          onValueChange={setFill}
        />
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={fill === "Gradient"}
          onClick={() => {
            setFill("Gradient");
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
  await see("Showing gradient swatches.");
};
